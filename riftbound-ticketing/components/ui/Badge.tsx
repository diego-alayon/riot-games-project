import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { IconCheck, IconDot, IconStar } from "@/components/icons";

export type BadgeTone =
  | "premium"   // orange fill — Premium tier
  | "standard"  // grey fill — Standard tier
  | "fan"       // violet tint — Fan First
  | "region"    // translucent on imagery — APAC / AMERICAS / EMEA
  | "live"      // green fill — On sale now
  | "soon"      // orange fill — On sale in N days
  | "neutral"   // grey tint on light surfaces — past pass type
  | "glass";    // white translucent on imagery — Attended, Your next event, countdown

const TONE: Record<BadgeTone, string> = {
  premium: "bg-accent text-on-accent",
  standard: "bg-surface-muted text-subtle",
  fan: "bg-fan-soft text-fan",
  region: "bg-surface-darker/40 text-on-dark border border-line-dark backdrop-blur-sm",
  live: "bg-success text-on-dark",
  soon: "bg-accent text-on-accent",
  neutral: "bg-surface-muted text-subtle",
  glass: "bg-surface/85 text-ink",
};

/** Small uppercase pill. `size="lg"` is used on featured event art. */
export function Badge({
  tone,
  size = "sm",
  icon,
  children,
  className,
}: {
  tone: BadgeTone;
  size?: "sm" | "lg";
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-pill uppercase whitespace-nowrap",
        size === "sm" ? "h-5.5 px-2.5 text-micro" : "h-8 px-3.5 text-label",
        TONE[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

export function TierBadge({ tier }: { tier: "premium" | "standard" }) {
  return <Badge tone={tier}>{tier === "premium" ? "Premium" : "Standard"}</Badge>;
}

export function FanFirstBadge() {
  return (
    <Badge tone="fan" icon={<IconStar size={10} />}>
      Fan First
    </Badge>
  );
}

/** Sale state pill used on event art. */
export function SaleBadge({ live, children, size = "sm" }: { live: boolean; children: ReactNode; size?: "sm" | "lg" }) {
  return (
    <Badge tone={live ? "live" : "soon"} size={size} icon={<IconDot size={size === "lg" ? 7 : 6} />}>
      {children}
    </Badge>
  );
}

/** Inline status text with a leading glyph — "● ON SALE NOW", "★ FAN FIRST PRE-REGISTRATION", "✓ YOUR BADGE". */
export function StatusText({
  tone,
  children,
}: {
  tone: "success" | "fan" | "danger";
  children: ReactNode;
}) {
  const color = tone === "success" ? "text-success" : tone === "fan" ? "text-fan" : "text-danger";
  const glyph =
    tone === "success" ? <IconDot /> : tone === "fan" ? <IconStar size={11} /> : null;
  return (
    <span className={cx("inline-flex items-center gap-1.5 text-micro uppercase", color)}>
      {glyph}
      {children}
    </span>
  );
}

export function OwnedText() {
  return (
    <span className="inline-flex items-center gap-1.5 text-micro uppercase text-success">
      <IconCheck size={12} />
      Your badge
    </span>
  );
}
