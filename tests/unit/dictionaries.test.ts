import { describe, it, expect } from 'vitest';
import { en, bg } from '../../src/lib/i18n/dictionaries';

describe('Dictionary Consistency', () => {

    // Helper to recursively check keys
    function checkKeys(obj1: Record<string, unknown>, obj2: Record<string, unknown>, path = '') {
        const keys1 = Object.keys(obj1).sort();
        const keys2 = Object.keys(obj2).sort();

        try {
            expect(keys1).toEqual(keys2);
        } catch (e) {
            console.error(`Mismatch at path: ${path}`);
            throw e;
        }

        for (const key of keys1) {
            const val1 = obj1[key];
            const val2 = obj2[key];
            const newPath = path ? `${path}.${key}` : key;

            const isObj1 = typeof val1 === 'object' && val1 !== null && !Array.isArray(val1);
            const isObj2 = typeof val2 === 'object' && val2 !== null && !Array.isArray(val2);

            if (isObj1 && isObj2) {
                checkKeys(val1 as Record<string, unknown>, val2 as Record<string, unknown>, newPath);
            } else if (isObj1 !== isObj2) {
                throw new Error(`Type mismatch at ${newPath}: ${typeof val1} vs ${typeof val2}`);
            }
        }
    }

    it('should have identical keys structure for EN and BG', () => {
        checkKeys(en as unknown as Record<string, unknown>, bg as unknown as Record<string, unknown>);
    });

    it('should explicitly contain critical booking keys', () => {
        expect(en.booking.loginRequired).toBeDefined();
        expect(bg.booking.loginRequired).toBeDefined();

        expect(en.booking.confirm.text).toContain('%s');
    });
});
