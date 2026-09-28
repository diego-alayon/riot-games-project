import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { IconArrowLeft } from "@/components/icons";

type Level = "display-hero" | "display-xl" | "display-lg" | "display-md" | "heading-lg" | "heading-md" | "heading-sm";

const LEVEL: Record<Level, string> = {
  "display-hero": "text-display-hero",
  "display-xl": "text-display-xl",
  "display-lg": "text-display-lg",
  "display-md": "text-display-md",
  "heading-lg": "text-heading-lg",
  "heading-md": "text-heading-md",
  "heading-sm": "text-heading-sm",
};

/** Same scale applied from the md breakpoint up (full strings so Tailwind generates them). */
const LEVEL_MD: Record<Level, string> = {
  "display-hero": "md:text-display-hero",
  "display-xl": "md:text-display-xl",
  "display-lg": "md:text-display-lg",
  "display-md": "md:text-display-md",
  "heading-lg": "md:text-heading-lg",
  "heading-md": "md:text-heading-md",
  "heading-sm": "md:text-heading-sm",
};

/**
 * Headings are uppercase, extra-bold, ink by default. `titleCase` keeps the
 * authored casing (hero titles over key art, pass and side event names).
 * `mobile` sets a smaller step of the scale below md; `level` applies from md up.
 */
export function Heading({
  level,
  mobile,
  titleCase,
  as: Tag = "h2",
  tone = "ink",
  children,
  className,
}: {
  level: Level;
  mobile?: Level;
  titleCase?: boolean;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  tone?: "ink" | "on-dark" | "muted";
  children: ReactNode;
  className?: string;
}) {
  const color = tone === "ink" ? "text-ink" : tone === "on-dark" ? "text-on-dark" : "text-disabled";
  const size = mobile ? cx(LEVEL[mobile], LEVEL_MD[level]) : LEVEL[level];
  return <Tag className={cx(size, !titleCase && "uppercase", color, className)}>{children}</Tag>;
}

/** Uppercase tracked label above a group ("COMPETITOR", "YOUR ORDER", "UPCOMING"). */
export function SectionLabel({ children, right, className }: { children: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <div className={cx("flex items-center justify-between gap-4", className)}>
      <span className="text-label uppercase text-subtle">{children}</span>
      {right}
    </div>
  );
}

/** Small uppercase key label ("QUANTITY", "TOTAL", "SIDE EVENTS"). */
export function Overline({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx("text-micro uppercase text-subtle", className)}>{children}</span>;
}

/** Orange date line above event titles ("SEP 4 - 6, 2026"). */
export function DateLine({ children, size = "sm" }: { children: ReactNode; size?: "sm" | "lg" }) {
  return (
    <span className={cx("uppercase text-accent", size === "sm" ? "text-overline" : "text-label")}>{children}</span>
  );
}

/** "← ALL EVENTS" style back link. */
export function BackLink({ href, children, tone = "ink" }: { href: string; children: ReactNode; tone?: "ink" | "on-dark" }) {
  return (
    <Link
      href={href}
      className={cx(
        "inline-flex items-center gap-1.5 text-overline uppercase hover:underline underline-offset-4",
        tone === "on-dark" ? "text-on-dark hover:text-on-dark-muted" : "text-subtle hover:text-ink",
      )}
    >
      <IconArrowLeft size={12} />
      {children}
    </Link>
  );
}

/** Inline orange underlined link inside copy ("playriftbound.com", "View in My Tickets"). */
export function InlineLink({ href, children, external }: { href: string; children: ReactNode; external?: boolean }) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="text-accent underline underline-offset-2 hover:text-accent-hover"
    >
      {children}
    </Link>
  );
}
