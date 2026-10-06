"use client";

import { useRouter } from "next/navigation";
import { Callout } from "@/components/ui/Surface";
import { ReqMarker } from "@/components/trace/ReqMarker";
import { EventShell, useRequireSession } from "@/components/patterns/EventShell";
import { PassCard, PassGroupStatus } from "@/components/patterns/PassCard";
import { passesFor } from "@/lib/data/catalog";
import type { Pass, RiftEvent, Role } from "@/lib/data/types";
import { ownedPassesFor, useStore } from "@/lib/state/store";

const ROLES: Role[] = ["competitor", "attendee"];
/** Group headings from the v2 comps. The pass tags keep the PRD role names (PAS-04). */
const GROUP_LABEL: Record<Role, string> = { competitor: "Compete", attendee: "Spectate" };
/** Standard before Premium, as in the comps. */
const byTier = (a: Pass, b: Pass) => (a.tier === b.tier ? 0 : a.tier === "standard" ? -1 : 1);

/** P-02 Event Passes, and P-05 Fan First when no group is on sale. */
export function EventPassesScreen({ ev }: { ev: RiftEvent }) {
  const router = useRouter();
  const store = useStore();
  const requireSession = useRequireSession();
  const passes = passesFor(ev);
  // PAS-06 / EVT-05: each pass type has its own limit (1 by default), so holding one type does not block the others.
  const ownedIds = new Set((store.ready ? ownedPassesFor(store.orders, ev.slug) : []).map((p) => p.id));
  const allFanFirst = ROLES.every((r) => ev.passSale[r] === "fan-first");

  /** Pre-registering goes to its confirmation (P-05); tapping again cancels it in place. */
  const prereg = (p: Pass) =>
    requireSession(() => {
      const wasRegistered = store.preregs.includes(p.id);
      store.togglePrereg(p.id);
      if (!wasRegistered) router.push(`/events/${ev.slug}/pre-registered?pass=${encodeURIComponent(p.id)}`);
    });

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

      <div className="flex flex-col gap-6">
        {ROLES.map((role, i) => {
          const sale = ev.passSale[role];
          const group = passes.filter((p) => p.role === role).sort(byTier);
          const inCart = (id: string) => store.cart.eventSlug === ev.slug && store.cart.passIds.includes(id);
          const groupInCart = group.some((p) => inCart(p.id));
          return (
            <section key={role}>
              <div className="relative flex items-end justify-between gap-4">
                <h2 className="text-label text-ink uppercase tracking-normal">{GROUP_LABEL[role]}</h2>
                {i === 0 || sale !== ev.passSale.competitor ? <PassGroupStatus sale={sale} /> : null}
                <ReqMarker ids={["PAS-05", "PAS-08", "EVT-06"]} corner="tl" />
              </div>
              {sale === "fan-first" && !allFanFirst && (
                <Callout tone="fan" className="mt-3">
                  <span className="text-body">
                    {role === "attendee" ? "Attendee" : "Competitor"} passes aren&apos;t on sale yet. Pre-register for{" "}
                    <span className="text-fan">Fan First Access</span> and we&apos;ll give you first crack — and an email — the moment they drop.
                  </span>
                </Callout>
              )}
              <div className="mt-3 flex flex-col gap-2.5">
                {group.map((p) => (
                  <PassCard
                    key={p.id}
                    pass={p}
                    currency={ev.currency}
                    sale={sale}
                    owned={ownedIds.has(p.id)}
                    selected={inCart(p.id)}
                    groupTaken={groupInCart && !inCart(p.id)}
                    preregistered={store.preregs.includes(p.id)}
                    onSelect={() => requireSession(() => store.selectPass(ev.slug, p.id))}
                    onRemove={() => store.removePass(p.id)}
                    onPrereg={() => prereg(p)}
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
