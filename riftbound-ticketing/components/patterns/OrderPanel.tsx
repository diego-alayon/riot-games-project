"use client";

import { Button, LinkButton } from "@/components/ui/Button";
import { Price } from "@/components/ui/Data";
import { Callout, Card, Divider } from "@/components/ui/Surface";
import { InlineLink, Overline, SectionLabel } from "@/components/ui/Typography";
import { ReqMarker } from "@/components/trace/ReqMarker";
import { getPass, getSideEvent } from "@/lib/data/catalog";
import type { Pass, RiftEvent } from "@/lib/data/types";
import type { Cart } from "@/lib/state/store";
import { money } from "@/lib/format";

/** Items and total of the cart for one event. Shared by the panel and the mobile order bar. */
export function orderSummary(ev: RiftEvent, cart: Cart) {
  const inCart = cart.eventSlug === ev.slug;
  const pass = inCart && cart.passId ? getPass(cart.passId) : undefined;
  const sides = inCart ? cart.sideIds.map((id) => getSideEvent(id)).filter((s): s is NonNullable<typeof s> => !!s) : [];
  const total = (pass?.price ?? 0) + sides.reduce((a, s) => a + s.price, 0);
  return { pass, sides, total, count: (pass ? 1 : 0) + sides.length, hasItems: !!pass || sides.length > 0 };
}

/**
 * "Your Order" side panel (PAS-10). One component, several states driven by
 * the event page: empty, cart, pass already held (EVT-04), Fan First (FFA-01).
 */
export function OrderPanel({
  ev,
  cart,
  owned,
  preregs,
  mode,
  onRemovePass,
  onRemoveSide,
  onCheckout,
  sideEventsHref,
}: {
  ev: RiftEvent;
  cart: Cart;
  owned: Pass | null;
  preregs: string[];
  mode: "sale" | "fan-first";
  onRemovePass: () => void;
  onRemoveSide: (id: string) => void;
  onCheckout: () => void;
  sideEventsHref: string;
}) {
  const { pass, sides, total, hasItems } = orderSummary(ev, cart);
  const myPreregs = preregs.map((id) => getPass(id)).filter((p): p is Pass => !!p && p.eventSlug === ev.slug);

  return (
    <Card padded={false} className="overflow-hidden">
      {owned && (
        <div className="relative">
          <Callout tone="success" flush title="You already hold a pass for this event">
            {owned.name} · one pass per account. <InlineLink href="/my-tickets">View in My Tickets</InlineLink>
          </Callout>
          <ReqMarker ids={["EVT-04"]} inset />
        </div>
      )}
      {mode === "fan-first" && !owned && (
        <Callout tone="fan" flush title="Fan First Access">
          Sales haven&apos;t opened yet — pre-register and we&apos;ll email you first.
        </Callout>
      )}

      <div className="relative p-5">
        {mode === "fan-first" && !hasItems ? (
          <>
            <SectionLabel>Your pre-registrations</SectionLabel>
            {myPreregs.length ? (
              <ul className="mt-3 flex flex-col gap-2">
                {myPreregs.map((p) => (
                  <li key={p.id} className="flex justify-between text-body text-ink">
                    <span>{p.name}</span>
                    <span className="text-muted">{money(p.price, ev.currency)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-body text-muted">
                Pre-register for the passes you want — pick any badge <span className="max-lg:hidden">on the left</span><span className="lg:hidden">above</span> and we&apos;ll hold your spot in line.
              </p>
            )}
            <div className="relative mt-4 px-3 py-2.5 rounded-md border border-fan-line bg-fan-soft text-caption text-muted">
              We&apos;ll notify you at your Riot account email when sales open. Pre-registering doesn&apos;t guarantee a pass.
              <ReqMarker ids={["FFA-02"]} />
            </div>
            <ReqMarker ids={["FFA-01"]} />
          </>
        ) : !hasItems && owned ? (
          <>
            <SectionLabel>Your order</SectionLabel>
            <p className="mt-3 text-body text-muted">
              Add side events from the schedule to build your weekend — they attach to your existing pass.
            </p>
            <Divider className="my-4" />
            <div className="flex items-center justify-between">
              <Overline>Total</Overline>
              <span className="text-heading-lg uppercase text-ink">Free</span>
            </div>
            <LinkButton href={sideEventsHref} variant="secondary" size="lg" block className="mt-4">
              Browse side events
            </LinkButton>
          </>
        ) : !hasItems ? (
          <>
            <SectionLabel>Your order</SectionLabel>
            <p className="mt-2 text-body text-muted">Select a pass to get started.</p>
          </>
        ) : (
          <>
            <SectionLabel>Your order</SectionLabel>
            {pass && (
              <div className="mt-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-heading-sm uppercase text-ink">{pass.name}</p>
                    <p className="text-caption text-muted">{ev.name}</p>
                  </div>
                  <span className="text-body-lg text-ink tabular-nums">{money(pass.price, ev.currency)}</span>
                </div>
                <button type="button" onClick={onRemovePass} className="mt-1 text-micro uppercase text-accent hover:text-accent-hover">
                  Remove
                </button>
              </div>
            )}
            {sides.length > 0 && (
              <div className="mt-4">
                <Divider className="mb-3" />
                <Overline>Side events</Overline>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {sides.map((s) => (
                    <li key={s.id} className="group flex items-baseline justify-between gap-3 text-body text-ink">
                      <span>
                        {s.name}
                        <button
                          type="button"
                          onClick={() => onRemoveSide(s.id)}
                          className="ml-2 text-micro uppercase text-accent opacity-0 group-hover:opacity-100 max-lg:opacity-100"
                        >
                          Remove
                        </button>
                      </span>
                      <span className="tabular-nums">{money(s.price, ev.currency)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Divider className="my-4" />
            <div className="flex items-center justify-between">
              <Overline>Total</Overline>
              <Price size="lg">{money(total, ev.currency)}</Price>
            </div>
            <Button variant="primary" size="lg" block className="mt-4" onClick={onCheckout}>
              Continue to checkout
            </Button>
            <div className="relative mt-4">
              <Callout tone="note">
                Once you check out, you&apos;ll be added to these events on{" "}
                <InlineLink href="https://playriftbound.com" external>playriftbound.com</InlineLink>.
              </Callout>
              <ReqMarker ids={["PAS-11", "SDE-08"]} />
            </div>
          </>
        )}
        <ReqMarker ids={["PAS-10", "SDE-07", "CHK-07"]} corner="tl" />
      </div>
    </Card>
  );
}
