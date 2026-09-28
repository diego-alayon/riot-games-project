"use client";

import { useEffect, useState, type RefObject } from "react";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Data";
import { Overline } from "@/components/ui/Typography";
import { ReqMarker } from "@/components/trace/ReqMarker";

/**
 * RNF-14: sticky order summary for < lg, where the order panel stacks below the
 * content. Shows the total and "Continue to checkout" while the cart has items;
 * hides itself while the full panel is on screen.
 */
export function MobileOrderBar({
  count,
  total,
  onCheckout,
  panelRef,
}: {
  count: number;
  total: string;
  onCheckout: () => void;
  panelRef: RefObject<HTMLElement | null>;
}) {
  const [panelVisible, setPanelVisible] = useState(false);

  useEffect(() => {
    const el = panelRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setPanelVisible(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, [panelRef]);

  if (count === 0) return null;
  return (
    <>
      {/* Spacer so the fixed bar never covers the end of the page. */}
      <div aria-hidden className="lg:hidden h-mobile-bar" />
      <div
        className={
          "lg:hidden fixed inset-x-0 bottom-0 z-30 h-mobile-bar bg-surface border-t border-line shadow-overlay transition-transform " +
          (panelVisible ? "translate-y-full" : "translate-y-0")
        }
      >
        <div className="relative h-full px-4 md:px-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="min-w-0 flex flex-col items-start text-left"
          >
            <Overline>
              Your order · {count} {count === 1 ? "item" : "items"}
            </Overline>
            <Price size="lg">{total}</Price>
          </button>
          <Button variant="primary" size="md" onClick={onCheckout}>
            <span className="sm:hidden">Checkout</span>
            <span className="max-sm:hidden">Continue to checkout</span>
          </Button>
          <ReqMarker ids={["PAS-10"]} corner="tr" inset />
        </div>
      </div>
    </>
  );
}
