import { describe, it, expect, afterEach, vi } from "vitest";
import { getSiteUrl } from "./site-url";

describe("getSiteUrl", () => {
    afterEach(() => vi.unstubAllEnvs());

    it("prefers APP_URL and strips trailing slashes", () => {
        vi.stubEnv("APP_URL", "https://drmanolova.bg/");
        vi.stubEnv("VERCEL_URL", "deploy-abc123.vercel.app");
        expect(getSiteUrl()).toBe("https://drmanolova.bg");
    });

    it("falls back to the deployment host so previews stay self-consistent", () => {
        vi.stubEnv("APP_URL", "");
        vi.stubEnv("VERCEL_URL", "deploy-abc123.vercel.app");
        expect(getSiteUrl()).toBe("https://deploy-abc123.vercel.app");
    });

    it("defaults to localhost outside any deployment", () => {
        vi.stubEnv("APP_URL", "");
        vi.stubEnv("VERCEL_URL", "");
        expect(getSiteUrl()).toBe("http://localhost:3000");
    });
});
