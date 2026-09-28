"use client";

/**
 * Cell renderers for the functional requirements table. Plain text + a small
 * icon per value (no pills, no borders), following the Linear-style list.
 */

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { PLATFORMS, PLATFORM_KEYS, type PlatformKey } from "@/lib/requirements/platforms";

export const TXT = "#282a30";
export const TXT_2 = "#6b6f76";
export const TXT_3 = "#a0a4ab";

const cell: CSSProperties = { display: "flex", alignItems: "center", gap: 8, minWidth: 0, fontSize: 13, color: TXT_2 };
const ellipsis: CSSProperties = { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 };

function Svg({ children, size = 14, color }: { children: ReactNode; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color ?? "currentColor"} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      {children}
    </svg>
  );
}

/* ── Kind (Type column) ─────────────────────────────────────────────────── */

export type Kind = "initiative" | "epic" | "story" | "fr";

const KIND_LABEL: Record<Kind, string> = { initiative: "Initiative", epic: "Epic", story: "Story", fr: "FR" };

export function KindIcon({ kind }: { kind: Kind }) {
  if (kind === "initiative")
    return <Svg color="#8a8f98"><path d="M8 1.8l5.5 3.1v6.2L8 14.2l-5.5-3.1V4.9L8 1.8z" /><path d="M2.5 4.9L8 8l5.5-3.1M8 8v6.2" /></Svg>;
  if (kind === "epic")
    return <Svg color="#d9822b"><path d="M8 2l6 3-6 3-6-3 6-3z" /><path d="M2 8l6 3 6-3M2 11l6 3 6-3" /></Svg>;
  if (kind === "story")
    return <Svg color="#26a269"><path d="M4 2h8v12l-4-2.5L4 14V2z" /></Svg>;
  return <Svg color="#8a8f98"><rect x="3" y="2" width="10" height="12" rx="1.5" /><path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" /></Svg>;
}

export function KindCell({ kind }: { kind: Kind }) {
  return (
    <span style={cell}>
      <KindIcon kind={kind} />
      <span style={{ ...ellipsis, color: TXT_2 }}>{KIND_LABEL[kind]}</span>
    </span>
  );
}

/* ── ID ─────────────────────────────────────────────────────────────────── */

export function IdCell({ code }: { code?: string | null }) {
  if (!code) return null;
  return <span style={{ fontSize: 13, color: TXT_2, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{code}</span>;
}

/* ── Estado (Health-style) ──────────────────────────────────────────────── */

export function StatusCell({ status }: { status?: string | null }) {
  if (!status) return <Empty />;
  let icon: ReactNode;
  if (status === "Confirmado")
    icon = <Svg size={16} color="#26a269"><circle cx="8" cy="8" r="6.2" /><path d="M5.4 8.2l1.8 1.8 3.5-3.8" /></Svg>;
  else if (status === "Descartado v1")
    icon = <Svg size={16} color={TXT_3}><circle cx="8" cy="8" r="6.2" /><path d="M6 6l4 4M10 6l-4 4" /></Svg>;
  else
    icon = <Svg size={16} color="#d9822b"><circle cx="8" cy="8" r="6.2" strokeDasharray="2.2 2" /></Svg>;
  return (
    <span style={cell}>
      {icon}
      <span style={ellipsis}>{status}</span>
    </span>
  );
}

/* ── Prioridad ──────────────────────────────────────────────────────────── */

export function PriorityCell({ priority }: { priority?: string | null }) {
  if (!priority) return <span style={{ ...cell, color: TXT_3 }}>---</span>;
  const critical = priority === "Crítica";
  return (
    <span style={cell}>
      {critical ? (
        <svg width="14" height="14" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
          <rect x="1.5" y="1.5" width="13" height="13" rx="3" fill="#e5484d" />
          <path d="M8 4.5v4.2M8 11h.01" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
          <rect x="2" y="9" width="3" height="5" rx="1" fill="#8a8f98" />
          <rect x="6.5" y="6" width="3" height="8" rx="1" fill="#d0d3d8" />
          <rect x="11" y="3" width="3" height="11" rx="1" fill="#d0d3d8" />
        </svg>
      )}
      <span style={{ ...ellipsis, color: critical ? TXT : TXT_2 }}>{priority}</span>
    </span>
  );
}

/* ── Owner (Teams/Lead-style) ───────────────────────────────────────────── */

const OWNER_COLOR: Record<string, string> = {
  Globant: "#d6409f",
  Riot: "#e5484d",
  Compartido: "#6e56cf",
  "Por definir": "#a0a4ab",
};

function TeamIcon({ color }: { color: string }) {
  return (
    <Svg size={16} color={color}>
      <rect x="2" y="2" width="12" height="12" rx="2.5" />
      <circle cx="8" cy="6.8" r="1.8" />
      <path d="M5 11.5c.6-1.5 1.7-2.2 3-2.2s2.4.7 3 2.2" />
    </Svg>
  );
}

export function OwnerCell({ owner }: { owner?: string | null }) {
  if (!owner) return <Empty />;
  return (
    <span style={cell}>
      <TeamIcon color={OWNER_COLOR[owner] ?? TXT_3} />
      <span style={{ ...ellipsis, color: TXT }}>{owner}</span>
    </span>
  );
}

/* ── Plataforma (multi-select) ──────────────────────────────────────────── */

export function PlatformIcon({ k }: { k: PlatformKey }) {
  return k === "riftbound" ? (
    <Svg color="#ef7d00"><path d="M8 2l6 6-6 6-6-6 6-6z" /><path d="M8 5.5L10.5 8 8 10.5 5.5 8 8 5.5z" /></Svg>
  ) : (
    <Svg color="#3e63dd"><rect x="2" y="2" width="12" height="12" rx="2.5" /><path d="M5 10.5V8M8 10.5V5.5M11 10.5V7" /></Svg>
  );
}

export function PlatformCell({ value, onChange }: { value: PlatformKey[]; onChange: (v: PlatformKey[]) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const toggle = (k: PlatformKey) => onChange(value.includes(k) ? value.filter(x => x !== k) : [...value, k]);

  return (
    <div ref={ref} style={{ position: "relative", minWidth: 0 }}>
      <button onClick={() => setOpen(o => !o)} className="req-editable"
        style={{ ...cell, gap: 14, width: "100%", background: "none", border: "none", padding: "4px 6px", margin: "0 -6px", borderRadius: 6, cursor: "pointer", textAlign: "left" }}>
        {value.length === 0 && <span style={{ color: TXT_3 }}>—</span>}
        {value.map(k => (
          <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <PlatformIcon k={k} />
            <span style={{ ...ellipsis, color: TXT }}>{PLATFORMS[k]}</span>
          </span>
        ))}
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: -6, zIndex: 50, minWidth: 240, padding: 4, background: "#fff", border: "1px solid #e6e6e8", borderRadius: 8, boxShadow: "0 6px 20px rgba(0,0,0,0.10)" }}>
          {PLATFORM_KEYS.map(k => {
            const on = value.includes(k);
            return (
              <button key={k} onClick={() => toggle(k)}
                style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "7px 8px", background: "none", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, color: TXT, textAlign: "left" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f4f4f5")} onMouseLeave={e => (e.currentTarget.style.backgroundColor = "")}>
                <span style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${on ? "#5e6ad2" : "#d0d3d8"}`, background: on ? "#5e6ad2" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {on && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5l2.5 2.5L8 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </span>
                <PlatformIcon k={k} />
                {PLATFORMS[k]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Fecha de entrega ───────────────────────────────────────────────────── */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function ordinal(n: number) {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  return `${n}${({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th"}`;
}
/** "Jun 5th"; adds the year when it is not the current one. */
export function formatDueDate(iso: string, now = new Date()): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${ordinal(d)}${y !== now.getFullYear() ? ` ${y}` : ""}`;
}
const todayIso = () => new Date().toISOString().slice(0, 10);

export function DueDateCell({ value, onChange }: { value?: string | null; onChange: (v: string | null) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const overdue = !!value && value < todayIso();
  const open = () => {
    const el = input.current;
    if (!el) return;
    if (typeof el.showPicker === "function") el.showPicker();
    else el.click();
  };
  return (
    <div className="req-date" style={{ position: "relative", display: "flex", alignItems: "center", minWidth: 0 }}>
      <button onClick={open} className="req-editable"
        style={{ ...cell, background: "none", border: "none", padding: "4px 6px", margin: "0 -6px", borderRadius: 6, cursor: "pointer" }}>
        {value ? (
          <>
            {overdue ? (
              <Svg size={16} color="#e5484d"><rect x="2" y="3" width="12" height="11" rx="2" /><path d="M2 6.5h12M5.5 1.8v2.4M10.5 1.8v2.4M6.5 9l3 3M9.5 9l-3 3" /></Svg>
            ) : (
              <Svg size={16} color={TXT_3}><rect x="2" y="3" width="12" height="11" rx="2" /><path d="M2 6.5h12M5.5 1.8v2.4M10.5 1.8v2.4" /></Svg>
            )}
            <span style={{ color: TXT, whiteSpace: "nowrap" }}>{formatDueDate(value)}</span>
          </>
        ) : (
          <span className="req-date-empty" style={{ color: TXT_3, whiteSpace: "nowrap" }}>Set date</span>
        )}
      </button>
      {value && (
        <button className="req-date-clear" onClick={() => onChange(null)} title="Clear date"
          style={{ marginLeft: 6, background: "none", border: "none", cursor: "pointer", color: TXT_3, fontSize: 14, lineHeight: 1, padding: 2 }}>
          ×
        </button>
      )}
      <input ref={input} type="date" value={value ?? ""} onChange={e => onChange(e.target.value || null)} tabIndex={-1} aria-hidden
        style={{ position: "absolute", left: 0, bottom: 0, width: 1, height: 1, opacity: 0, pointerEvents: "none" }} />
    </div>
  );
}

/* ── Plain text ─────────────────────────────────────────────────────────── */

export function TextCell({ value }: { value?: string | null }) {
  if (!value || value === "—") return <Empty />;
  return <span style={{ ...cell, display: "block", ...ellipsis }} title={value}>{value}</span>;
}

export function Empty() {
  return <span style={{ fontSize: 13, color: TXT_3 }}>—</span>;
}
