"use client";

import { useState } from "react";
import { FanFirstBadge, OwnedText, TierBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { BenefitList, DisclosureToggle, MetaList, Price } from "@/components/ui/Data";
import { Card, Divider, type CardState } from "@/components/ui/Surface";
import { IconCheck, IconStar } from "@/components/icons";
import { ReqMarker } from "@/components/trace/ReqMarker";
import { NON_TRANSFERABLE } from "@/lib/data/catalog";
import type { Currency, Pass, SaleState } from "@/lib/data/types";
import { cx } from "@/lib/cx";
import { money } from "@/lib/format";

export interface PassCardProps {
  pass: Pass;
  currency: Currency;
  sale: SaleState;
  owned?: boolean;        // EVT-05 "Your badge"
  dimmed?: boolean;       // user already holds another pass of this event
  selected?: boolean;     // in cart (PAS-06)
  preregistered?: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
  onPrereg?: () => void;
  layout?: "cards" | "rows";
}

function roleLabel(p: Pass) {
  return p.role === "competitor" ? "Competitor" : "Attendee";
}

function Cta({ sale, selected, owned, dimmed, preregistered, onSelect, onRemove, onPrereg }: PassCardProps) {
  if (owned || dimmed) return null;
  if (sale === "fan-first")
    return (
      <div className="relative inline-flex">
        {preregistered ? (
          <Button variant="success" size="sm" iconLeft={<IconCheck size={13} />} onClick={onPrereg} title="Cancel pre-registration">
            Pre-registered
          </Button>
        ) : (
          <Button variant="fan" size="sm" onClick={onPrereg}>
            Pre-register for access
          </Button>
        )}
        <ReqMarker ids={["FFA-01"]} corner="r" />
      </div>
    );
  if (sale === "scheduled")
    return (
      <Button variant="secondary" size="sm" disabled>
        Not on sale yet
      </Button>
    );
  return (
    <div className="relative inline-flex">
      {selected ? (
        <Button variant="selected" size="sm" onClick={onRemove} title="Remove from order">
          Selected
        </Button>
      ) : (
        <Button variant="primary" size="sm" onClick={onSelect}>
          Select
        </Button>
      )}
      <ReqMarker ids={["PAS-06", "ACC-02"]} corner="r" />
    </div>
  );
}

function PriceBlock({ pass, currency, sale, owned, muted }: { pass: Pass; currency: Currency; sale: SaleState; owned?: boolean; muted?: boolean }) {
  if (owned) return null;
  return (
    <div className="flex flex-col items-end shrink-0">
      <Price tone={muted ? "muted" : "ink"}>{money(pass.price, currency)}</Price>
      {sale === "fan-first" && <span className="mt-1 text-micro uppercase text-subtle">When passes drop</span>}
    </div>
  );
}

function Expanded({ pass }: { pass: Pass }) {
  return (
    <>
      <Divider className="my-4" />
      <div className="relative">
        <BenefitList items={pass.benefitsLong} />
        <ReqMarker ids={["PAS-02"]} />
      </div>
      <Divider className="my-4" />
      <div className="relative">
        <MetaList
          rows={[
            { label: "Availability", value: `${pass.left} of ${pass.capacity.toLocaleString("en-US")} left` },
            { label: "Side-event vouchers", value: pass.vouchers ? `${pass.vouchers} included` : "None" },
            { label: "Badge type", value: roleLabel(pass) },
          ]}
        />
        <ReqMarker ids={["PAS-07", "VOU-01"]} />
      </div>
      <p className="relative mt-3 text-fine text-muted">
        {NON_TRANSFERABLE}
        <ReqMarker ids={["PAS-09"]} />
      </p>
    </>
  );
}

export function PassCard(props: PassCardProps) {
  const { pass, currency, sale, owned, dimmed, selected, layout = "cards" } = props;
  const [open, setOpen] = useState(false);
  const state: CardState = selected ? "selected" : owned ? "owned" : sale === "fan-first" ? "fan" : "default";
  const muted = dimmed;

  if (layout === "rows") {
    return (
      <Card state={state} padded={false} className="flex overflow-visible">
        <div className="relative w-pass-rail-sm md:w-pass-rail shrink-0 flex flex-col items-center justify-center gap-2 border-r border-line">
          <TierBadge tier={pass.tier} />
          <span className="text-micro uppercase text-subtle">{roleLabel(pass)}</span>
          <ReqMarker ids={["PAS-04"]} inset />
        </div>
        <div className={cx("flex-1 min-w-0 p-4 pr-3", muted && "opacity-55")}>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-heading-sm uppercase text-ink">{pass.name}</h3>
                {sale === "fan-first" && <FanFirstBadge />}
                {owned && <OwnedText />}
              </div>
              <p className={cx("mt-1 text-body text-muted", !open && "truncate")}>{open ? pass.description : pass.summary}</p>
            </div>
            <div className="flex items-center justify-between gap-2 md:flex-col md:items-end">
              <PriceBlock pass={pass} currency={currency} sale={sale} owned={owned} muted={muted} />
              <Cta {...props} />
            </div>
          </div>
          {open && <Expanded pass={pass} />}
          <div className="relative mt-2 inline-flex">
            <DisclosureToggle open={open} onToggle={() => setOpen((o) => !o)} />
            <ReqMarker ids={["PAS-03"]} corner="tr" />
          </div>
        </div>
        <ReqMarker ids={["PAS-01", "EVT-06"]} corner="tr" />
      </Card>
    );
  }

  return (
    <Card state={state} className="flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <span className={cx(muted && "opacity-55")}>
          <TierBadge tier={pass.tier} />
        </span>
        {sale === "fan-first" && !owned && <FanFirstBadge />}
        {owned && <OwnedText />}
      </div>
      <div className={cx("mt-4 flex-1 flex flex-col", muted && "opacity-55")}>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-heading-sm uppercase text-ink">{pass.name}</h3>
          <PriceBlock pass={pass} currency={currency} sale={sale} owned={owned} muted={muted} />
        </div>
        <p className={cx("mt-1 text-body text-muted", !open && "line-clamp-2")}>{open ? pass.description : pass.summary}</p>
        {open ? <Expanded pass={pass} /> : <BenefitList items={pass.benefits} muted={muted} className="mt-4" />}
        <div className="flex-1" />
        <div className="relative mt-4 inline-flex self-start">
          <DisclosureToggle open={open} onToggle={() => setOpen((o) => !o)} />
          <ReqMarker ids={["PAS-03"]} corner="tr" />
        </div>
      </div>
      {!owned && !dimmed && (
        <div className="mt-4">
          <Cta {...props} />
        </div>
      )}
      <ReqMarker ids={owned || dimmed ? ["PAS-01", "PAS-04", "EVT-05"] : ["PAS-01", "PAS-04"]} />
    </Card>
  );
}

/** Section of passes for one role with its own sale state (PAS-05, PAS-08). */
export function PassGroupStatus({ sale }: { sale: SaleState }) {
  if (sale === "on-sale")
    return (
      <span className="inline-flex items-center gap-1.5 text-micro uppercase text-success">
        <span className="size-1.5 rounded-pill bg-success" />
        On sale now
      </span>
    );
  if (sale === "fan-first")
    return (
      <span className="inline-flex items-center gap-1.5 text-micro uppercase text-fan">
        <IconStar size={11} />
        Fan First pre-registration
      </span>
    );
  return <span className="text-micro uppercase text-subtle">Not on sale yet</span>;
}
