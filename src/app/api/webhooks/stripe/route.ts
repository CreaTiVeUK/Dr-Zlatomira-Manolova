import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendEmail, EMAIL_TEMPLATES } from "@/lib/email";
import { format } from "date-fns";


export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature") as string;

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as any;
        const appointmentId = session.metadata.appointmentId;

        if (appointmentId) {
            console.log(`[STRIPE WEBHOOK] Payment confirmed: ${appointmentId}`);
            const updated = await prisma.appointment.update({
                where: { id: appointmentId },
                include: { user: { select: { name: true, email: true } } },
                data: {
                    paymentStatus: "PAID",
                    paymentMethod: "STRIPE"
                }
            });

            // Trigger Professional Confirmation Email
            await sendEmail(updated.user?.email || "", EMAIL_TEMPLATES.CONFIRMATION(
                updated.user?.name || "Patient",
                format(new Date(updated.dateTime), "PPPP"),
                format(new Date(updated.dateTime), "HH:mm")
            ));
        }
    }

    return NextResponse.json({ received: true });
}
