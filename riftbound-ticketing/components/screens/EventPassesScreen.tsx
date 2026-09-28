"use client";

import { Callout } from "@/components/ui/Surface";
import { SectionLabel } from "@/components/ui/Typography";
import { ReqMarker } from "@/components/trace/ReqMarker";
import { EventShell, useRequireSession } from "@/components/patterns/EventShell";
import { PassCard, PassGroupStatus } from "@/components/patterns/PassCard";
import { passesFor } from "@/lib/data/catalog";
import type { RiftEvent, Role } from "@/lib/data/types";
import { ownedPassFor, useStore } from "@/lib/state/store";
import { useTrace } from "@/lib/trace/trace-context";
import { cx } from "@/lib/cx";

const ROLES: Role[] = ["competitor", "attendee"];

/** P-02 Event Passes, and P-05 Fan First when no group is on sale. */
export function EventPassesScreen({ ev }: { ev: RiftEvent }) {
  const store = useStore();
  const { passLayout } = useTrace();
  const requireSession = useRequireSession();
  const passes = passesFor(ev);
  const owned = store.ready ? ownedPassFor(store.orders, ev.slug) : null;
  const allFanFirst = ROLES.every((r) => ev.passSale[r] === "fan-first");
  const anyOnSale = ROLES.some((r) => ev.passSale[r] === "on-sale");

  return (
    <EventShell ev={ev} tab="passes" mode={allFanFirst ? "fan-first" : "sale"}>
      {allFanFirst && (
        <div className="relative mb-6">
          <Callout tone="fan" title="Fan First Access is open">
            <span className="text-body">
              Passes for this event aren&apos;t on sale yet. Pre-register for any badge you want and we&apos;ll give you first crack — and an
              email — the moment sales open.
            </span>
          </Callout>
          <ReqMarker ids={["FFA-01", "FFA-02"]} />
        </div>
      )}

      <div className="flex flex-col gap-8">
        {ROLES.map((role) => {
          const sale = ev.passSale[role];
          const group = passes.filter((p) => p.role === role); // premium first, as authored
          return (
            <section key={role}>
              <div className="relative">
                <SectionLabel right={<PassGroupStatus sale={sale} />}>{role === "competitor" ? "Competitor" : "Attendee"}</SectionLabel>
                <ReqMarker ids={["PAS-05", "PAS-08"]} corner="tl" />
              </div>
              {sale === "fan-first" && anyOnSale && (
                <Callout tone="fan" className="mt-3">
                  <span className="text-body">
                    {role === "attendee" ? "Attendee" : "Competitor"} passes aren&apos;t on sale yet. Pre-register for{" "}
                    <span className="text-fan">Fan First Access</span> and we&apos;ll give you first crack — and an email — the moment they drop.
                  </span>
                </Callout>
              )}
              <div className={cx("mt-3 gap-3", passLayout === "cards" ? "grid grid-cols-1 md:grid-cols-2" : "flex flex-col")}>
                {group.map((p) => (
                  <PassCard
                    key={p.id}
                    pass={p}
                    currency={ev.currency}
                    sale={sale}
                    layout={passLayout}
                    owned={owned?.pass.id === p.id}
                    dimmed={!!owned && owned.pass.id !== p.id}
                    selected={store.cart.passId === p.id}
                    preregistered={store.preregs.includes(p.id)}
                    onSelect={() => requireSession(() => store.selectPass(ev.slug, p.id))}
                    onRemove={store.removePass}
                    onPrereg={() => requireSession(() => store.togglePrereg(p.id))}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </EventShell>
  );
}
