"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { FR_CODE_RE, FR_DEF_RE, compareFrCodes } from "@/lib/import/fr-codes";
import type { ParsedPrd } from "@/lib/import/prd-parser";
import type { ArtifactKind, InitiativeFolder } from "@/lib/import/source-repo";
import { parsePlatforms, type PlatformKey } from "@/lib/requirements/platforms";
import { PENDING_COLOR } from "@/lib/requirements/pending";
import {
  DueDateCell, IdCell, KindCell, KindIcon, OwnerCell, PlatformCell, PriorityCell, StatusCell, TextCell, TXT, TXT_2, TXT_3,
} from "@/components/product/RequirementCells";
import { RequirementDrawer, type DrawerContext, type TraceScreen } from "@/components/product/RequirementDrawer";

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

interface DBFr {
  id: string; code: string; area: string; description: string; classification: string; story_id: string | null; epic_id: string | null;
  // PRD table columns
  page?: string | null; feature?: string | null; priority?: string | null; status?: string | null;
  source?: string | null; wo_ref?: string | null; owner?: string | null; comments?: string | null;
  platforms?: string | null; due_date?: string | null;
  /** Drawer entries still marked "[TBD…]". */
  pending_items?: number;
}
interface DBStory     { id: string; name: string; epic_id: string; requirements?: DBFr[]; }
/** `requirements` are FRs attached to the epic itself (PRD tables have no stories). */
interface DBEpic      { id: string; name: string; code?: string | null; initiative_id: string; stories?: DBStory[]; requirements?: DBFr[]; }
interface DBInitiative{ id: string; name: string; app?: { id: string; name: string } | null; epics?: DBEpic[]; }

// BMAD parser types
interface ParsedFr    { code: string; description: string; area: string; classification: "build" | "native" | "out"; }
interface ParsedStory { name: string; frs: ParsedFr[]; }
interface ParsedEpic  { name: string; stories: ParsedStory[]; }

// ── BMAD epics.md parser ──────────────────────────────────────────────────────
function parseBmadMarkdown(md: string): ParsedEpic[] {
  const lines = md.split("\n");
  // FR definitions appear as "- FR1: …", "- **FR1:** …" or "- **FR1** …",
  // and the trailing letter in codes like FR5c is part of the identity.
  const frMap: Record<string, string> = {};
  for (const line of lines) {
    const m = line.match(FR_DEF_RE);
    if (m && !frMap[m[1]]) frMap[m[1]] = m[2].trim();
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
        for (const match of l.matchAll(FR_CODE_RE)) frRefs.add(match[0]);
      }

      if (story.title.toLowerCase().includes("resolved")) continue;

      const frs: ParsedFr[] = Array.from(frRefs)
        .sort(compareFrCodes)
        .filter(ref => frMap[ref])
        .map(ref => ({ code: `${ref}`, description: frMap[ref], area: "—", classification: "build" as const }));

      stories.push({ name: story.title, frs });
      frCounter++;
    }

    if (stories.length === 0) {
      const frsLine = epicLines.find(l => l.startsWith("**FRs covered:**"));
      const refs = frsLine ? Array.from(frsLine.matchAll(FR_CODE_RE)).map(m => m[0]) : [];
      if (refs.length > 0) {
        stories.push({ name: "General requirements", frs: refs.filter(r => frMap[r]).map(r => ({ code: r, description: frMap[r], area: "—", classification: "build" as const })) });
      }
    }

    if (stories.length > 0) epics.push({ name: `Epic ${epic.num}: ${epic.title}`, stories });
  }

  return epics;
}

const ROW_H = 40;
const COL_HEADER: React.CSSProperties = {
  fontSize: 13, fontWeight: 400, color: TXT_2,
  textAlign: "left", padding: "0 12px", height: 44,
  whiteSpace: "nowrap", userSelect: "none",
};
const CELL: React.CSSProperties = { padding: "0 12px", height: ROW_H };

/** Table columns after checkbox · Type · ID · Funcionalidad. Order follows the Linear list. */
const DETAIL_COLS: Array<{ label: string; width: number }> = [
  { label: "Descripción corta", width: 520 },
  { label: "Estado", width: 190 },
  { label: "Plataforma", width: 380 },
  { label: "Prioridad", width: 120 },
  { label: "Owner", width: 140 },
  { label: "Fecha de entrega", width: 150 },
  { label: "Página", width: 130 },
  { label: "Fuente", width: 170 },
  { label: "Ref. WO", width: 170 },
  { label: "Comentarios", width: 320 },
];

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
      style={{ width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#a0a4ab", padding: 0, background: "none", border: "none", cursor: hasChildren ? "pointer" : "default", opacity: hasChildren ? 1 : 0 }}>
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
        style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 13, fontWeight: 400, color: open ? TXT : TXT_2 }}>
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

// ── Pending badge ─────────────────────────────────────────────────────────────
/** Magenta warning next to an FR title while some of its drawer entries are "[TBD…]". */
function PendingBadge({ count }: { count: number }) {
  return (
    <span title={`${count} ${count === 1 ? "punto pendiente" : "puntos pendientes"} de definir`}
      style={{ display: "inline-flex", alignItems: "center", gap: 3, flexShrink: 0, fontSize: 11, fontWeight: 600, color: PENDING_COLOR }}>
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2.2L14.5 13.5h-13L8 2.2z" /><path d="M8 6.5v3.2M8 11.6v.01" />
      </svg>
      {count}
    </span>
  );
}

// ── Export menu ───────────────────────────────────────────────────────────────
/** Downloads the whole catalog (initiative → epic → FR, with every drawer section) as Excel or PDF. */
function ExportMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const formats = [
    { format: "xlsx", label: "Excel", hint: ".xlsx" },
    { format: "pdf", label: "PDF", hint: ".pdf" },
  ];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", fontSize: 12, fontWeight: 500, border: "1px solid #e5e5e5", borderRadius: 6, backgroundColor: open ? "#f5f5f5" : "#fff", color: "#3b3b3b", cursor: "pointer" }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = open ? "#f5f5f5" : "#fff")}>
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 11h10M7 9V2M4 5l3-3 3 3"/></svg>
        Export
        <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 3.5l3 3 3-3" /></svg>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 50, backgroundColor: "#fff", border: "1px solid #e5e5e5", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.08)", padding: "6px 0", minWidth: 160 }}>
          {formats.map(f => (
            <a key={f.format} href={`/api/catalog/export?format=${f.format}`} download onClick={() => setOpen(false)}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "6px 12px", fontSize: 12, color: "#0f0f0f", textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f5f5f5")} onMouseLeave={e => (e.currentTarget.style.backgroundColor = "")}>
              {f.label}
              <span style={{ fontSize: 11, color: TXT_3 }}>{f.hint}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Import Modal ──────────────────────────────────────────────────────────────
type ImportSource = "upload" | "repo";

/** What the modal hands back once the user has chosen something to import. */
export type PendingImport =
  | { kind: "epics"; initiativeId: string; epics: ParsedEpic[]; mode: "replace" | "merge"; fileName: string; fileContent: string }
  | { kind: "prd"; initiativeId: string; path: string; fileName: string; parsed: ParsedPrd };

const ARTIFACT_LABEL: Record<ArtifactKind, string> = {
  prd: "PRD — defines the FRs",
  architecture: "Architecture — designs the FRs",
  epics: "Epics — implements the FRs",
};

const BTN_SECONDARY: React.CSSProperties = {
  padding: "6px 14px", fontSize: 12, fontWeight: 500, border: "1px solid #e5e5e5",
  borderRadius: 6, backgroundColor: "#fff", color: "#3b3b3b", cursor: "pointer",
};

const FIELD: React.CSSProperties = {
  width: "100%", padding: "8px 10px", border: "1px solid #e5e5e5", borderRadius: 6,
  fontSize: 12, color: "#0f0f0f", backgroundColor: "#fff", outline: "none",
};

function ImportModal({ initiatives, onClose, onPreview }: {
  initiatives: DBInitiative[];
  onClose: () => void;
  onPreview: (pending: PendingImport) => void;
}) {
  const [source, setSource] = useState<ImportSource>("upload");
  const [selectedInit, setSelectedInit] = useState("");
  const [mode, setMode] = useState<"replace" | "merge">("replace");
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [parsed, setParsed] = useState<ParsedEpic[] | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Local repo browsing ──────────────────────────────────────────────────
  const [folders, setFolders] = useState<InitiativeFolder[] | null>(null);
  const [foldersError, setFoldersError] = useState("");
  const [folderName, setFolderName] = useState("");
  const [kind, setKind] = useState<ArtifactKind>("prd");
  const [loadingArtifact, setLoadingArtifact] = useState(false);
  const [prdPreview, setPrdPreview] = useState<{ path: string; parsed: ParsedPrd } | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Load the folder list the first time the repo tab is opened
  useEffect(() => {
    if (source !== "repo" || folders !== null) return;
    (async () => {
      try {
        const res = await fetch("/api/source/artifacts");
        const data = await res.json();
        if (!res.ok) { setFoldersError(data.error ?? "Could not read the source repo."); return; }
        setFolders(data.folders);
        if (data.folders.length === 0) {
          setFoldersError(`No BMAD artifacts found under: ${(data.roots ?? []).join(", ")}`);
        }
      } catch {
        setFoldersError("Could not reach the source repo.");
      }
    })();
  }, [source, folders]);

  const folder = folders?.find(f => f.name === folderName) ?? null;
  const availableKinds = folder ? (Object.keys(folder.artifacts) as ArtifactKind[]) : [];

  // Keep the selected artifact kind valid for the chosen folder
  useEffect(() => {
    if (folder && !folder.artifacts[kind]) {
      const first = (Object.keys(folder.artifacts) as ArtifactKind[])[0];
      if (first) setKind(first);
    }
  }, [folder, kind]);

  function resetPreview() {
    setParsed(null);
    setPrdPreview(null);
    setFileName("");
    setFileContent("");
    setError("");
  }

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

  async function handleLoadFromRepo() {
    if (!folder) { setError("Choose an initiative folder."); return; }
    const relPath = folder.artifacts[kind];
    if (!relPath) { setError("That artifact does not exist in this folder yet."); return; }

    setLoadingArtifact(true);
    resetPreview();
    try {
      const res = await fetch(`/api/source/file?path=${encodeURIComponent(relPath)}&kind=${kind}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Could not read the artifact."); return; }

      const shortName = relPath.split("/").slice(-2).join("/");

      if (kind === "prd") {
        setPrdPreview({ path: relPath, parsed: data.parsed });
        setFileName(shortName);
      } else if (kind === "epics") {
        const result = parseBmadMarkdown(data.content);
        if (result.length === 0) { setError("No epics found in this file."); return; }
        setParsed(result);
        setFileName(shortName);
        setFileContent(data.content);
      } else {
        setError("Architecture import is not wired up yet — load the PRD or the epics.");
      }
    } catch {
      setError("Could not read the artifact.");
    } finally {
      setLoadingArtifact(false);
    }
  }

  function handlePreview() {
    if (!selectedInit) { setError("Select a target initiative."); return; }

    if (prdPreview) {
      onPreview({
        kind: "prd", initiativeId: selectedInit,
        path: prdPreview.path, fileName, parsed: prdPreview.parsed,
      });
      onClose();
      return;
    }

    if (parsed) {
      onPreview({ kind: "epics", initiativeId: selectedInit, epics: parsed, mode, fileName, fileContent });
      onClose();
      return;
    }

    setError(source === "upload" ? "Select a .md file to import." : "Load an artifact first.");
  }

  const totalFrs = parsed?.flatMap(e => e.stories.flatMap(s => s.frs)).length ?? 0;
  const ready = (parsed !== null || prdPreview !== null) && selectedInit !== "";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.35)" }} />
      <div style={{ position: "relative", backgroundColor: "#fff", borderRadius: 12, boxShadow: "0 8px 40px rgba(0,0,0,0.12)", width: 520, maxHeight: "86vh", overflowY: "auto", padding: "28px 28px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "#0f0f0f", letterSpacing: "-0.2px" }}>Import from BMAD</h2>
            <p style={{ fontSize: 12, color: "#6b6b6b", marginTop: 2 }}>Bring in functional requirements from a planning artifact — a PRD defines them, epics implement them.</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9b9b9b", fontSize: 18, lineHeight: 1, padding: 4 }}>×</button>
        </div>

        {/* Source switcher */}
        <div style={{ display: "flex", gap: 4, padding: 3, backgroundColor: "#f5f5f5", borderRadius: 7, marginBottom: 18 }}>
          {([["upload", "Upload a file"], ["repo", "From local repo"]] as const).map(([value, label]) => (
            <button key={value} onClick={() => { setSource(value); resetPreview(); }}
              style={{
                flex: 1, padding: "6px 10px", fontSize: 12, fontWeight: 500, borderRadius: 5, cursor: "pointer",
                border: "none",
                backgroundColor: source === value ? "#fff" : "transparent",
                color: source === value ? "#0f0f0f" : "#6b6b6b",
                boxShadow: source === value ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* ── Upload source (unchanged behaviour) ── */}
        {source === "upload" && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#3b3b3b", display: "block", marginBottom: 6 }}>BMAD epics.md file</label>
            <input ref={fileRef} type="file" accept=".md" style={{ display: "none" }} onChange={handleFile} />
            <button onClick={() => fileRef.current?.click()}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", border: "1px solid #e5e5e5", borderRadius: 6, backgroundColor: "#fafafa", cursor: "pointer", fontSize: 12, color: parsed ? "#0f0f0f" : "#9b9b9b" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f0f0f0")} onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#fafafa")}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 11h10M7 2v7M4 6l3 3 3-3"/></svg>
              {parsed ? (
                <span style={{ flex: 1, textAlign: "left" }}>{fileName} <span style={{ color: "#059669", fontWeight: 500 }}>— {parsed.length} epics, {parsed.flatMap(e => e.stories).length} stories, {totalFrs} FRs</span></span>
              ) : "Choose .md file…"}
            </button>
          </div>
        )}

        {/* ── Local repo source ── */}
        {source === "repo" && (
          <div style={{ marginBottom: 16 }}>
            {foldersError && (
              <p style={{ fontSize: 11, color: "#b45309", backgroundColor: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 6, padding: "8px 10px", marginBottom: 12 }}>
                {foldersError}
              </p>
            )}

            <label style={{ fontSize: 12, fontWeight: 500, color: "#3b3b3b", display: "block", marginBottom: 6 }}>Initiative folder</label>
            <select value={folderName} onChange={e => { setFolderName(e.target.value); resetPreview(); }} style={{ ...FIELD, marginBottom: 12 }}>
              <option value="">{folders === null ? "Loading…" : "Select a folder…"}</option>
              {(folders ?? []).map(f => (
                <option key={f.relPath} value={f.name}>
                  {f.name} ({(Object.keys(f.artifacts) as ArtifactKind[]).join(", ")})
                </option>
              ))}
            </select>

            {folder && (
              <>
                <label style={{ fontSize: 12, fontWeight: 500, color: "#3b3b3b", display: "block", marginBottom: 6 }}>Artifact</label>
                <div style={{ marginBottom: 12 }}>
                  {(["prd", "architecture", "epics"] as ArtifactKind[]).map(k => {
                    const exists = availableKinds.includes(k);
                    return (
                      <label key={k} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, cursor: exists ? "pointer" : "default", opacity: exists ? 1 : 0.4 }}>
                        <input type="radio" name="kind" value={k} checked={kind === k} disabled={!exists}
                          onChange={() => { setKind(k); resetPreview(); }} style={{ accentColor: "#6366f1" }} />
                        <span style={{ fontSize: 12, color: "#0f0f0f" }}>{ARTIFACT_LABEL[k]}</span>
                        {!exists && <span style={{ fontSize: 10, color: "#9b9b9b" }}>not generated yet</span>}
                      </label>
                    );
                  })}
                </div>

                <button onClick={handleLoadFromRepo} disabled={loadingArtifact || availableKinds.length === 0}
                  style={{ ...BTN_SECONDARY, width: "100%", opacity: loadingArtifact ? 0.6 : 1 }}>
                  {loadingArtifact ? "Reading…" : "Load artifact"}
                </button>
              </>
            )}

            {/* PRD summary */}
            {prdPreview && (
              <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 8, backgroundColor: "#fafafa", border: "1px solid #ebebeb" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#0f0f0f", marginBottom: 8 }}>
                  {prdPreview.parsed.metadata.initiative ?? prdPreview.parsed.title ?? "PRD"}
                </div>
                <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 12px", fontSize: 11, margin: 0 }}>
                  {prdPreview.parsed.metadata.jiraKey && (<><dt style={{ color: "#9b9b9b" }}>Jira</dt><dd style={{ color: "#3b3b3b", margin: 0 }}>{prdPreview.parsed.metadata.jiraKey}</dd></>)}
                  {prdPreview.parsed.metadata.complexity && (<><dt style={{ color: "#9b9b9b" }}>Complexity</dt><dd style={{ color: "#3b3b3b", margin: 0 }}>{prdPreview.parsed.metadata.complexity}</dd></>)}
                  <dt style={{ color: "#9b9b9b" }}>Steps done</dt>
                  <dd style={{ color: "#3b3b3b", margin: 0 }}>{prdPreview.parsed.metadata.stepsCompleted.join(", ") || "—"}</dd>
                  <dt style={{ color: "#9b9b9b" }}>FRs defined</dt>
                  <dd style={{ margin: 0, color: prdPreview.parsed.requirements.length > 0 ? "#059669" : "#b45309", fontWeight: 500 }}>
                    {prdPreview.parsed.requirements.length}
                  </dd>
                </dl>
                {!prdPreview.parsed.metadata.hasRequirementsSection && (
                  <p style={{ fontSize: 11, color: "#b45309", marginTop: 8, marginBottom: 0 }}>
                    This PRD has no Functional Requirements section yet — importing it records the artifact but adds no FRs.
                  </p>
                )}
              </div>
            )}

            {/* Epics summary loaded from the repo */}
            {source === "repo" && parsed && (
              <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 8, backgroundColor: "#fafafa", border: "1px solid #ebebeb", fontSize: 12, color: "#0f0f0f" }}>
                {fileName} <span style={{ color: "#059669", fontWeight: 500 }}>— {parsed.length} epics, {parsed.flatMap(e => e.stories).length} stories, {totalFrs} FRs</span>
              </div>
            )}
          </div>
        )}

        {/* Initiative selector */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: "#3b3b3b", display: "block", marginBottom: 6 }}>Target initiative</label>
          <select value={selectedInit} onChange={e => setSelectedInit(e.target.value)} style={FIELD}>
            <option value="">Select an initiative…</option>
            {initiatives.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>

        {/* Mode — only meaningful for an epics import, which rebuilds the tree */}
        {!prdPreview && (
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
        )}

        {prdPreview && (
          <p style={{ fontSize: 11, color: "#6b6b6b", marginBottom: 16 }}>
            A PRD import updates each FR&apos;s description and business area by code, and leaves epic and story links intact.
          </p>
        )}

        {error && <p style={{ fontSize: 12, color: "#eb5757", marginBottom: 12 }}>{error}</p>}

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={BTN_SECONDARY}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f5f5f5")} onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#fff")}>
            Cancel
          </button>
          <button onClick={handlePreview} disabled={!ready}
            style={{ padding: "6px 16px", fontSize: 12, fontWeight: 500, border: "none", borderRadius: 6, backgroundColor: ready ? "#0f0f0f" : "#e5e5e5", color: ready ? "#fff" : "#9b9b9b", cursor: ready ? "pointer" : "default" }}
            onMouseEnter={e => { if (ready) (e.currentTarget as HTMLElement).style.backgroundColor = "#3b3b3b"; }}
            onMouseLeave={e => { if (ready) (e.currentTarget as HTMLElement).style.backgroundColor = "#0f0f0f"; }}>
            {prdPreview ? "Review PRD import" : "Preview import"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function toPill(st?: { bg: string; color: string; border: string }): React.CSSProperties {
  const x = st ?? { bg: "#f5f5f5", color: "#6b6b6b", border: "#e5e5e5" };
  return { backgroundColor: x.bg, color: x.color, border: `1px solid ${x.border}` };
}

function epicChildLabel(epic: DBEpic): string {
  const st = epic.stories?.length ?? 0;
  const fr = epic.requirements?.length ?? 0;
  const parts = [];
  if (st) parts.push(`${st} stor${st !== 1 ? "ies" : "y"}`);
  if (fr || !st) parts.push(`${fr} FR${fr !== 1 ? "s" : ""}`);
  return parts.join(" · ");
}

export default function FunctionalRequirementsPage() {
  const [dbData, setDbData]       = useState<DBInitiative[]>([]);
  const [loading, setLoading]     = useState(true);
  const [activeKinds, setActiveKinds] = useState<Set<RowKind>>(new Set(["initiative", "epic", "story", "fr"]));
  const [expanded, setExpanded]   = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [selected, setSelected]   = useState<Set<string>>(new Set());
  const [deleting, setDeleting]   = useState(false);
  // Deep link from other apps (e.g. Riftbound trace markers): ?code=PAS-06
  const [highlight, setHighlight] = useState<string | null>(null);
  // Requirement shown in the right-hand drawer, and the app screens that implement each code.
  const [openFrId, setOpenFrId] = useState<string | null>(null);
  const [traceScreens, setTraceScreens] = useState<Array<TraceScreen & { requirements: string[] }>>([]);

  // Pending import state — an epics import previews into the tree, a PRD import
  // only reports what it will change, since it adds no epics or stories.
  const [pending, setPending] = useState<PendingImport | null>(null);
  const [prdResult, setPrdResult] = useState<string | null>(null);

  const defaultExpanded = (data: DBInitiative[]) =>
    new Set<string>(data.flatMap(i => [i.id, ...(i.epics?.slice(0, 1).map(e => e.id) ?? [])]));

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/initiatives/tree");
      const raw: DBInitiative[] = await res.json();
      setDbData(raw);
      // Only the first load picks the default expansion; refetches keep what the user opened.
      setExpanded(prev => (prev.size ? prev : defaultExpanded(raw)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    fetch("/api/traceability").then(r => r.json()).then(d => setTraceScreens(d.screens ?? [])).catch(() => {});
  }, []);

  // The drawer keeps ?code= in the URL so a requirement can be shared or deep-linked.
  const openDrawer = useCallback((fr: DBFr) => {
    setOpenFrId(fr.id);
    setHighlight(fr.id);
    window.history.replaceState(null, "", `?code=${encodeURIComponent(fr.code)}`);
  }, []);
  const closeDrawer = useCallback(() => {
    setOpenFrId(null);
    window.history.replaceState(null, "", window.location.pathname);
    fetchData(); // drawer edits may have added or resolved "[TBD…]" entries (pending badge)
  }, [fetchData]);

  // Expand the ancestors of ?code=…, open its drawer and scroll its row into view.
  // Runs once, on the first load — inline edits also update dbData.
  const deepLinked = useRef(false);
  useEffect(() => {
    if (loading || deepLinked.current) return;
    deepLinked.current = true;
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) return;
    for (const init of dbData) for (const epic of init.epics ?? []) {
      const direct = (epic.requirements ?? []).find(fr => fr.code === code);
      const story = (epic.stories ?? []).find(st => (st.requirements ?? []).some(fr => fr.code === code));
      const fr = direct ?? story?.requirements?.find(r => r.code === code);
      if (!fr) continue;
      setExpanded(prev => new Set([...prev, init.id, epic.id, ...(story ? [story.id] : [])]));
      setHighlight(fr.id);
      setOpenFrId(fr.id);
      setTimeout(() => document.getElementById(`row-${fr.id}`)?.scrollIntoView({ block: "center", behavior: "smooth" }), 120);
      return;
    }
  }, [loading, dbData]);

  const toggle = (id: string) =>
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // Inline edits (Plataforma, Fecha de entrega): optimistic update, then persist.
  async function patchFr(id: string, fields: { platforms?: PlatformKey[]; due_date?: string | null }) {
    const local: Partial<DBFr> = {};
    if (fields.platforms) local.platforms = JSON.stringify(fields.platforms);
    if ("due_date" in fields) local.due_date = fields.due_date ?? null;
    const apply = (fr: DBFr) => (fr.id === id ? { ...fr, ...local } : fr);
    setDbData(prev => prev.map(init => ({
      ...init,
      epics: init.epics?.map(ep => ({
        ...ep,
        requirements: ep.requirements?.map(apply),
        stories: ep.stories?.map(st => ({ ...st, requirements: st.requirements?.map(apply) })),
      })),
    })));
    const res = await fetch(`/api/requirements/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(fields) });
    if (!res.ok) { alert("Could not save the change."); await fetchData(); }
  }

  // ── Save pending import to DB ──────────────────────────────────────────────
  async function handleSave() {
    if (!pending) return;
    setSaving(true);
    setPrdResult(null);
    try {
      const url = pending.kind === "prd"
        ? `/api/initiatives/${pending.initiativeId}/import-prd`
        : `/api/initiatives/${pending.initiativeId}/import`;

      const body = pending.kind === "prd"
        ? { path: pending.path }
        : { mode: pending.mode, epics: pending.epics, fileName: pending.fileName, fileContent: pending.fileContent };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) { alert(`Error: ${data.error}`); return; }

      if (pending.kind === "prd") {
        const { created, updated, total } = data.requirements;
        setPrdResult(
          total === 0
            ? `${pending.fileName} imported — the PRD defines no functional requirements yet, so nothing changed.`
            : `${pending.fileName} imported — ${created} FR${created !== 1 ? "s" : ""} created, ${updated} updated.`,
        );
      }

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
              for (const fr of (epic.requirements ?? [])) {
                if (selected.has(fr.id)) toDelete.push({ id: fr.id, kind: "fr" });
              }
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
  const displayData: DBInitiative[] = pending?.kind === "epics" ? dbData.map(init => {
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
      if (showFr) for (const fr of (epic.requirements ?? [])) rows.push({ kind: "fr", item: fr });
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
        for (const fr of (epic.requirements ?? [])) ids.push(fr.id);
        for (const story of (epic.stories ?? [])) {
          ids.push(story.id);
          for (const fr of (story.requirements ?? [])) ids.push(fr.id);
        }
      }
    } else if (row.kind === "epic") {
      for (const fr of ((row.item as DBEpic).requirements ?? [])) ids.push(fr.id);
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
    fr:         displayData.flatMap(i => (i.epics ?? []).flatMap(e => [...(e.requirements ?? []), ...(e.stories ?? []).flatMap(s => s.requirements ?? [])])).length,
  };

  return (
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", height: "100%" }}>

      {/* Import modal */}
      {showModal && (
        <ImportModal
          initiatives={dbData}
          onClose={() => setShowModal(false)}
          onPreview={next => { setPrdResult(null); setPending(next); }}
        />
      )}

      {/* Result of the last PRD import */}
      {prdResult && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, padding: "10px 14px", borderRadius: 8, backgroundColor: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.25)" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="7" r="6"/><path d="M4.5 7l2 2 3-3.5"/></svg>
          <span style={{ fontSize: 12, color: "#065f46", flex: 1 }}>{prdResult}</span>
          <button onClick={() => setPrdResult(null)}
            style={{ fontSize: 12, color: "#065f46", background: "none", border: "1px solid rgba(5,150,105,0.3)", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontWeight: 500 }}>
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: pending ? 12 : 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "#0f0f0f", letterSpacing: "-0.3px" }}>Functional Requirements</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ExportMenu />
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
            <span style={{ color: "#b45309" }}>
              {pending.kind === "prd"
                ? ` (PRD — ${pending.parsed.requirements.length} FR${pending.parsed.requirements.length !== 1 ? "s" : ""})`
                : ` (${pending.mode})`}
            </span> — unsaved.
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

      {/* Table */}
      {loading ? (
        <div style={{ fontSize: 13, color: TXT_3, padding: 24 }}>Loading…</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: 3170, borderCollapse: "collapse", tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: 36 }} />
              <col style={{ width: 110 }} />
              <col style={{ width: 90 }} />
              <col style={{ width: 720 }} />
              {DETAIL_COLS.map(c => <col key={c.label} style={{ width: c.width }} />)}
            </colgroup>
            <thead>
              <tr className="req-head">
                <th style={{ ...COL_HEADER, padding: "0 0 0 10px" }}>
                  <button onClick={toggleSelectAll}
                    style={{ width: 15, height: 15, borderRadius: 3, border: `1.5px solid ${allSelected || someSelected ? "#5e6ad2" : "#d0d3d8"}`, backgroundColor: allSelected ? "#5e6ad2" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: visibleSelectableIds.length > 0 ? "pointer" : "default", padding: 0, outline: "none" }}>
                    {allSelected && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5l2.5 2.5L8 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    {!allSelected && someSelected && <div style={{ width: 7, height: 2, backgroundColor: "#5e6ad2", borderRadius: 1 }} />}
                  </button>
                </th>
                <th style={{ ...COL_HEADER, position: "relative" }}>
                  <TypeFilterDropdown active={activeKinds} onChange={setActiveKinds} counts={counts} />
                </th>
                <th style={COL_HEADER}>ID</th>
                <th style={COL_HEADER}>Funcionalidad</th>
                {DETAIL_COLS.map(c => <th key={c.label} style={COL_HEADER}>{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={4 + DETAIL_COLS.length} style={{ padding: "32px 12px", textAlign: "center", fontSize: 13, color: TXT_3 }}>
                  No data. Import a BMAD epics.md to get started.
                </td></tr>
              )}
              {rows.map(row => {
                const isPreview = row.item.id.startsWith("preview-");
                const meta  = KIND_META[row.kind];
                const levelIndex = ["initiative", "epic", "story", "fr"].indexOf(row.kind);
                let indent = 0;
                for (let i = 0; i < levelIndex; i++) if (visibleParents[i]) indent += 20;

                const chk = rowCheckState(row);
                const isChecked = chk === "checked";
                const isHighlighted = row.kind === "fr" && highlight === row.item.id;
                const bg = isHighlighted ? "rgba(94,106,210,0.10)" : isChecked ? "rgba(94,106,210,0.06)" : isPreview ? "rgba(245,158,11,0.04)" : undefined;
                const checkCell = (
                  <td style={{ ...CELL, padding: "0 0 0 10px" }} onClick={() => toggleSelectRow(row)}>
                    {!isPreview && <Checkbox state={chk} />}
                  </td>
                );

                if (row.kind === "fr") {
                  const fr = row.item as DBFr;
                  const title = fr.feature ?? fr.description;
                  return (
                    <tr key={fr.id} id={`row-${fr.id}`} className="req-row"
                      style={{ backgroundColor: bg, boxShadow: isHighlighted ? "inset 2px 0 0 #5e6ad2" : undefined }}>
                      {checkCell}
                      <td style={CELL}><KindCell kind="fr" /></td>
                      <td style={CELL}><IdCell code={fr.code} /></td>
                      <td style={CELL} title={title}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: indent + 22, minWidth: 0, fontSize: 14 }}>
                          <KindIcon kind="fr" />
                          <button onClick={() => !isPreview && openDrawer(fr)} className="req-title"
                            style={{ background: "none", border: "none", padding: 0, font: "inherit", color: TXT, cursor: isPreview ? "default" : "pointer", textAlign: "left", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>
                            {title}
                          </button>
                          {!!fr.pending_items && <PendingBadge count={fr.pending_items} />}
                        </div>
                      </td>
                      <td style={CELL}><TextCell value={fr.feature ? fr.description : null} /></td>
                      <td style={CELL}><StatusCell status={fr.status} /></td>
                      <td style={CELL}>
                        {isPreview ? null : <PlatformCell value={parsePlatforms(fr.platforms)} onChange={v => patchFr(fr.id, { platforms: v })} />}
                      </td>
                      <td style={CELL}><PriorityCell priority={fr.priority} /></td>
                      <td style={CELL}><OwnerCell owner={fr.owner} /></td>
                      <td style={CELL}>
                        {isPreview ? null : <DueDateCell value={fr.due_date} onChange={v => patchFr(fr.id, { due_date: v })} />}
                      </td>
                      <td style={CELL}><TextCell value={fr.page} /></td>
                      <td style={CELL}><TextCell value={fr.source} /></td>
                      <td style={CELL}><TextCell value={fr.wo_ref} /></td>
                      <td style={CELL}><TextCell value={fr.comments} /></td>
                    </tr>
                  );
                }

                // initiative / epic / story
                const id   = row.item.id;
                const name = (row.item as any).name as string;
                const children =
                  row.kind === "initiative" ? ((row.item as DBInitiative).epics ?? [])
                  : row.kind === "epic"     ? [...((row.item as DBEpic).stories ?? []), ...((row.item as DBEpic).requirements ?? [])]
                  : ((row.item as DBStory).requirements ?? []);
                const childLabel =
                  row.kind === "initiative" ? `${children.length} epic${children.length !== 1 ? "s" : ""}`
                  : row.kind === "epic"     ? epicChildLabel(row.item as DBEpic)
                  : `${children.length} FR${children.length !== 1 ? "s" : ""}`;
                const appName = row.kind === "initiative" ? ((row.item as DBInitiative).app?.name ?? null) : null;

                return (
                  <tr key={id} className="req-row" style={{ backgroundColor: bg }}>
                    {checkCell}
                    <td style={CELL}><KindCell kind={row.kind} /></td>
                    {/* ID column: only epics carry a code; initiatives and stories leave it empty. */}
                    <td style={CELL}><IdCell code={row.kind === "epic" ? (row.item as DBEpic).code : null} /></td>
                    <td style={CELL}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: indent, minWidth: 0, fontSize: 14 }}>
                        <ToggleBtn id={id} hasChildren={children.length > 0} isOpen={expanded.has(id)} onToggle={toggle} />
                        <KindIcon kind={row.kind} />
                        <span style={{ fontWeight: meta.bold ? 500 : 400, color: TXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
                        <span style={{ fontSize: 13, color: TXT_3, flexShrink: 0 }}>{childLabel}</span>
                        {appName && <span style={{ fontSize: 12, color: TXT_2, backgroundColor: "#f4f4f5", padding: "1px 6px", borderRadius: 4, flexShrink: 0 }}>{appName}</span>}
                        {isPreview && <span style={{ fontSize: 11, fontWeight: 500, color: "#b45309", backgroundColor: "rgba(245,158,11,0.1)", padding: "1px 5px", borderRadius: 4, flexShrink: 0 }}>preview</span>}
                      </div>
                    </td>
                    <td colSpan={DETAIL_COLS.length} />
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Requirement drawer */}
      {(() => {
        if (!openFrId) return null;
        for (const init of dbData) for (const epic of init.epics ?? []) {
          const direct = epic.requirements?.find(r => r.id === openFrId);
          const story = epic.stories?.find(st => st.requirements?.some(r => r.id === openFrId));
          const fr = direct ?? story?.requirements?.find(r => r.id === openFrId);
          if (!fr) continue;
          const context: DrawerContext = { initiative: init.name, epic: { code: epic.code, name: epic.name }, story: story?.name };
          const screens = traceScreens.filter(sc => sc.requirements.includes(fr.code));
          return <RequirementDrawer fr={fr} context={context} screens={screens} onClose={closeDrawer} onPatch={fields => patchFr(fr.id, fields)} />;
        }
        return null;
      })()}
    </div>
  );
}
