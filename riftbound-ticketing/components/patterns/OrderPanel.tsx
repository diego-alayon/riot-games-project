"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Callout, Card, Divider } from "@/components/ui/Surface";
import { InlineLink, Overline } from "@/components/ui/Typography";
import { IconCheck } from "@/components/icons";
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

/** EVT-04: separate pink card above the order panel. */
export function OwnedPassBanner({ pass }: { pass: Pass }) {
  return (
    <div className="relative flex gap-3 px-5 py-4 rounded-xl border border-accent-line bg-accent-soft">
      <IconCheck size={15} className="mt-0.5 shrink-0 text-accent" />
      <div className="min-w-0">
        <p className="text-label uppercase text-ink">You already hold a pass for this event</p>
        <p className="mt-0.5 text-caption text-muted">
          {pass.name} · one pass per account.{" "}
          <Link href="/my-tickets" className="underline underline-offset-2 hover:text-ink">View in My Tickets</Link>
        </p>
      </div>
      <ReqMarker ids={["EVT-04"]} inset />
    </div>
  );
}

export function GroupLabel({ children }: { children: React.ReactNode }) {
  return <p className="pb-1.5 mb-3 border-b border-line text-micro uppercase text-subtle">{children}</p>;
}

export function CartLine({ name, sub, price, onRemove, children }: { name: string; sub?: string; price: string; onRemove: () => void; children?: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-title text-ink truncate">{name}</p>
          {sub && <p className="text-caption text-muted">{sub}</p>}
        </div>
        <span className="text-body-lg text-ink tabular-nums shrink-0">{price}</span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
        <button type="button" onClick={onRemove} className="text-caption text-accent hover:text-accent-hover">
          Remove
        </button>
        {children}
      </div>
    </div>
  );
}

/**
 * "Your Order" side panel (PAS-10). States driven by the event page: empty
 * cart, cart with items, pass already held (EVT-04, banner above), Fan First
 * pre-registrations (FFA-01).
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
}: {
  ev: RiftEvent;
  cart: Cart;
  owned: Pass | null;
  preregs: string[];
  mode: "sale" | "fan-first";
  onRemovePass: () => void;
  onRemoveSide: (id: string) => void;
  onCheckout: () => void;
}) {
  const { pass, sides, total, hasItems } = orderSummary(ev, cart);
  const myPreregs = preregs.map((id) => getPass(id)).filter((p): p is Pass => !!p && p.eventSlug === ev.slug);

  return (
    <div className="flex flex-col gap-3">
      {owned && <OwnedPassBanner pass={owned} />}

      <Card padded={false} className="rounded-xl">
        <div className="relative p-5">
          {!hasItems ? (
            <div className="py-6 text-center">
              <p className="text-heading-sm text-ink normal-case">Your cart is empty</p>
              <p className="mt-1 text-caption text-muted">Add an event pass or side event to get started.</p>
            </div>
          ) : (
            <>
              {pass && (
                <>
                  <GroupLabel>Event pass</GroupLabel>
                  <CartLine name={pass.name} sub={ev.name} price={money(pass.price, ev.currency)} onRemove={onRemovePass} />
                </>
              )}
              {sides.length > 0 && (
                <div className={pass ? "mt-5" : undefined}>
                  <GroupLabel>Side events</GroupLabel>
                  <div className="flex flex-col gap-3">
                    {sides.map((s) => (
                      <CartLine key={s.id} name={s.name} price={money(s.price, ev.currency)} onRemove={() => onRemoveSide(s.id)} />
                    ))}
                  </div>
                </div>
              )}
              <Divider className="my-4" />
              <div className="flex items-center justify-between">
                <Overline>Total</Overline>
                <span className="text-display-md tabular-nums text-ink">{money(total, ev.currency)}</span>
              </div>
              <Button variant="primary" size="lg" block className="mt-4" onClick={onCheckout}>
                Continue to checkout
              </Button>
              <div className="relative mt-3">
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

        {(mode === "fan-first" || myPreregs.length > 0) && (
          <div className="relative px-5 pb-5">
            <Divider className="mb-4" />
            <GroupLabel>Your pre-registrations</GroupLabel>
            {myPreregs.length ? (
              <ul className="flex flex-col gap-2">
                {myPreregs.map((p) => (
                  <li key={p.id} className="flex justify-between gap-3 text-body text-ink">
                    <span>{p.name} Pass</span>
                    <span className="text-muted tabular-nums">{money(p.price, ev.currency)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-caption text-muted">Pre-register for the passes you want and we&apos;ll hold your spot in line.</p>
            )}
            <p className="mt-3 text-fine text-muted">
              We&apos;ll notify you at your Riot account email when sales open. Pre-registering doesn&apos;t guarantee a pass.
            </p>
            <ReqMarker ids={["FFA-01", "FFA-02"]} />
          </div>
        )}
      </Card>
    </div>
  );
}
