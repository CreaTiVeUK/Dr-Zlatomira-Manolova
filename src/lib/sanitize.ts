/**
 * Server-safe HTML sanitisation using an allowlist approach.
 *
 * The previous implementation decoded HTML entities then stripped tags with
 * regex, which is susceptible to double-encoding bypass. This version strips
 * ALL markup without decoding first — safe for storing user-supplied text that
 * will be displayed as plain text (appointment notes, contact messages, etc.).
 *
 * Do NOT use this for rich-text/HTML output. If you ever need to sanitise for
 * HTML output, use a purpose-built library (DOMPurify in the browser,
 * sanitize-html on the server).
 */
export function sanitizeString(input: string): string {
    if (!input || typeof input !== "string") return input;

    let clean = input;

    // 1. Remove script/style blocks and their full content (handles newlines)
    clean = clean.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
    clean = clean.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");

    // 2. Strip all remaining HTML tags (including self-closing and SVG)
    clean = clean.replace(/<[^>]*>/g, "");

    // 3. Remove javascript: / vbscript: / data:text/html URI schemes
    clean = clean.replace(/(?:javascript|vbscript)\s*:/gi, "");
    clean = clean.replace(/data\s*:\s*(?:text\s*\/\s*html|application\/)/gi, "");

    // 4. Encode < and > that remain to prevent injection in output context
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
