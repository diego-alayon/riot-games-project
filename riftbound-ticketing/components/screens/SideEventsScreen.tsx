"use client";

import { Callout } from "@/components/ui/Surface";
import { Heading, InlineLink } from "@/components/ui/Typography";
import { ReqMarker } from "@/components/trace/ReqMarker";
import { EventShell, useRequireSession } from "@/components/patterns/EventShell";
import { SideEventCard, type SideEventCta } from "@/components/patterns/SideEventCard";
import { sideEventsFor } from "@/lib/data/catalog";
import type { RiftEvent } from "@/lib/data/types";
import { ownedPassFor, registeredSideIds, useStore } from "@/lib/state/store";
import { dayHeading, saleLabelFor } from "./helpers";

/** P-03 Weekend Schedule. */
export function SideEventsScreen({ ev }: { ev: RiftEvent }) {
  const store = useStore();
  const requireSession = useRequireSession();
  const owned = store.ready ? ownedPassFor(store.orders, ev.slug) : null;
  const registered = store.ready ? registeredSideIds(store.orders, ev.slug) : new Set<string>();
  const passInCart = store.cart.eventSlug === ev.slug && !!store.cart.passId;
  // RN-06: a pass of this event is required. A pass in the cart counts (F-04; PQ-37 open).
  const unlocked = !store.session || !!owned || passInCart;

  const events = sideEventsFor(ev).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  const days = [...new Set(events.map((e) => e.date))];

  const ctaFor = (id: string, seatsLeft: number): SideEventCta => {
    if (registered.has(id)) return "registered";
    if (store.cart.eventSlug === ev.slug && store.cart.sideIds.includes(id)) return "added";
    if (seatsLeft === 0) return "full";
    if (!unlocked) return "locked";
    return "add";
  };

  return (
    <EventShell ev={ev} tab="side">
      {!ev.sideSaleOpen ? (
        <Callout tone="neutral" title="Side events aren't on sale yet">
          The weekend schedule opens separately from passes — usually a few weeks later. {saleLabelFor(ev)}
        </Callout>
      ) : (
        <>
          <div className="relative">
            <Heading level="heading-lg">Weekend schedule</Heading>
            <ReqMarker ids={["SDE-01"]} corner="tr" />
          </div>
          {!unlocked && (
            <div className="relative mt-4">
              <Callout tone="note" title="A pass is required for side events">
                Pick a pass in <InlineLink href={`/events/${ev.slug}`}>Event Passes</InlineLink> — you can buy it together with side events in one order.
              </Callout>
              <ReqMarker ids={["SDE-06", "SDE-07"]} />
            </div>
          )}
          {days.map((day) => (
            <section key={day} className="mt-6">
              <h3 className="pb-3 border-b border-line text-heading-md uppercase text-ink">{dayHeading(day)}</h3>
              <div className="mt-3 flex flex-col gap-3">
                {events
                  .filter((e) => e.date === day)
                  .map((se) => (
                    <SideEventCard
                      key={se.id}
                      se={se}
                      currency={ev.currency}
                      cta={ctaFor(se.id, se.seatsLeft)}
                      onToggle={() => requireSession(() => store.toggleSide(ev.slug, se.id))}
                    />
                  ))}
              </div>
            </section>
          ))}
        </>
      )}
    </EventShell>
  );
}
