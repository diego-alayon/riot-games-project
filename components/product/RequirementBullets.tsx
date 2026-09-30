"use client";

/**
 * Editable, persisted bullet list for a requirement (requirement_items).
 *
 * Click a bullet to edit it. Enter saves and starts the next bullet,
 * Shift+Enter adds a line break, Escape cancels, and Backspace on an empty
 * bullet removes it. Writes go through a queue so rapid typing keeps order.
 * Each saved entry shows its stable ID (FND-06.1, FND-06.AC1…). Entries with a
 * "[TBD: …]" marker are pending definition and show in magenta with a warning icon.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { ItemScope } from "@/lib/requirements/platforms";
import { itemLabel, type ItemKind } from "@/lib/requirements/items";
import { isPending, PENDING_BG, PENDING_COLOR, PENDING_LABEL } from "@/lib/requirements/pending";
import { TXT, TXT_2, TXT_3 } from "./RequirementCells";

interface Item {
  key: string;
  id?: string;
  seq?: number | null;
  text: string;
}

interface ServerItem { id: string; text: string; seq: number | null }

let seq = 0;
const newKey = () => `draft-${++seq}`;

export function RequirementBullets({ requirementId, code, platform = "all", kind = "functional", marker = "dot", addLabel, emptyLabel }: {
  requirementId: string;
  /** Requirement code, to build each entry's stable ID. */
  code: string;
  platform?: ItemScope;
  /** "excluded" draws a struck-through sign, for out-of-scope lists. */
  marker?: "dot" | "excluded";
  kind?: ItemKind;
  addLabel: string;
  emptyLabel: string;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  // Mirrors `editing` synchronously, so a late blur from a textarea that is being
  // replaced cannot commit (and wipe) a bullet that already ended its edit.
  const editingRef = useRef<string | null>(null);
  const edit = (key: string | null) => { editingRef.current = key; setEditing(key); };
  const itemsRef = useRef<Item[]>([]);
  itemsRef.current = items;
  const ids = useRef<Record<string, string>>({});
  const queue = useRef<Promise<unknown>>(Promise.resolve());

  const enqueue = (op: () => Promise<unknown>) => {
    queue.current = queue.current.then(op).catch(() => alert("No se pudo guardar el cambio."));
  };

  useEffect(() => {
    let alive = true;
    setLoaded(false);
    edit(null);
    fetch(`/api/requirements/${requirementId}/items?kind=${kind}&platform=${platform}`)
      .then(r => r.json())
      .then((rows: ServerItem[]) => {
        if (!alive) return;
        ids.current = {};
        setItems(rows.map(r => {
          const key = `item-${r.id}`;
          ids.current[key] = r.id;
          return { key, id: r.id, seq: r.seq, text: r.text };
        }));
        setLoaded(true);
      });
    return () => { alive = false; };
  }, [requirementId, kind, platform]);

  /** Persists `text` for the item `key`: create, update or delete. */
  const persist = useCallback((key: string, text: string) => {
    enqueue(async () => {
      const id = ids.current[key];
      if (!text.trim()) {
        if (id) await fetch(`/api/requirement-items/${id}`, { method: "DELETE" });
        delete ids.current[key];
        return;
      }
      if (id) {
        await fetch(`/api/requirement-items/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
        return;
      }
      // Position among the bullets that already exist (or are being saved).
      const list = itemsRef.current.filter(i => i.key === key || i.text.trim());
      const index = list.findIndex(i => i.key === key);
      const res = await fetch(`/api/requirements/${requirementId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, kind, platform, index }),
      });
      const row = (await res.json()) as ServerItem;
      ids.current[key] = row.id;
      setItems(xs => xs.map(i => (i.key === key ? { ...i, id: row.id, seq: row.seq } : i)));
    });
  }, [requirementId, kind, platform]);

  const startEdit = (item: Item) => {
    edit(item.key);
    setDraft(item.text);
  };

  const insertAfter = (afterKey: string | null) => {
    const item: Item = { key: newKey(), text: "" };
    setItems(prev => {
      if (afterKey === null) return [...prev, item];
      const i = prev.findIndex(x => x.key === afterKey);
      return [...prev.slice(0, i + 1), item, ...prev.slice(i + 1)];
    });
    edit(item.key);
    setDraft("");
  };

  /** Ends the current edit, saving it (empty text removes the bullet). */
  const commit = (key: string, text: string) => {
    const prev = itemsRef.current.find(i => i.key === key);
    if (!prev || editingRef.current !== key) return;
    edit(null);
    if (!text.trim()) {
      setItems(xs => xs.filter(i => i.key !== key));
      if (ids.current[key]) persist(key, "");
      return;
    }
    const clean = text.trim();
    setItems(xs => xs.map(i => (i.key === key ? { ...i, text: clean } : i)));
    itemsRef.current = itemsRef.current.map(i => (i.key === key ? { ...i, text: clean } : i));
    if (clean !== prev.text || !ids.current[key]) persist(key, clean);
  };

  const cancel = (key: string) => {
    edit(null);
    if (!ids.current[key]) setItems(xs => xs.filter(i => i.key !== key));
  };

  const remove = (key: string) => {
    setItems(xs => xs.filter(i => i.key !== key));
    if (ids.current[key]) persist(key, "");
  };

  if (!loaded) return <p style={{ fontSize: 13, color: TXT_3, margin: 0 }}>Cargando…</p>;

  return (
    <div>
      {items.length === 0 && <p style={{ fontSize: 13, color: TXT_3, margin: "0 0 8px" }}>{emptyLabel}</p>}
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 2 }}>
        {items.map((item, idx) => {
          const pending = editing !== item.key && isPending(item.text);
          return (
          <li key={item.key} className="req-bullet" title={pending ? PENDING_LABEL : undefined}
            style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "5px 6px", margin: "0 -6px", borderRadius: 6, backgroundColor: pending ? PENDING_BG : undefined }}>
            <span title="ID estable" style={{ width: 86, flexShrink: 0, paddingTop: 3, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 11, color: pending ? PENDING_COLOR : TXT_3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {itemLabel(code, kind, item.seq) ?? "…"}
            </span>
            {pending ? (
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke={PENDING_COLOR} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 4, flexShrink: 0, marginLeft: -4, marginRight: -2 }} aria-label={PENDING_LABEL}>
                <path d="M8 2.2L14.5 13.5h-13L8 2.2z" /><path d="M8 6.5v3.2M8 11.6v.01" />
              </svg>
            ) : marker === "excluded" ? (
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#c4543f" strokeWidth="1.6" strokeLinecap="round" style={{ marginTop: 5, flexShrink: 0, marginLeft: -3, marginRight: -2 }} aria-label="Fuera de scope">
                <circle cx="8" cy="8" r="6" /><path d="M3.8 12.2l8.4-8.4" />
              </svg>
            ) : (
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: TXT_2, marginTop: 9, flexShrink: 0 }} />
            )}
            {editing === item.key ? (
              <textarea
                autoFocus
                value={draft}
                rows={1}
                placeholder="Describe el requerimiento…"
                ref={el => { if (el) { el.style.height = "0px"; el.style.height = `${el.scrollHeight}px`; } }}
                onFocus={e => { const el = e.currentTarget; el.setSelectionRange(el.value.length, el.value.length); }}
                onChange={e => setDraft(e.target.value)}
                onBlur={() => commit(item.key, draft)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    const hasText = !!draft.trim();
                    commit(item.key, draft);
                    if (hasText) insertAfter(item.key);
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    cancel(item.key);
                  } else if (e.key === "Backspace" && draft === "") {
                    e.preventDefault();
                    const prevItem = items[idx - 1];
                    remove(item.key);
                    if (prevItem) startEdit(prevItem);
                    else edit(null);
                  }
                }}
                style={{ flex: 1, minWidth: 0, resize: "none", border: "none", outline: "none", padding: 0, background: "transparent", font: "inherit", fontSize: 14, lineHeight: 1.55, color: TXT, overflow: "hidden" }}
              />
            ) : (
              <button onClick={() => startEdit(item)}
                style={{ flex: 1, minWidth: 0, textAlign: "left", background: "none", border: "none", padding: 0, font: "inherit", fontSize: 14, lineHeight: 1.55, color: pending ? PENDING_COLOR : TXT, cursor: "text", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {item.text}
              </button>
            )}
            {editing !== item.key && (
              <button className="req-bullet-delete" onClick={() => remove(item.key)} title="Eliminar"
                style={{ background: "none", border: "none", cursor: "pointer", color: TXT_3, fontSize: 15, lineHeight: 1, padding: "3px 2px", flexShrink: 0 }}>
                ×
              </button>
            )}
          </li>
          );
        })}
      </ul>
      <button onClick={() => insertAfter(null)} className="req-editable"
        style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 6, padding: "5px 6px", marginLeft: -6, background: "none", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, color: TXT_2 }}>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>
        {addLabel}
      </button>
    </div>
  );
}
