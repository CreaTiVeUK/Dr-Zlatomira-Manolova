import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeString } from "@/lib/sanitize";

const contactSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    message: z.string().min(10, "Message must be at least 10 characters").max(1000, "Message too long"),
});

export async function POST(request: NextRequest) {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const limiter = rateLimit(ip, 5, 60000); // 5 requests per minute

    if (!limiter.success) {
        return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            { status: 429 }
        );
    }

    try {
        const body = await request.json();
        const result = contactSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid input", details: result.error.format() },
                { status: 400 }
            );
        }

        const { name, email, message } = result.data;
        const cleanName = sanitizeString(name);
        const cleanMessage = sanitizeString(message);

        // TODO: Integrate actual email service (Resend/Nodemailer)
        // For now, log the inquiry to the system logs
        console.log(`[CONTACT FORM] From: ${cleanName} <${email}>`);
        console.log(`[CONTACT FORM] Message: ${cleanMessage}`);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        return NextResponse.json(
            { success: true, message: "Message sent successfully" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Contact Form Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
