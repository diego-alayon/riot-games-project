"use client";

import React, { useState } from "react";

// ── Generic collapsible tree ──────────────────────────────────────────────────

export interface TreeNode {
  id: string;
  label: React.ReactNode;
  children?: TreeNode[];
  meta?: React.ReactNode; // right-side content (badges, counts)
}

interface TreeViewProps {
  nodes: TreeNode[];
  defaultOpen?: boolean;
  indent?: number; // px per level, default 16
}

function TreeItem({ node, depth, indent, defaultOpen }: { node: TreeNode; depth: number; indent: number; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen && depth < 2);
  const hasChildren = (node.children?.length ?? 0) > 0;

  return (
    <div>
      <div
        style={{ display: "flex", alignItems: "center", height: 32, paddingLeft: 12 + depth * indent, paddingRight: 12, cursor: hasChildren ? "pointer" : "default", borderBottom: "1px solid #f4f4f4" }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fafafa")}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "")}
        onClick={() => hasChildren && setOpen(o => !o)}
      >
        {/* Toggle chevron */}
        <span style={{ width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: 6, color: "#b0b0b0", opacity: hasChildren ? 1 : 0 }}>
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M2 3.5l3 3 3-3" /> : <path d="M3.5 2l3 3-3 3" />}
          </svg>
        </span>

        <span style={{ flex: 1, fontSize: 12, color: "#0f0f0f", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {node.label}
        </span>

        {node.meta && (
          <span style={{ fontSize: 11, color: "#9b9b9b", flexShrink: 0, marginLeft: 8 }}>
            {node.meta}
          </span>
        )}
      </div>

      {open && hasChildren && (
        <div>
          {node.children!.map(child => (
            <TreeItem key={child.id} node={child} depth={depth + 1} indent={indent} defaultOpen={defaultOpen} />
          ))}
        </div>
      )}
    </div>
  );
}

export function TreeView({ nodes, defaultOpen = true, indent = 16 }: TreeViewProps) {
  return (
    <div style={{ border: "1px solid #ebebeb", borderRadius: 8, overflow: "hidden" }}>
      {nodes.map(node => (
        <TreeItem key={node.id} node={node} depth={0} indent={indent} defaultOpen={defaultOpen} />
      ))}
    </div>
  );
}
