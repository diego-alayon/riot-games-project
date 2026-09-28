"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { DetailGrid, DisclosureToggle } from "@/components/ui/Data";
import { Card, Divider } from "@/components/ui/Surface";
import { IconCheck } from "@/components/icons";
import { ReqMarker } from "@/components/trace/ReqMarker";
import type { Currency, SideEvent } from "@/lib/data/types";
import { clock, duration, money } from "@/lib/format";
import { PricePanel } from "./PassCard";

export type SideEventCta = "add" | "added" | "registered" | "full" | "locked";

/** "Swiss, 60m time limit, no top cut, best of three" — attributes read as part of the summary (SDE-03). */
const attributes = (tags: string[]) => tags.map((t, i) => (i === 0 ? t : t.toLowerCase())).join(", ");

export function SideEventCard({
  se,
  currency,
  cta,
  onToggle,
}: {
  se: SideEvent;
  currency: Currency;
  cta: SideEventCta;
  onToggle?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const soldOut = se.seatsLeft === 0;
  const seats = `${se.seatsLeft.toLocaleString("en-US")} of ${se.seatsTotal.toLocaleString("en-US")} seats`;
  const cls = "w-32 sm:w-full";

  return (
    <Card padded={false} className="flex flex-col sm:flex-row overflow-visible">
      <div className="relative flex-1 min-w-0 px-5 pt-5 pb-4">
        <p className="text-caption font-bold text-ink">
          {clock(se.start)} · {duration(se.durationMin)}
        </p>
        <h3 className="mt-1 text-title text-ink">{se.name}</h3>
        <p className={open ? "mt-1 text-body text-muted" : "mt-1 text-body text-muted truncate"}>
          {open ? se.summary : `${se.summary} ${attributes(se.tags)}`}
        </p>
        {open && (
          <>
            <p className="relative mt-2 text-caption font-bold text-subtle">
              {attributes(se.tags)}
              <ReqMarker ids={["SDE-03"]} corner="r" />
            </p>
            <Divider className="my-4" />
            <p className="text-body-sm text-muted">{se.description}</p>
            <div className="mt-4">
              <DetailGrid
                items={[
                  { label: "Duration", value: duration(se.durationMin) },
                  { label: "Entry", value: money(se.price, currency) },
                  { label: "Pass vouchers", value: `${se.vouchersPerPlayer} per player` },
                  { label: "Availability", value: soldOut ? "Sold out" : seats, tone: soldOut ? "danger" : undefined },
                ]}
              />
            </div>
            <div className="mt-4">
              <span className="text-micro uppercase text-subtle">Event prizing</span>
              <ul className="mt-1 flex flex-col gap-0.5 text-body-sm text-ink">
                {se.prizing.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          </>
        )}
        <div className="relative mt-2 inline-flex">
          <DisclosureToggle open={open} onToggle={() => setOpen((o) => !o)} casing="sentence" />
          <ReqMarker ids={["SDE-02"]} corner="r" />
        </div>
      </div>

      <PricePanel price={money(se.price, currency)}>
        {cta === "add" && (
          <Button variant="primary" size="sm" className={cls} onClick={onToggle}>Add</Button>
        )}
        {cta === "added" && (
          <Button variant="inert" size="sm" className={cls} onClick={onToggle} title="Remove from order">Added</Button>
        )}
        {cta === "registered" && (
          <Button variant="registered" size="sm" className={cls} iconLeft={<IconCheck size={14} />} disabled>
            Registered
          </Button>
        )}
        {cta === "full" && (
          <Button variant="inert" size="sm" className={cls} disabled>Full</Button>
        )}
        {cta === "locked" && (
          <Button variant="inert" size="sm" className={cls} disabled title="You need a pass for this event">Add</Button>
        )}
        <ReqMarker ids={cta === "full" ? ["SDE-04"] : cta === "locked" ? ["SDE-06"] : ["SDE-05", "ACC-02"]} corner="bl" />
      </PricePanel>
    </Card>
  );
}
