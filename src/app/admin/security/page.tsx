import { getServerDictionary } from "@/lib/i18n/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import TwoFactorManager from "./TwoFactorManager";

export default async function AdminSecurityPage() {
  const { dict, language } = await getServerDictionary();
  const session = await getSession();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, totpEnabledAt: true },
  });

  const copy = dict.admin.securityPage;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="admin-page-header__copy">
          <span className="page-intro__eyebrow">{copy.eyebrow}</span>
          <h1 className="section-title">{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <strong style={{ fontFamily: "var(--font-heading)", fontSize: "1.05rem" }}>
              {copy.twoFactor.heading}
            </strong>
            <p className="helper-text">{copy.twoFactor.description}</p>
          </div>
          <span
            className={`status-chip ${user?.totpEnabledAt ? "status-chip--success" : "status-chip--warning"}`}
          >
            {user?.totpEnabledAt ? copy.twoFactor.enabled : copy.twoFactor.disabled}
          </span>
        </div>

        <div className="admin-panel__body">
          <TwoFactorManager
            email={user?.email ?? ""}
            enabled={Boolean(user?.totpEnabledAt)}
            language={language}
          />
        </div>
      </div>
    </div>
  );
}
