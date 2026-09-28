import type { Currency } from "./data/types";

/** Demo clock. Matches the comps: Barcelona "1 day to go", Singapore "15 days to go". */
export const DEMO_TODAY = "2026-08-20";

const SYMBOL: Record<Currency, string> = {
  EUR: "€",
  USD: "$",
  SGD: "S$",
  AUD: "A$",
  MXN: "MX$",
  KRW: "₩",
  BRL: "R$",
};

/** Whole-unit price in the event's local currency (CHK-07). */
export function money(amount: number, currency: Currency): string {
  const sign = amount < 0 ? "−" : "";
  return `${sign}${SYMBOL[currency]}${Math.abs(Math.round(amount)).toLocaleString("en-US")}`;
}

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const WEEKDAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

const parts = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d, dow: new Date(Date.UTC(y, m - 1, d)).getUTCDay() };
};

/** "SEP 4 - 6, 2026" / "AUG 30 - SEP 1, 2026" */
export function dateRange(start: string, end: string): string {
  const a = parts(start);
  const b = parts(end);
  const left = `${MONTHS[a.m - 1]} ${a.d}`;
  const right = a.m === b.m ? `${b.d}` : `${MONTHS[b.m - 1]} ${b.d}`;
  return `${left} - ${right}, ${b.y}`;
}

/** "FRIDAY" */
export const weekday = (iso: string) => WEEKDAYS[parts(iso).dow];

/** "FRIDAY, SEP 4" */
export function dayHeading(iso: string): string {
  const p = parts(iso);
  return `${WEEKDAYS[p.dow]}, ${MONTHS[p.m - 1]} ${p.d}`;
}

/** "SEP 25" */
export function shortDate(iso: string): string {
  const p = parts(iso);
  return `${MONTHS[p.m - 1]} ${p.d}`;
}

export function addDays(iso: string, n: number): string {
  const p = parts(iso);
  return new Date(Date.UTC(p.y, p.m - 1, p.d + n)).toISOString().slice(0, 10);
}

export function daysBetween(fromIso: string, toIso: string): number {
  const a = parts(fromIso);
  const b = parts(toIso);
  return Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86_400_000);
}

/** "1:00 PM" */
export function clock(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** "7HR:00M" */
export function duration(min: number): string {
  return `${Math.floor(min / 60)}hr:${String(min % 60).padStart(2, "0")}m`;
}
