import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { IconCheck, IconChevronDown, IconChevronUp } from "@/components/icons";

/** Green-check benefit list. `size="sm"` is the compact card preview. */
export function BenefitList({ items, muted, className }: { items: string[]; muted?: boolean; className?: string }) {
  return (
    <ul className={cx("flex flex-col gap-1.5", className)}>
      {items.map((b) => (
        <li key={b} className={cx("flex gap-2.5 text-body", muted ? "text-disabled" : "text-copy")}>
          <IconCheck size={14} className={cx("mt-1 shrink-0", muted ? "text-success/50" : "text-success")} />
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}

/** Key / value rows in micro caps ("AVAILABILITY … 42 OF 128 LEFT"). */
export function MetaList({ rows, className }: { rows: Array<{ label: string; value: ReactNode; tone?: "danger" }>; className?: string }) {
  return (
    <dl className={cx("flex flex-col gap-1.5", className)}>
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between gap-4">
          <dt className="text-micro uppercase text-subtle">{r.label}</dt>
          <dd className={cx("text-micro uppercase", r.tone === "danger" ? "text-danger" : "text-ink")}>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Two-column detail grid used in expanded side events ("DURATION / 7hr:00m"). */
export function DetailGrid({ items }: { items: Array<{ label: string; value: ReactNode; tone?: "danger" }> }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
      {items.map((i) => (
        <div key={i.label}>
          <dt className="text-micro uppercase text-subtle">{i.label}</dt>
          <dd className={cx("mt-0.5 text-body-sm", i.tone === "danger" ? "text-danger" : "text-ink")}>{i.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Orange uppercase disclosure — "SEE MORE ⌄" / "SEE LESS ⌃". */
export function DisclosureToggle({
  open,
  onToggle,
  moreLabel = "See more",
  lessLabel = "See less",
}: {
  open: boolean;
  onToggle: () => void;
  moreLabel?: string;
  lessLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="inline-flex items-center gap-1.5 text-label uppercase text-accent hover:text-accent-hover"
    >
      {open ? lessLabel : moreLabel}
      {open ? <IconChevronUp size={13} /> : <IconChevronDown size={13} />}
    </button>
  );
}

/** Price display. `size` maps to the price token or the total token. */
export function Price({ children, size = "md", tone = "ink" }: { children: ReactNode; size?: "sm" | "md" | "lg"; tone?: "ink" | "muted" }) {
  return (
    <span
      className={cx(
        "tabular-nums whitespace-nowrap",
        size === "sm" && "text-body",
        size === "md" && "text-price",
        size === "lg" && "text-heading-lg",
        tone === "ink" ? "text-ink" : "text-disabled",
      )}
    >
      {children}
    </span>
  );
}

/** Line item row in order summaries. */
export function LineItem({ label, value, children, strong }: { label: ReactNode; value: ReactNode; children?: ReactNode; strong?: boolean }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <span className={cx("text-body", strong ? "text-heading-sm uppercase text-ink" : "text-ink")}>{label}</span>
        <span className="text-body text-ink tabular-nums">{value}</span>
      </div>
      {children}
    </div>
  );
}

/** Rounded counter pill ("340 PRIZE TICKETS"). */
export function StatPill({ icon, value, label }: { icon: ReactNode; value: ReactNode; label: string }) {
  return (
    <div className="inline-flex items-center gap-3 h-12 pl-2 pr-4 rounded-pill bg-surface border border-line shadow-card">
      <span className="inline-flex items-center justify-center size-8 rounded-pill bg-accent-soft text-accent">{icon}</span>
      <span className="flex flex-col">
        <span className="text-heading-sm text-ink leading-none">{value}</span>
        <span className="mt-1 text-micro uppercase text-subtle">{label}</span>
      </span>
    </div>
  );
}

export function Avatar({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center justify-center size-7 rounded-pill bg-surface-dark text-on-dark text-micro">
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}
