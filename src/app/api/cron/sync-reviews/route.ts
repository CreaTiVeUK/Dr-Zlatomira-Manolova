import { NextRequest, NextResponse } from "next/server";
import { syncSuperdocReviews } from "@/lib/superdoc";

export async function GET(request: NextRequest) {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
        // Fail closed: if the secret is not configured, deny all requests
        return new Response("Cron secret not configured", { status: 503 });
    }

    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${secret}`) {
        return new Response("Unauthorized", { status: 401 });
    }

    const result = await syncSuperdocReviews();

    if (result.success) {
        return NextResponse.json(result);
    } else {
        return NextResponse.json(result, { status: 500 });
    }
}
