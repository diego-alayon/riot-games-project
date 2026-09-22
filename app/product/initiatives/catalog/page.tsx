"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ── Domain catalogue ──────────────────────────────────────────────────────────
const AREAS: Record<string, { label: string; service: string; db: string; category: string }> = {
  ORG: { label: "Organization",      service: "svekube-organization",      db: "sv-organization-db",  category: "Fundacional" },
  VEN: { label: "Venue",             service: "svekube-venue",             db: "sv-venue-db",         category: "Fundacional" },
  EVT: { label: "Event",             service: "svekube-event",             db: "sv-event-db",         category: "Core"        },
  PRD: { label: "Product",           service: "svekube-product",           db: "sv-product-db",       category: "Core"        },
  CMP: { label: "Campaign",          service: "svekube-campaign",          db: "sv-campaign-db",      category: "Core"        },
  DIS: { label: "Discount",          service: "svekube-discount",          db: "sv-discount-db",      category: "Core"        },
  SAL: { label: "Sales & Service",   service: "svekube-sale_and_service",  db: "sv-sales-db",         category: "Transacción" },
  ENT: { label: "Entitlement",       service: "svekube-entitlement",       db: "sv-entitlement-db",   category: "Transacción" },
  ACC: { label: "Access Management", service: "svekube-access_management", db: "sv-access-db",        category: "Transacción" },
  PAY: { label: "Payments",          service: "svekube-payments",          db: "sv-payments-db",      category: "Transacción" },
  PAS: { label: "Passes",            service: "svekube-passes",            db: "sv-passes-db",        category: "Entrega"     },
  EML: { label: "Emails",            service: "svekube-emails",            db: "sv-emails-db",        category: "Entrega"     },
};

const CAT_COLOR: Record<string, string> = {
  Fundacional: "#6366f1",
  Core:        "#f59e0b",
  Transacción: "#10b981",
  Entrega:     "#3b82f6",
};

const CLASS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  build:  { bg: "rgba(228,242,34,0.08)", color: "#8a8f00", border: "rgba(228,242,34,0.3)" },
  native: { bg: "rgba(99,102,241,0.08)", color: "#6366f1", border: "rgba(99,102,241,0.3)" },
  out:    { bg: "rgba(235,87,87,0.08)",  color: "#eb5757", border: "rgba(235,87,87,0.3)"  },
};

type Classification = "build" | "native" | "out";
type RowKind = "initiative" | "epic" | "story" | "fr";

const KIND_META: Record<RowKind, { dot: string; label: string; indent: number; bold: boolean; fontSize: number }> = {
  initiative: { dot: "#6366f1", label: "Initiative",             indent: 0,  bold: true,  fontSize: 13 },
  epic:       { dot: "#f59e0b", label: "Epic",                   indent: 16, bold: true,  fontSize: 12 },
  story:      { dot: "#10b981", label: "Story",                  indent: 32, bold: false, fontSize: 12 },
  fr:         { dot: "#9b9b9b", label: "Functional requirement", indent: 48, bold: false, fontSize: 11 },
};

const KIND_BADGE: Record<RowKind, { bg: string; color: string; border: string }> = {
  initiative: { bg: "rgba(99,102,241,0.08)",  color: "#6366f1", border: "rgba(99,102,241,0.25)" },
  epic:       { bg: "rgba(245,158,11,0.08)",  color: "#b45309", border: "rgba(245,158,11,0.25)" },
  story:      { bg: "rgba(16,185,129,0.08)",  color: "#059669", border: "rgba(16,185,129,0.25)" },
  fr:         { bg: "rgba(155,155,155,0.08)", color: "#6b6b6b", border: "rgba(155,155,155,0.25)" },
};

interface FR         { id: string; code: string; area: string; description: string; classification: Classification; }
interface Story      { id: string; name: string; frs: FR[]; }
interface Epic       { id: string; name: string; stories: Story[]; }
interface Initiative { id: string; name: string; epics: Epic[]; app?: { id: string; name: string } | null; }
interface ApiInitiative { id: string; name: string; description?: string; }

// ── BMAD epics.md parser ──────────────────────────────────────────────────────
interface ParsedEpic { title: string; stories: { title: string; frs: { code: string; description: string }[] }[] }

function parseBmadMarkdown(md: string): ParsedEpic[] {
  const lines = md.split("\n");

  // Collect all FRs
  const frMap: Record<string, string> = {};
  const frRegex = /^(FR\d+):\s+(.+)$/;
  for (const line of lines) {
    const m = line.match(frRegex);
    if (m) frMap[m[1]] = m[2].trim();
  }

  const epicHeaderRegex = /^#{2,3} Epic (\d+):\s+(.+)$/;
  const storyHeaderRegex = /^#{3,4} Story ([\d.]+[a-zA-Z-]*):\s+(.+)$/;

  const epicByNum = new Map<string, { num: string; title: string; startLine: number }>();
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(epicHeaderRegex);
    if (m) epicByNum.set(m[1], { num: m[1], title: m[2].trim(), startLine: i });
  }
  const epicSections = Array.from(epicByNum.values()).sort((a, b) => a.startLine - b.startLine);

  const epics: ParsedEpic[] = [];

  for (let ei = 0; ei < epicSections.length; ei++) {
    const epic = epicSections[ei];
    const endLine = ei + 1 < epicSections.length ? epicSections[ei + 1].startLine : lines.length;
    const epicLines = lines.slice(epic.startLine + 1, endLine);

    const storyStarts: { idx: number; num: string; title: string }[] = [];
    for (let i = 0; i < epicLines.length; i++) {
      const m = epicLines[i].match(storyHeaderRegex);
      if (m) storyStarts.push({ idx: i, num: m[1], title: m[2].trim() });
    }

    const stories: ParsedEpic["stories"] = [];
    for (let si = 0; si < storyStarts.length; si++) {
      const story = storyStarts[si];
      const storyEnd = si + 1 < storyStarts.length ? storyStarts[si + 1].idx : epicLines.length;
      const storyLines = epicLines.slice(story.idx + 1, storyEnd);

      const frRefs = new Set<string>();
      for (const l of storyLines) {
        for (const m of l.matchAll(/\b(FR\d+)\b/g)) frRefs.add(m[1]);
      }

      if (story.title.toLowerCase().includes("resolved")) continue;

      const frs = Array.from(frRefs)
        .sort((a, b) => parseInt(a.slice(2)) - parseInt(b.slice(2)))
        .filter(ref => frMap[ref])
        .map(ref => ({ code: ref, description: frMap[ref] }));

      stories.push({ title: story.title, frs });
    }

    if (stories.length === 0) {
      const frsLine = epicLines.find(l => l.startsWith("**FRs covered:**"));
      const refs = frsLine ? Array.from(frsLine.matchAll(/\b(FR\d+)\b/g)).map(m => m[1]) : [];
      if (refs.length > 0) {
        const frs = refs.filter(r => frMap[r]).map(r => ({ code: r, description: frMap[r] }));
        stories.push({ title: "General requirements", frs });
      }
    }

    if (stories.length > 0) {
      epics.push({ title: `Epic ${epic.num}: ${epic.title}`, stories });
    }
  }

  return epics;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const ROW_H = 36;

const COL_HEADER: React.CSSProperties = {
  fontSize: 11, fontWeight: 500, color: "#9b9b9b",
  textAlign: "left", padding: "0 12px", height: 36,
  borderBottom: "1px solid #ebebeb", whiteSpace: "nowrap", userSelect: "none",
};

// ── Toggle button ─────────────────────────────────────────────────────────────
function ToggleBtn({ id, hasChildren, isOpen, onToggle }: { id: string; hasChildren: boolean; isOpen: boolean; onToggle: (id: string) => void }) {
  return (
    <button onClick={() => hasChildren && onToggle(id)}
      style={{ width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: 6, color: "#b0b0b0", background: "none", border: "none", cursor: hasChildren ? "pointer" : "default", opacity: hasChildren ? 1 : 0 }}>
      <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        {isOpen ? <path d="M2 3.5l3 3 3-3" /> : <path d="M3.5 2l3 3-3 3" />}
      </svg>
    </button>
  );
}

// ── Type filter dropdown ──────────────────────────────────────────────────────
function TypeFilterDropdown({ active, onChange, data }: { active: Set<RowKind>; onChange: (next: Set<RowKind>) => void; data: Initiative[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const kinds: RowKind[] = ["initiative", "epic", "story", "fr"];

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (k: RowKind) => {
    const next = new Set(active);
    next.has(k) ? next.delete(k) : next.add(k);
    if (next.size > 0) onChange(next);
  };

  const allSelected = kinds.every((k) => active.has(k));
  const toggleAll   = () => onChange(allSelected ? new Set(["initiative"]) : new Set(kinds));

  const counts: Record<RowKind, number> = {
    initiative: data.length,
    epic:       data.flatMap(i => i.epics).length,
    story:      data.flatMap(i => i.epics.flatMap(e => e.stories)).length,
    fr:         data.flatMap(i => i.epics.flatMap(e => e.stories.flatMap(s => s.frs))).length,
  };

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 11, fontWeight: 500, color: open ? "#0f0f0f" : "#9b9b9b" }}>
        Type
        <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M2 3.5l3 3 3-3" />
        </svg>
        {!allSelected && (
          <span style={{ background: "#6366f1", color: "#fff", fontSize: 10, fontWeight: 600, lineHeight: "15px", padding: "0 4px", borderRadius: 9999 }}>{active.size}</span>
        )}
      </button>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 50, backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.08)", padding: "6px 0", minWidth: 210 }}>
          <button onClick={toggleAll}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "5px 12px", background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#0f0f0f", textAlign: "left" }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "")}>
            <div style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${allSelected ? "#6366f1" : "#d0d0d0"}`, backgroundColor: allSelected ? "#6366f1" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {allSelected && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5l2.5 2.5L8 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            All types
          </button>
          <div style={{ height: 1, backgroundColor: "#f0f0f0", margin: "4px 0" }} />
          {kinds.map(k => {
            const checked = active.has(k);
            const meta  = KIND_META[k];
            const badge = KIND_BADGE[k];
            return (
              <button key={k} onClick={() => toggle(k)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "5px 12px", background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#0f0f0f", textAlign: "left" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "")}>
                <div style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${checked ? "#6366f1" : "#d0d0d0"}`, backgroundColor: checked ? "#6366f1" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {checked && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5l2.5 2.5L8 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: meta.dot, flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{meta.label}</span>
                <span style={{ fontSize: 11, fontWeight: 500, padding: "1px 6px", borderRadius: 4, backgroundColor: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                  {counts[k]}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Import modal ──────────────────────────────────────────────────────────────
interface ImportModalProps {
  initiatives: ApiInitiative[];
  onClose: () => void;
  onImported: () => void;
}

function ImportModal({ initiatives, onClose, onImported }: ImportModalProps) {
  const [file, setFile]               = useState<File | null>(null);
  const [initiativeId, setInitiativeId] = useState<string>(initiatives[0]?.id ?? "");
  const [mode, setMode]               = useState<"replace" | "merge">("replace");
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSave() {
    if (!file || !initiativeId) { setError("Select a file and an initiative."); return; }
    setSaving(true);
    setError(null);
    try {
      const text = await file.text();
      const epics = parseBmadMarkdown(text);
      if (epics.length === 0) { setError("No epics or FRs found. Is this a BMAD epics.md file?"); setSaving(false); return; }

      const res = await fetch(`/api/initiatives/${initiativeId}/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ epics, mode }),
      });
      if (!res.ok) { setError("Import failed. Try again."); setSaving(false); return; }
      onImported();
    } catch {
      setError("Could not parse the file. Make sure it's a valid BMAD epics.md.");
      setSaving(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ backgroundColor: "#fff", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.18)", width: 460, padding: "24px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "#0f0f0f", margin: 0 }}>Import BMAD epics.md</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9b9b9b", fontSize: 20, lineHeight: 1 }}>×</button>
        </div>

        {/* File picker */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: "#3b3b3b", display: "block", marginBottom: 6 }}>File</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input ref={fileRef} type="file" accept=".md" style={{ display: "none" }} onChange={e => { setFile(e.target.files?.[0] ?? null); e.target.value = ""; }} />
            <button onClick={() => fileRef.current?.click()}
              style={{ fontSize: 12, border: "1px solid #e5e5e5", borderRadius: 6, padding: "6px 12px", backgroundColor: "#fafafa", cursor: "pointer", color: "#3b3b3b" }}>
              Choose file
            </button>
            <span style={{ fontSize: 12, color: file ? "#0f0f0f" : "#9b9b9b" }}>{file ? file.name : "No file selected"}</span>
          </div>
        </div>

        {/* Initiative selector */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: "#3b3b3b", display: "block", marginBottom: 6 }}>Assign to initiative</label>
          {initiatives.length === 0 ? (
            <p style={{ fontSize: 12, color: "#9b9b9b" }}>No initiatives in DB yet. Create one first.</p>
          ) : (
            <select value={initiativeId} onChange={e => setInitiativeId(e.target.value)}
              style={{ width: "100%", fontSize: 12, padding: "6px 10px", border: "1px solid #e5e5e5", borderRadius: 6, backgroundColor: "#fafafa", color: "#0f0f0f" }}>
              {initiatives.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          )}
        </div>

        {/* Replace / merge */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: "#3b3b3b", display: "block", marginBottom: 8 }}>Import mode</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(["replace", "merge"] as const).map(m => (
              <label key={m} style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                <input type="radio" name="mode" value={m} checked={mode === m} onChange={() => setMode(m)} style={{ marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#0f0f0f" }}>{m === "replace" ? "Replace" : "Merge"}</div>
                  <div style={{ fontSize: 11, color: "#9b9b9b" }}>
                    {m === "replace" ? "Deletes existing epics/stories/FRs for this initiative, then imports." : "Adds new items without removing existing ones. Skips duplicate FR codes."}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {error && <p style={{ fontSize: 12, color: "#eb5757", marginBottom: 12 }}>{error}</p>}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose}
            style={{ fontSize: 12, border: "1px solid #e5e5e5", borderRadius: 6, padding: "6px 14px", backgroundColor: "#fff", cursor: "pointer", color: "#3b3b3b" }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving || !file || !initiativeId}
            style={{ fontSize: 12, border: "none", borderRadius: 6, padding: "6px 16px", backgroundColor: saving ? "#9b9b9b" : "#0f0f0f", color: "#fff", cursor: saving ? "not-allowed" : "pointer", fontWeight: 500 }}>
            {saving ? "Importing…" : "Import & Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tree adapter: API tree → local Initiative[] ───────────────────────────────
function adaptTree(apiTree: any[]): Initiative[] {
  return apiTree.map((init: any) => ({
    id: init.id,
    name: init.name,
    app: init.app ?? null,
    epics: (init.epics ?? []).map((epic: any) => ({
      id: epic.id,
      name: epic.name,
      stories: (epic.stories ?? []).map((story: any) => ({
        id: story.id,
        name: story.name,
        frs: (story.requirements ?? []).map((req: any) => ({
          id: req.id,
          code: req.code,
          area: req.area ?? "—",
          description: req.description,
          classification: (req.classification ?? "build") as Classification,
        })),
      })),
    })),
  }));
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function FunctionalRequirementsPage() {
  const [data, setData]               = useState<Initiative[]>([]);
  const [allInits, setAllInits]       = useState<ApiInitiative[]>([]);
  const [loading, setLoading]         = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [activeKinds, setActiveKinds] = useState<Set<RowKind>>(new Set(["initiative", "epic", "story", "fr"]));
  const [expanded, setExpanded]       = useState<Set<string>>(new Set());

  const defaultExpanded = (d: Initiative[]) =>
    new Set<string>(d.flatMap(init => [init.id, ...init.epics.slice(0, 1).map(e => e.id)]));

  const fetchTree = useCallback(async () => {
    try {
      const res = await fetch("/api/initiatives/tree");
      const tree = await res.json();
      const adapted = adaptTree(Array.isArray(tree) ? tree : []);
      setData(adapted);
      setExpanded(defaultExpanded(adapted));
    } catch {}
    setLoading(false);
  }, []);

  const fetchInitiatives = useCallback(async () => {
    try {
      const res = await fetch("/api/initiatives");
      const list = await res.json();
      setAllInits(Array.isArray(list) ? list : []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchTree();
    fetchInitiatives();
  }, [fetchTree, fetchInitiatives]);

  const toggle = (id: string) =>
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // ── Flatten rows ────────────────────────────────────────────────────────────
  type Row =
    | { kind: "initiative"; item: Initiative }
    | { kind: "epic";       item: Epic       }
    | { kind: "story";      item: Story      }
    | { kind: "fr";         item: FR         };

  const showInit  = activeKinds.has("initiative");
  const showEpic  = activeKinds.has("epic");
  const showStory = activeKinds.has("story");
  const showFr    = activeKinds.has("fr");

  const rows: Row[] = [];
  for (const init of data) {
    if (showInit) rows.push({ kind: "initiative", item: init });
    const initOpen = expanded.has(init.id) || !showInit;
    if (!initOpen) continue;
    for (const epic of init.epics) {
      if (showEpic) rows.push({ kind: "epic", item: epic });
      const epicOpen = expanded.has(epic.id) || !showEpic;
      if (!epicOpen) continue;
      for (const story of epic.stories) {
        if (showStory) rows.push({ kind: "story", item: story });
        const storyOpen = expanded.has(story.id) || !showStory;
        if (!storyOpen) continue;
        if (showFr) for (const fr of story.frs) rows.push({ kind: "fr", item: fr });
      }
    }
  }

  const visibleParents = [showInit, showEpic, showStory];

  return (
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", height: "100%" }}>

      {showModal && (
        <ImportModal
          initiatives={allInits}
          onClose={() => setShowModal(false)}
          onImported={() => { setShowModal(false); setLoading(true); fetchTree(); }}
        />
      )}

      {/* Header */}
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 500, color: "#9b9b9b", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 4 }}>Product</div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "#0f0f0f", letterSpacing: "-0.3px" }}>Functional Requirements</h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => setShowModal(true)}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", fontSize: 12, fontWeight: 500, border: "1px solid #e5e5e5", borderRadius: 6, backgroundColor: "#ffffff", color: "#3b3b3b", cursor: "pointer" }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#ffffff")}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 11h10M7 2v7M4 6l3 3 3-3"/></svg>
            Import epics.md
          </button>

          <a href="/product/initiatives" style={{ fontSize: 12, color: "#6b6b6b", textDecoration: "none" }}>← Initiatives</a>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        {(["initiative", "epic", "story", "fr"] as RowKind[]).map(k => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: KIND_META[k].dot }} />
            <span style={{ fontSize: 11, color: "#9b9b9b" }}>{KIND_META[k].label}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ border: "1px solid #ebebeb", borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <colgroup>
            <col style={{ width: "9%" }} />
            <col style={{ width: "30%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "19%" }} />
            <col style={{ width: "6%" }} />
          </colgroup>
          <thead>
            <tr style={{ backgroundColor: "#fafafa" }}>
              <th style={{ ...COL_HEADER, position: "relative" }}>
                <TypeFilterDropdown active={activeKinds} onChange={setActiveKinds} data={data} />
              </th>
              {["Name / Description", "Code", "Business area", "Microservice", "Database", "Classification"].map(h => (
                <th key={h} style={COL_HEADER}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} style={{ padding: "32px 12px", textAlign: "center", fontSize: 13, color: "#9b9b9b" }}>
                  Loading…
                </td>
              </tr>
            )}
            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "32px 12px", textAlign: "center", fontSize: 13, color: "#9b9b9b" }}>
                  No data yet. Create an initiative and import an epics.md file.
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && data.length > 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "32px 12px", textAlign: "center", fontSize: 13, color: "#9b9b9b" }}>
                  Select at least one type to show rows.
                </td>
              </tr>
            )}
            {rows.map(row => {
              const meta  = KIND_META[row.kind];
              const badge = KIND_BADGE[row.kind];
              const levelIndex = ["initiative", "epic", "story", "fr"].indexOf(row.kind);
              let indent = 0;
              for (let i = 0; i < levelIndex; i++) if (visibleParents[i]) indent += 16;

              if (row.kind === "fr") {
                const fr   = row.item as FR;
                const area = AREAS[fr.area];
                const cls  = CLASS_STYLE[fr.classification] ?? CLASS_STYLE.build;
                return (
                  <tr key={fr.id} style={{ borderBottom: "1px solid #f4f4f4" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fafafa")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "")}>
                    <td style={{ padding: "0 12px", height: ROW_H }}>
                      <span style={{ fontSize: 10, fontWeight: 500, padding: "2px 6px", borderRadius: 4, backgroundColor: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, whiteSpace: "nowrap" }}>FR</span>
                    </td>
                    <td style={{ padding: "0 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", paddingLeft: indent }}>
                        <div style={{ width: 16, flexShrink: 0, marginRight: 6 }} />
                        <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: area ? CAT_COLOR[area.category] : "#d0d0d0", flexShrink: 0, marginRight: 8 }} />
                        <span style={{ fontSize: 11, color: "#6b6b6b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fr.description}</span>
                      </div>
                    </td>
                    <td style={{ padding: "0 12px" }}>
                      <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 600, color: "#4338ca", backgroundColor: "rgba(99,102,241,0.08)", padding: "2px 6px", borderRadius: 4, whiteSpace: "nowrap" }}>{fr.code}</span>
                    </td>
                    <td style={{ padding: "0 12px" }}>
                      {area ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: CAT_COLOR[area.category], flexShrink: 0 }} />
                          <span style={{ fontSize: 11, color: "#6b6b6b" }}>{area.label}</span>
                        </div>
                      ) : <span style={{ fontSize: 11, color: "#c0c0c0" }}>—</span>}
                    </td>
                    <td style={{ padding: "0 12px" }}>
                      <span style={{ fontFamily: "monospace", fontSize: 11, color: "#6b6b6b" }}>{area?.service ?? "—"}</span>
                    </td>
                    <td style={{ padding: "0 12px" }}>
                      <span style={{ fontFamily: "monospace", fontSize: 11, color: "#6b6b6b" }}>{area?.db ?? "—"}</span>
                    </td>
                    <td style={{ padding: "0 12px" }}>
                      <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 7px", borderRadius: 4, backgroundColor: cls.bg, color: cls.color, border: `1px solid ${cls.border}`, whiteSpace: "nowrap" }}>
                        {fr.classification}
                      </span>
                    </td>
                  </tr>
                );
              }

              // initiative / epic / story
              const id   = row.item.id;
              const name = (row.item as any).name as string;
              const children =
                row.kind === "initiative" ? (row.item as Initiative).epics
                : row.kind === "epic"     ? (row.item as Epic).stories
                : (row.item as Story).frs;
              const childLabel =
                row.kind === "initiative" ? `${children.length} epic${children.length !== 1 ? "s" : ""}`
                : row.kind === "epic"     ? `${children.length} stor${children.length !== 1 ? "ies" : "y"}`
                : `${(children as FR[]).length} FR${(children as FR[]).length !== 1 ? "s" : ""}`;

              const hasChildren = children.length > 0;
              const isOpen      = expanded.has(id);

              // Show app name for initiatives
              const appName = row.kind === "initiative" ? (row.item as Initiative).app?.name : null;

              return (
                <tr key={id} style={{ borderBottom: "1px solid #f4f4f4" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fafafa")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "")}>
                  <td style={{ padding: "0 12px", height: ROW_H }}>
                    <span style={{ fontSize: 10, fontWeight: 500, padding: "2px 6px", borderRadius: 4, backgroundColor: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, whiteSpace: "nowrap", textTransform: "capitalize" }}>
                      {row.kind}
                    </span>
                  </td>
                  <td style={{ padding: "0 12px", height: ROW_H }} colSpan={6}>
                    <div style={{ display: "flex", alignItems: "center", paddingLeft: indent }}>
                      <ToggleBtn id={id} hasChildren={hasChildren} isOpen={isOpen} onToggle={toggle} />
                      <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: meta.dot, flexShrink: 0, marginRight: 8 }} />
                      <span style={{ fontSize: meta.fontSize, fontWeight: meta.bold ? 600 : 400, color: "#0f0f0f", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {name}
                      </span>
                      {appName && (
                        <span style={{ marginLeft: 8, fontSize: 10, color: "#6b6b6b", backgroundColor: "#f0f0f0", padding: "1px 6px", borderRadius: 4, flexShrink: 0 }}>{appName}</span>
                      )}
                      <span style={{ marginLeft: 8, fontSize: 11, color: "#9b9b9b", flexShrink: 0 }}>{childLabel}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
