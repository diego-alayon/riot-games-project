import Link from "next/link";
import { cx } from "@/lib/cx";

export interface TabItem {
  label: string;
  /** Shown instead of `label` below the sm breakpoint. */
  shortLabel?: string;
  href?: string;
  active?: boolean;
  disabled?: boolean;
  hint?: string;
}

/**
 * Underlined tabs. `size="nav"` is the site header navigation (12px),
 * `size="section"` the event sub-tabs (14px) with a baseline rule.
 */
export function Tabs({ items, size = "section", className }: { items: TabItem[]; size?: "nav" | "section"; className?: string }) {
  const isNav = size === "nav";
  return (
    <nav
      className={cx(
        "flex",
        // Section tabs scroll sideways inside their own row on narrow screens instead of widening the page.
        isNav ? "gap-3 sm:gap-6 h-full" : "gap-6 border-b border-line max-md:overflow-x-auto max-md:scrollbar-none",
        className,
      )}
    >
      {items.map((t) => {
        const inner = (
          <span
            className={cx(
              "relative inline-flex items-center uppercase whitespace-nowrap",
              isNav ? "h-full text-label" : "pb-3 text-tab",
              t.active ? "text-ink" : t.disabled ? "text-disabled" : "text-subtle hover:text-ink",
            )}
          >
            {t.shortLabel ? (
              <>
                <span className="sm:hidden">{t.shortLabel}</span>
                <span className="max-sm:hidden">{t.label}</span>
              </>
            ) : (
              t.label
            )}
            {t.active && (
              <span
                className={cx(
                  "absolute left-0 right-0 bg-accent rounded-pill",
                  isNav ? "bottom-4 h-0.5" : "bottom-0 md:-bottom-px h-0.75",
                )}
              />
            )}
          </span>
        );
        if (t.disabled || !t.href)
          return (
            <span key={t.label} title={t.hint} aria-disabled className="shrink-0 cursor-not-allowed">
              {inner}
            </span>
          );
        return (
          <Link key={t.label} href={t.href} aria-current={t.active ? "page" : undefined} className="shrink-0">
            {inner}
          </Link>
        );
      })}
    </nav>
  );
}
