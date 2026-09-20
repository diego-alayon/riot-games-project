"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DisplayMedium, Eyebrow, Body } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { graphStore } from "@/lib/store/graph-store";
import { initiativeStore } from "@/lib/store/initiative-store";
import { requirementStore } from "@/lib/store/requirement-store";
import { documentStore } from "@/lib/store/document-store";
import { componentStore } from "@/lib/store/component-store";
import type { GraphNode, NodeType } from "@/lib/types/graph";
import type { GraphLink, LinkType } from "@/lib/types/links";

// Node type color map (Linear palette)
const NODE_COLORS: Record<NodeType, string> = {
  Product: "#5e6ad2",
  Section: "#7c6af5",
  Initiative: "#27a644",
  FunctionalRequirement: "#f59e0b",
  Prototype: "#3b82f6",
  Page: "#60a5fa",
  UIFunctionality: "#34d399",
  Document: "#a78bfa",
  Component: "#f472b6",
  DesignSystem: "#94a3b8",
};

const LINK_COLORS: Record<LinkType, string> = {
  "implements": "#f472b6",
  "documented-by": "#a78bfa",
  "depends-on": "#94a3b8",
  "integrates-with": "#3b82f6",
  "belongs-to": "#4b5563",
};

const NODE_TYPES: NodeType[] = [
  "Initiative", "FunctionalRequirement", "Document", "Component",
  "Prototype", "Page", "UIFunctionality", "DesignSystem",
];

const LINK_TYPES: LinkType[] = ["implements", "documented-by", "depends-on", "integrates-with", "belongs-to"];

interface LayoutNode {
  node: GraphNode;
  x: number;
  y: number;
  label: string;
}

function getNodeLabel(node: GraphNode): string {
  switch (node.type) {
    case "Initiative": return node.name;
    case "FunctionalRequirement": return node.code;
    case "Document": return node.title;
    case "Component": return node.name;
    case "Prototype": return node.name;
    case "Page": return node.name;
    case "UIFunctionality": return node.name;
    case "DesignSystem": return node.name;
    default: return node.id.slice(0, 8);
  }
}

function getNodeRoute(node: GraphNode): string | null {
  switch (node.type) {
    case "Initiative": return `/product/initiatives/${node.id}`;
    case "FunctionalRequirement": return `/product/initiatives/catalog?code=${node.code}`;
    case "Document": return `/product/${node.sectionName.toLowerCase()}/${node.id}`;
    case "Prototype": return `/applications/riftbound-ticketing-portal`;
    default: return null;
  }
}

// Simple force-free layout: arrange nodes in rows by type
function layoutNodes(nodes: GraphNode[]): LayoutNode[] {
  const byType: Partial<Record<NodeType, GraphNode[]>> = {};
  for (const n of nodes) {
    if (!byType[n.type]) byType[n.type] = [];
    byType[n.type]!.push(n);
  }

  const result: LayoutNode[] = [];
  let row = 0;
  for (const type of NODE_TYPES) {
    const group = byType[type] ?? [];
    group.forEach((n, i) => {
      result.push({
        node: n,
        x: 80 + i * 160,
        y: 60 + row * 110,
        label: getNodeLabel(n),
      });
    });
    if (group.length > 0) row++;
  }
  return result;
}

export default function GraphPage() {
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);

  const [allNodes, setAllNodes] = useState<GraphNode[]>([]);
  const [allLinks, setAllLinks] = useState<GraphLink[]>([]);
  const [selectedNodeTypes, setSelectedNodeTypes] = useState<Set<NodeType>>(new Set(NODE_TYPES));
  const [selectedLinkTypes, setSelectedLinkTypes] = useState<Set<LinkType>>(new Set(LINK_TYPES));
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    // Seed data like other pages
    const existing = initiativeStore.getAllInitiatives();
    const existingNames = new Set(existing.map((i) => i.name));
    const SEED_INITIATIVES = [
      { name: "Riftbound Ticketing Portal", description: "Core ticketing app." },
      { name: "GateFlow - Access Control", description: "Access control integration." },
      { name: "OneVenue Backoffice", description: "Reserved for future." },
    ];
    for (const s of SEED_INITIATIVES) {
      if (!existingNames.has(s.name)) initiativeStore.createInitiative(s.name, s.description);
    }

    const riftbound = initiativeStore.getAllInitiatives().find((i) => i.name === "Riftbound Ticketing Portal");
    if (riftbound && requirementStore.getRequirementsForInitiative(riftbound.id).length === 0) {
      requirementStore.createRequirement(riftbound.id, "LAY", "Login page branding and SSO entry point", "Product Design", "build", undefined, "Login");
      requirementStore.createRequirement(riftbound.id, "AUTH", "SSO authentication before access", "Security Policy", "native");
      requirementStore.createRequirement(riftbound.id, "TICK", "Create, view, update, close tickets", "Business Requirements", "build", undefined, "Ticket List");
    }

    // Seed docs
    if (documentStore.getDocumentsForSection("Architecture").length === 0) {
      documentStore.createDocument("Architecture", "System Overview", "Riftbound platform architecture overview.");
    }

    // Load all nodes and links
    const nodes: GraphNode[] = [];
    for (const type of NODE_TYPES) {
      nodes.push(...graphStore.getNodesByType(type) as GraphNode[]);
    }
    setAllNodes(nodes);

    // Extract links — iterate all nodes and get links from each
    const linkMap = new Map<string, GraphLink>();
    for (const n of nodes) {
      for (const lt of LINK_TYPES) {
        for (const l of graphStore.getLinksFrom(n.id, lt)) {
          linkMap.set(l.id, l);
        }
      }
    }
    setAllLinks(Array.from(linkMap.values()));
  }, []);

  const toggleNodeType = (type: NodeType) => {
    setSelectedNodeTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const toggleLinkType = (type: LinkType) => {
    setSelectedLinkTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const filteredNodes = useMemo(
    () => allNodes.filter((n) => selectedNodeTypes.has(n.type)),
    [allNodes, selectedNodeTypes]
  );

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);

  const filteredLinks = useMemo(
    () => allLinks.filter(
      (l) => selectedLinkTypes.has(l.type) && filteredNodeIds.has(l.sourceId) && filteredNodeIds.has(l.targetId)
    ),
    [allLinks, selectedLinkTypes, filteredNodeIds]
  );

  const layoutedNodes = useMemo(() => layoutNodes(filteredNodes), [filteredNodes]);
  const nodePositions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    for (const ln of layoutedNodes) map.set(ln.node.id, { x: ln.x, y: ln.y });
    return map;
  }, [layoutedNodes]);

  const svgWidth = Math.max(800, Math.max(...layoutedNodes.map((n) => n.x + 80)));
  const svgHeight = Math.max(400, Math.max(...layoutedNodes.map((n) => n.y + 80)));

  const handleNodeClick = (node: GraphNode) => {
    const route = getNodeRoute(node);
    if (route) router.push(route);
  };

  const connectedIds = useMemo(() => {
    if (!hoveredId) return new Set<string>();
    const ids = new Set<string>([hoveredId]);
    for (const l of filteredLinks) {
      if (l.sourceId === hoveredId) ids.add(l.targetId);
      if (l.targetId === hoveredId) ids.add(l.sourceId);
    }
    return ids;
  }, [hoveredId, filteredLinks]);

  return (
    <div className="px-6 py-96">
      <div className="max-w-6xl mx-auto">
        <Link href="/product" className="text-ash text-body-sm hover:text-mist mb-6 inline-block">
          ← Product
        </Link>

        <Eyebrow className="text-fog mb-2">Product</Eyebrow>
        <DisplayMedium className="text-paper mb-2">Knowledge Graph</DisplayMedium>
        <Body className="text-mist mb-6">
          Visual map of all entities and their relationships. Click a node to navigate.
        </Body>

        {/* Filters */}
        <div className="mb-4 space-y-3">
          <div>
            <p className="text-xs font-w510 text-fog uppercase tracking-wide mb-2">Node Types</p>
            <div className="flex flex-wrap gap-2">
              {NODE_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleNodeType(type)}
                  className={`text-xs px-3 py-1 rounded-full border transition-all ${
                    selectedNodeTypes.has(type)
                      ? "border-transparent text-white"
                      : "border-smoke text-ash bg-transparent"
                  }`}
                  style={selectedNodeTypes.has(type) ? { backgroundColor: NODE_COLORS[type] } : {}}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-w510 text-fog uppercase tracking-wide mb-2">Link Types</p>
            <div className="flex flex-wrap gap-2">
              {LINK_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleLinkType(type)}
                  className={`text-xs px-3 py-1 rounded-full border transition-all ${
                    selectedLinkTypes.has(type)
                      ? "text-white border-transparent"
                      : "border-smoke text-ash bg-transparent"
                  }`}
                  style={selectedLinkTypes.has(type) ? { backgroundColor: LINK_COLORS[type] } : {}}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mb-4 flex flex-wrap gap-3">
          {NODE_TYPES.filter((t) => selectedNodeTypes.has(t)).map((type) => (
            <div key={type} className="flex items-center gap-1.5 text-label text-ash">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: NODE_COLORS[type] }} />
              {type}
            </div>
          ))}
        </div>

        {/* SVG Graph */}
        <div className="border border-smoke rounded-xl overflow-auto bg-carbon">
          <svg
            ref={svgRef}
            width={svgWidth}
            height={svgHeight}
            className="block"
          >
            <defs>
              {LINK_TYPES.map((lt) => (
                <marker
                  key={lt}
                  id={`arrow-${lt}`}
                  markerWidth="8"
                  markerHeight="8"
                  refX="6"
                  refY="3"
                  orient="auto"
                >
                  <path d="M0,0 L0,6 L8,3 z" fill={LINK_COLORS[lt]} opacity="0.7" />
                </marker>
              ))}
            </defs>

            {/* Links */}
            {filteredLinks.map((link) => {
              const src = nodePositions.get(link.sourceId);
              const tgt = nodePositions.get(link.targetId);
              if (!src || !tgt) return null;
              const isConnected = hoveredId ? connectedIds.has(link.sourceId) && connectedIds.has(link.targetId) : true;
              return (
                <line
                  key={link.id}
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke={LINK_COLORS[link.type]}
                  strokeWidth={isConnected ? 1.5 : 0.5}
                  opacity={isConnected ? 0.7 : 0.15}
                  markerEnd={`url(#arrow-${link.type})`}
                />
              );
            })}

            {/* Nodes */}
            {layoutedNodes.map(({ node, x, y, label }) => {
              const color = NODE_COLORS[node.type];
              const isHovered = hoveredId === node.id;
              const isDimmed = hoveredId && !connectedIds.has(node.id);
              const hasRoute = !!getNodeRoute(node);
              return (
                <g
                  key={node.id}
                  transform={`translate(${x},${y})`}
                  onMouseEnter={() => setHoveredId(node.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => handleNodeClick(node)}
                  style={{ cursor: hasRoute ? "pointer" : "default", opacity: isDimmed ? 0.3 : 1 }}
                >
                  <circle
                    r={isHovered ? 22 : 18}
                    fill={color}
                    opacity={isHovered ? 1 : 0.85}
                    stroke={isHovered ? "#fff" : "transparent"}
                    strokeWidth={2}
                  />
                  <text
                    textAnchor="middle"
                    dy="30"
                    fontSize="9"
                    fill="#9ca3af"
                    className="pointer-events-none"
                  >
                    {label.length > 14 ? label.slice(0, 13) + "…" : label}
                  </text>
                  {isHovered && hasRoute && (
                    <text
                      textAnchor="middle"
                      dy="-26"
                      fontSize="8"
                      fill="#5e6ad2"
                      className="pointer-events-none"
                    >
                      click to open
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <p className="text-xs text-ash mt-3">
          {filteredNodes.length} nodes · {filteredLinks.length} links · Hover to highlight connections
        </p>
      </div>
    </div>
  );
}
