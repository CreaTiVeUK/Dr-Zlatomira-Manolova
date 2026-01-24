import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const purify = DOMPurify(window as any);

/**
 * Strips all HTML tags and script elements from a string.
 */
export function sanitizeString(input: string): string {
    if (!input) return input;
    // PURIFY removes scripts/tags. We also use ALLOWED_TAGS as empty to strip everything.
    return purify.sanitize(input, { ALLOWED_TAGS: [] }).trim();
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
