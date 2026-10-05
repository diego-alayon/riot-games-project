"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { EventArt, QRCode } from "@/components/ui/Media";
import { Callout, Card } from "@/components/ui/Surface";
import { Heading } from "@/components/ui/Typography";
import { IconCheck, IconDownload, IconPin, IconTicket, IconWallet } from "@/components/icons";
import { ReqMarker } from "@/components/trace/ReqMarker";
import { getPass, getSideEvent } from "@/lib/data/catalog";
import { countdown } from "@/lib/data/selectors";
import type { Order, OrderItem, RiftEvent } from "@/lib/data/types";
import { clock, dateRange, dayHeading } from "@/lib/format";
import { cx } from "@/lib/cx";

export interface HeldItem extends OrderItem {
  orderId: string;
}

/** Everything the user holds for one event, merged across orders. */
export interface EventHolding {
  ev: RiftEvent;
  orders: Order[];
  /** Every pass held for the event (one per type by default, PAS-06), refunded ones included. */
  passes: HeldItem[];
  sides: HeldItem[];
}

/** Checkbox row used while choosing what to refund. */
function RefundRow({ checked, locked, onToggle, title, sub }: { checked: boolean; locked?: boolean; onToggle: () => void; title: string; sub?: string }) {
  return (
    <label className={cx("flex items-center gap-4 py-4 border-b border-line", locked ? "cursor-not-allowed" : "cursor-pointer")}>
      <input
        type="checkbox"
        checked={checked}
        disabled={locked}
        onChange={onToggle}
        className="size-5 shrink-0 accent-(--color-accent) cursor-[inherit]"
      />
      <span className="min-w-0">
        <span className="block text-heading-sm uppercase text-ink">{title}</span>
        {sub && <span className="block mt-0.5 text-body text-muted uppercase">{sub}</span>}
      </span>
    </label>
  );
}

const sideWhen = (refId: string) => {
  const se = getSideEvent(refId);
  return se ? `${dayHeading(se.date)} · ${clock(se.start)}` : undefined;
};

export function TicketCard({
  h,
  next,
  onRefund,
  onPending,
}: {
  h: EventHolding;
  next?: boolean;
  /** Asks the screen to confirm refunding these items (it shows the modal). */
  onRefund: (items: HeldItem[]) => void;
  onPending: (what: string) => void;
}) {
  const { ev } = h;
  const activePasses = h.passes.filter((p) => !p.refunded);
  const passActive = activePasses.length > 0;
  const passName = (i: HeldItem) => getPass(i.refId)?.name ?? i.name;
  const activeSides = h.sides.filter((s) => !s.refunded);
  const [selecting, setSelecting] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const key = (i: HeldItem) => `${i.orderId}:${i.refId}`;

  // v2 rule: side events need a pass, so refunding every pass held also cancels every side event of the event.
  const allPassesIn = (set: Set<string>) => passActive && activePasses.every((p) => set.has(key(p)));
  const passPicked = allPassesIn(picked);
  const toggle = (item: HeldItem) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(key(item))) next.delete(key(item));
      else next.add(key(item));
      if (item.kind === "pass") {
        const all = allPassesIn(next);
        activeSides.forEach((s) => (all ? next.add(key(s)) : next.delete(key(s))));
      }
      return next;
    });
  const selectedItems = [...activePasses, ...activeSides].filter((i) => picked.has(key(i)));
  const passesPicked = selectedItems.filter((i) => i.kind === "pass").length;
  const sidesPicked = selectedItems.filter((i) => i.kind === "side").length;
  const plural = (n: number, one: string) => `${n} ${one}${n > 1 ? "s" : ""}`;
  const summary = !selectedItems.length
    ? "Select items to refund"
    : [passesPicked && plural(passesPicked, "event pass"), sidesPicked && plural(sidesPicked, "side event")].filter(Boolean).join(" and ") + " selected";
  const exitSelect = () => {
    setSelecting(false);
    setPicked(new Set());
  };
  const nothingToRefund = !passActive && activeSides.length === 0;
  // Leave selection mode once the selected items are refunded (or nothing is left).
  const refundable = [...activePasses, ...activeSides].map(key).join("|");
  const [lastRefundable, setLastRefundable] = useState(refundable);
  if (refundable !== lastRefundable) {
    setLastRefundable(refundable);
    if (selecting) exitSelect();
  }

  return (
    <Card padded={false} state={next ? "selected" : "default"} className="overflow-hidden">
      {/* Header art */}
      <div className="relative min-h-40 md:h-40 overflow-hidden">
        <EventArt art={ev.art} overlay="left" markScale={0.6} markTop={40} />
        {/* < md the copy sits in flow so a wrapped title grows the header instead of clipping. */}
        <div className="relative md:absolute md:inset-0 p-5 flex flex-col">
          <div className="flex flex-wrap justify-between gap-2">
            {next ? (
              <Badge tone="glass" icon={<IconTicket size={12} />}>Your next event</Badge>
            ) : (
              <Badge tone="glass">{ev.region}</Badge>
            )}
            <Badge tone="glass">{countdown(ev)}</Badge>
          </div>
          <Heading level="heading-lg" mobile="heading-md" as="h3" tone="on-dark" className="mt-3">{ev.name}</Heading>
          <p className="mt-1 text-body text-on-dark-muted">
            {dateRange(ev.startDate, ev.endDate)} · {ev.venue}, {ev.city}
          </p>
          {passActive && (
            <div className="mt-3 flex flex-wrap gap-2">
              {activePasses.map((p) => (
                <Badge key={key(p)} tone="premium">{passName(p)} badge</Badge>
              ))}
            </div>
          )}
        </div>
        <ReqMarker ids={["MYT-02"]} inset />
      </div>

      <div className="px-5 pb-5">
        {selecting ? (
          <div className="relative pt-5">
            <Callout tone="warning">
              <span className="text-body text-ink">
                Select the items you want to refund. Refunding every event pass you hold will also cancel all side event registrations.
              </span>
            </Callout>
            <div className="mt-1">
              {activePasses.map((p) => (
                <RefundRow key={key(p)} checked={picked.has(key(p))} onToggle={() => toggle(p)} title={passName(p)} />
              ))}
              {activeSides.map((s) => (
                <RefundRow key={key(s)} checked={picked.has(key(s))} locked={passPicked} onToggle={() => toggle(s)} title={s.name} sub={sideWhen(s.refId)} />
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-body-sm text-muted">{summary}</span>
              <div className="flex items-center gap-5">
                <Button variant="ghost" size="sm" onClick={exitSelect}>Cancel</Button>
                <Button
                  variant={selectedItems.length ? "primary" : "secondary"}
                  size="sm"
                  disabled={!selectedItems.length}
                  onClick={() => onRefund(selectedItems)}
                >
                  Confirm refund
                </Button>
              </div>
            </div>
            <ReqMarker ids={["REF-01", "REF-02", "REF-03"]} />
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-5 pt-5 md:flex-row md:gap-6">
              {activePasses.filter((p) => p.badgeCode).map((p) => (
                <div key={key(p)} className="relative w-full md:w-42 shrink-0 flex flex-col items-center">
                  <div className="p-4 rounded-lg border border-line bg-surface">
                    <QRCode value={p.badgeCode!} className="max-md:size-qr-mobile" />
                  </div>
                  <span className="mt-2 text-micro uppercase text-ink tracking-[0.1em]">{p.badgeCode}</span>
                  {activePasses.length > 1 && <span className="mt-1 text-micro uppercase text-muted">{passName(p)}</span>}
                  <div className="mt-3 md:mt-2 flex flex-col items-center gap-2 md:gap-1.5">
                    <Button variant="dark" size="xs" className="max-md:h-10 max-md:px-4" iconLeft={<IconWallet size={12} />} onClick={() => onPending("Apple Wallet")}>
                      Add to Apple Wallet
                    </Button>
                    <Button variant="dark" size="xs" className="max-md:h-10 max-md:px-4" iconLeft={<IconWallet size={12} />} onClick={() => onPending("Google Wallet")}>
                      Add to Google Wallet
                    </Button>
                    <button type="button" onClick={() => onPending("PDF ticket")} className="mt-1 inline-flex items-center gap-1 max-md:py-2 text-micro uppercase text-accent">
                      <IconDownload size={12} /> Download PDF
                    </button>
                  </div>
                  <ReqMarker ids={["MYT-03", "MYT-04", "MYT-05"]} />
                </div>
              ))}
              <div className="flex-1 min-w-0">
                {h.passes.length === 0 && <p className="text-heading-sm uppercase text-ink">Side events</p>}
                {h.passes.map((p) => (
                  <p key={key(p)} className={cx("text-heading-sm uppercase", p.refunded ? "text-disabled" : "text-ink")}>
                    {passName(p)}
                    {p.refunded && <span className="ml-2 text-micro text-subtle">Refunded</span>}
                  </p>
                ))}
              </div>
            </div>

            {h.sides.length > 0 && (
              <div className="relative mt-5 border-t border-line">
                {h.sides.map((s) => (
                  <div key={key(s)} className="flex items-center justify-between gap-4 py-5 border-b border-line">
                    <div className={cx("min-w-0", s.refunded && "opacity-50")}>
                      <p className={cx("text-heading-sm uppercase text-ink", s.refunded && "line-through")}>{s.name}</p>
                      <p className="mt-0.5 text-body text-muted uppercase">{sideWhen(s.refId)}</p>
                    </div>
                    {s.refunded ? (
                      <span className="text-micro uppercase text-subtle">Refunded</span>
                    ) : (
                      <Button variant="secondary" size="sm" className="shrink-0" onClick={() => onRefund([s])}>Refund</Button>
                    )}
                  </div>
                ))}
                <ReqMarker ids={["MYT-06", "REF-04", "REF-03"]} />
              </div>
            )}

            <div className={cx("flex flex-wrap justify-end gap-3", h.sides.length ? "mt-5" : "mt-5 pt-5 border-t border-line")}>
              {!nothingToRefund && (
                <div className="relative">
                  <Button variant="secondary" size="sm" onClick={() => setSelecting(true)}>Refund order</Button>
                  <ReqMarker ids={["REF-02"]} />
                </div>
              )}
              <div className="relative">
                <Button variant="secondary" size="sm" onClick={() => onPending("Invoice")}>View invoice</Button>
                <ReqMarker ids={["MYT-07"]} />
              </div>
              <div className="relative">
                <LinkButton href={`/events/${ev.slug}`} variant="primary" size="sm">Explore event</LinkButton>
                <ReqMarker ids={["MYT-08"]} />
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

export function PastEventRow({ h, onRecap }: { h: EventHolding; onRecap: () => void }) {
  const { ev } = h;
  const passNames = h.passes.map((p) => getPass(p.refId)?.name ?? p.name);
  return (
    <Card padded={false} className="flex flex-col md:flex-row overflow-hidden">
      <div className="relative h-32 md:h-auto md:w-past-thumb shrink-0 md:min-h-46">
        <EventArt art={ev.art} overlay="full" markScale={0.45} />
        <Badge tone="glass" icon={<IconCheck size={11} />} className="absolute left-3 top-3">Attended</Badge>
      </div>
      <div className="min-w-0 p-5">
        <span className="text-micro uppercase text-subtle">{dateRange(ev.startDate, ev.endDate)}</span>
        <Heading level="heading-md" as="h3" className="mt-1">{ev.name}</Heading>
        <p className="mt-1 inline-flex items-center gap-1.5 text-caption text-muted">
          <IconPin size={12} /> {ev.venue} · {ev.city}, {ev.country}
        </p>
        {passNames.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {passNames.map((n) => <Badge key={n} tone="neutral">{n}</Badge>)}
          </div>
        )}
        <div className="relative mt-4 inline-flex">
          <Button variant="secondary" size="sm" onClick={onRecap}>View recap</Button>
          <ReqMarker ids={["MYT-09"]} />
        </div>
      </div>
    </Card>
  );
}
