import { describe, expect, it } from "vitest";
import { messageContentSchema } from "./message-content";

describe("message content", () => {
    it.each(["", "   ", "<b></b>", "<script>alert(1)</script>"])("rejects empty sanitized content: %s", (input) => {
        expect(messageContentSchema.safeParse(input).success).toBe(false);
    });
    it("preserves a plain-text message and removes markup", () => {
        expect(messageContentSchema.parse("  <b>Hello</b> doctor  ")).toBe("Hello doctor");
    });
    it("limits both input and stored text", () => {
        expect(messageContentSchema.safeParse("a".repeat(2001)).success).toBe(false);
        expect(messageContentSchema.safeParse("<".repeat(501)).success).toBe(false);
    });
});
