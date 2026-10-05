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
  /** PAS-06: up to one pass of each type (the default limit; configurable per type in SmartVenues). */
  passIds: string[];
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
const EMPTY_CART: Cart = { eventSlug: null, passIds: [], sideIds: [] };

/** Clean slate: signed in, no purchases, no vouchers — every on-sale product is available. */
function seed(): State {
  return {
    session: DEMO_USER,
    cart: EMPTY_CART,
    orders: [],
    vouchers: [],
    preregs: [],
    prizeTickets: 0,
  };
}

const KEY = "riftbound-demo-v3"; // v3: the cart holds several pass types (PAS-06)

function code(prefix = "RB") {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const block = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${prefix}-${block()}-${block()}`;
}

/* ── Derived helpers ────────────────────────────────────────────────────── */

/** Passes the fan holds for an event, not refunded (EVT-04, PAS-06). */
export function ownedPassesFor(orders: Order[], eventSlug: string): Pass[] {
  const passes: Pass[] = [];
  for (const o of orders) {
    if (o.eventSlug !== eventSlug) continue;
    for (const i of o.items) {
      const pass = i.kind === "pass" && !i.refunded ? getPass(i.refId) : undefined;
      if (pass && !passes.some((p) => p.id === pass.id)) passes.push(pass);
    }
  }
  return passes;
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
  const passes = cart.passIds.map((id) => getPass(id)).filter((x): x is Pass => !!x);
  const sides = cart.sideIds.map((id) => getSideEvent(id)).filter((s): s is NonNullable<typeof s> => !!s);
  const available = vouchers.filter((v) => !v.usedOn && v.eventSlug === cart.eventSlug).length;
  const voucherIds = input.voucherSideIds.filter((id) => cart.sideIds.includes(id)).slice(0, available);
  const items: OrderItem[] = [
    ...passes.map((pass) => ({ kind: "pass" as const, refId: pass.id, name: pass.name, price: pass.price, voucherDiscount: 0 })),
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
  return { ev, passes, sides, items, available, voucherIds, codeDiscount, total: subtotal - codeDiscount, codeValid: rate > 0 };
}

/* ── Context ────────────────────────────────────────────────────────────── */

interface Store extends State {
  ready: boolean;
  /** True right after «Sign out» (not persisted): private pages then send the fan to Find Events, not to the login (ACC-04.6). */
  signedOut: boolean;
  signIn: () => void;
  signOut: () => void;
  /** Demo only: the RSO session lapses but the cart stays (ACC-02.3, ACC-04.8). */
  expireSession: () => void;
  selectPass: (eventSlug: string, passId: string) => void;
  removePass: (passId: string) => void;
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
  const [signedOut, setSignedOut] = useState(false);
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

  const signIn = useCallback(() => {
    setSignedOut(false);
    setState((s) => ({ ...s, session: DEMO_USER }));
  }, []);
  const signOut = useCallback(() => {
    setSignedOut(true);
    setState((s) => ({ ...s, session: null, cart: EMPTY_CART }));
  }, []);
  const expireSession = useCallback(() => {
    setSignedOut(false);
    setState((s) => ({ ...s, session: null }));
  }, []);

  /** One pass of each type per cart (PAS-06, default limit 1), and a cart belongs to a single event. */
  const selectPass = useCallback((eventSlug: string, passId: string) => {
    setState((s) => {
      const base = s.cart.eventSlug === eventSlug ? s.cart : { eventSlug, passIds: [], sideIds: [] };
      return { ...s, cart: base.passIds.includes(passId) ? base : { ...base, passIds: [...base.passIds, passId] } };
    });
  }, []);

  const removePass = useCallback((passId: string) => {
    setState((s) => {
      const cart = { ...s.cart, passIds: s.cart.passIds.filter((x) => x !== passId) };
      return { ...s, cart: cart.passIds.length || cart.sideIds.length ? cart : EMPTY_CART };
    });
  }, []);

  const toggleSide = useCallback((eventSlug: string, sideId: string) => {
    setState((s) => {
      const base = s.cart.eventSlug === eventSlug ? s.cart : { eventSlug, passIds: [], sideIds: [] };
      const sideIds = base.sideIds.includes(sideId) ? base.sideIds.filter((x) => x !== sideId) : [...base.sideIds, sideId];
      const cart = { ...base, sideIds };
      return { ...s, cart: cart.passIds.length || sideIds.length ? cart : EMPTY_CART };
    });
  }, []);

  const clearCart = useCallback(() => setState((s) => ({ ...s, cart: EMPTY_CART })), []);

  const placeOrder = useCallback((input: CheckoutInput) => {
    const s = stateRef.current;
    if (!s.session || !s.cart.eventSlug) return null;
    const priced = priceCart(s.cart, s.vouchers, input);
    const items = priced.items.map((i) => (i.kind === "pass" ? { ...i, badgeCode: code() } : i));
    const order: Order = {
      id: `ord-${Date.now().toString(36)}`,
      confirmation: code(),
      badgeCode: items.find((i) => i.kind === "pass")?.badgeCode,
      eventSlug: s.cart.eventSlug,
      createdAt: new Date().toISOString().slice(0, 10),
      items,
      discountCode: priced.codeValid ? input.discountCode?.toUpperCase() : undefined,
      codeDiscount: priced.codeDiscount,
    };
    // Consume redeemed vouchers, then grant the ones included in the pass (VOU-01).
    let toUse = priced.voucherIds.length;
    const vouchers = s.vouchers.map((v) =>
      toUse > 0 && !v.usedOn && v.eventSlug === order.eventSlug ? (toUse--, { ...v, usedOn: order.id }) : v,
    );
    const granted: Voucher[] = Array.from({ length: priced.passes.reduce((n, pass) => n + pass.vouchers, 0) }, (_, i) => ({
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
      ...state, ready, signedOut, signIn, signOut, expireSession, selectPass, removePass, toggleSide, clearCart,
      placeOrder, refundItem, refundOrder, togglePrereg, resetDemo,
    }),
    [state, ready, signedOut, signIn, signOut, expireSession, selectPass, removePass, toggleSide, clearCart, placeOrder, refundItem, refundOrder, togglePrereg, resetDemo],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside <StoreProvider>");
  return s;
}
