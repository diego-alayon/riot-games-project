"use client";

import { useRouter } from "next/navigation";
import { useRef, type ReactNode } from "react";
import { Tabs } from "@/components/ui/Tabs";
import { ReqMarker } from "@/components/trace/ReqMarker";
import type { RiftEvent } from "@/lib/data/types";
import { ownedPassFor, useStore } from "@/lib/state/store";
import { EventHero } from "./Heroes";
import { Container, TwoColumn } from "./Layout";
import { OrderPanel, orderSummary } from "./OrderPanel";
import { MobileOrderBar } from "./MobileOrderBar";
import { money } from "@/lib/format";

/** Hero + sub-tabs + two columns with the order panel. Shared by P-02 / P-03 / P-05. */
export function EventShell({
  ev,
  tab,
  mode = "sale",
  children,
}: {
  ev: RiftEvent;
  tab: "passes" | "side";
  mode?: "sale" | "fan-first";
  children: ReactNode;
}) {
  const router = useRouter();
  const store = useStore();
  const owned = store.ready ? ownedPassFor(store.orders, ev.slug) : null;
  const base = `/events/${ev.slug}`;
  const panelRef = useRef<HTMLDivElement>(null);
  const summary = orderSummary(ev, store.cart);
  const checkout = () => router.push(store.session ? "/checkout" : `/login?next=/checkout`);
  // RN-06 at tab level (v2 comps): a signed-in fan with no pass of this event, held
  // or in the cart, cannot open Side Events. A pass in the cart unlocks it so a pass
  // and side events can be bought together (SDE-07; PQ-37 still open). Visitors
  // without a session keep read access (ACC-01).
  const passInCart = store.cart.eventSlug === ev.slug && !!store.cart.passId;
  const sideLocked = store.ready && !!store.session && !owned && !passInCart;

  return (
    <>
      <EventHero ev={ev} />
      <Container className="py-6 md:py-10">
        <TwoColumn
          main={
            <>
              <div className="relative">
                <Tabs
                  items={[
                    { label: "Event Passes", shortLabel: "Passes", href: base, active: tab === "passes" },
                    { label: "Side Events", href: `${base}/side-events`, active: tab === "side", disabled: sideLocked && tab !== "side", hint: "Get a pass for this event to add side events" },
                    { label: "On Demand Events", shortLabel: "On Demand", disabled: true, hint: "Not available in the first release" },
                  ]}
                />
                <ReqMarker ids={["EVT-01", "EVT-02", "SDE-06"]} corner="tr" />
              </div>
              <div className="mt-6">{children}</div>
            </>
          }
          aside={
            <div ref={panelRef} className="scroll-mt-[calc(var(--spacing-header)+16px)]">
              <OrderPanel
                ev={ev}
                cart={store.cart}
                owned={owned?.pass ?? null}
                preregs={store.preregs}
                mode={mode}
                onRemovePass={store.removePass}
                onRemoveSide={(id) => store.toggleSide(ev.slug, id)}
                onCheckout={checkout}
              />
            </div>
          }
        />
      </Container>
      <MobileOrderBar count={summary.count} total={money(summary.total, ev.currency)} onCheckout={checkout} panelRef={panelRef} />
    </>
  );
}

/** ACC-02 / RN-01: any purchase intent without a session goes to RSO first. */
export function useRequireSession() {
  const router = useRouter();
  const { session } = useStore();
  return (action: () => void) => {
    if (session) return action();
    router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
  };
}
