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
