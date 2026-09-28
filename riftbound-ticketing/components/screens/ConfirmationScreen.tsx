"use client";

import { LinkButton } from "@/components/ui/Button";
import { Price } from "@/components/ui/Data";
import { Card, Divider } from "@/components/ui/Surface";
import { Heading, Overline } from "@/components/ui/Typography";
import { IconCheck } from "@/components/icons";
import { ReqMarker } from "@/components/trace/ReqMarker";
import { Container } from "@/components/patterns/Layout";
import { getEvent } from "@/lib/data/catalog";
import { useStore } from "@/lib/state/store";
import { dateRange, money } from "@/lib/format";

/** P-07 Order Confirmation. */
export function ConfirmationScreen({ orderId }: { orderId: string }) {
  const { orders, ready } = useStore();
  if (!ready) return null;
  const order = orders.find((o) => o.id === orderId);
  const ev = order && getEvent(order.eventSlug);

  if (!order || !ev) {
    return (
      <Container className="py-20 text-center">
        <Heading level="heading-lg">Order not found</Heading>
        <LinkButton href="/my-tickets" variant="primary" size="md" className="mt-6">View my tickets</LinkButton>
      </Container>
    );
  }

  const total = order.items.reduce((a, i) => a + i.price - i.voucherDiscount, 0) - order.codeDiscount;
  const vouchers = order.items.reduce((a, i) => a + i.voucherDiscount, 0);

  return (
    <Container className="py-8 md:py-16">
      <Card className="relative mx-auto max-w-140 p-5! md:p-8! text-center">
        <span className="mx-auto inline-flex items-center justify-center size-14 rounded-pill bg-success-soft text-success">
          <IconCheck size={26} />
        </span>
        <Heading level="heading-lg" as="h1" className="mt-5">Order confirmed</Heading>
        <p className="mt-1 text-body text-muted">
          Confirmation <span className="text-code text-ink">{order.confirmation}</span>
        </p>

        <div className="relative mt-6 p-4 md:p-5 text-left rounded-lg border border-line bg-canvas">
          <p className="text-heading-sm uppercase text-ink">{ev.name}</p>
          <p className="text-caption text-muted">{dateRange(ev.startDate, ev.endDate)} · {ev.city}</p>
          <Divider className="my-4" />
          <ul className="flex flex-col gap-1.5">
            {order.items.map((i) => (
              <li key={i.refId} className="flex justify-between gap-3 text-body text-ink">
                <span>{i.name}</span>
                <span className="tabular-nums">{money(i.price, ev.currency)}</span>
              </li>
            ))}
            {vouchers > 0 && (
              <li className="flex justify-between text-body text-success">
                <span>Vouchers</span>
                <span className="tabular-nums">{money(-vouchers, ev.currency)}</span>
              </li>
            )}
            {order.codeDiscount > 0 && (
              <li className="flex justify-between text-body text-success">
                <span>Code {order.discountCode}</span>
                <span className="tabular-nums">{money(-order.codeDiscount, ev.currency)}</span>
              </li>
            )}
          </ul>
          <Divider className="my-4" />
          <div className="flex items-center justify-between">
            <Overline>Total paid</Overline>
            <Price size="lg">{money(total, ev.currency)}</Price>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <LinkButton href="/my-tickets?welcome=1" variant="primary" size="lg" block>View my tickets</LinkButton>
          <LinkButton href="/" variant="secondary" size="lg" block>Browse more events</LinkButton>
        </div>
        <p className="relative mt-4 text-caption text-muted">
          A receipt is on its way to your email — show your scan code at the door to check in.
          <ReqMarker ids={["CHK-09"]} />
        </p>
        <ReqMarker ids={["CHK-08", "SDE-08"]} inset />
      </Card>
    </Container>
  );
}
