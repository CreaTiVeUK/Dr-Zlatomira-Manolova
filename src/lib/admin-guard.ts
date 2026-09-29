/**
 * Authorization gate for admin server components.
 *
 * src/proxy.ts already guards /admin, but middleware must not be the ONLY
 * check. Two ways that fails:
 *
 *  - the matcher is one regex; editing it (or adding an exclusion) silently
 *    removes authorization from every admin page at once;
 *  - framework-level middleware bypasses are a real, recurring class of bug
 *    (CVE-2025-29927 let a single request header skip middleware entirely).
 *
 * Next.js' own guidance is that middleware performs optimistic redirects and
 * the authoritative check lives next to the data. These pages render patient
 * records — decrypted phone numbers, children's notes, consultation
 * transcripts — so they get their own check.
 *
 * Mirrors the proxy's behaviour: unauthenticated → /login (with callback),
 * authenticated non-admin → /.
 */

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export async function requireAdmin(callbackPath?: string) {
    const session = await getSession();

    if (!session?.user?.id) {
        redirect(callbackPath ? `/login?callbackUrl=${encodeURIComponent(callbackPath)}` : "/login");
    }

    if (session.user.role !== "ADMIN") {
        redirect("/");
    }

    return session;
}
