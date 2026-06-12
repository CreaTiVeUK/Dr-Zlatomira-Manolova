/**
 * Encrypted file storage with two interchangeable backends:
 *
 * - **Vercel Blob** (when BLOB_READ_WRITE_TOKEN is set) — required on Vercel,
 *   whose runtime filesystem is read-only. Blobs are PRIVATE (token-gated
 *   reads via the SDK) and additionally AES-256-GCM encrypted BEFORE upload;
 *   plaintext is served exclusively through the authorising download route.
 * - **Local filesystem** (`<cwd>/uploads`) — dev, CI, and the Docker stack.
 *
 * `fileUrl` values stored in the database are either a blob URL (https://…)
 * or an absolute path under the uploads directory; every reader/deleter here
 * validates them with isAllowedStoredFileUrl() before touching them.
 *
 * Encrypted file layout: MAGIC "ENCI"(4) | IV(12) | AUTH_TAG(16) | CIPHERTEXT.
 */

import { writeFile, readFile, mkdir, unlink } from "fs/promises";
import { join, extname, resolve } from "path";
import { randomUUID, randomBytes, createCipheriv, createDecipheriv, createHash } from "crypto";
import { fileTypeFromBuffer } from "file-type";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALGORITHM = "aes-256-gcm";

// Magic bytes identifying an encrypted file written by saveEncryptedFile.
const ENCRYPTED_MAGIC = Buffer.from("ENCI");

// Covers both public and private store hostnames (*.public.… / *.private.…)
const BLOB_HOST_SUFFIX = ".blob.vercel-storage.com";

const ALLOWED_MIME_TYPES = new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "audio/mpeg",
    "audio/mp4",
    "audio/wav",
    "audio/webm",
    "audio/ogg",
    "video/mp4",
    "video/webm",
]);

const ALLOWED_EXTENSIONS = new Set([
    ".pdf", ".jpg", ".jpeg", ".png", ".webp",
    ".mp3", ".mp4", ".wav", ".webm", ".ogg",
]);

export class FileValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "FileValidationError";
    }
}

export class StoredFileNotFoundError extends Error {
    constructor(message = "Stored file not found") {
        super(message);
        this.name = "StoredFileNotFoundError";
    }
}

function blobStorageEnabled(): boolean {
    return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function isRemoteFileUrl(fileUrl: string): boolean {
    return fileUrl.startsWith("https://");
}

/**
 * A stored fileUrl may only be a Vercel Blob URL or a path inside the local
 * uploads directory. Anything else (path traversal, foreign hosts) is refused.
 */
export function isAllowedStoredFileUrl(fileUrl: string): boolean {
    if (isRemoteFileUrl(fileUrl)) {
        try {
            return new URL(fileUrl).hostname.endsWith(BLOB_HOST_SUFFIX);
        } catch {
            return false;
        }
    }
    const uploadsDir = resolve(process.cwd(), "uploads");
    const resolved = resolve(fileUrl);
    return resolved.startsWith(uploadsDir + "/");
}

function deriveFileKey(): Buffer {
    const raw = process.env.PII_ENCRYPTION_KEY;
    if (!raw) {
        throw new Error("PII_ENCRYPTION_KEY must be set to use encrypted file storage");
    }
    // SHA-256 digest gives a stable 32-byte key from any-length input
    return createHash("sha256").update(raw).digest();
}

async function validateFile(file: File): Promise<Buffer> {
    if (file.size > MAX_FILE_SIZE) {
        throw new FileValidationError(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024} MB.`);
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
        throw new FileValidationError(`File type "${file.type}" is not allowed.`);
    }

    const ext = extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
        throw new FileValidationError(`File extension "${ext}" is not allowed.`);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate MIME type via magic bytes (not just the client-supplied Content-Type)
    const detected = await fileTypeFromBuffer(buffer);
    if (!detected || !ALLOWED_MIME_TYPES.has(detected.mime)) {
        throw new FileValidationError(
            `File content does not match allowed types (detected: ${detected?.mime ?? "unknown"}).`
        );
    }

    return buffer;
}

function safeFolderName(folderName: string): string {
    // Restrict folder name to alphanumerics/hyphens/underscores to prevent path traversal
    return folderName.replace(/[^a-zA-Z0-9-_]/g, "");
}

function uniqueFileName(originalName: string): string {
    return `${randomUUID()}-${originalName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
}

async function storeBuffer(data: Buffer, folderName: string, originalName: string): Promise<{ fileUrl: string; filename: string }> {
    const folder = safeFolderName(folderName);
    const filename = uniqueFileName(originalName);

    if (blobStorageEnabled()) {
        const { put } = await import("@vercel/blob");
        const blob = await put(`${folder}/${filename}`, data, {
            access: "private", // token-gated reads; content is ciphertext anyway
            contentType: "application/octet-stream",
            addRandomSuffix: false,
        });
        return { fileUrl: blob.url, filename };
    }

    const dir = join(process.cwd(), "uploads", folder);
    await mkdir(dir, { recursive: true });
    const filepath = join(dir, filename);
    await writeFile(filepath, data);
    return { fileUrl: filepath, filename };
}

/**
 * Validate, AES-256-GCM encrypt, and persist an upload.
 * All patient files (documents, session audio) go through this — there is no
 * unencrypted save path.
 */
export async function saveEncryptedFile(
    file: File,
    folderName: string = "docs"
): Promise<{ filepath: string; filename: string; size: number }> {
    const plaintext = await validateFile(file);
    const key = deriveFileKey();
    const iv = randomBytes(12);

    const cipher = createCipheriv(ALGORITHM, key, iv);
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const tag = cipher.getAuthTag();

    // ENCI | iv(12) | tag(16) | ciphertext
    const encrypted = Buffer.concat([ENCRYPTED_MAGIC, iv, tag, ciphertext]);

    const { fileUrl, filename } = await storeBuffer(encrypted, folderName, file.name);

    return { filepath: fileUrl, filename, size: plaintext.length };
}

/**
 * Fetch a stored file (blob URL or local path), decrypting it transparently
 * if it was saved with saveEncryptedFile. Legacy unencrypted files are
 * returned as-is. Throws StoredFileNotFoundError when the file is gone and
 * FileValidationError when the fileUrl fails the allowlist.
 */
export async function readEncryptedFile(fileUrl: string): Promise<Buffer> {
    if (!isAllowedStoredFileUrl(fileUrl)) {
        throw new FileValidationError("File location is not allowed");
    }

    let data: Buffer;
    if (isRemoteFileUrl(fileUrl)) {
        // SDK get() handles private-blob authentication with the store token
        const { get } = await import("@vercel/blob");
        const result = await get(fileUrl, { access: "private" });
        if (result === null) throw new StoredFileNotFoundError();
        if (result.statusCode !== 200 || !result.stream) {
            throw new Error(`Blob fetch returned status ${result.statusCode}`);
        }
        data = Buffer.from(await new Response(result.stream).arrayBuffer());
    } else {
        try {
            data = await readFile(fileUrl);
        } catch (err) {
            if ((err as NodeJS.ErrnoException).code === "ENOENT") throw new StoredFileNotFoundError();
            throw err;
        }
    }

    if (data.length < ENCRYPTED_MAGIC.length + 12 + 16) {
        return data; // Too short to be encrypted — serve as-is
    }

    const magic = data.subarray(0, 4);
    if (!magic.equals(ENCRYPTED_MAGIC)) {
        return data; // Not encrypted — serve as-is (backward compat)
    }

    const key = deriveFileKey();
    const iv = data.subarray(4, 16);
    const tag = data.subarray(16, 32);
    const ciphertext = data.subarray(32);

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

/**
 * Best-effort removal of a stored file. Missing files are not an error;
 * disallowed locations are silently skipped (and logged) rather than touched.
 */
export async function deleteStoredFile(fileUrl: string): Promise<void> {
    if (!isAllowedStoredFileUrl(fileUrl)) {
        console.warn(`[storage] Refusing to delete disallowed file location: ${fileUrl}`);
        return;
    }

    if (isRemoteFileUrl(fileUrl)) {
        const { del } = await import("@vercel/blob");
        await del(fileUrl);
        return;
    }

    try {
        await unlink(fileUrl);
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    }
}
