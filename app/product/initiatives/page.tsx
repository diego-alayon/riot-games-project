"use client";

import { useState, useRef, useEffect } from "react";

type TaskType = "initiative" | "epic" | "story" | "task";

interface RowItem {
  id: string;
  type: TaskType;
  name: string;
  startDate: Date | null;
  dueDate: Date | null;
  assignee: string;
  progress: number;
  children?: RowItem[];
}

const TYPE_META = {
  initiative: { dot: "#6366f1", bar: "#6366f1", indent: 0,  bold: true,  fontSize: 13 },
  epic:       { dot: "#f59e0b", bar: "#f59e0b", indent: 16, bold: true,  fontSize: 12 },
  story:      { dot: "#10b981", bar: "#10b981", indent: 32, bold: false, fontSize: 12 },
  task:       { dot: "#9b9b9b", bar: "#c4c4c4", indent: 48, bold: false, fontSize: 11 },
};

const ROW_H = 36;
const LEFT_W = 260;
const DAY_W = 3;

function parseDate(s: string | null): Date | null {
  return s ? new Date(s) : null;
}

function mapTree(raw: any[]): RowItem[] {
  return raw.map((init) => ({
    id: init.id, type: "initiative" as const,
    name: init.name,
    startDate: init.epics?.[0]?.start_date ? new Date(init.epics[0].start_date) : null,
    dueDate: init.epics?.length ? new Date(Math.max(...init.epics.map((e: any) => new Date(e.due_date).getTime()))) : null,
    assignee: init.epics?.[0]?.assignee ?? "—",
    progress: init.epics?.length ? Math.round(init.epics.reduce((s: number, e: any) => s + e.progress, 0) / init.epics.length) : 0,
    children: init.epics?.map((epic: any) => ({
      id: epic.id, type: "epic" as const,
      name: epic.name,
      startDate: parseDate(epic.start_date),
      dueDate: parseDate(epic.due_date),
      assignee: epic.assignee ?? "—",
      progress: epic.progress,
      children: epic.stories?.map((story: any) => ({
        id: story.id, type: "story" as const,
        name: story.name,
        startDate: parseDate(story.start_date),
        dueDate: parseDate(story.due_date),
        assignee: story.assignee ?? "—",
        progress: story.progress,
        children: story.tasks?.map((task: any) => ({
          id: task.id, type: "task" as const,
          name: task.name,
          startDate: parseDate(task.start_date),
          dueDate: parseDate(task.due_date),
          assignee: task.assignee ?? "—",
          progress: task.progress,
        })),
      })),
    })),
  }));
}

function flattenRows(items: RowItem[], expanded: Set<string>): { item: RowItem }[] {
  const result: { item: RowItem }[] = [];
  for (const item of items) {
    result.push({ item });
    if (expanded.has(item.id) && item.children) {
      result.push(...flattenRows(item.children, expanded));
    }
  }
  return result;
}

function daysFrom(origin: Date, date: Date) {
  return Math.round((date.getTime() - origin.getTime()) / 86400000);
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function monthsBetween(start: Date, end: Date) {
  const months: { year: number; month: number; label: string }[] = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
  while (cur <= endMonth) {
    months.push({ year: cur.getFullYear(), month: cur.getMonth(), label: cur.toLocaleString("en", { month: "short" }).toUpperCase() });
    cur.setMonth(cur.getMonth() + 1);
  }
  return months;
}

function AvatarInitials({ name }: { name: string }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{ width: 22, height: 22, borderRadius: "50%", backgroundColor: "#e4f222", color: "#0f0f0f", fontSize: 10, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function ProgressBar({ value, bar }: { value: number; bar: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 4, backgroundColor: "#f0f0f0", borderRadius: 9999, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value}%`, backgroundColor: value === 100 ? "#10b981" : value > 0 ? bar : "#e5e5e5", borderRadius: 9999 }} />
      </div>
      <span style={{ fontSize: 11, color: "#9b9b9b", minWidth: 28, textAlign: "right" }}>{value}%</span>
    </div>
  );
}

export default function InitiativesPage() {
  const [view, setView] = useState<"table" | "timeline">("table");
  const [data, setData] = useState<RowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/initiatives/tree")
      .then((r) => r.json())
      .then((raw) => {
        const tree = mapTree(raw);
        setData(tree);
        // auto-expand top 2 initiatives and their first epic
        const defaultOpen = new Set<string>();
        tree.forEach((init) => {
          defaultOpen.add(init.id);
          init.children?.slice(0, 1).forEach((epic) => defaultOpen.add(epic.id));
        });
        setExpanded(defaultOpen);
        setLoading(false);
      });
  }, []);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const rows = flattenRows(data, expanded);

  // Timeline bounds
  const originDate = new Date(2026, 0, 1);
  const endDate = new Date(2026, 11, 31);
  const months = monthsBetween(originDate, endDate);
  const totalDays = daysFrom(originDate, endDate) + 1;
  const timelineWidth = totalDays * DAY_W;
  const today = new Date();
  const todayX = daysFrom(originDate, today) * DAY_W;

  const COL_HEADER: React.CSSProperties = {
    fontSize: 11, fontWeight: 500, color: "#9b9b9b",
    textAlign: "left", padding: "0 12px", height: 36,
    borderBottom: "1px solid #ebebeb", whiteSpace: "nowrap", userSelect: "none",
  };

  const ToggleBtn = ({ id, hasChildren, isOpen }: { id: string; hasChildren: boolean; isOpen: boolean }) => (
    <button onClick={() => hasChildren && toggle(id)}
      style={{ width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: 6, color: "#b0b0b0", background: "none", border: "none", cursor: hasChildren ? "pointer" : "default", opacity: hasChildren ? 1 : 0 }}>
      <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        {isOpen ? <path d="M2 3.5l3 3 3-3" /> : <path d="M3.5 2l3 3-3 3" />}
      </svg>
    </button>
  );

  return (
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 500, color: "#9b9b9b", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 4 }}>Product</div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "#0f0f0f", letterSpacing: "-0.3px" }}>Initiatives</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", border: "1px solid #e5e5e5", borderRadius: 6, overflow: "hidden" }}>
            {(["table", "timeline"] as const).map((v, i) => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding: "5px 12px", fontSize: 12, fontWeight: 500, border: "none", cursor: "pointer", borderRight: i === 0 ? "1px solid #e5e5e5" : "none", backgroundColor: view === v ? "#f5f5f5" : "#ffffff", color: view === v ? "#0f0f0f" : "#6b6b6b", display: "flex", alignItems: "center", gap: 5 }}>
                {v === "table" ? (
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="1" y="1" width="11" height="11" rx="1.5" /><path d="M1 5h11M5 5v7" /></svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M1 4h4M1 9h6M8 4h4M10 9h3" strokeLinecap="round" /></svg>
                )}
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <a href="/product/initiatives/catalog" style={{ fontSize: 12, color: "#6b6b6b", textDecoration: "none" }}>Requirements Catalog →</a>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        {(["initiative","epic","story","task"] as TaskType[]).map((type) => (
          <div key={type} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: TYPE_META[type].dot }} />
            <span style={{ fontSize: 11, color: "#9b9b9b", textTransform: "capitalize" }}>{type}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ color: "#9b9b9b", fontSize: 13, padding: 24 }}>Loading…</div>
      ) : (
        <>
          {/* ── TABLE ── */}
          {view === "table" && (
            <div style={{ border: "1px solid #ebebeb", borderRadius: 8, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <colgroup><col style={{ width: "45%" }} /><col style={{ width: "13%" }} /><col style={{ width: "13%" }} /><col style={{ width: "16%" }} /><col style={{ width: "13%" }} /></colgroup>
                <thead>
                  <tr style={{ backgroundColor: "#fafafa" }}>
                    {["Name","Start date","Due date","Assignee","Progress"].map(h => <th key={h} style={COL_HEADER}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ item }) => {
                    const meta = TYPE_META[item.type];
                    const hasChildren = !!item.children?.length;
                    const isOpen = expanded.has(item.id);
                    const fmt = (d: Date | null) => d ? d.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" }) : "—";
                    return (
                      <tr key={item.id} style={{ borderBottom: "1px solid #f4f4f4" }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fafafa")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "")}>
                        <td style={{ padding: "0 12px", height: ROW_H }}>
                          <div style={{ display: "flex", alignItems: "center", paddingLeft: meta.indent }}>
                            <ToggleBtn id={item.id} hasChildren={hasChildren} isOpen={isOpen} />
                            <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: meta.dot, flexShrink: 0, marginRight: 8 }} />
                            <span style={{ fontSize: meta.fontSize, fontWeight: meta.bold ? 600 : 400, color: item.type === "task" ? "#6b6b6b" : "#0f0f0f", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "0 12px", fontSize: 12, color: "#6b6b6b", whiteSpace: "nowrap" }}>{fmt(item.startDate)}</td>
                        <td style={{ padding: "0 12px", fontSize: 12, color: "#6b6b6b", whiteSpace: "nowrap" }}>{fmt(item.dueDate)}</td>
                        <td style={{ padding: "0 12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <AvatarInitials name={item.assignee} />
                            <span style={{ fontSize: 12, color: "#6b6b6b" }}>{item.assignee}</span>
                          </div>
                        </td>
                        <td style={{ padding: "0 12px", minWidth: 120 }}><ProgressBar value={item.progress} bar={meta.bar} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── TIMELINE ── */}
          {view === "timeline" && (
            <div style={{ border: "1px solid #ebebeb", borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
              <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>
                {/* Left panel */}
                <div style={{ width: LEFT_W, flexShrink: 0, borderRight: "1px solid #ebebeb", display: "flex", flexDirection: "column" }}>
                  <div style={{ height: 36, borderBottom: "1px solid #ebebeb", backgroundColor: "#fafafa", display: "flex", alignItems: "center", paddingLeft: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 500, color: "#9b9b9b" }}>Name</span>
                  </div>
                  <div style={{ overflowY: "auto", flex: 1 }}>
                    {rows.map(({ item }) => {
                      const meta = TYPE_META[item.type];
                      const hasChildren = !!item.children?.length;
                      const isOpen = expanded.has(item.id);
                      return (
                        <div key={item.id} style={{ height: ROW_H, display: "flex", alignItems: "center", borderBottom: "1px solid #f4f4f4", paddingLeft: 8 + meta.indent, paddingRight: 8 }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fafafa")}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "")}>
                          <ToggleBtn id={item.id} hasChildren={hasChildren} isOpen={isOpen} />
                          <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: meta.dot, flexShrink: 0, marginRight: 6 }} />
                          <span style={{ fontSize: meta.fontSize, fontWeight: meta.bold ? 600 : 400, color: item.type === "task" ? "#6b6b6b" : "#0f0f0f", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Right scrollable */}
                <div style={{ flex: 1, overflowX: "auto", overflowY: "auto" }}>
                  <div style={{ width: timelineWidth, minWidth: "100%", position: "relative" }}>
                    {/* Month header */}
                    <div style={{ display: "flex", height: 36, borderBottom: "1px solid #ebebeb", backgroundColor: "#fafafa", position: "sticky", top: 0, zIndex: 1 }}>
                      {months.map((m) => {
                        const days = daysInMonth(m.year, m.month);
                        const left = daysFrom(originDate, new Date(m.year, m.month, 1)) * DAY_W;
                        return (
                          <div key={`${m.year}-${m.month}`} style={{ position: "absolute", left, width: days * DAY_W, height: 36, display: "flex", alignItems: "center", paddingLeft: 8, borderRight: "1px solid #f0f0f0" }}>
                            <span style={{ fontSize: 11, fontWeight: 500, color: "#9b9b9b", letterSpacing: "0.3px" }}>{m.label}</span>
                          </div>
                        );
                      })}
                    </div>
                    {/* Rows */}
                    <div style={{ position: "relative" }}>
                      {months.map((m) => (
                        <div key={`g-${m.year}-${m.month}`} style={{ position: "absolute", left: daysFrom(originDate, new Date(m.year, m.month, 1)) * DAY_W, top: 0, bottom: 0, width: 1, backgroundColor: "#f4f4f4", pointerEvents: "none" }} />
                      ))}
                      {todayX >= 0 && todayX <= timelineWidth && (
                        <div style={{ position: "absolute", left: todayX, top: 0, bottom: 0, width: 1, backgroundColor: "#6366f1", zIndex: 2, pointerEvents: "none" }}>
                          <div style={{ position: "absolute", top: 0, left: -16, backgroundColor: "#6366f1", color: "#fff", fontSize: 10, fontWeight: 600, padding: "1px 5px", borderRadius: 3, whiteSpace: "nowrap" }}>
                            {today.toLocaleDateString("en", { month: "short", day: "numeric" }).toUpperCase()}
                          </div>
                        </div>
                      )}
                      {rows.map(({ item }) => {
                        const meta = TYPE_META[item.type];
                        if (!item.startDate || !item.dueDate) return (
                          <div key={item.id} style={{ height: ROW_H, borderBottom: "1px solid #f4f4f4" }} />
                        );
                        const barStart = daysFrom(originDate, item.startDate) * DAY_W;
                        const barWidth = Math.max((daysFrom(originDate, item.dueDate) - daysFrom(originDate, item.startDate)) * DAY_W, 6);
                        const barH = item.type === "initiative" ? 14 : item.type === "epic" ? 12 : item.type === "story" ? 10 : 8;
                        return (
                          <div key={item.id} style={{ height: ROW_H, position: "relative", borderBottom: "1px solid #f4f4f4", display: "flex", alignItems: "center" }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fafafa")}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "")}>
                            <div style={{ position: "absolute", left: barStart, width: barWidth, height: barH, backgroundColor: `${meta.bar}22`, borderRadius: 4, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${item.progress}%`, backgroundColor: meta.bar, borderRadius: 4 }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
