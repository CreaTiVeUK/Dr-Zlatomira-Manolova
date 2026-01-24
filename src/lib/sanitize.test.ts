import { describe, it, expect } from 'vitest';
import { sanitizeString, sanitizeObject } from './sanitize';

describe('Sanitization Utility', () => {
    it('should strip script tags', () => {
        const dirty = "<script>alert(1)</script>Hello";
        expect(sanitizeString(dirty)).toBe("Hello");
    });

    it('should strip all HTML tags', () => {
        const dirty = "<b>Bold</b> <i>Italic</i>";
        expect(sanitizeString(dirty)).toBe("Bold Italic");
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
