import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminMessagesClient from "./AdminMessagesClient";

export default async function AdminMessagesPage() {
    const session = await getSession();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
        redirect("/login?callbackUrl=/admin/messages");
    }
    return <AdminMessagesClient adminId={session.user.id} />;
}
