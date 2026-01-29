import { getSession } from "@/lib/auth";
import AppointmentsClient from "./AppointmentsClient";

export default async function MyAppointmentsPage() {
    const session = await getSession();
    const serializedSession = session ? {
        user: {
            id: session.id,
            email: session.user.email,
            name: session.user.name,
            role: session.user.role
        }
    } : null;

    return <AppointmentsClient session={serializedSession} />;
}
