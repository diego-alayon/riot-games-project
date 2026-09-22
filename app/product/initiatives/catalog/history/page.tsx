"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface HistoryRow {
  id: string;
  file_name: string;
  imported_at: string;
  mode: string;
  initiative_id: string | null;
  initiative_name: string | null;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const MODE_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  replace: { bg: "rgba(235,87,87,0.07)", color: "#b91c1c", border: "rgba(235,87,87,0.25)" },
  merge:   { bg: "rgba(16,185,129,0.07)", color: "#059669", border: "rgba(16,185,129,0.25)" },
};

const COL_HEADER: React.CSSProperties = {
  fontSize: 11, fontWeight: 500, color: "#9b9b9b",
  textAlign: "left", padding: "0 14px", height: 36,
  borderBottom: "1px solid #ebebeb", whiteSpace: "nowrap", userSelect: "none",
};

export default function ImportHistoryPage() {
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/import-history")
      .then(r => r.json())
      .then(data => { setRows(data); setLoading(false); });
  }, []);

  return (
    <div style={{ padding: "28px 32px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 500, color: "#9b9b9b", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 4 }}>Product</div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "#0f0f0f", letterSpacing: "-0.3px" }}>Import History</h1>
        </div>
        <Link href="/product/initiatives/catalog"
          style={{ fontSize: 12, color: "#6b6b6b", textDecoration: "none" }}>
          ← Functional Requirements
        </Link>
      </div>

      {loading ? (
        <div style={{ fontSize: 13, color: "#9b9b9b", padding: 24 }}>Loading…</div>
      ) : (
        <div style={{ border: "1px solid #ebebeb", borderRadius: 8, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <colgroup>
              <col style={{ width: "32%" }} />
              <col style={{ width: "28%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "10%" }} />
            </colgroup>
            <thead>
              <tr style={{ backgroundColor: "#fafafa" }}>
                {["File name", "Initiative", "Imported at", "Mode", ""].map(h => (
                  <th key={h} style={COL_HEADER}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: "40px 14px", textAlign: "center", fontSize: 13, color: "#9b9b9b" }}>
                    No imports yet. Import an epics.md from the{" "}
                    <Link href="/product/initiatives/catalog" style={{ color: "#6366f1" }}>Functional Requirements</Link> page.
                  </td>
                </tr>
              )}
              {rows.map(row => {
                const mode = MODE_STYLE[row.mode] ?? MODE_STYLE.merge;
                return (
                  <tr key={row.id} style={{ borderBottom: "1px solid #f4f4f4" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fafafa")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "")}>
                    <td style={{ padding: "0 14px", height: 44 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#9b9b9b" strokeWidth="1.5" strokeLinecap="round">
                          <path d="M2 2h7l3 3v7a1 1 0 01-1 1H2a1 1 0 01-1-1V3a1 1 0 011-1z"/><path d="M9 2v3h3"/>
                        </svg>
                        <span style={{ fontSize: 12, fontWeight: 500, color: "#0f0f0f", fontFamily: "monospace" }}>{row.file_name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "0 14px" }}>
                      {row.initiative_name
                        ? <span style={{ fontSize: 12, color: "#3b3b3b" }}>{row.initiative_name}</span>
                        : <span style={{ fontSize: 12, color: "#c0c0c0" }}>—</span>}
                    </td>
                    <td style={{ padding: "0 14px" }}>
                      <span style={{ fontSize: 12, color: "#6b6b6b" }}>{formatDate(row.imported_at)}</span>
                    </td>
                    <td style={{ padding: "0 14px" }}>
                      <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 7px", borderRadius: 4, backgroundColor: mode.bg, color: mode.color, border: `1px solid ${mode.border}` }}>
                        {row.mode}
                      </span>
                    </td>
                    <td style={{ padding: "0 14px" }}>
                      <a href={`/api/import-history/${row.id}/download`} download={row.file_name}
                        style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "#6366f1", textDecoration: "none", padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(99,102,241,0.25)", backgroundColor: "rgba(99,102,241,0.05)" }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(99,102,241,0.12)")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "rgba(99,102,241,0.05)")}>
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 11h10M7 2v7M4 6l3 3 3-3"/></svg>
                        Download
                      </a>
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
