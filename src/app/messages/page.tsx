import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import MessagesClient from "./MessagesClient";

export default async function MessagesPage() {
    const session = await getSession();
    if (!session?.user?.id) redirect("/login?callbackUrl=/messages");
    if (session.user.role === "ADMIN") redirect("/admin/messages");

    return <MessagesClient currentUserId={session.user.id} />;
}
