import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getSession } from "@/lib/auth";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

const checkoutSchema = z.object({
    appointmentId: z.string().uuid(),
    price: z.number().positive(),
    serviceName: z.string().optional()
});

export async function POST(request: NextRequest) {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const limiter = rateLimit(ip, 10, 60000); // 10 checkouts per minute

    if (!limiter.success) {
        return NextResponse.json({ error: "Too many request attempts." }, { status: 429 });
    }

    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const result = checkoutSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        const { appointmentId, price, serviceName } = result.data;

        const checkoutSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: serviceName || 'Pediatric Consultation',
                            description: `Appointment ID: ${appointmentId}`,
                        },
                        unit_amount: Math.round(price * 100), // Stripe uses cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${request.nextUrl.origin}/book/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${request.nextUrl.origin}/book`,
            metadata: {
                appointmentId,
                userId: session.user.id
            }
        });

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error: any) {
        console.error("Stripe Session Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
