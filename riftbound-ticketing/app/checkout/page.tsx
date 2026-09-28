"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, LinkButton } from "@/components/ui/Button";
import { Checkbox, RadioList, TextInput } from "@/components/ui/Form";
import { Callout, Card, Divider } from "@/components/ui/Surface";
import { BackLink, Heading, InlineLink, Overline } from "@/components/ui/Typography";
import { IconCheck, IconLock, IconTicket } from "@/components/icons";
import { ReqMarker } from "@/components/trace/ReqMarker";
import { Container, TwoColumn } from "@/components/patterns/Layout";
import { CartLine, GroupLabel } from "@/components/patterns/OrderPanel";
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
  // Stripe resolves the wallets and cards on offer (CHK-01); there is no PayPal (DEC-04).
  const [method, setMethod] = useState<"wallet" | "card">("wallet");
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
              <RadioList
                name="payment"
                value={method}
                onChange={setMethod}
                options={[
                  { value: "wallet", label: "Google Pay / Apple Pay", hint: "Fast checkout" },
                  { value: "card", label: "Credit card", hint: "•••• 4242" },
                ]}
              />
              <p className="mt-2 inline-flex items-center gap-1.5 text-caption text-muted">
                <IconLock size={13} /> Payments are processed securely by Stripe.
              </p>
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
          <Card className="relative rounded-xl">
            <p className="text-label uppercase text-ink">{ev.name}</p>
            <p className="text-caption text-muted">
              {dateRange(ev.startDate, ev.endDate)} · {ev.city}
            </p>

            {pass && (
              <div className="mt-5">
                <GroupLabel>Event pass</GroupLabel>
                <CartLine name={pass.name} price={money(pass.price, ev.currency)} onRemove={store.removePass} />
              </div>
            )}

            {sides.length > 0 && (
              <div className="relative mt-5">
                <div className="flex items-start justify-between gap-3">
                  <GroupLabel>Side events</GroupLabel>
                  {priced.available > 0 && (
                    <span className="inline-flex items-center gap-1 text-micro uppercase text-ink">
                      <IconTicket size={13} className="text-accent" />
                      {remaining} of {priced.available} vouchers
                    </span>
                  )}
                </div>
                <div className="-mt-1.5 flex flex-col gap-3">
                  {priced.items
                    .filter((i) => i.kind === "side")
                    .map((i) => {
                      const applied = i.voucherDiscount > 0;
                      return (
                        <CartLine key={i.refId} name={i.name} price={money(i.price, ev.currency)} onRemove={() => store.toggleSide(ev.slug, i.refId)}>
                          {applied ? (
                            <button type="button" onClick={() => toggleVoucher(i.refId)} className="inline-flex items-center gap-1 text-caption text-success">
                              <IconCheck size={12} /> Voucher {money(-i.voucherDiscount, ev.currency)} · Undo
                            </button>
                          ) : priced.available > 0 ? (
                            <button
                              type="button"
                              disabled={remaining <= 0}
                              onClick={() => toggleVoucher(i.refId)}
                              className="text-caption text-accent hover:text-accent-hover disabled:text-disabled"
                            >
                              Redeem a voucher
                            </button>
                          ) : null}
                        </CartLine>
                      );
                    })}
                </div>
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
              <span className="text-display-md tabular-nums text-ink">{money(priced.total, ev.currency)}</span>
            </div>
            <Button variant="primary" size="lg" block className="mt-4" disabled={!terms || paying} onClick={pay}>
              {paying ? "Processing…" : "Check out"}
            </Button>
            {!terms && <p className="mt-2 text-center text-caption text-muted">Accept the terms to continue.</p>}
            <div className="relative mt-3">
              <Callout tone="note">
                Once you check out, you&apos;ll be added to these events on{" "}
                <InlineLink href="https://playriftbound.com" external>playriftbound.com</InlineLink>.
              </Callout>
              <ReqMarker ids={["PAS-11", "SDE-08"]} />
            </div>
            <ReqMarker ids={["CHK-03", "CHK-07"]} corner="tl" />
          </Card>
        }
      />
    </Container>
  );
}
