"use client";

import { useState, useRef, useEffect } from "react";

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
interface Initiative { id: string; name: string; epics: Epic[]; }

// ── BMAD epics.md parser ──────────────────────────────────────────────────────
function parseBmadMarkdown(md: string): Initiative[] {
  const lines = md.split("\n");

  // 1. Collect all FRs from the "Functional Requirements" section
  const frMap: Record<string, string> = {};
  const frRegex = /^(FR\d+):\s+(.+)$/;
  for (const line of lines) {
    const m = line.match(frRegex);
    if (m) frMap[m[1]] = m[2].trim();
  }

  // 2. Parse epics and stories
  // Epics start with "## Epic N:" or "### Epic N:"
  const initiatives: Initiative[] = [];
  let frCounter = 1;

  // Find epic sections (lines like "## Epic 1: Title" or "### Epic 1: Title")
  const epicHeaderRegex = /^#{2,3} Epic (\d+):\s+(.+)$/;
  const storyHeaderRegex = /^#{3,4} Story ([\d.]+[a-zA-Z-]*):\s+(.+)$/;

  // Group lines by epic — keep only the LAST occurrence of each epic number
  // (epics.md lists each epic twice: once in the summary list, once in the detail section)
  const epicByNum = new Map<string, { num: string; title: string; startLine: number }>();
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(epicHeaderRegex);
    if (m) epicByNum.set(m[1], { num: m[1], title: m[2].trim(), startLine: i });
  }
  const epicSections = Array.from(epicByNum.values()).sort((a, b) => a.startLine - b.startLine);

  for (let ei = 0; ei < epicSections.length; ei++) {
    const epic = epicSections[ei];
    const endLine = ei + 1 < epicSections.length ? epicSections[ei + 1].startLine : lines.length;
    const epicLines = lines.slice(epic.startLine + 1, endLine);

    // Find stories within this epic section
    const storyStarts: { idx: number; num: string; title: string }[] = [];
    for (let i = 0; i < epicLines.length; i++) {
      const m = epicLines[i].match(storyHeaderRegex);
      if (m) storyStarts.push({ idx: i, num: m[1], title: m[2].trim() });
    }

    const stories: Story[] = [];
    for (let si = 0; si < storyStarts.length; si++) {
      const story = storyStarts[si];
      const storyEnd = si + 1 < storyStarts.length ? storyStarts[si + 1].idx : epicLines.length;
      const storyLines = epicLines.slice(story.idx + 1, storyEnd);

      // Extract FR references from Acceptance Criteria — look for "FR\d+" mentions
      const frRefs = new Set<string>();
      for (const l of storyLines) {
        const matches = l.matchAll(/\b(FR\d+)\b/g);
        for (const match of matches) frRefs.add(match[1]);
      }

      // Also check the "FRs covered" line on the epic header
      const epicFrLine = epicLines.find(l => l.startsWith("**FRs covered:**"));
      if (epicFrLine && storyStarts.length === 0) {
        const matches = epicFrLine.matchAll(/\b(FR\d+)\b/g);
        for (const m of matches) frRefs.add(m[1]);
      }

      const frs: FR[] = Array.from(frRefs)
        .sort((a, b) => parseInt(a.slice(2)) - parseInt(b.slice(2)))
        .filter(ref => frMap[ref])
        .map(ref => ({
          id: `bmad-fr-${frCounter++}`,
          code: ref,
          area: "—",
          description: frMap[ref],
          classification: "build" as Classification,
        }));

      // Skip stories with no FRs and skip "RESOLVED" / already-existing stories
      const titleLower = story.title.toLowerCase();
      if (titleLower.includes("resolved")) continue;

      stories.push({
        id: `bmad-story-${epic.num}-${story.num}`,
        name: story.title,
        frs,
      });
    }

    // If epic has no stories but has FRs in the "FRs covered" line, create one story
    if (stories.length === 0) {
      const frsLine = epicLines.find(l => l.startsWith("**FRs covered:**"));
      const refs = frsLine ? Array.from(frsLine.matchAll(/\b(FR\d+)\b/g)).map(m => m[1]) : [];
      if (refs.length > 0) {
        const frs: FR[] = refs.filter(r => frMap[r]).map(r => ({
          id: `bmad-fr-${frCounter++}`,
          code: r,
          area: "—",
          description: frMap[r],
          classification: "build" as Classification,
        }));
        stories.push({ id: `bmad-story-${epic.num}-0`, name: "General requirements", frs });
      }
    }

    if (stories.length === 0 && Object.keys(frMap).length === 0) continue;

    // Find which initiative this epic belongs to — for now group all under one initiative
    // (epics.md typically covers one PRD / initiative)
    const epicObj: Epic = {
      id: `bmad-epic-${epic.num}`,
      name: `Epic ${epic.num}: ${epic.title}`,
      stories,
    };

    // All epics go into the single initiative derived from the document title
    if (initiatives.length === 0) {
      initiatives.push({ id: "init-imported-1", name: "Imported from BMAD", epics: [] });
    }
    initiatives[0].epics.push(epicObj);
  }

  // Fallback: if no epics parsed but FRs exist, create a flat list
  if (initiatives.length === 0 && Object.keys(frMap).length > 0) {
    const frs: FR[] = Object.entries(frMap).map(([code, desc]) => ({
      id: `bmad-fr-${frCounter++}`,
      code,
      area: "—",
      description: desc,
      classification: "build" as Classification,
    }));
    initiatives.push({
      id: "init-imported-1",
      name: "Imported from BMAD",
      epics: [{ id: "bmad-epic-imported-1", name: "Functional Requirements", stories: [{ id: "bmad-story-imported-1", name: "All requirements", frs }] }],
    });
  }

  return initiatives;
}

// ── Seed / default data ───────────────────────────────────────────────────────
const DEFAULT_DATA: Initiative[] = [
  {
    id: "def-init-1", name: "Riftbound Ticketing Portal",
    epics: [
      {
        id: "def-epic-1", name: "User Authentication & Access",
        stories: [
          { id: "def-story-1", name: "As a user, I can log in via SSO", frs: [
            { id: "def-fr-1", code: "FR-ORG-01", area: "ORG", classification: "native", description: "The system must validate the user's organizational identity via the SSO provider before granting portal access." },
            { id: "def-fr-2", code: "FR-ACC-01", area: "ACC", classification: "native", description: "Session tokens must be issued by sv-access-db after successful SSO validation and expire after 8 hours of inactivity." },
          ]},
          { id: "def-story-2", name: "As an admin, I can manage user roles", frs: [
            { id: "def-fr-3", code: "FR-ORG-02", area: "ORG", classification: "build",  description: "Role and permission assignments must reference the organizational identity of each user." },
            { id: "def-fr-4", code: "FR-EVT-01", area: "EVT", classification: "native", description: "Seat inventory changes triggered by admin role actions must be reflected in sv-event-db without race conditions." },
          ]},
        ],
      },
      {
        id: "def-epic-2", name: "Ticket Purchase Flow",
        stories: [
          { id: "def-story-3", name: "As a user, I can create and complete an order", frs: [
            { id: "def-fr-5", code: "FR-SAL-01", area: "SAL", classification: "build",  description: "Users must be able to initiate a ticket purchase flow with cart, order placement and confirmation." },
            { id: "def-fr-6", code: "FR-ENT-01", area: "ENT", classification: "build",  description: "Each confirmed purchase must generate an entitlement record linked to the buyer's profile." },
            { id: "def-fr-7", code: "FR-PAY-01", area: "PAY", classification: "native", description: "Payment processing must route through the payments domain; no payment data may be stored outside sv-payments-db." },
            { id: "def-fr-8", code: "FR-PAS-01", area: "PAS", classification: "build",  description: "On successful purchase the system must issue a digital pass (Apple Wallet / Google Wallet) and send it by email." },
          ]},
        ],
      },
    ],
  },
  {
    id: "def-init-2", name: "GateFlow – Access Control",
    epics: [
      {
        id: "def-epic-3", name: "Gate Entry Validation",
        stories: [
          { id: "def-story-5", name: "As a security officer, I can scan entry badges", frs: [
            { id: "def-fr-9",  code: "FR-VEN-01", area: "VEN", classification: "native", description: "The venue gate configuration must be read from sv-venue-db to validate scan targets." },
            { id: "def-fr-10", code: "FR-ACC-02", area: "ACC", classification: "build",  description: "QR/badge scans must be validated in real time against access tokens stored in sv-access-db." },
            { id: "def-fr-11", code: "FR-ENT-02", area: "ENT", classification: "native", description: "The scan result must cross-reference the entitlement status before granting entry." },
          ]},
        ],
      },
    ],
  },
];

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

// ── Main page ─────────────────────────────────────────────────────────────────
export default function FunctionalRequirementsPage() {
  const STORAGE_KEY = "fr-page-imported-v2";
  // Clean up stale key from previous versions
  useEffect(() => { try { localStorage.removeItem("fr-page-imported"); } catch {} }, []);

  const defaultExpanded = (d: Initiative[]) =>
    new Set<string>(d.flatMap(init => [init.id, ...init.epics.slice(0, 1).map(e => e.id)]));

  // Always start with defaults — localStorage is read client-side only in useEffect
  const [data, setData]           = useState<Initiative[]>(DEFAULT_DATA);
  const [savedName, setSavedName] = useState<string | null>(null);
  const [pending, setPending]     = useState<{ data: Initiative[]; fileName: string } | null>(null);
  const [activeKinds, setActiveKinds] = useState<Set<RowKind>>(new Set(["initiative", "epic", "story", "fr"]));
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hydrate from localStorage after mount (client only)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { initiatives, fileName } = JSON.parse(saved);
        if (Array.isArray(initiatives) && initiatives.length > 0) {
          setData(initiatives);
          setSavedName(fileName ?? null);
          setExpanded(defaultExpanded(initiatives));
        }
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Display data: pending takes priority over saved
  const displayData = pending?.data ?? data;

  const [expanded, setExpanded] = useState<Set<string>>(() => defaultExpanded(DEFAULT_DATA));

  const toggle = (id: string) =>
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // ── Import handler — loads into preview, does NOT persist yet ──────────────
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      try {
        const parsed = parseBmadMarkdown(text);
        if (parsed.length === 0) {
          alert("No epics or functional requirements found in this file. Make sure it's a BMAD epics.md file.");
          return;
        }
        setPending({ data: parsed, fileName: file.name });
        setExpanded(defaultExpanded(parsed));
      } catch {
        alert("Could not parse the file. Make sure it's a valid BMAD epics.md.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  // ── Save — persists pending data to localStorage ───────────────────────────
  function handleSave() {
    if (!pending) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ fileName: pending.fileName, initiatives: pending.data })); } catch {}
    setData(pending.data);
    setSavedName(pending.fileName);
    setPending(null);
  }

  // ── Discard pending import ─────────────────────────────────────────────────
  function handleDiscard() {
    setPending(null);
    setExpanded(defaultExpanded(data));
  }

  // ── Clear saved data ───────────────────────────────────────────────────────
  function clearSaved() {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setData(DEFAULT_DATA);
    setSavedName(null);
    setPending(null);
    setExpanded(defaultExpanded(DEFAULT_DATA));
  }

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
  for (const init of displayData) {
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

      {/* Header */}
      <div style={{ marginBottom: pending ? 12 : 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 500, color: "#9b9b9b", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 4 }}>Product</div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "#0f0f0f", letterSpacing: "-0.3px" }}>Functional Requirements</h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Saved file badge */}
          {savedName && !pending && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 6, backgroundColor: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6l3 3 5-5"/></svg>
              <span style={{ fontSize: 11, color: "#059669", fontWeight: 500, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{savedName}</span>
              <button onClick={clearSaved} style={{ background: "none", border: "none", cursor: "pointer", color: "#059669", padding: 0, fontSize: 14, lineHeight: 1 }}>×</button>
            </div>
          )}

          {/* Import button */}
          <input ref={fileInputRef} type="file" accept=".md" style={{ display: "none" }} onChange={handleFile} />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", fontSize: 12, fontWeight: 500, border: "1px solid #e5e5e5", borderRadius: 6, backgroundColor: "#ffffff", color: "#3b3b3b", cursor: "pointer" }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#ffffff")}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 11h10M7 2v7M4 6l3 3 3-3"/></svg>
            Import epics.md
          </button>

          <a href="/product/initiatives" style={{ fontSize: 12, color: "#6b6b6b", textDecoration: "none" }}>← Initiatives</a>
        </div>
      </div>

      {/* Unsaved changes banner */}
      {pending && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, padding: "10px 14px", borderRadius: 8, backgroundColor: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.25)" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="7" r="6"/><path d="M7 4v3.5M7 10h.01"/></svg>
          <span style={{ fontSize: 12, color: "#92400e", flex: 1 }}>
            <strong style={{ fontWeight: 600 }}>{pending.fileName}</strong> imported — unsaved changes. Save to persist across page reloads.
          </span>
          <button onClick={handleDiscard}
            style={{ fontSize: 12, color: "#92400e", background: "none", border: "1px solid rgba(180,83,9,0.3)", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontWeight: 500 }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(180,83,9,0.06)")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "")}>
            Discard
          </button>
          <button onClick={handleSave}
            style={{ fontSize: 12, color: "#ffffff", background: "#0f0f0f", border: "none", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontWeight: 500 }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#3b3b3b")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#0f0f0f")}>
            Save
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
                <TypeFilterDropdown active={activeKinds} onChange={setActiveKinds} data={displayData} />
              </th>
              {["Name / Description", "Code", "Business area", "Microservice", "Database", "Classification"].map(h => (
                <th key={h} style={COL_HEADER}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
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
                const cls  = CLASS_STYLE[fr.classification];
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
