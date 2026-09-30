"use client";

/**
 * Roles table in the requirement drawer: which role the requirement supports,
 * what it lets that role do, and any special precondition. Persisted in
 * requirement_roles. Click a row to edit it; Enter saves, Escape cancels.
 */

import { useEffect, useState, type CSSProperties } from "react";
import { ROLES } from "@/lib/requirements/roles";
import { TXT, TXT_2, TXT_3 } from "./RequirementCells";

interface RoleRow {
  id: string;
  role: string;
  capability: string;
  precondition: string | null;
}

interface Draft {
  id: string | null; // null = new row
  role: string;
  capability: string;
  precondition: string;
}

const GRID: CSSProperties = { display: "grid", gridTemplateColumns: "132px minmax(0, 1fr) 120px 16px", gap: 10, alignItems: "start" };
const HEAD: CSSProperties = { fontSize: 12, color: TXT_2, padding: "0 0 8px" };
const CELL: CSSProperties = { fontSize: 13, lineHeight: 1.5, color: TXT, minWidth: 0, overflowWrap: "anywhere" };
const FIELD: CSSProperties = {
  width: "100%", minWidth: 0, fontSize: 13, lineHeight: 1.4, color: TXT, background: "#fff",
  border: "1px solid #d0d3d8", borderRadius: 6, padding: "5px 7px", outline: "none", font: "inherit",
};

export function RequirementRoles({ requirementId }: { requirementId: string }) {
  const [rows, setRows] = useState<RoleRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoaded(false);
    setDraft(null);
    fetch(`/api/requirements/${requirementId}/roles`)
      .then(r => r.json())
      .then((data: RoleRow[]) => {
        if (!alive) return;
        setRows(data);
        setLoaded(true);
      });
    return () => { alive = false; };
  }, [requirementId]);

  const startNew = () => setDraft({ id: null, role: ROLES[0], capability: "", precondition: "" });
  const startEdit = (r: RoleRow) => setDraft({ id: r.id, role: r.role, capability: r.capability, precondition: r.precondition ?? "" });

  async function save() {
    if (!draft || !draft.capability.trim() || saving) return;
    setSaving(true);
    try {
      const body = JSON.stringify({ role: draft.role, capability: draft.capability, precondition: draft.precondition });
      const res = draft.id
        ? await fetch(`/api/requirement-roles/${draft.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body })
        : await fetch(`/api/requirements/${requirementId}/roles`, { method: "POST", headers: { "Content-Type": "application/json" }, body });
      if (!res.ok) { alert("No se pudo guardar el rol."); return; }
      const row = (await res.json()) as RoleRow;
      setRows(prev => (draft.id ? prev.map(r => (r.id === row.id ? row : r)) : [...prev, row]));
      setDraft(null);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    setRows(prev => prev.filter(r => r.id !== id));
    const res = await fetch(`/api/requirement-roles/${id}`, { method: "DELETE" });
    if (!res.ok) alert("No se pudo eliminar el rol.");
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); save(); }
    if (e.key === "Escape") { e.preventDefault(); setDraft(null); }
  };

  if (!loaded) return <p style={{ fontSize: 13, color: TXT_3, margin: 0 }}>Cargando…</p>;

  // Keep a role written outside the list (e.g. from the CLI) selectable while editing it.
  const roleOptions = draft && !(ROLES as readonly string[]).includes(draft.role) ? [draft.role, ...ROLES] : [...ROLES];

  const editor = (key: string) => (
    <div key={key} style={{ ...GRID, padding: "8px 0", borderTop: "1px solid #f0f0f2" }} onKeyDown={onKey}>
      <select value={draft!.role} onChange={e => setDraft(d => d && { ...d, role: e.target.value })} style={{ ...FIELD, padding: "5px 4px" }} aria-label="Rol">
        {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
      </select>
      <textarea autoFocus rows={2} value={draft!.capability} placeholder="Qué puede hacer este rol…" aria-label="Funcionalidad soportada"
        onChange={e => setDraft(d => d && { ...d, capability: e.target.value })} style={{ ...FIELD, resize: "vertical" }} />
      <textarea rows={2} value={draft!.precondition} placeholder="Ninguna" aria-label="Precondición"
        onChange={e => setDraft(d => d && { ...d, precondition: e.target.value })} style={{ ...FIELD, resize: "vertical" }} />
      <span />
      <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button onClick={() => setDraft(null)} className="req-editable"
          style={{ fontSize: 12, color: TXT_2, background: "none", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer" }}>
          Cancelar
        </button>
        <button onClick={save} disabled={!draft!.capability.trim() || saving}
          style={{ fontSize: 12, fontWeight: 500, color: "#fff", background: "#5e6ad2", border: "none", borderRadius: 6, padding: "4px 12px", cursor: "pointer", opacity: !draft!.capability.trim() || saving ? 0.5 : 1 }}>
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </div>
  );

  return (
    <div>
      {rows.length === 0 && !draft ? (
        <p style={{ fontSize: 13, color: TXT_3, margin: "0 0 8px" }}>Todavía no hay roles asociados a este requerimiento.</p>
      ) : (
        <div role="table" aria-label="Roles">
          <div role="row" style={GRID}>
            <span role="columnheader" style={HEAD}>Rol</span>
            <span role="columnheader" style={HEAD}>Funcionalidad soportada</span>
            <span role="columnheader" style={HEAD}>Precondición</span>
            <span />
          </div>
          {rows.map(r =>
            draft?.id === r.id ? (
              editor(r.id)
            ) : (
              <div key={r.id} role="row" className="req-bullet" style={{ ...GRID, padding: "8px 6px", margin: "0 -6px", borderTop: "1px solid #f0f0f2", borderRadius: 0, cursor: "text" }}
                onClick={() => startEdit(r)}>
                <span role="cell" style={{ ...CELL, fontWeight: 500 }}>{r.role}</span>
                <span role="cell" style={CELL}>{r.capability}</span>
                <span role="cell" style={{ ...CELL, color: r.precondition ? TXT : TXT_3 }}>{r.precondition ?? "—"}</span>
                <button className="req-bullet-delete" title="Eliminar" onClick={e => { e.stopPropagation(); remove(r.id); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: TXT_3, fontSize: 15, lineHeight: 1, padding: "2px 0" }}>
                  ×
                </button>
              </div>
            ),
          )}
          {draft && draft.id === null && editor("new")}
        </div>
      )}
      {!draft && (
        <button onClick={startNew} className="req-editable"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 6, padding: "5px 6px", marginLeft: -6, background: "none", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, color: TXT_2 }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>
          Añadir rol
        </button>
      )}
    </div>
  );
}
