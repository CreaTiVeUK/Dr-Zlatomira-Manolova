
import { writeFile, mkdir } from "fs/promises";
import { join, extname } from "path";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

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

export async function saveFile(
    file: File,
    folderName: string = "docs"
): Promise<{ filepath: string; filename: string; size: number }> {
    // Validate size
    if (file.size > MAX_FILE_SIZE) {
        throw new FileValidationError(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024} MB.`);
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
        throw new FileValidationError(`File type "${file.type}" is not allowed.`);
    }

    // Validate extension
    const ext = extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
        throw new FileValidationError(`File extension "${ext}" is not allowed.`);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure directory exists — folder name is restricted to alphanumerics/hyphens to prevent path traversal
    const safeFolderName = folderName.replace(/[^a-zA-Z0-9-_]/g, "");
    const uploadDir = join(process.cwd(), "uploads", safeFolderName);
    await mkdir(uploadDir, { recursive: true });

    // Generate safe filename: uuid + sanitized original name
    const uniqueId = randomUUID();
    const safeName = `${uniqueId}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const filepath = join(uploadDir, safeName);

    await writeFile(filepath, buffer);

    return { filepath, filename: safeName, size: buffer.length };
}
