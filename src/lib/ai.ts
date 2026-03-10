import { OpenAI } from "openai";

const DEFAULT_VERCEL_AI_GATEWAY_BASE_URL = "https://ai-gateway.vercel.sh/v1";
const DEFAULT_VERCEL_AI_GATEWAY_MODEL = "openai/gpt-5.4";
const DEFAULT_OPENAI_SUMMARY_MODEL = "gpt-4o";
const DEFAULT_OPENAI_TRANSCRIPTION_MODEL = "whisper-1";

export function getTranscriptionClient() {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is not configured");
    }

    return {
        client: new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        }),
        model: process.env.OPENAI_TRANSCRIPTION_MODEL || DEFAULT_OPENAI_TRANSCRIPTION_MODEL
    };
}

export function getSummaryClient() {
    if (process.env.VERCEL_AI_GATEWAY_API_KEY) {
        return {
            client: new OpenAI({
                apiKey: process.env.VERCEL_AI_GATEWAY_API_KEY,
                baseURL: process.env.VERCEL_AI_GATEWAY_BASE_URL || DEFAULT_VERCEL_AI_GATEWAY_BASE_URL,
            }),
            model: process.env.VERCEL_AI_GATEWAY_MODEL || DEFAULT_VERCEL_AI_GATEWAY_MODEL,
            provider: "vercel-ai-gateway"
        } as const;
    }

    if (!process.env.OPENAI_API_KEY) {
        throw new Error("Configure either VERCEL_AI_GATEWAY_API_KEY or OPENAI_API_KEY");
    }

    return {
        client: new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        }),
        model: process.env.OPENAI_SUMMARY_MODEL || DEFAULT_OPENAI_SUMMARY_MODEL,
        provider: "openai"
    } as const;
}
