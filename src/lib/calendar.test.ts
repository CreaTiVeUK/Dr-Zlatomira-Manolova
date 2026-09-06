import { describe, it, expect } from "vitest";
import { generateICS } from "./calendar";

const base = {
    id: "appt-1",
    dateTime: new Date("2026-09-10T09:30:00Z"),
    duration: 30,
    summary: "Pediatric Appointment",
};

/** Unfold per RFC 5545 §3.1 to inspect logical content lines. */
function contentLines(ics: string): string[] {
    return ics.replace(/\r\n /g, "").split("\r\n").filter(Boolean);
}

function prop(ics: string, name: string): string {
    const line = contentLines(ics).find((l) => l.startsWith(`${name}:`));
    if (!line) throw new Error(`${name} not found`);
    return line.slice(name.length + 1);
}

describe("generateICS", () => {
    it("emits a well-formed calendar with CRLF line endings", () => {
        const ics = generateICS(base);
        expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
        expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
        expect(prop(ics, "DTSTART")).toBe("20260910T093000Z");
        expect(prop(ics, "DTEND")).toBe("20260910T100000Z");
    });

    // The bug this suite exists for: COMMA and SEMICOLON are value separators,
    // so unescaped ones in free text split or truncate the property.
    it("escapes commas, semicolons and backslashes in free text", () => {
        const ics = generateICS({
            ...base,
            description: "Follow-up, bring results; note the C:\\path",
        });
        expect(prop(ics, "DESCRIPTION")).toBe(
            "Follow-up\\, bring results\\; note the C:\\\\path"
        );
    });

    it("escapes newlines rather than emitting a raw line break", () => {
        const ics = generateICS({ ...base, description: "line one\nline two" });
        expect(prop(ics, "DESCRIPTION")).toBe("line one\\nline two");
        // A raw newline would have created a bogus content line.
        expect(contentLines(ics).some((l) => l === "line two")).toBe(false);
    });

    it("escapes the comma in the practice address", () => {
        expect(prop(generateICS(base), "LOCATION")).toContain("\\,");
    });

    it("folds long lines at 75 octets with a leading-space continuation", () => {
        const ics = generateICS({ ...base, description: "x".repeat(300) });
        const encoder = new TextEncoder();
        for (const physical of ics.split("\r\n")) {
            expect(encoder.encode(physical).length).toBeLessThanOrEqual(75);
        }
        expect(ics).toContain("\r\n ");
        expect(prop(ics, "DESCRIPTION")).toBe("x".repeat(300));
    });

    it("never splits a multi-byte character across a fold", () => {
        const ics = generateICS({ ...base, description: "Прегледът е при д-р Манолова-Пенева. ".repeat(6) });
        // A split surrogate/continuation byte would survive folding but come
        // back as U+FFFD once re-decoded.
        expect(ics).not.toContain("\uFFFD");
        expect(prop(ics, "DESCRIPTION")).toBe("Прегледът е при д-р Манолова-Пенева. ".repeat(6));
    });
});
