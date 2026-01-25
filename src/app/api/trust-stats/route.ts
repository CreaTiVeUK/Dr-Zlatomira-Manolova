import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const [stats, reviews] = await Promise.all([
            prisma.superdocStat.findUnique({ where: { id: 'singleton' } }),
            prisma.superdocReview.findMany({
                where: { isPublished: true },
                orderBy: { createdAt: 'desc' },
                take: 10
            })
        ]);

        return NextResponse.json({
            rating: stats?.rating || "5.0/5",
            reviewsCount: stats?.reviewsCount || "14",
            testimonials: reviews.map(r => ({
                textEn: r.textEn,
                textBg: r.textBg,
                authorEn: r.authorEn,
                authorBg: r.authorBg
            }))
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
