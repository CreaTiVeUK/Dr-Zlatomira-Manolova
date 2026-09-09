import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";

// Account page: crawlable but never worth ranking. A noindex the crawler can
// read is more reliable than a robots.txt Disallow, which still lets an
// externally-linked URL show up in results and hides this directive. The
// self-canonical stops the page inheriting the homepage's canonical, which
// would contradict the noindex.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
  alternates: { canonical: `${getSiteUrl()}/login` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
