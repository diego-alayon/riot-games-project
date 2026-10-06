import { addDays } from "@/lib/format";
import type { Currency, Pass, RiftEvent, SideEvent } from "./types";

/**
 * Demo catalog. Stands in for OneVenue until the API is wired.
 * Copy is taken from the comps; "Admission" is renamed "Attendee" (official name, PAS-04).
 */

const art = (from: string, to: string, city: string, glow?: string) => ({ from, to, city, glow });

export const EVENTS: RiftEvent[] = [
  {
    slug: "regional-qualifier-singapore",
    name: "Regional Qualifier - Singapore",
    city: "Singapore", venue: "Suntec Singapore", country: "Singapore", region: "APAC",
    startDate: "2026-09-04", endDate: "2026-09-06", currency: "SGD",
    art: art("#1c2340", "#2a1f5c", "Singapore", "rgb(64 90 200 / 0.55)"),
    listed: true,
    passSale: { competitor: "on-sale", attendee: "on-sale" }, sideSaleOpen: true,
    voucherValue: 25, passTemplate: "full",
  },
  {
    slug: "regional-qualifier-los-angeles",
    name: "Regional Qualifier - Los Angeles",
    city: "Los Angeles", venue: "Los Angeles Convention Center", country: "USA", region: "AMERICAS",
    startDate: "2026-09-25", endDate: "2026-09-27", currency: "USD",
    art: art("#6b5a45", "#2b2219", "Los Angeles", "rgb(230 190 140 / 0.35)"),
    listed: true,
    passSale: { competitor: "on-sale", attendee: "on-sale" }, sideSaleOpen: false,
    voucherValue: 25, passTemplate: "compact",
  },
  {
    slug: "regional-qualifier-bologna",
    name: "Regional Qualifier - Bologna",
    city: "Bologna", venue: "BolognaFiere", country: "Italy", region: "EMEA",
    startDate: "2026-10-09", endDate: "2026-10-11", currency: "EUR",
    art: { ...art("#3f9a3a", "#0b1a0c", "Bologna"), showMark: false },
    listed: true, saleOpensAt: "2026-08-23",
    passSale: { competitor: "fan-first", attendee: "fan-first" }, sideSaleOpen: false,
    voucherValue: 25, passTemplate: "compact",
  },
  {
    slug: "regional-qualifier-sydney",
    name: "Regional Qualifier - Sydney",
    city: "Sydney", venue: "ICC Sydney", country: "Australia", region: "APAC",
    startDate: "2026-10-23", endDate: "2026-10-25", currency: "AUD",
    art: { ...art("#1d6b4f", "#0d2a22", "Sydney"), showMark: false },
    listed: true, saleOpensAt: "2026-09-06",
    passSale: { competitor: "scheduled", attendee: "scheduled" }, sideSaleOpen: false,
    voucherValue: 35, passTemplate: "compact",
  },
  {
    slug: "regional-qualifier-atlanta",
    name: "Regional Qualifier - Atlanta",
    city: "Atlanta", venue: "Georgia World Congress Center", country: "USA", region: "AMERICAS",
    startDate: "2026-11-06", endDate: "2026-11-08", currency: "USD",
    art: { ...art("#7a4a26", "#b9a48f", "Atlanta"), showMark: false },
    listed: true, saleOpensAt: "2026-09-25",
    passSale: { competitor: "scheduled", attendee: "scheduled" }, sideSaleOpen: false,
    voucherValue: 25, passTemplate: "compact",
  },
  {
    slug: "regional-qualifier-utrecht",
    name: "Regional Qualifier - Utrecht",
    city: "Utrecht", venue: "Jaarbeurs Utrecht", country: "Netherlands", region: "EMEA",
    startDate: "2026-11-20", endDate: "2026-11-22", currency: "EUR",
    art: { ...art("#5b4a8a", "#1f1a36", "Utrecht"), showMark: false },
    listed: true, saleOpensAt: "2026-10-09",
    passSale: { competitor: "scheduled", attendee: "scheduled" }, sideSaleOpen: false,
    voucherValue: 25, passTemplate: "compact",
  },
  {
    slug: "regional-qualifier-barcelona",
    name: "Regional Qualifier - Barcelona",
    city: "Barcelona", venue: "Fira Barcelona Montjuïc", country: "Spain", region: "EMEA",
    startDate: "2026-08-21", endDate: "2026-08-23", currency: "EUR",
    art: art("#2b3a52", "#b8764a", "Barcelona", "rgb(120 170 220 / 0.35)"),
    listed: true,
    passSale: { competitor: "on-sale", attendee: "fan-first" }, sideSaleOpen: true,
    voucherValue: 25, passTemplate: "compact",
  },
  {
    slug: "regional-qualifier-mexico-city",
    name: "Regional Qualifier - Mexico City",
    city: "Mexico City", venue: "Centro Citibanamex", country: "Mexico", region: "AMERICAS",
    startDate: "2026-12-04", endDate: "2026-12-06", currency: "MXN",
    art: { ...art("#9a3b2a", "#2a1210", "Mexico City"), showMark: false },
    listed: true, saleOpensAt: "2026-10-23",
    passSale: { competitor: "scheduled", attendee: "scheduled" }, sideSaleOpen: false,
    voucherValue: 500, passTemplate: "compact",
  },
  {
    slug: "regional-qualifier-seoul",
    name: "Regional Qualifier - Seoul",
    city: "Seoul", venue: "COEX", country: "South Korea", region: "APAC",
    startDate: "2026-12-11", endDate: "2026-12-13", currency: "KRW",
    art: { ...art("#2a4d7a", "#0e1a2b", "Seoul"), showMark: false },
    listed: true, saleOpensAt: "2026-10-30",
    passSale: { competitor: "scheduled", attendee: "scheduled" }, sideSaleOpen: false,
    voucherValue: 35000, passTemplate: "compact",
  },
  {
    slug: "regional-qualifier-paris",
    name: "Regional Qualifier - Paris",
    city: "Paris", venue: "Paris Expo Porte de Versailles", country: "France", region: "EMEA",
    startDate: "2027-01-15", endDate: "2027-01-17", currency: "EUR",
    art: { ...art("#3a3f58", "#12141f", "Paris"), showMark: false },
    listed: true, saleOpensAt: "2026-11-13",
    passSale: { competitor: "scheduled", attendee: "scheduled" }, sideSaleOpen: false,
    voucherValue: 25, passTemplate: "compact",
  },
  {
    slug: "regional-qualifier-sao-paulo",
    name: "Regional Qualifier - São Paulo",
    city: "São Paulo", venue: "Expo Center Norte", country: "Brazil", region: "AMERICAS",
    startDate: "2027-02-05", endDate: "2027-02-07", currency: "BRL",
    art: { ...art("#2f7a3f", "#0d2413", "São Paulo"), showMark: false },
    listed: true, saleOpensAt: "2026-12-04",
    passSale: { competitor: "scheduled", attendee: "scheduled" }, sideSaleOpen: false,
    voucherValue: 130, passTemplate: "compact",
  },
  // Past editions — reachable from My Tickets only.
  {
    slug: "regional-qualifier-los-angeles-2026-05",
    name: "Regional Qualifier - Los Angeles",
    city: "Los Angeles", venue: "Los Angeles Convention Center", country: "USA", region: "AMERICAS",
    startDate: "2026-05-15", endDate: "2026-05-17", currency: "USD",
    art: art("#6b5a45", "#2b2219", "Los Angeles", "rgb(230 190 140 / 0.35)"),
    listed: false,
    passSale: { competitor: "scheduled", attendee: "scheduled" }, sideSaleOpen: false,
    voucherValue: 25, passTemplate: "compact",
  },
  {
    slug: "regional-qualifier-bologna-2026-03",
    name: "Regional Qualifier - Bologna",
    city: "Bologna", venue: "BolognaFiere", country: "Italy", region: "EMEA",
    startDate: "2026-03-06", endDate: "2026-03-08", currency: "EUR",
    art: { ...art("#2f3d55", "#1b2536", "Bologna"), showMark: false },
    listed: false,
    passSale: { competitor: "scheduled", attendee: "scheduled" }, sideSaleOpen: false,
    voucherValue: 25, passTemplate: "compact",
  },
];

export const getEvent = (slug: string) => EVENTS.find((e) => e.slug === slug);

/* ── Passes ─────────────────────────────────────────────────────────────── */

// PAS-12: no "one pass per account" any more — the purchase limit is per pass type (PAS-06).
const NON_TRANSFERABLE = "Badge and side-event entries are non-transferable and tied to your Riot account.";
export { NON_TRANSFERABLE };

const FULL_PASSES: Array<Omit<Pass, "id" | "eventSlug" | "price">> = [
  {
    role: "competitor", tier: "premium", name: "Premium Competitor",
    summary: "Players who want the full Riftbound experience. This badge is valid for one",
    description: "Players who want the full Riftbound experience. This badge is valid for one (1) attendee {{RANGE}}.",
    benefits: ["Main Event Access", "1x Side Event Voucher", "2x Vendetta Booster Boxes", "Jayce promo card", "10% off a Merch Store item", "Coat/bag check concierge", "2x Booster Box purchase vouchers", "Exclusive Sett, Brawler playmat", "30-min early hall access daily", "Dedicated Premium badge lines"],
    benefitsLong: [
      "Main Event Access — Compete for glory in the Regional Qualifier tournament, spanning Saturday and Sunday!",
      "1x Side Event Voucher — Vouchers can be used to enroll in side events throughout the weekend!",
      "2x Vendetta Booster Boxes!",
      "Jayce, Brilliant Inventor promo card!",
      "10% off a single item at the Merch Store — Valid for any item!",
      "Coat/bag check for Premium Badge holders only — Safely leave your swag with our dedicated concierge!",
      "2x Booster Box vouchers that will each guarantee you the ability to purchase a Vendetta Riftbound booster box from the official onsite Merch Store — Use your vouchers at any time during the weekend!",
      "An exclusive playmat of Vendetta Showcase Sett, Brawler — Only available at RQ {{CITY}}!",
      "30 minute early access to event hall each day",
      "Prize Wall, Badge Pickup, and onsite Event Signups will have dedicated lines just for Premium badge holders!",
    ],
    vouchers: 1, left: 42, capacity: 128,
  },
  {
    role: "competitor", tier: "standard", name: "Standard Competitor",
    summary: "With this badge, you're guaranteed entry into the Regional Qualifier tournament to",
    description: "With this badge, you're guaranteed entry into the Regional Qualifier tournament to prove your skill on the big stage. Your Competitor Badge covers one (1) attendee {{RANGE}}.",
    benefits: ["Main Event Access", "1x Side Event Voucher", "Jayce promo card", "10% off a Merch Store item", "1x Booster Box purchase voucher"],
    benefitsLong: [
      "Main Event Access — Compete for glory in the Regional Qualifier tournament, spanning Saturday and Sunday.",
      "1x Side Event Voucher — Vouchers can be used to enroll in side events throughout the weekend!",
      "Jayce, Brilliant Inventor promo card!",
      "10% off a single item at the Merch Store — Valid for any item!",
      "1x Booster Box voucher that will guarantee you the ability to purchase a Vendetta Riftbound booster box from the official onsite Merch Store — Use your voucher at any time during the weekend!",
    ],
    vouchers: 1, left: 298, capacity: 384,
  },
  {
    role: "attendee", tier: "premium", name: "Premium Attendee",
    summary: "This badge is valid for one (1) attendee {{FROM}} through",
    description: "This badge is valid for one (1) attendee {{RANGE}}. The Premium Attendee Badge grants full access to the venue across the weekend, with a wide range of gameplay, side events, and activities to explore in addition to exclusives and extras. Please note: the Premium Attendee Badge does not include access to the Regional Qualifier main event.",
    benefits: ["6x Side Event Vouchers", "2x Vendetta Booster Boxes", "Jayce promo card", "10% off a Merch Store item", "Coat/bag check concierge", "2x Booster Box purchase vouchers", "Exclusive Sett, Brawler playmat", "30-min early hall access daily", "Dedicated Premium badge lines"],
    benefitsLong: [
      "6x Side Event Voucher — Vouchers can be used to enroll in side events throughout the weekend!",
      "2x Vendetta Booster Boxes!",
      "Jayce, Brilliant Inventor promo card!",
      "10% off a single item at the Merch Store — Valid for any item!",
      "Coat/bag check for Premium Badge holders only — Safely leave your swag with our dedicated concierge!",
      "2x Booster Box vouchers that will each guarantee you the ability to purchase a Vendetta Riftbound booster box from the official onsite Merch Store — Use your vouchers at any time during the weekend!",
      "An exclusive playmat of Vendetta Showcase Sett, Brawler — Only available at RQ {{CITY}}!",
      "30 minute early access to event hall each day",
      "Prize Wall, Badge Pickup, and onsite Event Signups will have dedicated lines just for Premium badge holders!",
    ],
    vouchers: 6, left: 188, capacity: 300,
  },
  {
    role: "attendee", tier: "standard", name: "Standard Attendee",
    summary: "Your gateway into the Riftbound Regional Qualifier: {{CITY}}. The Standard",
    description: "Your gateway into the Riftbound Regional Qualifier: {{CITY}}. The Standard Attendee Badge grants full access for one (1) attendee to the venue {{RANGE}}, with a wide range of gameplay, side events, and activities to explore. Whether you're here to test new decks, connect with the community, or just soak in the atmosphere, this badge is your starting point. Please note: the Standard Attendee Badge does not include access to the Regional Qualifier main event.",
    benefits: ["1x Side Event Voucher", "Jayce promo card", "10% off a Merch Store item", "1x Booster Box purchase voucher"],
    benefitsLong: [
      "1x Side Event Voucher — Vouchers can be used to enroll in side events throughout the weekend!",
      "Jayce, Brilliant Inventor promo card!",
      "10% off a single item at the Merch Store — Valid for any item!",
      "1x Booster Box voucher that will guarantee you the ability to purchase a Vendetta Riftbound booster box from the official onsite Merch Store — Use your voucher at any time during the weekend!",
    ],
    vouchers: 1, left: 858, capacity: 1200,
  },
];

const COMPACT_PASSES: Array<Omit<Pass, "id" | "eventSlug" | "price">> = [
  {
    role: "competitor", tier: "premium", name: "Premium Competitor",
    summary: "Main event entry with reserved seating and premium play kit.",
    description: "Main event entry with reserved seating and premium play kit. Valid for one (1) attendee for the whole event weekend.",
    benefits: ["Regional Qualifier main event entry", "Reserved seating in the competitor hall", "Premium playmat, sleeves, and deck box", "Early venue access each morning", "Two side event vouchers"],
    benefitsLong: ["Regional Qualifier main event entry", "Reserved seating in the competitor hall", "Premium playmat, sleeves, and deck box", "Early venue access each morning", "Two side event vouchers"],
    vouchers: 2, left: 64, capacity: 256,
  },
  {
    role: "competitor", tier: "standard", name: "Standard Competitor",
    summary: "Main event entry and the weekend participation promo.",
    description: "Main event entry and the weekend participation promo. Valid for one (1) attendee for the whole event weekend.",
    benefits: ["Regional Qualifier main event entry", "Participation promo card", "Access to the open play hall"],
    benefitsLong: ["Regional Qualifier main event entry", "Participation promo card", "Access to the open play hall"],
    vouchers: 0, left: 410, capacity: 768,
  },
  {
    role: "attendee", tier: "premium", name: "Premium Attendee",
    summary: "Spectator weekend with reserved seating and the full swag bag.",
    description: "Spectator weekend with reserved seating and the full swag bag. Does not include access to the Regional Qualifier main event.",
    benefits: ["Three-day spectator access", "Reserved seating at the feature match stage", "Premium swag bag", "Priority queue for artist signings"],
    benefitsLong: ["Three-day spectator access", "Reserved seating at the feature match stage", "Premium swag bag", "Priority queue for artist signings"],
    vouchers: 2, left: 150, capacity: 300,
  },
  {
    role: "attendee", tier: "standard", name: "Standard Attendee",
    summary: "Three-day spectator access and the on-demand play hall.",
    description: "Three-day spectator access and the on-demand play hall. Does not include access to the Regional Qualifier main event.",
    benefits: ["Three-day spectator access", "On-demand events and open play hall", "Trade hall access"],
    benefitsLong: ["Three-day spectator access", "On-demand events and open play hall", "Trade hall access"],
    vouchers: 0, left: 900, capacity: 1500,
  },
];

/** Prices per template/currency: [premium competitor, standard competitor, premium attendee, standard attendee]. */
const PASS_PRICES: Record<"full" | Currency, number[]> = {
  full: [500, 100, 500, 25],
  EUR: [189, 79, 119, 39],
  USD: [189, 79, 119, 39],
  SGD: [269, 109, 169, 55],
  AUD: [279, 119, 179, 59],
  MXN: [3600, 1500, 2300, 750],
  KRW: [250000, 105000, 160000, 52000],
  BRL: [990, 420, 630, 210],
};

/** Long-form weekday date: "Friday, September 4, 2026". */
function longDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

/** Fills the event's own city and dates into the authored pass copy. */
function fill(text: string, ev: RiftEvent) {
  return text
    .replaceAll("{{RANGE}}", `from ${longDate(ev.startDate)} through ${longDate(ev.endDate)}`)
    .replaceAll("{{FROM}}", `from ${longDate(ev.startDate)}`)
    .replaceAll("{{CITY}}", ev.city);
}

export function passesFor(ev: RiftEvent): Pass[] {
  const src = ev.passTemplate === "full" ? FULL_PASSES : COMPACT_PASSES;
  const prices = ev.passTemplate === "full" ? PASS_PRICES.full : PASS_PRICES[ev.currency];
  return src.map((p, i) => ({
    ...p,
    id: `${ev.slug}:${p.role}-${p.tier}`,
    eventSlug: ev.slug,
    price: prices[i],
    summary: fill(p.summary, ev),
    description: fill(p.description, ev),
    benefits: p.benefits.map((t) => fill(t, ev)),
    benefitsLong: p.benefitsLong.map((t) => fill(t, ev)),
  }));
}

export function getPass(id: string): Pass | undefined {
  const ev = getEvent(id.split(":")[0]);
  return ev ? passesFor(ev).find((p) => p.id === id) : undefined;
}

/* ── Side events ────────────────────────────────────────────────────────── */

type SideTemplate = Omit<SideEvent, "id" | "eventSlug" | "date" | "price"> & { day: 0 | 1 | 2; key: string };

const SIDE_TEMPLATE: SideTemplate[] = [
  {
    key: "pre-regional", day: 0, start: "13:00", durationMin: 420, name: "Pre-Regional Challenge",
    summary: "Prepare for tomorrow's event — excellent for competitive Riftbound players.",
    description: "Prepare for tomorrow's event in this Pre-Regional Challenge. This event is excellent for competitive Riftbound players. Event cap is 1536 players. Competitors will play 1v1 Constructed. This event requires a decklist submission. 5 Rounds. Best of 3. Rounds have a 60 minute time limit. Prizes are awarded by the end of Round 5.",
    tags: ["Swiss", "60m time limit", "No top cut", "Best of three"], vouchersPerPlayer: 2, seatsLeft: 608, seatsTotal: 1536,
    prizing: ["5 Wins : 50 PW Tickets", "4 Wins : 30 PW Tickets", "3 Wins : 15 PW Tickets"],
  },
  {
    key: "2v2-team", day: 0, start: "14:00", durationMin: 330, name: "2v2 Team Challenge",
    summary: "Show off your teamwork — excellent for casual Riftbound players.",
    description: "Show off your teamwork with this 2v2 team challenge! This event is excellent for casual Riftbound players. Event cap is 512 players/256 teams. Players enroll individually, then can pair as teams. Competitors will play 2v2 Constructed. 4 Rounds. Best of 1. Rounds have a 50 minute time limit. Prizes are awarded by the end of Round 4.",
    tags: ["Swiss", "50m time limit", "Best of one"], vouchersPerPlayer: 1, seatsLeft: 174, seatsTotal: 512,
    prizing: ["Prize per team", "4 Wins : 20 PW Tickets", "3 Wins : 16 PW Tickets", "2 Wins : 12 PW Tickets", "1 Win : 8 PW Tickets", "0 Wins : 4 PW Tickets"],
  },
  {
    key: "draft", day: 0, start: "16:00", durationMin: 270, name: "Draft Challenge",
    summary: "Draft three Vendetta packs in pods of eight, then battle.",
    description: "Players split into pods of eight, open 3 Vendetta booster packs, and draft. After the draft you get 20 minutes to build following Draft construction rules; decks may be changed between rounds. Event cap is 64 players. 3 Rounds. Best of 3. Rounds have a 60 minute time limit. Prizes are awarded by the end of Round 3.",
    tags: ["Draft", "Pods of 8", "60m time limit", "Best of three"], vouchersPerPlayer: 1, seatsLeft: 0, seatsTotal: 64,
    prizing: ["3 Wins : 24 PW Tickets", "2 Wins : 12 PW Tickets", "1 Win : 6 PW Tickets"],
  },
  {
    key: "super-nexus", day: 0, start: "19:00", durationMin: 150, name: "Super Nexus Night",
    summary: "The Friday-night celebration — casual games, door prizes, maybe a Rioter.",
    description: "Celebrate Riftbound in this super sized event to kick off the weekend! Show off your favorite Legends, win great prizes, and you might even run into a Rioter or two. Door prizes are given randomly to players each round, and the number of prizes increases with the number of players enrolled. Event cap is 1024 players. 4 Rounds. Best of 1. Rounds have a 30 minute time limit. Prizes are awarded by the start of each round.",
    tags: ["Casual", "30m time limit", "Best of one"], vouchersPerPlayer: 1, seatsLeft: 480, seatsTotal: 1024,
    prizing: ["Door prizes each round", "More players enrolled = more prizes"],
  },
  {
    key: "super-saturday", day: 1, start: "09:00", durationMin: 540, name: "Super Saturday Standard Challenge",
    summary: "Seven rounds of 1v1 Constructed with a cut to Top 8.",
    description: "The marquee Saturday Constructed event: 1v1 Constructed with a required decklist. Event cap is 512 players. 7 Rounds. Best of 3. Rounds have a 60 minute time limit. After 7 Rounds, there is a cut to the Top 8 players. Prizes are awarded at the end of Round 7, and after each round in the top cut.",
    tags: ["Swiss", "60m time limit", "Top 8 cut", "Best of three"], vouchersPerPlayer: 2, seatsLeft: 267, seatsTotal: 512,
    prizing: ["7 Wins : 70 PW Tickets", "6 Wins : 45 PW Tickets", "5 Wins : 25 PW Tickets", "Top 8 cut : bonus PW Tickets"],
  },
  {
    key: "2v2-champions", day: 2, start: "09:00", durationMin: 360, name: "2v2 Champions of the Rift",
    summary: "The premier 2v2 Constructed event with a Top 4 team cut.",
    description: "The premier 2v2 event of the weekend. Enroll solo, then pair into teams for 2v2 Constructed with a required decklist. Event cap is 512 players/256 teams. 6 Rounds. Best of 1. Rounds have a 50 minute time limit. After 6 Rounds, there is a cut to the Top 4 teams. Prizes are awarded at the end of Round 6, and after each round in the top cut.",
    tags: ["Swiss", "50m time limit", "Top 4 cut", "Best of one"], vouchersPerPlayer: 1, seatsLeft: 142, seatsTotal: 512,
    prizing: ["Prize per team", "6 Wins : 40 PW Tickets", "Top 4 cut : bonus PW Tickets"],
  },
  {
    key: "secretlab", day: 2, start: "10:00", durationMin: 420, name: "Secretlab Regional Rebound",
    summary: "One more shot at glory — 1v1 Constructed for Secretlab chair prizes.",
    description: "One more shot at glory on Sunday. Play 1v1 Constructed with a required decklist. Event cap is 1024 players. 6 Rounds. Best of 3. Rounds have a 60 minute time limit. A perfect record wins a Secretlab League of Legends Edition chair. Chair prizes ship to US, EU, UK, SG & MY; players elsewhere who finish with a perfect record receive a Secretlab Lumbar Pillow and a Standard Competitor badge for a future Regional Qualifier.",
    tags: ["Swiss", "60m time limit", "Best of three"], vouchersPerPlayer: 2, seatsLeft: 374, seatsTotal: 1024,
    prizing: ["Perfect record : Secretlab LoL Edition chair", "6 Wins : 60 PW Tickets", "5 Wins : 35 PW Tickets"],
  },
];

const SIDE_BASE = [50, 25, 35, 20, 50, 25, 50];
const SIDE_OVERRIDE: Record<string, { prices: number[]; starts?: string[] }> = {
  "regional-qualifier-barcelona": {
    prices: [30, 25, 35, 20, 30, 25, 35],
    starts: ["10:00", "12:00", "16:00", "19:00", "09:00", "09:00", "10:00"],
  },
};
const FX: Record<Currency, number> = { EUR: 1, USD: 1, SGD: 1, AUD: 1.5, MXN: 20, KRW: 1400, BRL: 5.5 };

export function sideEventsFor(ev: RiftEvent): SideEvent[] {
  const o = SIDE_OVERRIDE[ev.slug];
  return SIDE_TEMPLATE.map((t, i) => {
    const { day, key, ...rest } = t;
    return {
      ...rest,
      id: `${ev.slug}:${key}`,
      eventSlug: ev.slug,
      date: addDays(ev.startDate, day),
      start: o?.starts?.[i] ?? t.start,
      price: o ? o.prices[i] : Math.round(SIDE_BASE[i] * FX[ev.currency]),
      // Barcelona's Draft still has seats in its comp.
      seatsLeft: ev.slug === "regional-qualifier-barcelona" && key === "draft" ? 22 : t.seatsLeft,
    };
  });
}

export function getSideEvent(id: string): SideEvent | undefined {
  const ev = getEvent(id.split(":")[0]);
  return ev ? sideEventsFor(ev).find((s) => s.id === id) : undefined;
}
