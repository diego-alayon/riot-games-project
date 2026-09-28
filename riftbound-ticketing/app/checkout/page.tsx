"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Price } from "@/components/ui/Data";
import { Checkbox, TextInput } from "@/components/ui/Form";
import { Card, Divider } from "@/components/ui/Surface";
import { BackLink, Heading, InlineLink, Overline, SectionLabel } from "@/components/ui/Typography";
import { IconCheck, IconLock, IconTicket } from "@/components/icons";
import { ReqMarker } from "@/components/trace/ReqMarker";
import { Container, TwoColumn } from "@/components/patterns/Layout";
import { priceCart, useStore } from "@/lib/state/store";
import { dateRange, money } from "@/lib/format";

/** P-06 Checkout. */
export default function CheckoutPage() {
  const router = useRouter();
  const store = useStore();
  const [voucherSideIds, setVoucherSideIds] = useState<string[]>([]);
  const [codeInput, setCodeInput] = useState("");
  const [discountCode, setDiscountCode] = useState<string>();
  const [terms, setTerms] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (store.ready && !store.session) router.replace("/login?next=/checkout"); // RN-01
  }, [store.ready, store.session, router]);

  if (!store.ready || !store.session) return null;

  const priced = priceCart(store.cart, store.vouchers, { voucherSideIds, discountCode });
  const { ev, pass, sides } = priced;

  if (!ev || (!pass && sides.length === 0)) {
    return (
      <Container className="py-20 text-center">
        <Heading level="heading-lg">Your order is empty</Heading>
        <p className="mt-2 text-body text-muted">Pick a pass or side events to check out.</p>
        <LinkButton href="/" variant="primary" size="md" className="mt-6">Find events</LinkButton>
      </Container>
    );
  }

  const used = priced.voucherIds.length;
  const remaining = priced.available - used;
  const toggleVoucher = (id: string) =>
    setVoucherSideIds((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]));

  const pay = () => {
    setPaying(true);
    setTimeout(() => {
      const order = store.placeOrder({ voucherSideIds, discountCode });
      if (order) router.push(`/confirmation/${order.id}`);
      else setPaying(false);
    }, 1200);
  };

  return (
    <Container className="py-6 md:py-10">
      <BackLink href={`/events/${ev.slug}`}>Back to {ev.name}</BackLink>
      <Heading level="display-lg" mobile="display-md" as="h1" className="mt-4 mb-6 md:mt-5 md:mb-8">Checkout</Heading>

      <TwoColumn
        main={
          <div className="flex flex-col gap-8 md:gap-10">
            <section className="relative">
              <Heading level="heading-lg" className="mb-4">Payment</Heading>
              <Card>
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                  <span className="text-body-lg text-ink">Pay securely</span>
                  <span className="inline-flex items-center gap-1.5 text-caption text-muted">
                    <IconLock size={13} /> Payments by Stripe
                  </span>
                </div>
                <p className="mt-1 text-caption text-muted">Apple Pay, Google Pay and cards are offered by Stripe when available on your device.</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <TextInput label="Card number" defaultValue="4242 4242 4242 4242" className="col-span-2" inputMode="numeric" autoComplete="cc-number" />
                  <TextInput label="Expiry" defaultValue="12 / 28" inputMode="numeric" autoComplete="cc-exp" />
                  <TextInput label="CVC" defaultValue="123" inputMode="numeric" autoComplete="cc-csc" />
                </div>
              </Card>
              <ReqMarker ids={["CHK-01", "CHK-02"]} />
            </section>

            <section className="relative">
              <Heading level="heading-lg" className="mb-4">Discount code</Heading>
              <div className="flex items-end gap-3">
                <TextInput
                  label="Code"
                  placeholder="Enter a code"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  className="flex-1"
                />
                <Button variant="secondary" size="lg" onClick={() => setDiscountCode(codeInput || undefined)}>
                  Apply
                </Button>
              </div>
              {discountCode && (
                <p className={priced.codeValid ? "mt-2 text-caption text-success" : "mt-2 text-caption text-danger"}>
                  {priced.codeValid ? `Code ${discountCode.toUpperCase()} applied.` : "This code isn't valid for your order."}
                </p>
              )}
              <ReqMarker ids={["VOU-04"]} />
            </section>

            <section className="relative">
              <Heading level="heading-lg" className="mb-4">Before you pay</Heading>
              <Card>
                <Checkbox checked={terms} onChange={setTerms}>
                  I agree to the <InlineLink href="#">Terms of Service</InlineLink> and <InlineLink href="#">Refund Policy</InlineLink>. Badges and
                  side-event entries are non-transferable and tied to my Riot account.
                </Checkbox>
              </Card>
              <ReqMarker ids={["CHK-05"]} />
            </section>
          </div>
        }
        aside={
          <>
            <Card className="relative">
              <SectionLabel>Your order</SectionLabel>
              <p className="mt-3 text-heading-sm uppercase text-ink">{ev.name}</p>
              <p className="text-caption text-muted">
                {dateRange(ev.startDate, ev.endDate)} · {ev.city}
              </p>
              <Divider className="my-4" />

              {pass && (
                <div className="flex justify-between gap-3 text-body text-ink">
                  <span>{pass.name}</span>
                  <span className="tabular-nums">{money(pass.price, ev.currency)}</span>
                </div>
              )}

              {sides.length > 0 && (
                <div className="relative mt-4">
                  {pass && <Divider className="mb-3" />}
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <Overline>Side events</Overline>
                    {priced.available > 0 ? (
                      <span className="inline-flex items-center gap-1 text-micro uppercase text-ink">
                        <IconTicket size={13} className="text-accent" />
                        {remaining} of {priced.available} vouchers
                      </span>
                    ) : (
                      <span className="text-micro uppercase text-subtle">No vouchers for this event</span>
                    )}
                  </div>
                  <ul className="mt-2 flex flex-col gap-3">
                    {priced.items
                      .filter((i) => i.kind === "side")
                      .map((i) => {
                        const applied = i.voucherDiscount > 0;
                        return (
                          <li key={i.refId}>
                            <div className="flex justify-between gap-3 text-body text-ink">
                              <span>{i.name}</span>
                              <span className="tabular-nums">{money(i.price, ev.currency)}</span>
                            </div>
                            {applied ? (
                              <div className="flex justify-between gap-3 text-caption text-success">
                                <button type="button" onClick={() => toggleVoucher(i.refId)} className="inline-flex items-center gap-1 text-micro uppercase">
                                  <IconCheck size={12} /> Voucher applied · Remove
                                </button>
                                <span className="tabular-nums">{money(-i.voucherDiscount, ev.currency)}</span>
                              </div>
                            ) : priced.available === 0 ? null : (
                              <button
                                type="button"
                                disabled={remaining <= 0}
                                onClick={() => toggleVoucher(i.refId)}
                                className="text-micro uppercase text-accent hover:text-accent-hover disabled:text-disabled"
                              >
                                Redeem a voucher
                              </button>
                            )}
                          </li>
                        );
                      })}
                  </ul>
                  <ReqMarker ids={["VOU-05", "VOU-03", "CHK-04", "VOU-07", "VOU-08"]} />
                </div>
              )}

              {priced.codeDiscount > 0 && (
                <div className="mt-3 flex justify-between text-body text-success">
                  <span>Code {discountCode?.toUpperCase()}</span>
                  <span className="tabular-nums">{money(-priced.codeDiscount, ev.currency)}</span>
                </div>
              )}

              <Divider className="my-4" />
              <div className="flex items-center justify-between">
                <Overline>Total</Overline>
                <Price size="lg">{money(priced.total, ev.currency)}</Price>
              </div>
              <Button variant="primary" size="lg" block className="mt-4" disabled={!terms || paying} onClick={pay}>
                {paying ? "Processing…" : `Pay ${money(priced.total, ev.currency)}`}
              </Button>
              {!terms && <p className="mt-2 text-center text-caption text-muted">Accept the terms above to continue.</p>}
              <p className="relative mt-3 inline-flex items-center gap-1.5 text-caption text-muted">
                <IconCheck size={13} className="text-success" /> Free cancellation up to 14 days out
                <ReqMarker ids={["REF-06"]} />
              </p>
              <ReqMarker ids={["CHK-03", "CHK-07"]} corner="tl" />
            </Card>
            <div className="relative mt-3 flex justify-end">
              <Badge tone="neutral">Step 3 of 4</Badge>
              <ReqMarker ids={["CHK-06"]} />
            </div>
          </>
        }
      />
    </Container>
  );
}
