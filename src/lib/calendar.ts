/**
 * Medical Calendar Integration
 * Generates RFC 5545 compliant ICS files for patient calendars.
 */

/** Practice address, emitted as the event LOCATION. */
const PRACTICE_LOCATION =
    "Dr. Zlatomira Manolova-Peneva — Paediatric Practice, A11, Zahari Zograf Neighbourhood, Trakiya, 4000 Plovdiv";

/**
 * Escape a value for an iCalendar TEXT property (RFC 5545 §3.3.11).
 *
 * COMMA and SEMICOLON separate multiple values in a property, so an
 * unescaped one in free text silently truncates or splits the value — an
 * appointment description like "Follow-up, bring test results" would reach
 * the calendar app as two values, and stricter parsers reject the file.
 *
 * Backslashes must be escaped first, or the escapes added below get escaped
 * a second time.
 */
function escapeText(value: string): string {
    return value
        .replace(/\\/g, "\\\\")
        .replace(/;/g, "\\;")
        .replace(/,/g, "\\,")
        .replace(/\r\n|\r|\n/g, "\\n");
}

/**
 * Fold a content line to 75 octets (RFC 5545 §3.1). Continuation lines begin
 * with a single space, which counts toward the limit.
 *
 * The limit is in octets, not characters, and this content is UTF-8 with
 * Cyrillic and curly quotes — so we measure encoded length and step by code
 * point, which keeps a multi-byte character from being split across a fold.
 */
function foldLine(line: string): string {
    const encoder = new TextEncoder();
    if (encoder.encode(line).length <= 75) return line;

    const parts: string[] = [];
    let current = "";
    let bytes = 0;
    let limit = 75; // subsequent lines spend one octet on the leading space

    for (const char of line) {
        const size = encoder.encode(char).length;
        if (bytes + size > limit) {
            parts.push(current);
            current = "";
            bytes = 0;
            limit = 74;
        }
        current += char;
        bytes += size;
    }
    if (current) parts.push(current);

    return parts.join("\r\n ");
}

function utcStamp(date: Date): string {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function generateICS(appointment: {
    id: string;
    dateTime: Date;
    duration: number;
    summary: string;
    description?: string;
}) {
    const start = utcStamp(appointment.dateTime);
    const end = utcStamp(new Date(appointment.dateTime.getTime() + appointment.duration * 60000));

    const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        `PRODID:-//${escapeText("Manolova-Peneva Pediatrics")}//EN`,
        "BEGIN:VEVENT",
        `UID:${appointment.id}`,
        `DTSTAMP:${utcStamp(new Date())}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${escapeText(appointment.summary)}`,
        `DESCRIPTION:${escapeText(appointment.description || "")}`,
        `LOCATION:${escapeText(PRACTICE_LOCATION)}`,
        "END:VEVENT",
        "END:VCALENDAR",
    ];

    // Trailing CRLF: the spec treats each content line as terminated, and some
    // parsers drop a final line that lacks one.
    return lines.map(foldLine).join("\r\n") + "\r\n";
}
