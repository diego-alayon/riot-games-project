"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { DetailGrid, DisclosureToggle, Price } from "@/components/ui/Data";
import { Card, Divider } from "@/components/ui/Surface";
import { IconCheck } from "@/components/icons";
import { ReqMarker } from "@/components/trace/ReqMarker";
import type { Currency, SideEvent } from "@/lib/data/types";
import { clock, duration, money } from "@/lib/format";

export type SideEventCta = "add" | "added" | "registered" | "full" | "locked";

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

  return (
    <Card padded={false} state={cta === "added" ? "selected" : "default"} className="flex">
      {/* < md the time column collapses into an inline line above the title. */}
      <div className="hidden md:flex w-time-col shrink-0 flex-col items-center justify-center border-r border-line text-center">
        <span className="text-body-sm font-bold text-ink">{clock(se.start)}</span>
        <span className="mt-0.5 text-micro uppercase text-subtle">{duration(se.durationMin)}</span>
      </div>

      <div className="flex-1 min-w-0 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
          <div className="min-w-0">
            <p className="md:hidden mb-1 inline-flex items-baseline gap-2">
              <span className="text-body-sm font-bold text-ink">{clock(se.start)}</span>
              <span className="text-micro uppercase text-subtle">{duration(se.durationMin)}</span>
            </p>
            <h3 className="text-heading-sm uppercase text-ink">{se.name}</h3>
            <p className="mt-1 text-body text-muted">{se.summary}</p>
          </div>
          <div className="flex items-center justify-between gap-2 shrink-0 md:flex-col md:items-end">
            <Price>{money(se.price, currency)}</Price>
            <div className="relative inline-flex">
              {cta === "add" && (
                <Button variant="secondary" size="sm" onClick={onToggle}>Add</Button>
              )}
              {cta === "added" && (
                <Button variant="primary" size="sm" onClick={onToggle} title="Remove from order">Added</Button>
              )}
              {cta === "registered" && (
                <Button variant="success" size="sm" iconLeft={<IconCheck size={13} />} disabled className="disabled:cursor-default">
                  Registered
                </Button>
              )}
              {cta === "full" && (
                <Button variant="primary" size="sm" disabled>Full</Button>
              )}
              {cta === "locked" && (
                <Button variant="secondary" size="sm" disabled title="You need a pass for this event">Pass required</Button>
              )}
              <ReqMarker ids={cta === "full" ? ["SDE-04"] : cta === "locked" ? ["SDE-06"] : ["SDE-05", "ACC-02"]} corner="l" />
            </div>
          </div>
        </div>

        <div className="relative mt-3 flex flex-wrap items-center gap-2">
          {se.tags.map((t) => (
            <Chip key={t}>{t}</Chip>
          ))}
          <span className={soldOut ? "text-micro uppercase text-danger" : "text-micro uppercase text-subtle"}>
            {soldOut ? "Sold out" : seats}
          </span>
          <ReqMarker ids={["SDE-03"]} corner="br" />
        </div>

        {open && (
          <>
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

        <div className="relative mt-3 inline-flex">
          <DisclosureToggle open={open} onToggle={() => setOpen((o) => !o)} />
          <ReqMarker ids={["SDE-02"]} corner="tr" />
        </div>
      </div>
    </Card>
  );
}
