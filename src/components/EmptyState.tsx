import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: "neutral" | "accent" | "warning" | "success";
  compact?: boolean;
};

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = "neutral",
  compact = false,
}: EmptyStateProps) {
  return (
    <div className={`empty-state empty-state--${tone}${compact ? " empty-state--compact" : ""}`}>
      {Icon ? (
        <span className="empty-state__icon" aria-hidden="true">
          <Icon size={compact ? 18 : 22} />
        </span>
      ) : null}
      <div className="empty-state__copy">
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <div className="empty-state__action">{action}</div> : null}
    </div>
  );
}
