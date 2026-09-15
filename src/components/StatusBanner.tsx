"use client";

import { useEffect, useRef } from "react";

type Variant = "success" | "error" | "warning" | "info";

interface StatusBannerProps {
    variant: Variant;
    children: React.ReactNode;
    /**
     * Move focus into the banner when it appears. Reserve this for the
     * direct, expected result of something the user just did — submitting a
     * form, clicking an action button — matching the "focusable error
     * summary" pattern (move focus after a failed submit). Never set it on
     * an ambient notice that can appear passively while the user is doing
     * something unrelated (browsing a calendar, a page simply loading with
     * no data): stealing focus there interrupts a task the banner had
     * nothing to do with. Ambient banners still reach screen-reader users —
     * `role="status"`/`role="alert"` announce via the live-region mechanism
     * on their own, with no focus change required.
     */
    focus?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Accessible replacement for the site's old bare `<div className="status-banner">`
 * pattern (24 call sites, none of them announced to screen readers or
 * managed focus). `role` is chosen from `variant` rather than taken as a
 * prop: error/warning are interruptive (`alert`, implicit aria-live
 * "assertive"), success/info are not (`status`, implicit aria-live
 * "polite") — both imply `aria-atomic`, so the whole message is read as one
 * unit rather than word-by-word as it renders.
 */
export default function StatusBanner({ variant, children, focus = false, className, style }: StatusBannerProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (focus) ref.current?.focus();
        // Deliberately mount-only: this must fire when the banner newly
        // appears, not on every re-render while it stays visible (a parent
        // re-rendering for an unrelated reason must not re-steal focus).
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isInterruptive = variant === "error" || variant === "warning";
    const colorClass = variant === "info" ? "" : ` status-banner--${variant}`;

    return (
        <div
            ref={ref}
            className={`status-banner${colorClass}${className ? ` ${className}` : ""}`}
            style={style}
            role={isInterruptive ? "alert" : "status"}
            aria-atomic="true"
            tabIndex={focus ? -1 : undefined}
        >
            {children}
        </div>
    );
}
