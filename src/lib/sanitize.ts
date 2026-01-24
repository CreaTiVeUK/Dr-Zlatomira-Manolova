// Removed JSDOM dependency to fix Vercel deployment (ESM/CJS interop issues)
// import DOMPurify from "dompurify";
// import { JSDOM } from "jsdom";

/**
 * Strips all HTML tags and script elements from a string.
 */
export function sanitizeString(input: string): string {
    if (!input) return input;
    // Simple regex to strip HTML tags. Efficient and sufficient for this use case (stripping all tags).
    return input.replace(/<[^>]*>/g, '').trim();
}

/**
 * Recursively sanitizes all string properties in an object.
 */
export function sanitizeObject<T>(obj: T): T {
    if (typeof obj !== "object" || obj === null) return obj;

    const sanitized = { ...obj } as any;
    for (const key in sanitized) {
        if (typeof sanitized[key] === "string") {
            sanitized[key] = sanitizeString(sanitized[key]);
        } else if (typeof sanitized[key] === "object") {
            sanitized[key] = sanitizeObject(sanitized[key]);
        }
    }
    return sanitized as T;
}
