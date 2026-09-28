"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getEvent, getPass, getSideEvent } from "@/lib/data/catalog";
import type { Order, OrderItem, Pass, Voucher } from "@/lib/data/types";
import { DEMO_TODAY } from "@/lib/format";

/**
 * Demo state. Stands in for RSO (session) and OneVenue (cart, orders,
 * vouchers) until the real integrations exist. Persisted per browser.
 */

export interface Session {
  riotId: string;   // ACC-04
  gameName: string;
  puid: string;
}

export interface Cart {
  eventSlug: string | null;
  passId: string | null;
  sideIds: string[];
}

interface State {
  session: Session | null;
  cart: Cart;
  orders: Order[];
  vouchers: Voucher[];
  preregs: string[];      // pass ids (FFA-01)
  prizeTickets: number;   // MYT-10 (definition pending, PQ-26)
}

const DEMO_USER: Session = { riotId: "Slazareth#NA1", gameName: "Slazareth", puid: "a1f3-demo-puid" };
const EMPTY_CART: Cart = { eventSlug: null, passId: null, sideIds: [] };
const BCN = "regional-qualifier-barcelona";

function seed(): State {
  const item = (kind: OrderItem["kind"], refId: string): OrderItem => {
    const ref = kind === "pass" ? getPass(refId) : getSideEvent(refId);
    return { kind, refId, name: ref?.name ?? refId, price: ref?.price ?? 0, voucherDiscount: 0 };
  };
  return {
    session: DEMO_USER,
    cart: EMPTY_CART,
    orders: [
      {
        id: "ord-bcn", confirmation: "RB-CPK1-GOYP", badgeCode: "RB-7QF2-9KLM", eventSlug: BCN, createdAt: "2026-07-02",
        items: [
          item("pass", `${BCN}:competitor-premium`),
          item("side", `${BCN}:2v2-team`),
          item("side", `${BCN}:draft`),
          item("side", `${BCN}:super-nexus`),
        ],
        codeDiscount: 0,
      },
      {
        id: "ord-la-may", confirmation: "RB-LA05-2026", badgeCode: "RB-LA55-0517", eventSlug: "regional-qualifier-los-angeles-2026-05",
        createdAt: "2026-03-01", items: [item("pass", "regional-qualifier-los-angeles-2026-05:competitor-premium")], codeDiscount: 0,
      },
      {
        id: "ord-bo-mar", confirmation: "RB-BO03-2026", badgeCode: "RB-BO36-0308", eventSlug: "regional-qualifier-bologna-2026-03",
        createdAt: "2026-01-12", items: [item("pass", "regional-qualifier-bologna-2026-03:attendee-standard")], codeDiscount: 0,
      },
    ],
    vouchers: [
      { id: "v-bcn-1", eventSlug: BCN, source: "pass" },
      { id: "v-bcn-2", eventSlug: BCN, source: "pass" },
    ],
    preregs: [],
    prizeTickets: 340,
  };
}

const KEY = "riftbound-demo-v1";

function code(prefix = "RB") {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const block = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${prefix}-${block()}-${block()}`;
}

/* ── Derived helpers ────────────────────────────────────────────────────── */

export function ownedPassFor(orders: Order[], eventSlug: string): { order: Order; pass: Pass } | null {
  for (const o of orders) {
    if (o.eventSlug !== eventSlug) continue;
    const it = o.items.find((i) => i.kind === "pass" && !i.refunded);
    const pass = it && getPass(it.refId);
    if (pass) return { order: o, pass };
  }
  return null;
}

export function registeredSideIds(orders: Order[], eventSlug: string): Set<string> {
  const ids = new Set<string>();
  for (const o of orders)
    if (o.eventSlug === eventSlug) for (const i of o.items) if (i.kind === "side" && !i.refunded) ids.add(i.refId);
  return ids;
}

/** Event is "Upcoming" through its last day inclusive (RN-09 / MYT-01). */
export const isUpcoming = (endDate: string, today = DEMO_TODAY) => endDate >= today;

export interface CheckoutInput {
  voucherSideIds: string[];   // side events the user chose to redeem a voucher on (VOU-05)
  discountCode?: string;      // VOU-04
}

export const DISCOUNT_CODES: Record<string, number> = { RIFT10: 0.1 };

/** Prices a cart. Vouchers only on side events of the same event (RN-11/RN-12). */
export function priceCart(cart: Cart, vouchers: Voucher[], input: CheckoutInput) {
  const ev = cart.eventSlug ? getEvent(cart.eventSlug) : undefined;
  const pass = cart.passId ? getPass(cart.passId) : undefined;
  const sides = cart.sideIds.map((id) => getSideEvent(id)).filter((s): s is NonNullable<typeof s> => !!s);
  const available = vouchers.filter((v) => !v.usedOn && v.eventSlug === cart.eventSlug).length;
  const voucherIds = input.voucherSideIds.filter((id) => cart.sideIds.includes(id)).slice(0, available);
  const items: OrderItem[] = [
    ...(pass ? [{ kind: "pass" as const, refId: pass.id, name: pass.name, price: pass.price, voucherDiscount: 0 }] : []),
    ...sides.map((s) => ({
      kind: "side" as const,
      refId: s.id,
      name: s.name,
      price: s.price,
      voucherDiscount: ev && voucherIds.includes(s.id) ? Math.min(ev.voucherValue, s.price) : 0,
    })),
  ];
  const subtotal = items.reduce((a, i) => a + i.price - i.voucherDiscount, 0);
  const rate = input.discountCode ? DISCOUNT_CODES[input.discountCode.trim().toUpperCase()] ?? 0 : 0;
  const codeDiscount = Math.round(subtotal * rate);
  return { ev, pass, sides, items, available, voucherIds, codeDiscount, total: subtotal - codeDiscount, codeValid: rate > 0 };
}

/* ── Context ────────────────────────────────────────────────────────────── */

interface Store extends State {
  ready: boolean;
  signIn: () => void;
  signOut: () => void;
  selectPass: (eventSlug: string, passId: string) => void;
  removePass: () => void;
  toggleSide: (eventSlug: string, sideId: string) => void;
  clearCart: () => void;
  placeOrder: (input: CheckoutInput) => Order | null;
  refundItem: (orderId: string, refId: string) => void;
  refundOrder: (orderId: string) => void;
  togglePrereg: (passId: string) => void;
  resetDemo: () => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(seed);
  const [ready, setReady] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState(JSON.parse(raw) as State);
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }, [state, ready]);

  const signIn = useCallback(() => setState((s) => ({ ...s, session: DEMO_USER })), []);
  const signOut = useCallback(() => setState((s) => ({ ...s, session: null, cart: EMPTY_CART })), []);

  /** One pass per cart, and a cart belongs to a single event. */
  const selectPass = useCallback((eventSlug: string, passId: string) => {
    setState((s) => ({
      ...s,
      cart: s.cart.eventSlug === eventSlug ? { ...s.cart, passId } : { eventSlug, passId, sideIds: [] },
    }));
  }, []);

  const removePass = useCallback(() => {
    setState((s) => {
      const cart = { ...s.cart, passId: null };
      return { ...s, cart: cart.sideIds.length ? cart : EMPTY_CART };
    });
  }, []);

  const toggleSide = useCallback((eventSlug: string, sideId: string) => {
    setState((s) => {
      const base = s.cart.eventSlug === eventSlug ? s.cart : { eventSlug, passId: null, sideIds: [] };
      const sideIds = base.sideIds.includes(sideId) ? base.sideIds.filter((x) => x !== sideId) : [...base.sideIds, sideId];
      const cart = { ...base, sideIds };
      return { ...s, cart: cart.passId || sideIds.length ? cart : EMPTY_CART };
    });
  }, []);

  const clearCart = useCallback(() => setState((s) => ({ ...s, cart: EMPTY_CART })), []);

  const placeOrder = useCallback((input: CheckoutInput) => {
    const s = stateRef.current;
    if (!s.session || !s.cart.eventSlug) return null;
    const priced = priceCart(s.cart, s.vouchers, input);
    const order: Order = {
      id: `ord-${Date.now().toString(36)}`,
      confirmation: code(),
      badgeCode: priced.pass ? code() : undefined,
      eventSlug: s.cart.eventSlug,
      createdAt: new Date().toISOString().slice(0, 10),
      items: priced.items,
      discountCode: priced.codeValid ? input.discountCode?.toUpperCase() : undefined,
      codeDiscount: priced.codeDiscount,
    };
    // Consume redeemed vouchers, then grant the ones included in the pass (VOU-01).
    let toUse = priced.voucherIds.length;
    const vouchers = s.vouchers.map((v) =>
      toUse > 0 && !v.usedOn && v.eventSlug === order.eventSlug ? (toUse--, { ...v, usedOn: order.id }) : v,
    );
    const granted: Voucher[] = Array.from({ length: priced.pass?.vouchers ?? 0 }, (_, i) => ({
      id: `v-${order.id}-${i}`,
      eventSlug: order.eventSlug,
      source: "pass" as const,
    }));
    const next = { ...s, orders: [order, ...s.orders], vouchers: [...vouchers, ...granted], cart: EMPTY_CART };
    stateRef.current = next;
    setState(next);
    return order;
  }, []);

  const refundItem = useCallback((orderId: string, refId: string) => {
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) =>
        o.id === orderId ? { ...o, items: o.items.map((i) => (i.refId === refId ? { ...i, refunded: true } : i)) } : o,
      ),
    }));
  }, []);

  const refundOrder = useCallback((orderId: string) => {
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) => (o.id === orderId ? { ...o, items: o.items.map((i) => ({ ...i, refunded: true })) } : o)),
    }));
  }, []);

  const togglePrereg = useCallback((passId: string) => {
    setState((s) => ({
      ...s,
      preregs: s.preregs.includes(passId) ? s.preregs.filter((x) => x !== passId) : [...s.preregs, passId],
    }));
  }, []);

  const resetDemo = useCallback(() => setState(seed()), []);

  const value = useMemo<Store>(
    () => ({
      ...state, ready, signIn, signOut, selectPass, removePass, toggleSide, clearCart,
      placeOrder, refundItem, refundOrder, togglePrereg, resetDemo,
    }),
    [state, ready, signIn, signOut, selectPass, removePass, toggleSide, clearCart, placeOrder, refundItem, refundOrder, togglePrereg, resetDemo],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside <StoreProvider>");
  return s;
}
