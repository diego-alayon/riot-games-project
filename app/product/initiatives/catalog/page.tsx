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
  Fundacional: "#6366f1", Core: "#f59e0b", Transacción: "#10b981", Entrega: "#3b82f6",
};

const CLASS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  build:  { bg: "rgba(228,242,34,0.08)", color: "#8a8f00", border: "rgba(228,242,34,0.3)" },
  native: { bg: "rgba(99,102,241,0.08)", color: "#6366f1", border: "rgba(99,102,241,0.3)" },
  out:    { bg: "rgba(235,87,87,0.08)",  color: "#eb5757", border: "rgba(235,87,87,0.3)"  },
};

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

interface DBFr        { id: string; code: string; area: string; description: string; classification: string; story_id: string; epic_id: string; }
interface DBStory     { id: string; name: string; epic_id: string; requirements?: DBFr[]; }
interface DBEpic      { id: string; name: string; initiative_id: string; stories?: DBStory[]; }
interface DBInitiative{ id: string; name: string; app?: { id: string; name: string } | null; epics?: DBEpic[]; }

// BMAD parser types
interface ParsedFr    { code: string; description: string; area: string; classification: "build" | "native" | "out"; }
interface ParsedStory { name: string; frs: ParsedFr[]; }
interface ParsedEpic  { name: string; stories: ParsedStory[]; }

// ── BMAD epics.md parser ──────────────────────────────────────────────────────
function parseBmadMarkdown(md: string): ParsedEpic[] {
  const lines = md.split("\n");
  const frMap: Record<string, string> = {};
  for (const line of lines) {
    const m = line.match(/^(FR\d+):\s+(.+)$/);
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

  let frCounter = 1;
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

    const stories: ParsedStory[] = [];
    for (let si = 0; si < storyStarts.length; si++) {
      const story = storyStarts[si];
      const storyEnd = si + 1 < storyStarts.length ? storyStarts[si + 1].idx : epicLines.length;
      const storyLines = epicLines.slice(story.idx + 1, storyEnd);

      const frRefs = new Set<string>();
      for (const l of storyLines) {
        for (const match of l.matchAll(/\b(FR\d+)\b/g)) frRefs.add(match[1]);
      }

      if (story.title.toLowerCase().includes("resolved")) continue;

      const frs: ParsedFr[] = Array.from(frRefs)
        .sort((a, b) => parseInt(a.slice(2)) - parseInt(b.slice(2)))
        .filter(ref => frMap[ref])
        .map(ref => ({ code: `${ref}`, description: frMap[ref], area: "—", classification: "build" as const }));

      stories.push({ name: story.title, frs });
      frCounter++;
    }

    if (stories.length === 0) {
      const frsLine = epicLines.find(l => l.startsWith("**FRs covered:**"));
      const refs = frsLine ? Array.from(frsLine.matchAll(/\b(FR\d+)\b/g)).map(m => m[1]) : [];
      if (refs.length > 0) {
        stories.push({ name: "General requirements", frs: refs.filter(r => frMap[r]).map(r => ({ code: r, description: frMap[r], area: "—", classification: "build" as const })) });
      }
    }

    if (stories.length > 0) epics.push({ name: `Epic ${epic.num}: ${epic.title}`, stories });
  }

  return epics;
}

const ROW_H = 36;
const COL_HEADER: React.CSSProperties = {
  fontSize: 11, fontWeight: 500, color: "#9b9b9b",
  textAlign: "left", padding: "0 12px", height: 36,
  borderBottom: "1px solid #ebebeb", whiteSpace: "nowrap", userSelect: "none",
};

function Checkbox({ state }: { state: "checked" | "indeterminate" | "unchecked" }) {
  const checked = state === "checked";
  const indet   = state === "indeterminate";
  return (
    <div style={{ width: 15, height: 15, borderRadius: 3, border: `1.5px solid ${checked || indet ? "#6366f1" : "#d0d0d0"}`, backgroundColor: checked ? "#6366f1" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
      {checked && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5l2.5 2.5L8 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      {indet   && <div style={{ width: 7, height: 2, backgroundColor: "#6366f1", borderRadius: 1 }} />}
    </div>
  );
}

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

function TypeFilterDropdown({ active, onChange, counts }: { active: Set<RowKind>; onChange: (s: Set<RowKind>) => void; counts: Record<RowKind, number> }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const kinds: RowKind[] = ["initiative", "epic", "story", "fr"];

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const toggle = (k: RowKind) => { const n = new Set(active); n.has(k) ? n.delete(k) : n.add(k); if (n.size > 0) onChange(n); };
  const allSelected = kinds.every(k => active.has(k));
  const toggleAll = () => onChange(allSelected ? new Set(["initiative"]) : new Set(kinds));

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 11, fontWeight: 500, color: open ? "#0f0f0f" : "#9b9b9b" }}>
        Type
        <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 3.5l3 3 3-3" /></svg>
        {!allSelected && <span style={{ background: "#6366f1", color: "#fff", fontSize: 10, fontWeight: 600, lineHeight: "15px", padding: "0 4px", borderRadius: 9999 }}>{active.size}</span>}
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 50, backgroundColor: "#fff", border: "1px solid #e5e5e5", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.08)", padding: "6px 0", minWidth: 210 }}>
          <button onClick={toggleAll} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "5px 12px", background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#0f0f0f" }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f5f5f5")} onMouseLeave={e => (e.currentTarget.style.backgroundColor = "")}>
            <div style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${allSelected ? "#6366f1" : "#d0d0d0"}`, backgroundColor: allSelected ? "#6366f1" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {allSelected && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5l2.5 2.5L8 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            All types
          </button>
          <div style={{ height: 1, backgroundColor: "#f0f0f0", margin: "4px 0" }} />
          {kinds.map(k => {
            const checked = active.has(k);
            const meta = KIND_META[k]; const badge = KIND_BADGE[k];
            return (
              <button key={k} onClick={() => toggle(k)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "5px 12px", background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#0f0f0f" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f5f5f5")} onMouseLeave={e => (e.currentTarget.style.backgroundColor = "")}>
                <div style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${checked ? "#6366f1" : "#d0d0d0"}`, backgroundColor: checked ? "#6366f1" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {checked && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5l2.5 2.5L8 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: meta.dot, flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{meta.label}</span>
                <span style={{ fontSize: 11, fontWeight: 500, padding: "1px 6px", borderRadius: 4, backgroundColor: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>{counts[k]}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Import Modal ──────────────────────────────────────────────────────────────
function ImportModal({ initiatives, onClose, onPreview }: {
  initiatives: DBInitiative[];
  onClose: () => void;
  onPreview: (initiativeId: string, epics: ParsedEpic[], mode: "replace" | "merge", fileName: string, fileContent: string) => void;
}) {
  const [selectedInit, setSelectedInit] = useState("");
  const [mode, setMode] = useState<"replace" | "merge">("replace");
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [parsed, setParsed] = useState<ParsedEpic[] | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      try {
        const result = parseBmadMarkdown(text);
        if (result.length === 0) { setError("No epics found. Make sure this is a BMAD epics.md file."); return; }
        setParsed(result);
        setFileName(file.name);
        setFileContent(text);
        setError("");
      } catch { setError("Could not parse the file."); }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function handlePreview() {
    if (!selectedInit) { setError("Select a target initiative."); return; }
    if (!parsed) { setError("Select a .md file to import."); return; }
    onPreview(selectedInit, parsed, mode, fileName, fileContent);
    onClose();
  }

  const totalFrs = parsed?.flatMap(e => e.stories.flatMap(s => s.frs)).length ?? 0;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.35)" }} />
      <div style={{ position: "relative", backgroundColor: "#fff", borderRadius: 12, boxShadow: "0 8px 40px rgba(0,0,0,0.12)", width: 480, padding: "28px 28px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "#0f0f0f", letterSpacing: "-0.2px" }}>Import from BMAD</h2>
            <p style={{ fontSize: 12, color: "#6b6b6b", marginTop: 2 }}>Import epics, stories and functional requirements from a BMAD epics.md file.</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9b9b9b", fontSize: 18, lineHeight: 1, padding: 4 }}>×</button>
        </div>

        {/* File picker */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: "#3b3b3b", display: "block", marginBottom: 6 }}>BMAD epics.md file</label>
          <input ref={fileRef} type="file" accept=".md" style={{ display: "none" }} onChange={handleFile} />
          <button onClick={() => fileRef.current?.click()}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", border: "1px solid #e5e5e5", borderRadius: 6, backgroundColor: "#fafafa", cursor: "pointer", fontSize: 12, color: parsed ? "#0f0f0f" : "#9b9b9b" }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f0f0f0")} onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#fafafa")}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 11h10M7 2v7M4 6l3 3 3-3"/></svg>
            {parsed ? (
              <span style={{ flex: 1 }}>{fileName} <span style={{ color: "#059669", fontWeight: 500 }}>— {parsed.length} epics, {parsed.flatMap(e => e.stories).length} stories, {totalFrs} FRs</span></span>
            ) : "Choose .md file…"}
          </button>
        </div>

        {/* Initiative selector */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: "#3b3b3b", display: "block", marginBottom: 6 }}>Target initiative</label>
          <select value={selectedInit} onChange={e => setSelectedInit(e.target.value)}
            style={{ width: "100%", padding: "8px 10px", border: "1px solid #e5e5e5", borderRadius: 6, fontSize: 12, color: "#0f0f0f", backgroundColor: "#fff", outline: "none" }}>
            <option value="">Select an initiative…</option>
            {initiatives.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>

        {/* Mode */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: "#3b3b3b", display: "block", marginBottom: 8 }}>Import mode</label>
          {(["replace", "merge"] as const).map(m => (
            <label key={m} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8, cursor: "pointer" }}>
              <input type="radio" name="mode" value={m} checked={mode === m} onChange={() => setMode(m)} style={{ marginTop: 2, accentColor: "#6366f1" }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#0f0f0f" }}>{m === "replace" ? "Replace" : "Merge"}</div>
                <div style={{ fontSize: 11, color: "#6b6b6b" }}>
                  {m === "replace" ? "Delete all existing epics, stories and FRs in this initiative, then import." : "Keep existing epics and add the imported ones alongside them."}
                </div>
              </div>
            </label>
          ))}
        </div>

        {error && <p style={{ fontSize: 12, color: "#eb5757", marginBottom: 12 }}>{error}</p>}

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "6px 14px", fontSize: 12, fontWeight: 500, border: "1px solid #e5e5e5", borderRadius: 6, backgroundColor: "#fff", color: "#3b3b3b", cursor: "pointer" }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f5f5f5")} onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#fff")}>
            Cancel
          </button>
          <button onClick={handlePreview} disabled={!parsed || !selectedInit}
            style={{ padding: "6px 16px", fontSize: 12, fontWeight: 500, border: "none", borderRadius: 6, backgroundColor: (!parsed || !selectedInit) ? "#e5e5e5" : "#0f0f0f", color: (!parsed || !selectedInit) ? "#9b9b9b" : "#fff", cursor: (!parsed || !selectedInit) ? "default" : "pointer" }}
            onMouseEnter={e => { if (parsed && selectedInit) (e.currentTarget as HTMLElement).style.backgroundColor = "#3b3b3b"; }}
            onMouseLeave={e => { if (parsed && selectedInit) (e.currentTarget as HTMLElement).style.backgroundColor = "#0f0f0f"; }}>
            Preview import
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function FunctionalRequirementsPage() {
  const [dbData, setDbData]       = useState<DBInitiative[]>([]);
  const [loading, setLoading]     = useState(true);
  const [activeKinds, setActiveKinds] = useState<Set<RowKind>>(new Set(["initiative", "epic", "story", "fr"]));
  const [expanded, setExpanded]   = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [selected, setSelected]   = useState<Set<string>>(new Set());
  const [deleting, setDeleting]   = useState(false);

  // Pending import state
  const [pending, setPending] = useState<{
    initiativeId: string; epics: ParsedEpic[]; mode: "replace" | "merge"; fileName: string; fileContent: string;
  } | null>(null);

  const defaultExpanded = (data: DBInitiative[]) =>
    new Set<string>(data.flatMap(i => [i.id, ...(i.epics?.slice(0, 1).map(e => e.id) ?? [])]));

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/initiatives/tree");
      const raw: DBInitiative[] = await res.json();
      setDbData(raw);
      setExpanded(defaultExpanded(raw));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggle = (id: string) =>
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // ── Save pending import to DB ──────────────────────────────────────────────
  async function handleSave() {
    if (!pending) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/initiatives/${pending.initiativeId}/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: pending.mode, epics: pending.epics, fileName: pending.fileName, fileContent: pending.fileContent }),
      });
      if (!res.ok) { const e = await res.json(); alert(`Error: ${e.error}`); return; }
      setPending(null);
      await fetchData();
    } finally {
      setSaving(false);
    }
  }

  // ── Delete selected items — only delete topmost ancestors (CASCADE handles children) ──
  async function handleDeleteSelected() {
    if (selected.size === 0) return;
    setDeleting(true);
    try {
      // Build a set of IDs to actually DELETE via API:
      // skip any item whose parent is also selected (cascade will remove it)
      const toDelete: { id: string; kind: RowKind }[] = [];

      for (const init of displayData) {
        if (!selected.has(init.id)) {
          for (const epic of (init.epics ?? [])) {
            if (!selected.has(epic.id)) {
              for (const story of (epic.stories ?? [])) {
                if (!selected.has(story.id)) {
                  for (const fr of (story.requirements ?? [])) {
                    if (selected.has(fr.id)) toDelete.push({ id: fr.id, kind: "fr" });
                  }
                } else {
                  toDelete.push({ id: story.id, kind: "story" });
                }
              }
            } else {
              toDelete.push({ id: epic.id, kind: "epic" });
            }
          }
        } else {
          toDelete.push({ id: init.id, kind: "initiative" });
        }
      }

      const endpointFor: Record<RowKind, string> = {
        initiative: "/api/initiatives",
        epic:       "/api/epics",
        story:      "/api/stories",
        fr:         "/api/requirements",
      };

      await Promise.all(toDelete.map(({ id, kind }) =>
        fetch(`${endpointFor[kind]}/${id}`, { method: "DELETE" })
      ));

      setSelected(new Set());
      await fetchData();
    } finally {
      setDeleting(false);
    }
  }

  // ── Build display tree: merge pending preview into dbData ─────────────────
  const displayData: DBInitiative[] = pending ? dbData.map(init => {
    if (init.id !== pending.initiativeId) return init;
    const previewEpics: DBEpic[] = pending.epics.map((pe, ei) => ({
      id: `preview-epic-${ei}`,
      name: pe.name,
      initiative_id: init.id,
      stories: pe.stories.map((ps, si) => ({
        id: `preview-story-${ei}-${si}`,
        name: ps.name,
        epic_id: `preview-epic-${ei}`,
        requirements: ps.frs.map((fr, fi) => ({
          id: `preview-fr-${ei}-${si}-${fi}`,
          code: fr.code,
          area: fr.area,
          description: fr.description,
          classification: fr.classification,
          story_id: `preview-story-${ei}-${si}`,
          epic_id: `preview-epic-${ei}`,
        })),
      })),
    }));
    return {
      ...init,
      epics: pending.mode === "replace" ? previewEpics : [...(init.epics ?? []), ...previewEpics],
    };
  }) : dbData;

  // Flatten
  type Row =
    | { kind: "initiative"; item: DBInitiative }
    | { kind: "epic";  item: DBEpic }
    | { kind: "story"; item: DBStory }
    | { kind: "fr";    item: DBFr };

  // Clear selection when data changes
  // (handled implicitly — stale IDs simply won't match anything)

  const showInit  = activeKinds.has("initiative");
  const showEpic  = activeKinds.has("epic");
  const showStory = activeKinds.has("story");
  const showFr    = activeKinds.has("fr");
  const visibleParents = [showInit, showEpic, showStory];

  const rows: Row[] = [];
  for (const init of displayData) {
    if (showInit) rows.push({ kind: "initiative", item: init });
    const initOpen = expanded.has(init.id) || !showInit;
    if (!initOpen) continue;
    for (const epic of (init.epics ?? [])) {
      if (showEpic) rows.push({ kind: "epic", item: epic });
      const epicOpen = expanded.has(epic.id) || !showEpic;
      if (!epicOpen) continue;
      for (const story of (epic.stories ?? [])) {
        if (showStory) rows.push({ kind: "story", item: story });
        const storyOpen = expanded.has(story.id) || !showStory;
        if (!storyOpen) continue;
        if (showFr) for (const fr of (story.requirements ?? [])) rows.push({ kind: "fr", item: fr });
      }
    }
  }

  // Collect all real (non-preview) IDs per row so we can compute descendant sets
  function descendantIds(row: Row): string[] {
    const ids: string[] = [];
    if (row.item.id.startsWith("preview-")) return ids;
    ids.push(row.item.id);
    if (row.kind === "initiative") {
      for (const epic of ((row.item as DBInitiative).epics ?? [])) {
        ids.push(epic.id);
        for (const story of (epic.stories ?? [])) {
          ids.push(story.id);
          for (const fr of (story.requirements ?? [])) ids.push(fr.id);
        }
      }
    } else if (row.kind === "epic") {
      for (const story of ((row.item as DBEpic).stories ?? [])) {
        ids.push(story.id);
        for (const fr of (story.requirements ?? [])) ids.push(fr.id);
      }
    } else if (row.kind === "story") {
      for (const fr of ((row.item as DBStory).requirements ?? [])) ids.push(fr.id);
    }
    return ids;
  }

  const visibleSelectableIds = rows.filter(r => !r.item.id.startsWith("preview-")).map(r => r.item.id);
  const allSelected = visibleSelectableIds.length > 0 && visibleSelectableIds.every(id => selected.has(id));
  const someSelected = visibleSelectableIds.some(id => selected.has(id));

  function toggleSelectAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(visibleSelectableIds));
    }
  }

  function toggleSelectRow(row: Row) {
    if (row.item.id.startsWith("preview-")) return;
    const ids = descendantIds(row);
    const isChecked = selected.has(row.item.id);
    setSelected(prev => {
      const n = new Set(prev);
      if (isChecked) { ids.forEach(id => n.delete(id)); }
      else            { ids.forEach(id => n.add(id)); }
      return n;
    });
  }

  function rowCheckState(row: Row): "checked" | "indeterminate" | "unchecked" {
    if (row.item.id.startsWith("preview-")) return "unchecked";
    const ids = descendantIds(row);
    if (ids.length === 0) return "unchecked";
    const checkedCount = ids.filter(id => selected.has(id)).length;
    if (checkedCount === 0) return "unchecked";
    if (checkedCount === ids.length) return "checked";
    return "indeterminate";
  }

  const counts: Record<RowKind, number> = {
    initiative: displayData.length,
    epic:       displayData.flatMap(i => i.epics ?? []).length,
    story:      displayData.flatMap(i => (i.epics ?? []).flatMap(e => e.stories ?? [])).length,
    fr:         displayData.flatMap(i => (i.epics ?? []).flatMap(e => (e.stories ?? []).flatMap(s => s.requirements ?? []))).length,
  };

  return (
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", height: "100%" }}>

      {/* Import modal */}
      {showModal && (
        <ImportModal
          initiatives={dbData}
          onClose={() => setShowModal(false)}
          onPreview={(initiativeId, epics, mode, fileName, fileContent) => setPending({ initiativeId, epics, mode, fileName, fileContent })}
        />
      )}

      {/* Header */}
      <div style={{ marginBottom: pending ? 12 : 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 500, color: "#9b9b9b", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 4 }}>Product</div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "#0f0f0f", letterSpacing: "-0.3px" }}>Functional Requirements</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setShowModal(true)}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", fontSize: 12, fontWeight: 500, border: "1px solid #e5e5e5", borderRadius: 6, backgroundColor: "#fff", color: "#3b3b3b", cursor: "pointer" }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#fff")}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 11h10M7 2v7M4 6l3 3 3-3"/></svg>
            Import epics.md
          </button>
          <a href="/product/initiatives/catalog/history" style={{ fontSize: 12, color: "#6b6b6b", textDecoration: "none" }}>Import history</a>
          <a href="/product/initiatives" style={{ fontSize: 12, color: "#6b6b6b", textDecoration: "none", marginLeft: 12 }}>← Initiatives</a>
        </div>
      </div>

      {/* Unsaved changes banner */}
      {pending && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, padding: "10px 14px", borderRadius: 8, backgroundColor: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.25)" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="7" r="6"/><path d="M7 4v3.5M7 10h.01"/></svg>
          <span style={{ fontSize: 12, color: "#92400e", flex: 1 }}>
            Preview: <strong style={{ fontWeight: 600 }}>{pending.fileName}</strong> → <strong style={{ fontWeight: 600 }}>{dbData.find(i => i.id === pending.initiativeId)?.name}</strong>
            <span style={{ color: "#b45309" }}> ({pending.mode})</span> — unsaved.
          </span>
          <button onClick={() => setPending(null)}
            style={{ fontSize: 12, color: "#92400e", background: "none", border: "1px solid rgba(180,83,9,0.3)", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontWeight: 500 }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(180,83,9,0.06)")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "")}>
            Discard
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{ fontSize: 12, color: "#fff", background: "#0f0f0f", border: "none", borderRadius: 6, padding: "4px 14px", cursor: saving ? "default" : "pointer", fontWeight: 500, opacity: saving ? 0.6 : 1 }}
            onMouseEnter={e => { if (!saving) (e.currentTarget as HTMLElement).style.backgroundColor = "#3b3b3b"; }}
            onMouseLeave={e => { if (!saving) (e.currentTarget as HTMLElement).style.backgroundColor = "#0f0f0f"; }}>
            {saving ? "Saving…" : "Save to database"}
          </button>
        </div>
      )}

      {/* Selection action bar */}
      {selected.size > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, padding: "8px 14px", borderRadius: 8, backgroundColor: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.2)" }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: "#4338ca" }}>{selected.size} item{selected.size !== 1 ? "s" : ""} selected</span>
          <button onClick={() => setSelected(new Set())}
            style={{ fontSize: 12, color: "#6b6b6b", background: "none", border: "1px solid #e5e5e5", borderRadius: 6, padding: "3px 10px", cursor: "pointer" }}>
            Clear
          </button>
          <div style={{ flex: 1 }} />
          <button onClick={handleDeleteSelected} disabled={deleting}
            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 500, color: "#fff", background: "#eb5757", border: "none", borderRadius: 6, padding: "5px 14px", cursor: deleting ? "default" : "pointer", opacity: deleting ? 0.6 : 1 }}
            onMouseEnter={e => { if (!deleting) (e.currentTarget as HTMLElement).style.backgroundColor = "#c93a3a"; }}
            onMouseLeave={e => { if (!deleting) (e.currentTarget as HTMLElement).style.backgroundColor = "#eb5757"; }}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 4h10M5 4V2h4v2M5.5 6.5v4M8.5 6.5v4M3 4l.8 8h6.4L11 4"/></svg>
            {deleting ? "Deleting…" : `Delete ${selected.size} item${selected.size !== 1 ? "s" : ""}`}
          </button>
        </div>
      )}

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
      {loading ? (
        <div style={{ fontSize: 13, color: "#9b9b9b", padding: 24 }}>Loading…</div>
      ) : (
        <div style={{ border: "1px solid #ebebeb", borderRadius: 8, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: 40 }} />
              <col style={{ width: 88 }} />
              <col />
              <col style={{ width: 90 }} />
              <col style={{ width: 130 }} />
              <col style={{ width: 190 }} />
              <col style={{ width: 190 }} />
              <col style={{ width: 90 }} />
            </colgroup>
            <thead>
              <tr style={{ backgroundColor: "#fafafa" }}>
                <th style={{ ...COL_HEADER, padding: "0 0 0 14px" }}>
                  <button onClick={toggleSelectAll}
                    style={{ width: 15, height: 15, borderRadius: 3, border: `1.5px solid ${allSelected ? "#6366f1" : someSelected ? "#6366f1" : "#d0d0d0"}`, backgroundColor: allSelected ? "#6366f1" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: visibleSelectableIds.length > 0 ? "pointer" : "default", flexShrink: 0, opacity: visibleSelectableIds.length > 0 ? 1 : 0.3, outline: "none" }}>
                    {allSelected && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5l2.5 2.5L8 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    {!allSelected && someSelected && <div style={{ width: 7, height: 2, backgroundColor: "#6366f1", borderRadius: 1 }} />}
                  </button>
                </th>
                <th style={{ ...COL_HEADER, position: "relative" }}>
                  <TypeFilterDropdown active={activeKinds} onChange={setActiveKinds} counts={counts} />
                </th>
                {["Name / Description", "Code", "Business area", "Microservice", "Database", "Classification"].map(h => (
                  <th key={h} style={COL_HEADER}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={8} style={{ padding: "32px 12px", textAlign: "center", fontSize: 13, color: "#9b9b9b" }}>
                  No data. Import a BMAD epics.md to get started.
                </td></tr>
              )}
              {rows.map(row => {
                const isPreview = row.item.id.startsWith("preview-");
                const meta  = KIND_META[row.kind];
                const badge = KIND_BADGE[row.kind];
                const levelIndex = ["initiative", "epic", "story", "fr"].indexOf(row.kind);
                let indent = 0;
                for (let i = 0; i < levelIndex; i++) if (visibleParents[i]) indent += 16;

                const rowStyle: React.CSSProperties = {
                  borderBottom: "1px solid #f4f4f4",
                  backgroundColor: isPreview ? "rgba(245,158,11,0.03)" : undefined,
                };

                if (row.kind === "fr") {
                  const fr   = row.item as DBFr;
                  const area = AREAS[fr.area];
                  const cls  = CLASS_STYLE[fr.classification] ?? CLASS_STYLE.build;
                  const chk  = rowCheckState(row);
                  const isChecked = chk === "checked";
                  const rowBg = isChecked ? "rgba(99,102,241,0.04)" : isPreview ? "rgba(245,158,11,0.03)" : undefined;
                  return (
                    <tr key={fr.id} style={{ ...rowStyle, backgroundColor: rowBg }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = isChecked ? "rgba(99,102,241,0.07)" : "#fafafa")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = rowBg ?? "")}>
                      <td style={{ padding: "0 0 0 14px", height: ROW_H }} onClick={() => toggleSelectRow(row)}>
                        {!isPreview && <Checkbox state={chk} />}
                      </td>
                      <td style={{ padding: "0 12px", height: ROW_H }}>
                        <span style={{ fontSize: 10, fontWeight: 500, padding: "2px 6px", borderRadius: 4, backgroundColor: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>FR</span>
                      </td>
                      <td style={{ padding: "0 12px" }}>
                        <div style={{ display: "flex", alignItems: "center", paddingLeft: indent }}>
                          <div style={{ width: 16, flexShrink: 0, marginRight: 6 }} />
                          <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: area ? CAT_COLOR[area.category] : "#d0d0d0", flexShrink: 0, marginRight: 8 }} />
                          <span style={{ fontSize: 11, color: "#6b6b6b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fr.description}</span>
                        </div>
                      </td>
                      <td style={{ padding: "0 12px" }}>
                        <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 600, color: "#4338ca", backgroundColor: "rgba(99,102,241,0.08)", padding: "2px 6px", borderRadius: 4 }}>{fr.code}</span>
                      </td>
                      <td style={{ padding: "0 12px" }}>
                        {area ? <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: CAT_COLOR[area.category] }} /><span style={{ fontSize: 11, color: "#6b6b6b" }}>{area.label}</span></div>
                          : <span style={{ fontSize: 11, color: "#c0c0c0" }}>—</span>}
                      </td>
                      <td style={{ padding: "0 12px" }}><span style={{ fontFamily: "monospace", fontSize: 11, color: "#6b6b6b" }}>{area?.service ?? "—"}</span></td>
                      <td style={{ padding: "0 12px" }}><span style={{ fontFamily: "monospace", fontSize: 11, color: "#6b6b6b" }}>{area?.db ?? "—"}</span></td>
                      <td style={{ padding: "0 12px" }}>
                        <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 7px", borderRadius: 4, backgroundColor: cls.bg, color: cls.color, border: `1px solid ${cls.border}`, whiteSpace: "nowrap" }}>{fr.classification}</span>
                      </td>
                    </tr>
                  );
                }

                // initiative / epic / story
                const id   = row.item.id;
                const name = (row.item as any).name as string;
                const children =
                  row.kind === "initiative" ? ((row.item as DBInitiative).epics ?? [])
                  : row.kind === "epic"     ? ((row.item as DBEpic).stories ?? [])
                  : ((row.item as DBStory).requirements ?? []);
                const childLabel =
                  row.kind === "initiative" ? `${children.length} epic${children.length !== 1 ? "s" : ""}`
                  : row.kind === "epic"     ? `${children.length} stor${children.length !== 1 ? "ies" : "y"}`
                  : `${children.length} FR${children.length !== 1 ? "s" : ""}`;

                const appName = row.kind === "initiative" ? ((row.item as DBInitiative).app?.name ?? null) : null;

                const chk = rowCheckState(row);
                const isChecked = chk === "checked";
                const rowBg2 = isChecked ? "rgba(99,102,241,0.04)" : isPreview ? "rgba(245,158,11,0.03)" : undefined;
                return (
                  <tr key={id} style={{ ...rowStyle, backgroundColor: rowBg2 }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = isChecked ? "rgba(99,102,241,0.07)" : "#fafafa")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = rowBg2 ?? "")}>
                    <td style={{ padding: "0 0 0 14px", height: ROW_H }} onClick={() => toggleSelectRow(row)}>
                      {!isPreview && <Checkbox state={chk} />}
                    </td>
                    <td style={{ padding: "0 12px", height: ROW_H }}>
                      <span style={{ fontSize: 10, fontWeight: 500, padding: "2px 6px", borderRadius: 4, backgroundColor: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, textTransform: "capitalize" }}>{row.kind}</span>
                    </td>
                    <td style={{ padding: "0 12px", height: ROW_H }} colSpan={6}>
                      <div style={{ display: "flex", alignItems: "center", paddingLeft: indent }}>
                        <ToggleBtn id={id} hasChildren={children.length > 0} isOpen={expanded.has(id)} onToggle={toggle} />
                        <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: meta.dot, flexShrink: 0, marginRight: 8 }} />
                        <span style={{ fontSize: meta.fontSize, fontWeight: meta.bold ? 600 : 400, color: "#0f0f0f", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
                        <span style={{ marginLeft: 8, fontSize: 11, color: "#9b9b9b", flexShrink: 0 }}>{childLabel}</span>
                        {appName && <span style={{ marginLeft: 8, fontSize: 11, color: "#6b6b6b", backgroundColor: "#f5f5f5", padding: "1px 6px", borderRadius: 4, flexShrink: 0 }}>{appName}</span>}
                        {isPreview && <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 600, color: "#b45309", backgroundColor: "rgba(245,158,11,0.1)", padding: "1px 5px", borderRadius: 4, flexShrink: 0 }}>preview</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
