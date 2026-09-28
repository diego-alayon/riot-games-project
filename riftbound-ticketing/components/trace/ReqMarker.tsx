"use client";

import { cx } from "@/lib/cx";
import { REQUIREMENTS, requirementHref } from "@/lib/trace/requirements";
import { useTrace } from "@/lib/trace/trace-context";

/**
 * Requirement marker. Drop inside any `relative` element.
 *
 * Trace mode off (default): renders nothing — zero pixels, zero DOM.
 * Trace mode on: a tiny mono tag just outside a corner (or inside with `inset`), at low opacity. Hovering it
 * outlines the region it belongs to; clicking opens the requirement in the
 * Riot Games Project catalog in a new tab.
 */
export function ReqMarker({
  ids,
  corner = "tr",
  inset = false,
}: {
  ids: string[];
  /** "r" / "l" sit beside the region — use for small controls (CTAs, prices). */
  corner?: "tr" | "tl" | "br" | "bl" | "r" | "l";
  /** Place the tag inside the region instead of straddling its edge. */
  inset?: boolean;
}) {
  const { trace } = useTrace();
  if (!trace) return null;

  const pos = {
    tr: inset ? "top-1 right-1" : "bottom-full right-0 mb-px",
    tl: inset ? "top-1 left-1" : "bottom-full left-0 mb-px",
    br: inset ? "bottom-1 right-1" : "top-full right-0 mt-px",
    bl: inset ? "bottom-1 left-1" : "top-full left-0 mt-px",
    r: "left-full top-1/2 -translate-y-1/2 ml-1 flex-col",
    l: "right-full top-1/2 -translate-y-1/2 mr-1 flex-col",
  }[corner];

  return (
    <span className="group/req pointer-events-none absolute inset-0 z-20" data-trace>
      <span className="absolute -inset-1 rounded-md outline outline-dashed outline-fan/70 opacity-0 group-hover/req:opacity-100 transition-opacity" />
      <span className={cx("absolute flex gap-0.5 w-max whitespace-nowrap pointer-events-auto", pos)}>
        {ids.map((id) => {
          const r = REQUIREMENTS[id];
          // Not an <a>: markers often sit inside cards that are links themselves,
          // and <a> inside <a> is invalid HTML (hydration error). The tag opens
          // the catalog itself and stops the host link from navigating.
          const open = (e: React.SyntheticEvent) => {
            e.preventDefault();
            e.stopPropagation();
            window.open(requirementHref(id), "_blank", "noopener,noreferrer");
          };
          return (
            <span
              key={id}
              role="link"
              tabIndex={0}
              title={r ? `${id} · ${r.name} — ${r.priority} · ${r.status}` : id}
              onClick={open}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && open(e)}
              className={cx(
                "font-mono text-[9px] leading-none px-1 py-0.5 rounded-xs bg-surface/90 border cursor-pointer",
                "opacity-40 hover:opacity-100 focus-visible:opacity-100 transition-opacity",
                r?.status === "Confirmado" ? "text-fan border-fan-line" : "text-subtle border-line-strong border-dashed",
              )}
            >
              {id}
            </span>
          );
        })}
      </span>
    </span>
  );
}
