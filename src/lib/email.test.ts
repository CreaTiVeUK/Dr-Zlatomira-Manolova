import { describe, it, expect, afterEach, vi } from "vitest";
import { getBaseUrl } from "./email";

describe("getBaseUrl", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("prefers APP_URL and strips trailing slashes", () => {
        vi.stubEnv("APP_URL", "https://drmanolova.bg/");
        vi.stubEnv("VERCEL_URL", "deploy-abc123.vercel.app");
        expect(getBaseUrl()).toBe("https://drmanolova.bg");
    });

    it("falls back to the deployment URL when APP_URL is missing", () => {
        vi.stubEnv("APP_URL", "");
        vi.stubEnv("VERCEL_URL", "deploy-abc123.vercel.app");
        expect(getBaseUrl()).toBe("https://deploy-abc123.vercel.app");
    });

    it("defaults to localhost outside any deployment", () => {
        vi.stubEnv("APP_URL", "");
        vi.stubEnv("VERCEL_URL", "");
        expect(getBaseUrl()).toBe("http://localhost:3000");
    });
});
