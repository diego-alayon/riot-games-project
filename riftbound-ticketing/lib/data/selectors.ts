import { DEMO_TODAY, daysBetween, shortDate } from "@/lib/format";
import type { RiftEvent } from "./types";

export interface SaleLabel {
  live: boolean;
  text: string;         // "On sale now" | "On sale in 3 days" | "On sale Sep 25"
}

/**
 * Sale-status label (FND-03.21, FND-03.22). FND-03 defines «On sale now» and «On sale in N days»;
 * «On sale tomorrow», the date beyond 30 days and «On sale soon» are prototype choices still to confirm.
 */
export function saleLabel(ev: RiftEvent, today = DEMO_TODAY): SaleLabel {
  if (ev.passSale.competitor === "on-sale" || ev.passSale.attendee === "on-sale") return { live: true, text: "On sale now" };
  if (!ev.saleOpensAt) return { live: false, text: "On sale soon" };
  const d = daysBetween(today, ev.saleOpensAt);
  if (d <= 0) return { live: true, text: "On sale now" };
  if (d === 1) return { live: false, text: "On sale tomorrow" };
  if (d <= 30) return { live: false, text: `On sale in ${d} days` };
  return { live: false, text: `On sale ${shortDate(ev.saleOpensAt)}` };
}

/** "1 day to go" / "15 days to go" / "Today" (MYT-02). */
export function countdown(ev: RiftEvent, today = DEMO_TODAY): string {
  const d = daysBetween(today, ev.startDate);
  if (d <= 0) return "Happening now";
  return d === 1 ? "1 day to go" : `${d} days to go`;
}

export const venueLine = (ev: RiftEvent) => `${ev.venue} · ${ev.city}, ${ev.country}`;

const byStart = (a: RiftEvent, b: RiftEvent) => a.startDate.localeCompare(b.startDate);

/** "En venta" as FND-03.21 sees it: a pass sale is open, or its opening time has passed. */
export const isOnSale = (ev: RiftEvent, today = DEMO_TODAY) => saleLabel(ev, today).live;

/**
 * FND-03: the featured events are computed, not configured. 1st: the event on sale with
 * the nearest start date. 2nd and 3rd: the next two events by start date, on sale or not
 * yet on sale. Still pending, so provisional here: which event leads when none is on sale
 * (FND-03.12) — the nearest one by start date — and whether sold-out or closed events can
 * be featured (FND-03.11). The other visible events go to "More events", by start date (FND-07).
 */
export function featuredEvents(visible: RiftEvent[], today = DEMO_TODAY) {
  const events = [...visible].sort(byStart);
  const first = events.find((e) => isOnSale(e, today)) ?? events[0];
  const featured = first ? [first, ...events.filter((e) => e !== first).slice(0, 2)] : [];
  return { featured, more: events.filter((e) => !featured.includes(e)) };
}
