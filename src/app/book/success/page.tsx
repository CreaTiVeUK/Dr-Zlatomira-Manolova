"use client";

import Link from "next/link";
import { CircleCheckBig } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function SuccessPage() {
  const { dict } = useLanguage();

  return (
    <div className="page-shell page-shell--soft">
      <div className="container state-shell">
        <div className="state-shell__panel">
          <EmptyState
            icon={CircleCheckBig}
            title={dict.successPage.title}
            description={dict.successPage.message}
            tone="success"
            action={
              <div className="btn-group" style={{ justifyContent: "center" }}>
                <Link href="/my-appointments" className="btn btn-primary">
                  {dict.successPage.viewAppointments}
                </Link>
                <Link href="/" className="btn btn-outline">
                  {dict.successPage.home}
                </Link>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
