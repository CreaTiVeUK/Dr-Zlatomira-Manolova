import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function AuthRedirect() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  redirect("/book");
}
