"use client";

import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { EventArt, QRCode } from "@/components/ui/Media";
import { ActionMenu } from "@/components/ui/Overlay";
import { Card, Divider } from "@/components/ui/Surface";
import { Heading, Overline } from "@/components/ui/Typography";
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
  pass?: HeldItem;
  badgeCode?: string;
  sides: HeldItem[];
}

export function TicketCard({
  h,
  next,
  onRefundItem,
  onRefundOrder,
  onPending,
}: {
  h: EventHolding;
  next?: boolean;
  onRefundItem: (item: HeldItem) => void;
  onRefundOrder: (orderId: string) => void;
  onPending: (what: string) => void;
}) {
  const { ev, pass } = h;
  const passInfo = pass ? getPass(pass.refId) : undefined;
  const passActive = pass && !pass.refunded;

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
          {passInfo && (
            <Badge tone="premium" className={cx("mt-3 self-start", passInfo.tier === "standard" && "bg-surface text-ink")}>
              {passInfo.name} badge
            </Badge>
          )}
        </div>
        <ReqMarker ids={["MYT-02"]} inset />
      </div>

      <div className="p-5">
        {/* < md the badge QR stacks above the details, enlarged so it scans at the door (RNF-14). */}
        <div className="flex flex-col gap-5 md:flex-row md:gap-6">
          {passActive && h.badgeCode && (
            <div className="relative w-full md:w-42 shrink-0 flex flex-col items-center">
              <div className="p-4 rounded-lg border border-line bg-surface">
                <QRCode value={h.badgeCode} className="max-md:size-qr-mobile" />
              </div>
              <span className="mt-2 text-micro uppercase text-ink tracking-[0.1em]">{h.badgeCode}</span>
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
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <p className={cx("text-heading-sm uppercase", passActive ? "text-ink" : "text-disabled")}>
                {passInfo?.name ?? "Side events"}
                {pass?.refunded && <span className="ml-2 text-micro text-subtle">Refunded</span>}
              </p>
              {pass && (
                <div className="relative">
                  <ActionMenu
                    label="Pass actions"
                    items={[
                      { label: "Refund pass", onSelect: () => onRefundItem(pass), tone: "danger", disabled: pass.refunded },
                      ...h.orders.map((o) => ({
                        label: `Refund entire order ${o.confirmation}`,
                        onSelect: () => onRefundOrder(o.id),
                        tone: "danger" as const,
                        disabled: o.items.every((i) => i.refunded),
                      })),
                    ]}
                  />
                  <ReqMarker ids={["REF-01", "REF-02"]} corner="bl" />
                </div>
              )}
            </div>
            <Divider className="my-3" />

            {h.sides.length > 0 ? (
              <div className="relative">
                <Overline>Side events</Overline>
                <ul className="mt-2 flex flex-col">
                  {h.sides.map((s) => {
                    const se = getSideEvent(s.refId);
                    return (
                      <li key={s.orderId + s.refId} className="group flex items-center justify-between gap-3 py-1 -mx-2 px-2 rounded-md hover:bg-canvas">
                        <span className={cx("min-w-0 text-body", s.refunded ? "text-disabled line-through" : "text-ink")}>
                          {s.name}
                          {se && (
                            <span className={s.refunded ? "" : "text-muted"}>
                              {" "}· {dayHeading(se.date).split(",")[0]}, {dayHeading(se.date).split(", ")[1]} · {clock(se.start)}
                            </span>
                          )}
                        </span>
                        {s.refunded ? (
                          <span className="text-micro uppercase text-subtle">Refunded</span>
                        ) : (
                          <span className="shrink-0 opacity-40 group-hover:opacity-100 max-lg:opacity-100 transition-opacity">
                            <ActionMenu label={`Actions for ${s.name}`} items={[{ label: "Request refund", onSelect: () => onRefundItem(s), tone: "danger" }]} />
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <ReqMarker ids={["MYT-06", "REF-04", "REF-03"]} />
              </div>
            ) : (
              <p className="text-body text-muted">No side events yet.</p>
            )}
          </div>
        </div>

        <Divider className="my-4" />
        <div className="flex flex-wrap justify-end gap-3">
          <div className="relative">
            <Button variant="secondary" size="sm" onClick={() => onPending("Invoice")}>View invoice</Button>
            <ReqMarker ids={["MYT-07"]} />
          </div>
          <div className="relative">
            <LinkButton href={`/events/${ev.slug}`} variant="primary" size="sm">Explore event</LinkButton>
            <ReqMarker ids={["MYT-08"]} />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function PastEventRow({ h, onRecap }: { h: EventHolding; onRecap: () => void }) {
  const { ev } = h;
  const passInfo = h.pass ? getPass(h.pass.refId) : undefined;
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
        {passInfo && (
          <div className="mt-3">
            <Badge tone="neutral">{passInfo.name}</Badge>
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
