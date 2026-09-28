import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

/** Attribute tag — side event format, time limit, cut ("SWISS", "BEST OF THREE"). */
export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center h-6 px-2.5 rounded-pill bg-surface-muted text-copy text-micro uppercase whitespace-nowrap",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Selectable filter pill — game category bar on Find Events. */
export function FilterChip({
  active,
  disabled,
  icon,
  children,
  onClick,
}: {
  active?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cx(
        "inline-flex items-center gap-2 h-9 px-4 rounded-pill text-body-sm border transition-colors",
        active
          ? "bg-surface-dark border-surface-dark text-on-dark"
          : "bg-surface border-line-strong text-copy hover:bg-canvas",
        disabled && "opacity-45 hover:bg-surface",
      )}
    >
      {icon}
      {children}
    </button>
  );
}
