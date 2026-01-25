import { syncSuperdocReviews } from '../src/lib/superdoc';
import { prisma } from '../src/lib/prisma';

async function main() {
    console.log("Starting manual sync...");
    const result = await syncSuperdocReviews();
    console.log("Sync result:", result);

    const count = await prisma.superdocReview.count();
    console.log("Total reviews in DB:", count);

    process.exit(0);
}

main().catch(err => {
    console.error("Sync script failed:", err);
    process.exit(1);
});
