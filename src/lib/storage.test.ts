// @vitest-environment node
// (jsdom's realm breaks file-type's instanceof Uint8Array check and its File
// polyfill lacks arrayBuffer(); this suite is pure Node I/O anyway)

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { readFile, rm } from "fs/promises";
import { join } from "path";
import { File as NodeFile } from "node:buffer";

function makeFile(content: Buffer, name: string, type: string): File {
    return new NodeFile([new Uint8Array(content)], name, { type }) as unknown as File;
}
import {
    saveEncryptedFile,
    readEncryptedFile,
    deleteStoredFile,
    isAllowedStoredFileUrl,
    StoredFileNotFoundError,
} from "./storage";

// Minimal but magic-byte-valid PDF so the file-type sniff passes validation.
const PDF_BYTES = Buffer.from(
    "%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n"
);

const TEST_FOLDER = "vitest-tmp";

describe("storage (filesystem driver)", () => {
    beforeAll(() => {
        vi.stubEnv("PII_ENCRYPTION_KEY", "unit-test-key-units-test-key-units");
        vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
    });

    afterAll(async () => {
        vi.unstubAllEnvs();
        await rm(join(process.cwd(), "uploads", TEST_FOLDER), { recursive: true, force: true });
    });

    it("round-trips a file through encrypt-save-read", async () => {
        const file = makeFile(PDF_BYTES, "report.pdf", "application/pdf");

        const { filepath, size } = await saveEncryptedFile(file, TEST_FOLDER);
        expect(size).toBe(PDF_BYTES.length);

        // What's on disk must be ciphertext in the ENCI envelope, not the PDF
        const onDisk = await readFile(filepath);
        expect(onDisk.subarray(0, 4).toString()).toBe("ENCI");
        expect(onDisk.includes(PDF_BYTES)).toBe(false);

        const roundTripped = await readEncryptedFile(filepath);
        expect(roundTripped.equals(PDF_BYTES)).toBe(true);

        await deleteStoredFile(filepath);
        await expect(readEncryptedFile(filepath)).rejects.toBeInstanceOf(StoredFileNotFoundError);
    });

    it("rejects files whose content does not match an allowed type", async () => {
        const file = makeFile(Buffer.from("#!/bin/sh\necho pwned"), "report.pdf", "application/pdf");
        await expect(saveEncryptedFile(file, TEST_FOLDER)).rejects.toThrow(/does not match allowed types/);
    });

    it("only accepts blob URLs and uploads-dir paths as stored locations", () => {
        expect(isAllowedStoredFileUrl(join(process.cwd(), "uploads", "docs", "a.pdf"))).toBe(true);
        expect(isAllowedStoredFileUrl("https://abc123.public.blob.vercel-storage.com/docs/a.pdf")).toBe(true);

        expect(isAllowedStoredFileUrl("/etc/passwd")).toBe(false);
        expect(isAllowedStoredFileUrl(join(process.cwd(), "uploads", "..", ".env"))).toBe(false);
        expect(isAllowedStoredFileUrl("https://evil.example.com/docs/a.pdf")).toBe(false);
        expect(isAllowedStoredFileUrl("http://abc.public.blob.vercel-storage.com/a.pdf")).toBe(false);
    });
});
