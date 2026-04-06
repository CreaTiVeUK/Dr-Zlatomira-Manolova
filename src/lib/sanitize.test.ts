import { describe, it, expect } from 'vitest';
import { sanitizeString, sanitizeObject } from './sanitize';

describe('Sanitization Utility', () => {
    it('should strip script tags and their content', () => {
        const dirty = "<script>alert(1)</script>Hello";
        expect(sanitizeString(dirty)).toBe("Hello");
    });

    it('should strip all HTML tags', () => {
        const dirty = "<b>Bold</b> <i>Italic</i>";
        expect(sanitizeString(dirty)).toBe("Bold Italic");
    });

    it('should handle obfuscated HTML entities', () => {
        expect(sanitizeString("&lt;script&gt;bad&lt;/script&gt;content")).toBe("content");
    });

    it('should remove javascript: URIs', () => {
        const input = "javascript:alert(1)";
        expect(sanitizeString(input)).not.toContain("javascript:");
    });

    it('should strip style tags', () => {
        const dirty = "<style>body{color:red}</style>Text";
        expect(sanitizeString(dirty)).toBe("Text");
    });

    it('should handle empty and null-like input', () => {
        expect(sanitizeString("")).toBe("");
    });

    it('should sanitize nested objects', () => {
        const dirtyObj = {
            name: "<b>Malicious</b>",
            details: {
                note: "<img src=x onerror=alert(1)> Safe?"
            }
        };
        const clean = sanitizeObject(dirtyObj);
        expect(clean.name).toBe("Malicious");
        expect(clean.details.note).toBe("Safe?");
    });
});
