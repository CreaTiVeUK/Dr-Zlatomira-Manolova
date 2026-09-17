import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import BookClient from "./BookClient";

// BookClient has no visible on-page heading (removed as redundant with the
// "ЗАПАЗЕТЕ ЧАС" nav item you just clicked), so this is the only place the
// page's name is communicated — browser tab, bookmarks, screen readers.
export const metadata: Metadata = {
    title: "Онлайн записване на час",
};

export default async function BookPage() {
    const session = await getSession();
    const serializedSession = session
        ? { user: { id: session.id, email: session.user.email, name: session.user.name, role: session.user.role } }
        : null;
    return <BookClient session={serializedSession} />;
}
