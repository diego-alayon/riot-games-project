import React from "react";

// ── Shared table primitives used across the design system ─────────────────────

export const COL_HEADER: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  color: "#9b9b9b",
  textAlign: "left",
  padding: "0 12px",
  height: 36,
  borderBottom: "1px solid #ebebeb",
  whiteSpace: "nowrap",
  userSelect: "none",
};

export const ROW_H = 36;

interface Column<T> {
  key: string;
  header: React.ReactNode;
  width?: number | string;
  render: (row: T, index: number) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  empty?: React.ReactNode;
  onRowClick?: (row: T) => void;
}

export function Table<T>({ columns, rows, rowKey, empty, onRowClick }: TableProps<T>) {
  return (
    <div style={{ border: "1px solid #ebebeb", borderRadius: 8, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <colgroup>
          {columns.map(col => (
            <col key={col.key} style={{ width: col.width ?? undefined }} />
          ))}
        </colgroup>
        <thead>
          <tr style={{ backgroundColor: "#fafafa" }}>
            {columns.map(col => (
              <th key={col.key} style={COL_HEADER}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} style={{ padding: "32px 12px", textAlign: "center", fontSize: 13, color: "#9b9b9b" }}>
                {empty ?? "No data."}
              </td>
            </tr>
          )}
          {rows.map((row, i) => (
            <tr
              key={rowKey(row)}
              style={{ borderBottom: "1px solid #f4f4f4", cursor: onRowClick ? "pointer" : undefined }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fafafa")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "")}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map(col => (
                <td key={col.key} style={{ padding: `0 12px`, height: ROW_H }}>
                  {col.render(row, i)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
