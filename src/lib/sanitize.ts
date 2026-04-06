/**
 * Strips all HTML/script content from a string.
 * Uses a multi-pass approach to handle obfuscated and nested tags.
 */
export function sanitizeString(input: string): string {
    if (!input || typeof input !== "string") return input;

    let clean = input;

    // 1. Decode common HTML entities that might hide tags
    clean = clean
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&#x3C;/gi, "<")
        .replace(/&#60;/gi, "<")
        .replace(/&#x3E;/gi, ">")
        .replace(/&#62;/gi, ">");

    // 2. Remove script/style tags and their full content (handles newlines)
    clean = clean.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
    clean = clean.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");

    // 3. Remove all remaining HTML tags (including self-closing)
    clean = clean.replace(/<[^>]*>/g, "");

    // 4. Remove javascript: and data: URI schemes from any remaining text
    clean = clean.replace(/javascript\s*:/gi, "");
    clean = clean.replace(/data\s*:\s*text\s*\/\s*html/gi, "");

    // 5. Encode < and > that survive to prevent any HTML injection in output context
    clean = clean.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    return clean.trim();
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
