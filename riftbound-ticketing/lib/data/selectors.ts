import { DEMO_TODAY, daysBetween, shortDate } from "@/lib/format";
import type { RiftEvent } from "./types";

export interface SaleLabel {
  live: boolean;
  text: string;         // "On sale now" | "On sale in 3 days" | "On sale Sep 25"
}

/** FND-06. Within 30 days the label counts down; beyond that it shows the date. */
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

/** "En venta" as FND-06.1 sees it: a pass sale is open, or its opening time has passed. */
export const isOnSale = (ev: RiftEvent, today = DEMO_TODAY) => saleLabel(ev, today).live;

/**
 * FND-08: the featured events are computed, not configured. 1st and 2nd: the events on
 * sale with the nearest start date. 3rd: the event not yet on sale whose sale opens first.
 * Still pending, so provisional here: whether the 3rd goes by sale opening or start date
 * (FND-08.3), and how empty slots are filled — with the next events by start date (FND-08.4).
 * The other visible events go to "More events", by start date (FND-07).
 */
export function featuredEvents(visible: RiftEvent[], today = DEMO_TODAY) {
  const events = [...visible].sort(byStart);
  const onSale = events.filter((e) => isOnSale(e, today));
  const upcoming = events
    .filter((e) => !isOnSale(e, today) && e.saleOpensAt)
    .sort((a, b) => a.saleOpensAt!.localeCompare(b.saleOpensAt!) || byStart(a, b));
  const slots = [onSale[0], onSale[1], upcoming[0]];
  const rest = events.filter((e) => !slots.includes(e));
  const featured = slots.map((e) => e ?? rest.shift()).filter((e): e is RiftEvent => !!e);
  return { featured, more: events.filter((e) => !featured.includes(e)) };
}
