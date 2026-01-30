
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export async function saveFile(file: File, folderName: string = "docs"): Promise<{ filepath: string, filename: string, size: number }> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure directory exists
    const uploadDir = join(process.cwd(), "uploads", folderName);
    await mkdir(uploadDir, { recursive: true });

    // Generate safe filename
    const uniqueId = randomUUID();
    const safeName = `${uniqueId}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filepath = join(uploadDir, safeName);

    await writeFile(filepath, buffer);

    return { filepath, filename: safeName, size: buffer.length };
}
