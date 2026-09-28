import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { IconCheck, IconClose, IconStar, IconTicket } from "@/components/icons";

export type CardState = "default" | "selected" | "owned" | "fan" | "dimmed";

const CARD_STATE: Record<CardState, string> = {
  default: "border-line",
  selected: "border-accent",
  owned: "border-success",
  fan: "border-fan-line",
  dimmed: "border-line",
};

/** White surface with a 1px line and 8px radius. Every panel and card builds on this. */
export function Card({
  state = "default",
  padded = true,
  children,
  className,
}: {
  state?: CardState;
  padded?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "relative bg-surface border rounded-lg shadow-card",
        CARD_STATE[state],
        padded && "p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Divider({ className, tone = "line" }: { className?: string; tone?: "line" | "dark" }) {
  return <hr className={cx("border-0 border-t", tone === "line" ? "border-line" : "border-line-dark", className)} />;
}

export type CalloutTone = "success" | "brand" | "warning" | "fan" | "note" | "neutral";

const CALLOUT: Record<CalloutTone, { box: string; icon: ReactNode; title: string }> = {
  success: { box: "bg-success-soft border-success-line", icon: <IconCheck size={16} className="text-success" />, title: "text-ink" },
  brand: { box: "bg-accent-soft border-accent", icon: <IconCheck size={16} className="text-accent" />, title: "text-ink" },
  warning: { box: "bg-warning-soft border-warning-line", icon: <span className="block w-1 h-4 rounded-pill bg-warning" />, title: "text-ink" },
  fan: { box: "bg-fan-soft border-fan-line", icon: <IconStar size={13} className="text-fan" />, title: "text-fan" },
  note: { box: "bg-accent-soft border-accent-line", icon: <IconTicket size={14} className="text-accent" />, title: "text-ink" },
  neutral: { box: "bg-surface border-line", icon: null, title: "text-ink" },
};

/**
 * Tinted message block. `title` is rendered as an uppercase label.
 * `flush` removes the border and radius so it can sit as a panel header.
 */
export function Callout({
  tone,
  title,
  children,
  onDismiss,
  flush,
  hideIcon,
  className,
}: {
  tone: CalloutTone;
  title?: ReactNode;
  children?: ReactNode;
  onDismiss?: () => void;
  flush?: boolean;
  hideIcon?: boolean;
  className?: string;
}) {
  const t = CALLOUT[tone];
  return (
    <div
      className={cx(
        "relative flex gap-3",
        t.box,
        flush ? "border-0 border-b px-5 py-4" : "border rounded-md px-4 py-3",
        className,
      )}
    >
      {!hideIcon && t.icon && <span className="mt-0.5 shrink-0">{t.icon}</span>}
      <div className="flex-1 min-w-0">
        {title && <p className={cx("text-label uppercase", t.title)}>{title}</p>}
        {children && <div className={cx("text-caption text-muted", !!title && "mt-0.5")}>{children}</div>}
      </div>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Dismiss" className="shrink-0 self-start text-muted hover:text-ink">
          <IconClose size={16} />
        </button>
      )}
    </div>
  );
}
