import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeString } from "@/lib/sanitize";
import { sendEmail, EMAIL_TEMPLATES } from "@/lib/email";

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

        // Send email notification using existing utility
        const emailResult = await sendEmail("zlatomira.manolova@gmail.com", EMAIL_TEMPLATES.CONTACT_INQUIRY(cleanName, email, cleanMessage));

        if (!emailResult.success) {
            console.error("Failed to send contact email:", emailResult.error);
            // We still return success to the user to not discourage them, but log the failure
        }

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
