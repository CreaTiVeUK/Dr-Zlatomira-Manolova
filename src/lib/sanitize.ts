// Removed JSDOM dependency to fix Vercel deployment (ESM/CJS interop issues)
// import DOMPurify from "dompurify";
// import { JSDOM } from "jsdom";

/**
 * Strips all HTML tags and script elements from a string.
 */
export function sanitizeString(input: string): string {
    if (!input) return input;
    // 1. Remove script tags and their content
    const clean = input.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "");
    // 2. Remove all other HTML tags
    return clean.replace(/<[^>]*>/g, '').trim();
}

/**
 * Recursively sanitizes all string properties in an object.
 */
export function sanitizeObject<T>(obj: T): T {
    if (typeof obj !== "object" || obj === null) return obj;

    const sanitized = { ...obj } as Record<string, unknown>;
    for (const key in sanitized) {
        if (typeof sanitized[key] === "string") {
            sanitized[key] = sanitizeString(sanitized[key] as string);
        } else if (typeof sanitized[key] === "object") {
            sanitized[key] = sanitizeObject(sanitized[key]);
        }
    }
    return sanitized as T;
}
