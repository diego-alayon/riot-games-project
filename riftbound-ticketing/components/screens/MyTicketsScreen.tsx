"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { StatPill } from "@/components/ui/Data";
import { Modal, useToast } from "@/components/ui/Overlay";
import { Callout } from "@/components/ui/Surface";
import { Heading, InlineLink, SectionLabel } from "@/components/ui/Typography";
import { IconTarget, IconTicket } from "@/components/icons";
import { ReqMarker } from "@/components/trace/ReqMarker";
import { Container } from "@/components/patterns/Layout";
import { PastEventRow, TicketCard, type EventHolding, type HeldItem } from "@/components/patterns/TicketCard";
import { getEvent } from "@/lib/data/catalog";
import { isUpcoming, useStore } from "@/lib/state/store";
import { money } from "@/lib/format";

type RefundTarget = { kind: "item"; item: HeldItem } | { kind: "order"; orderId: string };

/** P-08 My Tickets. */
export function MyTicketsScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const store = useStore();
  const [welcome, setWelcome] = useState(params.get("welcome") === "1");
  const [refund, setRefund] = useState<RefundTarget | null>(null);

  useEffect(() => {
    if (store.ready && !store.session) router.replace("/login?next=/my-tickets"); // ACC-03
  }, [store.ready, store.session, router]);

  const holdings = useMemo(() => {
    const map = new Map<string, EventHolding>();
    for (const o of store.orders) {
      const ev = getEvent(o.eventSlug);
      if (!ev) continue;
      const h = map.get(ev.slug) ?? { ev, orders: [], sides: [] };
      h.orders.push(o);
      for (const i of o.items) {
        const held = { ...i, orderId: o.id };
        if (i.kind === "pass" && (!h.pass || h.pass.refunded)) {
          h.pass = held;
          h.badgeCode = o.badgeCode;
        } else if (i.kind === "side") h.sides.push(held);
      }
      map.set(ev.slug, h);
    }
    return [...map.values()].sort((a, b) => a.ev.startDate.localeCompare(b.ev.startDate));
  }, [store.orders]);

  if (!store.ready || !store.session) return null;

  const upcoming = holdings.filter((h) => isUpcoming(h.ev.endDate));
  const past = holdings.filter((h) => !isUpcoming(h.ev.endDate)).reverse();
  const vouchers = store.vouchers.filter((v) => !v.usedOn).length;
  const pending = (what: string) => toast(`${what} — pending definition in the PRD.`);

  const refundAmount = (() => {
    if (!refund) return null;
    if (refund.kind === "item") {
      const ev = holdings.find((h) => h.orders.some((o) => o.id === refund.item.orderId))?.ev;
      return ev ? money(refund.item.price - refund.item.voucherDiscount, ev.currency) : null;
    }
    const h = holdings.find((x) => x.orders.some((o) => o.id === refund.orderId));
    const o = h?.orders.find((x) => x.id === refund.orderId);
    return h && o ? money(o.items.filter((i) => !i.refunded).reduce((a, i) => a + i.price - i.voucherDiscount, 0), h.ev.currency) : null;
  })();

  const confirmRefund = () => {
    if (!refund) return;
    if (refund.kind === "item") store.refundItem(refund.item.orderId, refund.item.refId);
    else store.refundOrder(refund.orderId);
    setRefund(null);
    toast("Refund requested. You'll see it on your original payment method.");
  };

  return (
    <Container className="py-8 md:py-12">
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <Heading level="display-lg" mobile="display-md" as="h1">My tickets</Heading>
        <div className="relative flex flex-wrap gap-3">
          <StatPill icon={<IconTarget size={15} />} value={store.prizeTickets} label="Prize tickets" />
          <StatPill icon={<IconTicket size={15} />} value={vouchers} label="Side vouchers" />
          <ReqMarker ids={["MYT-10"]} />
        </div>
      </div>

      {welcome && (
        <div className="relative mt-6">
          <Callout tone="success" title="You're in — see you there!" onDismiss={() => setWelcome(false)} className="px-5! py-4!">
            <span className="text-body">
              You have been added to the events on <InlineLink href="https://playriftbound.com" external>playriftbound.com</InlineLink> — show
              your code at the door to check in!
            </span>
          </Callout>
          <ReqMarker ids={["MYT-11"]} />
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
              onRefundItem={(item) => setRefund({ kind: "item", item })}
              onRefundOrder={(orderId) => setRefund({ kind: "order", orderId })}
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
        title={refund?.kind === "order" ? "Refund entire order?" : `Refund ${refund?.kind === "item" ? refund.item.name : ""}?`}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setRefund(null)}>Keep it</Button>
            <Button variant="primary" size="sm" onClick={confirmRefund}>Refund {refundAmount}</Button>
          </>
        }
      >
        {refund?.kind === "order"
          ? "Every item in this order will be refunded to your original payment method and you'll lose access to this event."
          : "Only this item is refunded; the rest of your order stays active. You'll be removed from this event on playriftbound.com."}
      </Modal>
    </Container>
  );
}
