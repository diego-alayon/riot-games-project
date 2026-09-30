"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/state/store";
import { useTrace } from "@/lib/trace/trace-context";
import { MANAGER_URL } from "@/lib/trace/requirements";
import { cx } from "@/lib/cx";

/**
 * Floating presenter tools. Only exists while trace mode is on, so it never
 * shows in a stakeholder demo unless the presenter turns it on (⌥T).
 * < lg it starts collapsed to a small "Trace" pill (above the mobile order bar)
 * so it never covers the screen; tap to expand.
 */
export function PresenterPanel() {
  const { trace, setTrace } = useTrace();
  const { session, signIn, signOut, expireSession, resetDemo } = useStore();
  const [expanded, setExpanded] = useState(false);
  if (!trace) return null;

  const seg = (active: boolean) =>
    cx("px-2 h-6 rounded-xs text-[10px] font-semibold", active ? "bg-fan text-on-accent" : "text-subtle hover:text-ink");

  const place = "fixed right-4 z-40 bottom-[calc(var(--spacing-mobile-bar)+12px)] lg:bottom-4";

  return (
    <>
    {!expanded && (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className={cx(place, "lg:hidden h-7 px-2.5 rounded-pill border border-fan-line bg-surface/95 shadow-raised backdrop-blur font-mono text-micro uppercase text-fan")}
      >
        Trace ▴
      </button>
    )}
    <div
      className={cx(
        place,
        "w-60 max-w-[calc(100vw-32px)] rounded-lg border border-fan-line bg-surface/95 shadow-raised backdrop-blur p-3 font-mono text-[10px] text-subtle",
        !expanded && "max-lg:hidden",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold text-fan uppercase tracking-wider">Trace mode</span>
        <span className="flex items-center gap-3">
          <button onClick={() => setExpanded(false)} className="lg:hidden hover:text-ink" title="Collapse">
            ▾
          </button>
          <button onClick={() => setTrace(false)} className="hover:text-ink" title="Hide (⌥T)">
            ⌥T ✕
          </button>
        </span>
      </div>
      <p className="mt-1 leading-snug">Tags link to the requirement in the catalog.</p>

      <div className="mt-3 flex items-center justify-between">
        <span>Session</span>
        <span className="inline-flex rounded-sm border border-line p-0.5">
          <button className={seg(!!session)} onClick={signIn}>signed in</button>
          <button className={seg(!session)} onClick={signOut}>anonymous</button>
        </span>
      </div>
      {session && (
        <button onClick={expireSession} className="mt-1.5 hover:text-ink underline" title="The RSO session lapses; the cart is kept (ACC-02.3, ACC-04.8)">
          expire session
        </button>
      )}

      <div className="mt-3 pt-2 border-t border-line flex flex-wrap gap-x-3 gap-y-1">
        <Link href="/design-system" className="hover:text-ink underline">design system</Link>
        <a href={`${MANAGER_URL}/product/initiatives/catalog`} target="_blank" rel="noopener noreferrer" className="hover:text-ink underline">
          FR catalog ↗
        </a>
        <button onClick={resetDemo} className="hover:text-ink underline">reset demo data</button>
      </div>
    </div>
    </>
  );
}
