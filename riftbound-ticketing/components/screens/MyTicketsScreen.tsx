"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { StatPill } from "@/components/ui/Data";
import { Modal, useToast } from "@/components/ui/Overlay";
import { Callout } from "@/components/ui/Surface";
import { Heading, InlineLink, SectionLabel } from "@/components/ui/Typography";
import { IconTicket } from "@/components/icons";
import { ReqMarker } from "@/components/trace/ReqMarker";
import { Container } from "@/components/patterns/Layout";
import { PastEventRow, TicketCard, type EventHolding, type HeldItem } from "@/components/patterns/TicketCard";
import { getEvent } from "@/lib/data/catalog";
import { isUpcoming, useStore } from "@/lib/state/store";
import { usePrivatePage } from "@/lib/state/private-page";
import { money } from "@/lib/format";


/** P-08 My Tickets. */
export function MyTicketsScreen() {
  const params = useSearchParams();
  const toast = useToast();
  const store = useStore();
  const [welcome, setWelcome] = useState(params.get("welcome") === "1");
  const [refund, setRefund] = useState<{ ev: EventHolding["ev"]; items: HeldItem[] } | null>(null);

  const allowed = usePrivatePage("/my-tickets"); // ACC-03.1, ACC-04.6

  const holdings = useMemo(() => {
    const map = new Map<string, EventHolding>();
    for (const o of store.orders) {
      const ev = getEvent(o.eventSlug);
      if (!ev) continue;
      const h = map.get(ev.slug) ?? { ev, orders: [], passes: [], sides: [] };
      h.orders.push(o);
      for (const i of o.items) {
        // PAS-06: a fan can hold one pass of each type; each pass has its own badge.
        const held = { ...i, orderId: o.id, badgeCode: i.badgeCode ?? (i.kind === "pass" ? o.badgeCode : undefined) };
        if (i.kind === "pass") h.passes.push(held);
        else if (i.kind === "side") h.sides.push(held);
      }
      map.set(ev.slug, h);
    }
    return [...map.values()].sort((a, b) => a.ev.startDate.localeCompare(b.ev.startDate));
  }, [store.orders]);

  if (!allowed) return null;

  const upcoming = holdings.filter((h) => isUpcoming(h.ev.endDate));
  const past = holdings.filter((h) => !isUpcoming(h.ev.endDate)).reverse();
  const vouchers = store.vouchers.filter((v) => !v.usedOn).length;
  const pending = (what: string) => toast(`${what} — pending definition in the PRD.`);

  const refundTotal = refund ? refund.items.reduce((sum, i) => sum + i.price - i.voucherDiscount, 0) : 0;

  const confirmRefund = () => {
    if (!refund) return;
    for (const i of refund.items) store.refundItem(i.orderId, i.refId);
    setRefund(null);
    toast("Refund requested. You'll see it on your original payment method.");
  };

  return (
    <Container className="py-8 md:py-12">
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <Heading level="display-lg" mobile="display-md" as="h1">My tickets</Heading>
        <div className="relative flex flex-wrap gap-3">
          <StatPill icon={<IconTicket size={15} />} value={vouchers} label="Side vouchers" />
          <ReqMarker ids={["MYT-10"]} />
        </div>
      </div>

      {welcome && (
        <div className="relative mt-6">
          <Callout tone="brand" title="You're in — see you there!" onDismiss={() => setWelcome(false)} className="px-5! py-4!">
            <span className="text-body">
              You have been added to the events on <InlineLink href="https://playriftbound.com" external>playriftbound.com</InlineLink> — show
              your code at the door to check in!
            </span>
          </Callout>
          <ReqMarker ids={["SDE-08"]} />
        </div>
      )}

      <section className="relative mt-8">
        <SectionLabel>Upcoming</SectionLabel>
        <div className="mt-3 flex flex-col gap-6">
          {upcoming.length === 0 && <p className="text-body text-muted">No upcoming events yet.</p>}
          {upcoming.map((h, i) => (
            <TicketCard
              key={h.ev.slug}
              h={h}
              next={i === 0}
              onPending={pending}
              onRefund={(items) => setRefund({ ev: h.ev, items })}
            />
          ))}
        </div>
        <ReqMarker ids={["MYT-01"]} corner="tl" />
      </section>

      {past.length > 0 && (
        <section className="mt-10">
          <SectionLabel>Past events</SectionLabel>
          <div className="mt-3 flex flex-col gap-3">
            {past.map((h) => (
              <PastEventRow key={h.ev.slug} h={h} onRecap={() => pending("Event recap")} />
            ))}
          </div>
        </section>
      )}

      <Modal
        open={!!refund}
        onClose={() => setRefund(null)}
        title={<span className="normal-case">Confirm refund</span>}
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setRefund(null)}>Go back</Button>
            <Button variant="primary" size="md" onClick={confirmRefund}>Confirm refund</Button>
          </>
        }
      >
        {refund && (
          <>
            <p>You are about to refund the following items. This action cannot be undone.</p>
            <ul className="mt-4 flex flex-col gap-1.5 px-3 py-3 rounded-md bg-canvas text-body-sm text-ink">
              {refund.items.map((i) => (
                <li key={`${i.orderId}:${i.refId}`}>
                  {i.name} — {money(i.price - i.voucherDiscount, refund.ev.currency)}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between text-body">
              <span>Refund total</span>
              <span className="font-bold text-ink tabular-nums">{money(refundTotal, refund.ev.currency)}</span>
            </div>
            {refund.items.some((i) => i.kind === "pass") && (
              <p className="mt-3 text-caption text-muted">Refunding your event pass also cancels your side event registrations for this event.</p>
            )}
          </>
        )}
      </Modal>
    </Container>
  );
}
