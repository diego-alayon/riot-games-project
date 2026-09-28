import type { EventArtwork } from "@/components/ui/Media";

export type Region = "APAC" | "AMERICAS" | "EMEA";
export type Currency = "EUR" | "USD" | "SGD" | "AUD" | "MXN" | "KRW" | "BRL";
export type Role = "competitor" | "attendee";
export type Tier = "premium" | "standard";

/** Sale window state of a group of products (PAS-08, FFA-01). */
export type SaleState = "on-sale" | "fan-first" | "scheduled";

export interface RiftEvent {
  slug: string;
  name: string;              // "Regional Qualifier - Singapore"
  city: string;
  venue: string;
  country: string;
  region: Region;
  startDate: string;         // ISO date
  endDate: string;
  currency: Currency;        // CHK-07 / RN-19
  art: EventArtwork;
  placement?: "hero" | "grid" | "list"; // FND-08 is pending: placement is configured, not computed
  listed: boolean;           // past editions are not shown on Find Events
  saleOpensAt?: string;      // ISO date, when passes open (FND-06)
  passSale: Record<Role, SaleState>;
  sideSaleOpen: boolean;     // RN-07: independent windows
  voucherValue: number;      // value of one side-event voucher in event currency
  passTemplate: "full" | "compact";
}

export interface Pass {
  id: string;
  eventSlug: string;
  role: Role;
  tier: Tier;
  name: string;
  price: number;
  summary: string;           // one-line description (collapsed)
  description: string;       // full text (expanded)  PAS-02
  benefits: string[];        // short list (collapsed)
  benefitsLong: string[];    // full list (expanded)
  vouchers: number;          // VOU-01
  left: number;              // PAS-07
  capacity: number;
}

export interface SideEvent {
  id: string;
  eventSlug: string;
  date: string;              // ISO date
  start: string;             // "13:00"
  durationMin: number;
  name: string;
  summary: string;
  description: string;
  price: number;
  tags: string[];            // SDE-03
  vouchersPerPlayer: number;
  seatsLeft: number;
  seatsTotal: number;
  prizing: string[];
}

export interface OrderItem {
  kind: "pass" | "side";
  refId: string;
  name: string;
  price: number;
  voucherDiscount: number;
  refunded?: boolean;
}

export interface Order {
  id: string;
  confirmation: string;      // "RB-CPK1-GOYP"
  badgeCode?: string;        // "RB-7QF2-9KLM" — only when the order has a pass
  eventSlug: string;
  createdAt: string;
  items: OrderItem[];
  discountCode?: string;
  codeDiscount: number;
}

export interface Voucher {
  id: string;
  eventSlug: string;         // RN-12: only valid on this event
  source: "pass" | "riot";   // VOU-01 / VOU-02
  usedOn?: string;           // order id
}
