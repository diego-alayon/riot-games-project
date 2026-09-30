"use client";

/**
 * Review tag of a drawer entry (lib/requirements/tags.ts): the coloured chip
 * shown under the entry, and the picker that sets, changes or clears it.
 */

import { useEffect, useRef, useState } from "react";
import { ITEM_TAGS, ITEM_TAG_KEYS, type ItemTag } from "@/lib/requirements/tags";
import { TXT, TXT_2 } from "./RequirementCells";

/** Warning triangle for the pending tags, struck-through circle for "Out of scope". */
export function TagIcon({ tag, size = 12 }: { tag: ItemTag; size?: number }) {
  const t = ITEM_TAGS[tag];
  return t.warning ? (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={t.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-hidden>
      <path d="M8 2.2L14.5 13.5h-13L8 2.2z" /><path d="M8 6.5v3.2M8 11.6v.01" />
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={t.color} strokeWidth="1.6" strokeLinecap="round" style={{ flexShrink: 0 }} aria-hidden>
      <circle cx="8" cy="8" r="6" /><path d="M3.8 12.2l8.4-8.4" />
    </svg>
  );
}

export function TagChip({ tag }: { tag: ItemTag }) {
  const t = ITEM_TAGS[tag];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, height: 20, padding: "0 8px", borderRadius: 10,
      fontSize: 11, fontWeight: 600, color: t.color, background: t.bg, border: `1px solid ${t.color}40`, whiteSpace: "nowrap",
    }}>
      <TagIcon tag={tag} size={11} />
      {t.label}
    </span>
  );
}

/** Tag button shown on hover; stays visible while its menu is open. */
export function TagPicker({ value, onChange }: { value: ItemTag | null; onChange: (tag: ItemTag | null) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const pick = (tag: ItemTag | null) => { onChange(tag); setOpen(false); };
  const row: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "7px 8px", background: "none", border: "none",
    borderRadius: 6, cursor: "pointer", fontSize: 13, color: TXT, textAlign: "left", whiteSpace: "nowrap",
  };
  const hover = {
    onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.backgroundColor = "#f4f4f5"),
    onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.backgroundColor = ""),
  };

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button onClick={() => setOpen(o => !o)} title="Etiquetar" aria-label="Etiquetar" className={open ? undefined : "req-bullet-action"}
        style={{ background: "none", border: "none", cursor: "pointer", color: TXT_2, padding: "4px 2px", display: "flex" }}>
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
          <path d="M2 2.5h5.3l6.7 6.7-4.8 4.8L2.5 7.3V2.5z" /><circle cx="5.2" cy="5.7" r="1" />
        </svg>
      </button>
      {open && (
        <div role="menu" style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, zIndex: 70, padding: 4, background: "#fff", border: "1px solid #e6e6e8", borderRadius: 8, boxShadow: "0 6px 20px rgba(0,0,0,0.10)" }}>
          {ITEM_TAG_KEYS.map(k => (
            <button key={k} role="menuitemradio" aria-checked={value === k} onClick={() => pick(k)} style={row} {...hover}>
              <TagIcon tag={k} />
              <span style={{ flex: 1 }}>{ITEM_TAGS[k].label}</span>
              {value === k && <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.5l3 3L10 1" stroke={TXT_2} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </button>
          ))}
          {value && (
            <>
              <div style={{ height: 1, background: "#f0f0f2", margin: "4px 0" }} />
              <button role="menuitem" onClick={() => pick(null)} style={{ ...row, color: TXT_2 }} {...hover}>Quitar tag (resuelto)</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
