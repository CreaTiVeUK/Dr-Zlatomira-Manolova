import { NextRequest, NextResponse } from 'next/server';
import { syncSuperdocReviews } from '@/lib/superdoc';

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    const result = await syncSuperdocReviews();

    if (result.success) {
        return NextResponse.json(result);
    } else {
        return NextResponse.json(result, { status: 500 });
    }
}
