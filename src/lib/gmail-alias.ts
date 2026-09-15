/**
 * Gmail ignores dots in the local part: zlatomira.manolova@gmail.com and
 * zlatomiramanolova@gmail.com are one mailbox, owned by one Google account,
 * and Google verifies the address before we ever see it. The spelling a
 * provider profile carries can therefore differ from the one stored at first
 * sign-in — and an exact lookup would silently create a second, PATIENT
 * account for an existing admin.
 *
 * Only these two domains get this treatment. Nowhere else is dot-equivalence
 * guaranteed, and fuzzy matching in an auth path is how takeovers happen.
 */
const GMAIL_DOMAINS = new Set(["gmail.com", "googlemail.com"]);

/** Lower-cased, dot-free local part for a Gmail address; null for any other domain. */
export function gmailCanonicalLocal(email: string): string | null {
    const at = email.lastIndexOf("@");
    if (at < 1) return null;
    if (!GMAIL_DOMAINS.has(email.slice(at + 1).toLowerCase())) return null;
    return email.slice(0, at).toLowerCase().replace(/\./g, "");
}
