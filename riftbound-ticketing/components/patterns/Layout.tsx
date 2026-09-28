import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

/** 1136px centered content column. 16px side gutter on mobile, 24px from md up. */
export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("mx-auto max-w-page px-4 md:px-6 box-content", className)}>{children}</div>;
}

/**
 * Main column (744) + order panel (360), 32px gap. Panel is sticky under the header.
 * < lg: single column, the panel stacks below the main content (RNF-14).
 * lg: fluid main + 360 panel. xl+: the fixed desktop comp widths.
 */
export function TwoColumn({ main, aside }: { main: ReactNode; aside: ReactNode }) {
  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-gutter">
      <div className="min-w-0 lg:flex-1 xl:flex-none xl:w-main xl:shrink-0">{main}</div>
      <aside className="min-w-0 lg:w-aside lg:shrink-0 lg:sticky lg:top-[calc(var(--spacing-header)+24px)]">{aside}</aside>
    </div>
  );
}
