"use client";

import { useState, useRef, useEffect } from "react";

type TaskType = "initiative" | "epic" | "story" | "task";

interface RowItem {
  id: string;
  type: TaskType;
  name: string;
  startDate: Date;
  dueDate: Date;
  assignee: string;
  progress: number;
  children?: RowItem[];
}

const d = (s: string) => new Date(s);

const DATA: RowItem[] = [
  {
    id: "i1", type: "initiative", name: "Riftbound Ticketing Portal",
    startDate: d("2026-01-06"), dueDate: d("2026-06-30"), assignee: "Diego A.", progress: 42,
    children: [
      {
        id: "e1", type: "epic", name: "Authentication & Access Control",
        startDate: d("2026-01-06"), dueDate: d("2026-02-28"), assignee: "Diego A.", progress: 80,
        children: [
          {
            id: "s1", type: "story", name: "As a user, I can log in via SSO",
            startDate: d("2026-01-06"), dueDate: d("2026-01-24"), assignee: "Diego A.", progress: 100,
            children: [
              { id: "t1", type: "task", name: "Integrate OAuth2 provider", startDate: d("2026-01-06"), dueDate: d("2026-01-17"), assignee: "Diego A.", progress: 100 },
              { id: "t2", type: "task", name: "Create login page UI", startDate: d("2026-01-13"), dueDate: d("2026-01-20"), assignee: "Diego A.", progress: 100 },
              { id: "t3", type: "task", name: "Write auth middleware", startDate: d("2026-01-20"), dueDate: d("2026-01-24"), assignee: "Diego A.", progress: 100 },
            ],
          },
          {
            id: "s2", type: "story", name: "As an admin, I can manage user roles",
            startDate: d("2026-01-27"), dueDate: d("2026-02-14"), assignee: "Maria G.", progress: 60,
            children: [
              { id: "t4", type: "task", name: "Design roles & permissions model", startDate: d("2026-01-27"), dueDate: d("2026-02-03"), assignee: "Maria G.", progress: 100 },
              { id: "t5", type: "task", name: "Build admin roles UI", startDate: d("2026-02-03"), dueDate: d("2026-02-10"), assignee: "Maria G.", progress: 60 },
              { id: "t6", type: "task", name: "API endpoints for role assignment", startDate: d("2026-02-10"), dueDate: d("2026-02-14"), assignee: "Diego A.", progress: 20 },
            ],
          },
        ],
      },
      {
        id: "e2", type: "epic", name: "Ticket Management",
        startDate: d("2026-03-02"), dueDate: d("2026-06-30"), assignee: "Carlos R.", progress: 25,
        children: [
          {
            id: "s3", type: "story", name: "As a user, I can create and track tickets",
            startDate: d("2026-03-02"), dueDate: d("2026-04-10"), assignee: "Carlos R.", progress: 50,
            children: [
              { id: "t7", type: "task", name: "Design ticket data model", startDate: d("2026-03-02"), dueDate: d("2026-03-09"), assignee: "Carlos R.", progress: 100 },
              { id: "t8", type: "task", name: "Build ticket list view", startDate: d("2026-03-09"), dueDate: d("2026-03-27"), assignee: "Carlos R.", progress: 70 },
              { id: "t9", type: "task", name: "Build ticket detail view", startDate: d("2026-03-27"), dueDate: d("2026-04-10"), assignee: "Carlos R.", progress: 10 },
            ],
          },
          {
            id: "s4", type: "story", name: "As an agent, I can assign and close tickets",
            startDate: d("2026-04-13"), dueDate: d("2026-05-15"), assignee: "Sofia L.", progress: 0,
            children: [
              { id: "t10", type: "task", name: "Assignment workflow logic", startDate: d("2026-04-13"), dueDate: d("2026-04-24"), assignee: "Sofia L.", progress: 0 },
              { id: "t11", type: "task", name: "Email notifications on status change", startDate: d("2026-04-24"), dueDate: d("2026-05-08"), assignee: "Sofia L.", progress: 0 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "i2", type: "initiative", name: "GateFlow – Access Control",
    startDate: d("2026-07-01"), dueDate: d("2026-12-31"), assignee: "Diego A.", progress: 10,
    children: [
      {
        id: "e3", type: "epic", name: "Gate Entry & Validation",
        startDate: d("2026-07-01"), dueDate: d("2026-09-30"), assignee: "Diego A.", progress: 15,
        children: [
          {
            id: "s5", type: "story", name: "As a security officer, I can scan entry badges",
            startDate: d("2026-07-01"), dueDate: d("2026-08-15"), assignee: "Ana P.", progress: 30,
            children: [
              { id: "t12", type: "task", name: "QR scanner integration", startDate: d("2026-07-01"), dueDate: d("2026-07-18"), assignee: "Ana P.", progress: 60 },
              { id: "t13", type: "task", name: "Badge validation API", startDate: d("2026-07-18"), dueDate: d("2026-08-01"), assignee: "Ana P.", progress: 20 },
              { id: "t14", type: "task", name: "Real-time entry log UI", startDate: d("2026-08-01"), dueDate: d("2026-08-15"), assignee: "Ana P.", progress: 0 },
            ],
          },
          {
            id: "s6", type: "story", name: "As an admin, I can define access zones",
            startDate: d("2026-08-18"), dueDate: d("2026-09-30"), assignee: "Diego A.", progress: 0,
            children: [
              { id: "t15", type: "task", name: "Zone configuration data model", startDate: d("2026-08-18"), dueDate: d("2026-09-05"), assignee: "Diego A.", progress: 0 },
              { id: "t16", type: "task", name: "Zone management UI", startDate: d("2026-09-05"), dueDate: d("2026-09-30"), assignee: "Diego A.", progress: 0 },
            ],
          },
        ],
      },
      {
        id: "e4", type: "epic", name: "Reporting & Analytics",
        startDate: d("2026-10-01"), dueDate: d("2026-12-31"), assignee: "Carlos R.", progress: 0,
        children: [
          {
            id: "s7", type: "story", name: "As an admin, I can view entry/exit reports",
            startDate: d("2026-10-01"), dueDate: d("2026-11-30"), assignee: "Carlos R.", progress: 0,
            children: [
              { id: "t17", type: "task", name: "Build reporting data pipeline", startDate: d("2026-10-01"), dueDate: d("2026-10-31"), assignee: "Carlos R.", progress: 0 },
              { id: "t18", type: "task", name: "Design analytics dashboard", startDate: d("2026-11-01"), dueDate: d("2026-11-30"), assignee: "Sofia L.", progress: 0 },
            ],
          },
        ],
      },
    ],
  },
];

const TYPE_META = {
  initiative: { dot: "#6366f1", bar: "#6366f1", indent: 0,  bold: true,  fontSize: 13 },
  epic:       { dot: "#f59e0b", bar: "#f59e0b", indent: 16, bold: true,  fontSize: 12 },
  story:      { dot: "#10b981", bar: "#10b981", indent: 32, bold: false, fontSize: 12 },
  task:       { dot: "#9b9b9b", bar: "#c4c4c4", indent: 48, bold: false, fontSize: 11 },
};

const ROW_H = 36;
const LEFT_W = 260;
const DAY_W = 3; // px per day

function flattenRows(items: RowItem[], expanded: Set<string>, depth = 0): { item: RowItem; depth: number }[] {
  const result: { item: RowItem; depth: number }[] = [];
  for (const item of items) {
    result.push({ item, depth });
    if (expanded.has(item.id) && item.children) {
      result.push(...flattenRows(item.children, expanded, depth + 1));
    }
  }
  return result;
}

function monthsBetween(start: Date, end: Date) {
  const months: { year: number; month: number; label: string }[] = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
  while (cur <= endMonth) {
    months.push({
      year: cur.getFullYear(),
      month: cur.getMonth(),
      label: cur.toLocaleString("en", { month: "short" }).toUpperCase(),
    });
    cur.setMonth(cur.getMonth() + 1);
  }
  return months;
}

function daysFrom(origin: Date, date: Date) {
  return Math.round((date.getTime() - origin.getTime()) / 86400000);
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export default function InitiativesPage() {
  const [view, setView] = useState<"table" | "timeline">("table");
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["i1", "e1", "i2"]));
  const timelineRef = useRef<HTMLDivElement>(null);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Timeline bounds: Jan 2026 → Dec 2026
  const originDate = new Date(2026, 0, 1);
  const endDate = new Date(2026, 11, 31);
  const months = monthsBetween(originDate, endDate);
  const totalDays = daysFrom(originDate, endDate) + 1;
  const timelineWidth = totalDays * DAY_W;

  const today = new Date();
  const todayX = daysFrom(originDate, today) * DAY_W;

  const rows = flattenRows(DATA, expanded);

  // Scroll timeline to show Jan 2026 by default
  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.scrollLeft = 0;
    }
  }, [view]);

  const COL_HEADER: React.CSSProperties = {
    fontSize: 11, fontWeight: 500, color: "#9b9b9b",
    textAlign: "left", padding: "0 12px", height: 36,
    borderBottom: "1px solid #ebebeb", whiteSpace: "nowrap", userSelect: "none",
  };

  return (
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 500, color: "#9b9b9b", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 4 }}>
            Product
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "#0f0f0f", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
            Initiatives
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* View toggle */}
          <div style={{ display: "flex", border: "1px solid #e5e5e5", borderRadius: 6, overflow: "hidden" }}>
            <button
              onClick={() => setView("table")}
              style={{
                padding: "5px 12px", fontSize: 12, fontWeight: 500, border: "none", cursor: "pointer",
                backgroundColor: view === "table" ? "#f5f5f5" : "#ffffff",
                color: view === "table" ? "#0f0f0f" : "#6b6b6b",
                borderRight: "1px solid #e5e5e5",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <rect x="1" y="1" width="11" height="11" rx="1.5" />
                  <path d="M1 5h11M5 5v7" />
                </svg>
                Table
              </span>
            </button>
            <button
              onClick={() => setView("timeline")}
              style={{
                padding: "5px 12px", fontSize: 12, fontWeight: 500, border: "none", cursor: "pointer",
                backgroundColor: view === "timeline" ? "#f5f5f5" : "#ffffff",
                color: view === "timeline" ? "#0f0f0f" : "#6b6b6b",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M1 4h4M1 9h6M8 4h4M10 9h3" strokeLinecap="round" />
                </svg>
                Timeline
              </span>
            </button>
          </div>
          <a href="/product/initiatives/catalog" style={{ fontSize: 12, color: "#6b6b6b", textDecoration: "none" }}>
            Requirements Catalog →
          </a>
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

      {/* ── TABLE VIEW ── */}
      {view === "table" && (
        <div style={{ border: "1px solid #ebebeb", borderRadius: 8, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <colgroup>
              <col style={{ width: "45%" }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "13%" }} />
            </colgroup>
            <thead>
              <tr style={{ backgroundColor: "#fafafa" }}>
                <th style={COL_HEADER}>Name</th>
                <th style={COL_HEADER}>Start date</th>
                <th style={COL_HEADER}>Due date</th>
                <th style={COL_HEADER}>Assignee</th>
                <th style={COL_HEADER}>Progress</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ item }) => {
                const meta = TYPE_META[item.type];
                const hasChildren = !!item.children?.length;
                const isOpen = expanded.has(item.id);
                return (
                  <tr key={item.id} style={{ borderBottom: "1px solid #f4f4f4" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}>
                    <td style={{ padding: "0 12px", height: ROW_H }}>
                      <div style={{ display: "flex", alignItems: "center", paddingLeft: meta.indent }}>
                        <button onClick={() => hasChildren && toggle(item.id)}
                          style={{ width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: 6, color: "#b0b0b0", background: "none", border: "none", cursor: hasChildren ? "pointer" : "default", opacity: hasChildren ? 1 : 0 }}>
                          <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            {isOpen ? <path d="M2 3.5l3 3 3-3" /> : <path d="M3.5 2l3 3-3 3" />}
                          </svg>
                        </button>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: meta.dot, flexShrink: 0, marginRight: 8 }} />
                        <span style={{ fontSize: meta.fontSize, fontWeight: meta.bold ? 600 : 400, color: item.type === "task" ? "#6b6b6b" : "#0f0f0f", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "0 12px", fontSize: 12, color: "#6b6b6b", whiteSpace: "nowrap" }}>
                      {item.startDate.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td style={{ padding: "0 12px", fontSize: 12, color: "#6b6b6b", whiteSpace: "nowrap" }}>
                      {item.dueDate.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td style={{ padding: "0 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 22, height: 22, borderRadius: "50%", backgroundColor: "#e4f222", color: "#0f0f0f", fontSize: 10, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {item.assignee.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase()}
                        </div>
                        <span style={{ fontSize: 12, color: "#6b6b6b" }}>{item.assignee}</span>
                      </div>
                    </td>
                    <td style={{ padding: "0 12px", minWidth: 120 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, height: 4, backgroundColor: "#f0f0f0", borderRadius: 9999, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${item.progress}%`, backgroundColor: item.progress === 100 ? "#10b981" : item.progress > 0 ? meta.bar : "#e5e5e5", borderRadius: 9999 }} />
                        </div>
                        <span style={{ fontSize: 11, color: "#9b9b9b", minWidth: 28, textAlign: "right" }}>{item.progress}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── TIMELINE VIEW ── */}
      {view === "timeline" && (
        <div style={{ border: "1px solid #ebebeb", borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
          <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>

            {/* Left panel — frozen names */}
            <div style={{ width: LEFT_W, flexShrink: 0, borderRight: "1px solid #ebebeb", display: "flex", flexDirection: "column", zIndex: 2 }}>
              {/* Header spacer matching month row */}
              <div style={{ height: 36, borderBottom: "1px solid #ebebeb", backgroundColor: "#fafafa", display: "flex", alignItems: "center", paddingLeft: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: "#9b9b9b" }}>Name</span>
              </div>
              {/* Rows */}
              <div style={{ overflowY: "auto", flex: 1 }}>
                {rows.map(({ item }) => {
                  const meta = TYPE_META[item.type];
                  const hasChildren = !!item.children?.length;
                  const isOpen = expanded.has(item.id);
                  return (
                    <div key={item.id}
                      style={{ height: ROW_H, display: "flex", alignItems: "center", borderBottom: "1px solid #f4f4f4", paddingLeft: 8 + meta.indent, paddingRight: 8 }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}>
                      <button onClick={() => hasChildren && toggle(item.id)}
                        style={{ width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: 4, color: "#b0b0b0", background: "none", border: "none", cursor: hasChildren ? "pointer" : "default", opacity: hasChildren ? 1 : 0 }}>
                        <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          {isOpen ? <path d="M2 3.5l3 3 3-3" /> : <path d="M3.5 2l3 3-3 3" />}
                        </svg>
                      </button>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: meta.dot, flexShrink: 0, marginRight: 6 }} />
                      <span style={{ fontSize: meta.fontSize, fontWeight: meta.bold ? 600 : 400, color: item.type === "task" ? "#6b6b6b" : "#0f0f0f", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right panel — scrollable timeline */}
            <div ref={timelineRef} style={{ flex: 1, overflowX: "auto", overflowY: "auto", position: "relative" }}>
              <div style={{ width: timelineWidth, minWidth: "100%", position: "relative" }}>

                {/* Month headers */}
                <div style={{ display: "flex", height: 36, borderBottom: "1px solid #ebebeb", backgroundColor: "#fafafa", position: "sticky", top: 0, zIndex: 1 }}>
                  {months.map((m) => {
                    const days = daysInMonth(m.year, m.month);
                    const w = days * DAY_W;
                    const monthStart = daysFrom(originDate, new Date(m.year, m.month, 1)) * DAY_W;
                    return (
                      <div key={`${m.year}-${m.month}`}
                        style={{ position: "absolute", left: monthStart, width: w, height: 36, display: "flex", alignItems: "center", paddingLeft: 8, borderRight: "1px solid #f0f0f0" }}>
                        <span style={{ fontSize: 11, fontWeight: 500, color: "#9b9b9b", letterSpacing: "0.3px" }}>
                          {m.label} {m.year !== 2026 ? m.year : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Grid lines + bars */}
                <div style={{ position: "relative" }}>
                  {/* Month vertical grid lines */}
                  {months.map((m) => {
                    const monthStart = daysFrom(originDate, new Date(m.year, m.month, 1)) * DAY_W;
                    return (
                      <div key={`g-${m.year}-${m.month}`}
                        style={{ position: "absolute", left: monthStart, top: 0, bottom: 0, width: 1, backgroundColor: "#f4f4f4", pointerEvents: "none" }} />
                    );
                  })}

                  {/* Today line */}
                  {todayX >= 0 && todayX <= timelineWidth && (
                    <div style={{ position: "absolute", left: todayX, top: 0, bottom: 0, width: 1, backgroundColor: "#6366f1", zIndex: 2, pointerEvents: "none" }}>
                      <div style={{ position: "absolute", top: 0, left: -16, backgroundColor: "#6366f1", color: "#fff", fontSize: 10, fontWeight: 600, padding: "1px 5px", borderRadius: 3, whiteSpace: "nowrap" }}>
                        {today.toLocaleDateString("en", { month: "short", day: "numeric" }).toUpperCase()}
                      </div>
                    </div>
                  )}

                  {/* Rows with bars */}
                  {rows.map(({ item }) => {
                    const meta = TYPE_META[item.type];
                    const barStart = daysFrom(originDate, item.startDate) * DAY_W;
                    const barWidth = Math.max((daysFrom(originDate, item.dueDate) - daysFrom(originDate, item.startDate)) * DAY_W, 6);
                    const barH = item.type === "initiative" ? 14 : item.type === "epic" ? 12 : item.type === "story" ? 10 : 8;
                    const barRadius = item.type === "initiative" ? 4 : item.type === "epic" ? 3 : 3;

                    return (
                      <div key={item.id}
                        style={{ height: ROW_H, position: "relative", borderBottom: "1px solid #f4f4f4", display: "flex", alignItems: "center" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}>

                        {/* Bar background (total duration) */}
                        <div style={{
                          position: "absolute", left: barStart, width: barWidth, height: barH,
                          backgroundColor: `${meta.bar}22`, borderRadius: barRadius, overflow: "hidden",
                        }}>
                          {/* Progress fill */}
                          <div style={{ height: "100%", width: `${item.progress}%`, backgroundColor: meta.bar, borderRadius: barRadius }} />
                        </div>

                        {/* Bar label (show for initiative & epic) */}
                        {(item.type === "initiative" || item.type === "epic") && barWidth > 40 && (
                          <span style={{
                            position: "absolute", left: barStart + 6, fontSize: 10, fontWeight: 600,
                            color: meta.bar, whiteSpace: "nowrap", pointerEvents: "none",
                            top: "50%", transform: "translateY(-50%)", lineHeight: 1,
                            marginTop: item.type === "initiative" ? 0 : 0,
                          }}>
                            {item.progress}%
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
