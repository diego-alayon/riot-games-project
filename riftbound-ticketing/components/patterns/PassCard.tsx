"use client";

import { useState } from "react";
import { Badge, TierBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { BenefitList, DisclosureToggle } from "@/components/ui/Data";
import { Card, Divider } from "@/components/ui/Surface";
import { IconCheck, IconDot } from "@/components/icons";
import { ReqMarker } from "@/components/trace/ReqMarker";
import { NON_TRANSFERABLE } from "@/lib/data/catalog";
import type { Currency, Pass, Role, SaleState } from "@/lib/data/types";
import { cx } from "@/lib/cx";
import { money } from "@/lib/format";

export interface PassCardProps {
  pass: Pass;
  currency: Currency;
  sale: SaleState;
  owned?: boolean;        // EVT-05 — shown as "Registered"
  dimmed?: boolean;       // the pass type has reached its purchase limit (PAS-06)
  selected?: boolean;     // in cart (PAS-06)
  preregistered?: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
  onPrereg?: () => void;
}

/** Role tag. PAS-04 names the spectator role "Attendee" (the comps say "Admission"). */
export const roleLabel = (role: Role) => (role === "competitor" ? "Competitor" : "Attendee");

/** Price + CTA panel on the right of pass and side event cards. */
export function PricePanel({ price, note, children }: { price: string; note?: string; children: React.ReactNode }) {
  return (
    <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-3 m-1 px-4 py-3 sm:py-5 rounded-lg bg-surface-sunken sm:w-price-panel shrink-0">
      <div className="flex flex-col sm:items-center">
        <span className="text-display-md tabular-nums text-ink normal-case">{price}</span>
        {note && <span className="mt-0.5 text-micro uppercase text-subtle">{note}</span>}
      </div>
      <div className="relative sm:w-full flex sm:justify-center">{children}</div>
    </div>
  );
}

function Cta({ sale, selected, owned, dimmed, preregistered, onSelect, onRemove, onPrereg }: PassCardProps) {
  const cls = "w-32 sm:w-full";
  if (owned)
    return (
      <Button variant="registered" size="sm" className={cls} iconLeft={<IconCheck size={14} />} disabled>
        Registered
      </Button>
    );
  if (dimmed)
    return (
      <Button variant="inert" size="sm" className={cls} disabled title="One pass per Riot account">
        Add
      </Button>
    );
  if (sale === "fan-first")
    return (
      <>
        {preregistered ? (
          <Button variant="success" size="sm" className={cls} iconLeft={<IconCheck size={13} />} onClick={onPrereg} title="Cancel pre-registration">
            Pre-registered
          </Button>
        ) : (
          <Button variant="fan" size="sm" className={cls} onClick={onPrereg}>
            Pre-register
          </Button>
        )}
        <ReqMarker ids={["FFA-01"]} corner="bl" />
      </>
    );
  if (sale === "scheduled")
    return (
      <Button variant="inert" size="sm" className={cls} disabled>
        Soon
      </Button>
    );
  return (
    <>
      {selected ? (
        <Button variant="inert" size="sm" className={cls} onClick={onRemove} title="Remove from order">
          Selected
        </Button>
      ) : (
        <Button variant="primary" size="sm" className={cls} onClick={onSelect}>
          Add
        </Button>
      )}
      <ReqMarker ids={["PAS-06", "ACC-02"]} corner="bl" />
    </>
  );
}

export function PassCard(props: PassCardProps) {
  const { pass, currency, sale, owned, dimmed } = props;
  const [open, setOpen] = useState(false);

  return (
    <Card padded={false} className="flex flex-col sm:flex-row overflow-visible">
      <div className={cx("relative flex-1 min-w-0 px-5 pt-5 pb-4", dimmed && "opacity-55")}>
        <div className="relative inline-flex flex-wrap gap-1.5">
          <TierBadge tier={pass.tier} />
          <Badge tone="neutral">{roleLabel(pass.role)}</Badge>
          <ReqMarker ids={["PAS-04"]} corner="tr" />
        </div>
        <h3 className="mt-3 text-title text-ink">{pass.name} Pass</h3>
        <p className={cx("mt-1 text-body text-muted", !open && "truncate")}>{open ? pass.description : pass.summary}</p>
        {open && (
          <>
            <Divider className="my-4" />
            <div className="relative">
              <BenefitList items={pass.benefitsLong} muted />
              <ReqMarker ids={["PAS-02", "VOU-01"]} />
            </div>
            <p className="relative mt-4 text-fine text-muted">
              {NON_TRANSFERABLE}
              <ReqMarker ids={["PAS-12"]} />
            </p>
          </>
        )}
        <div className="relative mt-2 inline-flex">
          <DisclosureToggle open={open} onToggle={() => setOpen((o) => !o)} moreLabel="More" lessLabel="Less" />
          <ReqMarker ids={["PAS-03"]} corner="r" />
        </div>
      </div>
      <PricePanel price={money(pass.price, currency)} note={sale === "fan-first" ? "When passes drop" : undefined}>
        <Cta {...props} />
      </PricePanel>
      <ReqMarker ids={owned || dimmed ? ["PAS-01", "EVT-05", "I18N-03"] : ["PAS-01", "I18N-03"]} />
    </Card>
  );
}

/** Group sale state (PAS-08): green "On sale now" pill; Fan First uses the group callout instead. */
export function PassGroupStatus({ sale }: { sale: SaleState }) {
  if (sale === "on-sale")
    return (
      <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-pill bg-success-soft text-label uppercase text-success">
        <IconDot />
        On sale now
      </span>
    );
  if (sale === "scheduled") return <span className="text-label uppercase text-subtle">Not on sale yet</span>;
  return null;
}
