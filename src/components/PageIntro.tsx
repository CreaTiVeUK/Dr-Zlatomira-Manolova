import type { ReactNode } from "react";

type PageIntroProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  actions?: ReactNode;
  className?: string;
};

export default function PageIntro({
  eyebrow,
  title,
  subtitle,
  align = "center",
  actions,
  className = "",
}: PageIntroProps) {
  return (
    <header className={`page-intro page-intro--${align} ${className}`.trim()}>
      {eyebrow ? <span className="page-intro__eyebrow">{eyebrow}</span> : null}
      <div className="page-intro__copy">
        <h1 className="page-intro__title">{title}</h1>
        {subtitle ? <p className="page-intro__subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="page-intro__actions">{actions}</div> : null}
    </header>
  );
}
