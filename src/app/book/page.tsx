import { getSession } from "@/lib/auth";
import BookClient from "./BookClient";

export default async function BookPage() {
    const session = await getSession();
    const serializedSession = session ? {
        user: {
            id: session.id, // session.id is the user id in our combined session
            email: session.user.email,
            name: session.user.name,
            role: session.user.role
        }
    } : null;

    return <BookClient session={serializedSession} />;
}
