import { writeFile, readFile, mkdir } from "fs/promises";
import { join, extname } from "path";
import { randomUUID, randomBytes, createCipheriv, createDecipheriv, createHash } from "crypto";
import { fileTypeFromBuffer } from "file-type";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALGORITHM = "aes-256-gcm";

// Magic bytes identifying an encrypted file written by saveEncryptedFile.
// Format: MAGIC(4) | IV(12) | AUTH_TAG(16) | CIPHERTEXT(N)
const ENCRYPTED_MAGIC = Buffer.from("ENCI");

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

async function ensureDir(folderName: string): Promise<string> {
    // Restrict folder name to alphanumerics/hyphens/underscores to prevent path traversal
    const safe = folderName.replace(/[^a-zA-Z0-9-_]/g, "");
    const dir = join(process.cwd(), "uploads", safe);
    await mkdir(dir, { recursive: true });
    return dir;
}

function buildPath(dir: string, originalName: string): string {
    const uniqueId = randomUUID();
    const safeName = `${uniqueId}-${originalName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    return join(dir, safeName);
}

/**
 * Save a file to disk without encryption.
 * Use only for non-sensitive files (e.g. public images).
 */
export async function saveFile(
    file: File,
    folderName: string = "docs"
): Promise<{ filepath: string; filename: string; size: number }> {
    const buffer = await validateFile(file);
    const dir = await ensureDir(folderName);
    const filepath = buildPath(dir, file.name);

    await writeFile(filepath, buffer);

    return { filepath, filename: filepath.split("/").pop()!, size: buffer.length };
}

/**
 * Save a file to disk with AES-256-GCM encryption.
 * Use for all sensitive uploads (patient audio, medical documents).
 *
 * Encrypted file layout:
 *   MAGIC(4) | IV(12) | AUTH_TAG(16) | CIPHERTEXT(variable)
 *
 * readEncryptedFile() transparently reverses this.
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

    const dir = await ensureDir(folderName);
    const filepath = buildPath(dir, file.name);

    await writeFile(filepath, encrypted);

    return { filepath, filename: filepath.split("/").pop()!, size: plaintext.length };
}

/**
 * Read a file from disk, decrypting it transparently if it was saved
 * with saveEncryptedFile. Unencrypted files are returned as-is
 * for backward compatibility.
 */
export async function readEncryptedFile(filepath: string): Promise<Buffer> {
    const data = await readFile(filepath);

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
