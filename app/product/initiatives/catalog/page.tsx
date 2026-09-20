"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { DisplayMedium, Eyebrow, Body } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { initiativeStore } from "@/lib/store/initiative-store";
import { requirementStore } from "@/lib/store/requirement-store";
import { pageStore } from "@/lib/store/page-store";
import { graphStore } from "@/lib/store/graph-store";
import type { FunctionalRequirement, UIFunctionality } from "@/lib/types/graph";

const SEED_INITIATIVES = [
  { name: "Riftbound Ticketing Portal", description: "The core ticketing application." },
  { name: "GateFlow - Access Control", description: "Access control integration inside Riftbound." },
  { name: "OneVenue Backoffice", description: "Reserved for future phase." },
];

const RIFTBOUND_SEED_REQUIREMENTS = [
  { area: "LAY", description: "The login page must display company branding and a single sign-on entry point", source: "Product Design", classification: "build" as const, prototypeView: "Login" },
  { area: "AUTH", description: "Users must authenticate via SSO before accessing any portal feature", source: "Security Policy", classification: "native" as const },
  { area: "TICK", description: "Users must be able to create, view, update, and close support tickets", source: "Business Requirements", classification: "build" as const, prototypeView: "Ticket List" },
];

const classificationStyles: Record<string, string> = {
  build: "bg-linear-accent/10 text-linear-accent border border-linear-accent/30",
  native: "bg-linear-surface-3 text-linear-text-muted border border-linear-hairline-2",
  out: "bg-linear-surface-2 text-linear-text-tertiary border border-linear-hairline-1 line-through",
};

function getWhereLabel(req: FunctionalRequirement): { label: string; link: string } | null {
  const allFuncs = graphStore.getNodesByType("UIFunctionality") as UIFunctionality[];
  const matching = allFuncs.filter((f) => f.requirementCode === req.code);
  if (matching.length === 0) return null;
  const page = pageStore.get(matching[0].pageId);
  return page ? { label: page.name, link: "/applications/riftbound-ticketing-portal" } : null;
}

function isRepresented(req: FunctionalRequirement): boolean {
  const allFuncs = graphStore.getNodesByType("UIFunctionality") as UIFunctionality[];
  return allFuncs.some((f) => f.requirementCode === req.code);
}

function CatalogContent() {
  const searchParams = useSearchParams();
  const highlightCode = searchParams.get("code") ?? "";

  const [requirements, setRequirements] = useState<FunctionalRequirement[]>([]);
  const [search, setSearch] = useState("");
  const [filterClassification, setFilterClassification] = useState<"all" | "build" | "out" | "native">("all");
  const [filterArea, setFilterArea] = useState("all");
  const [filterRepresented, setFilterRepresented] = useState<"all" | "yes" | "no">("all");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Seed initiatives
    const existing = initiativeStore.getAllInitiatives();
    const existingNames = new Set(existing.map((i) => i.name));
    for (const seed of SEED_INITIATIVES) {
      if (!existingNames.has(seed.name)) {
        initiativeStore.createInitiative(seed.name, seed.description);
      }
    }

    // Seed Riftbound requirements
    const allInitiatives = initiativeStore.getAllInitiatives();
    const riftbound = allInitiatives.find((i) => i.name === "Riftbound Ticketing Portal");
    if (riftbound) {
      const existingReqs = requirementStore.getRequirementsForInitiative(riftbound.id);
      if (existingReqs.length === 0) {
        for (const seed of RIFTBOUND_SEED_REQUIREMENTS) {
          requirementStore.createRequirement(riftbound.id, seed.area, seed.description, seed.source, seed.classification, undefined, seed.prototypeView);
        }
      }
    }

    setRequirements(requirementStore.getAllRequirements());
  }, []);

  const uniqueAreas = useMemo(() => {
    const areas = Array.from(new Set(requirements.map((r) => r.area.toUpperCase())));
    return areas.sort();
  }, [requirements]);

  const filtered = useMemo(() => {
    return requirements.filter((req) => {
      if (filterClassification !== "all" && req.classification !== filterClassification) return false;
      if (filterArea !== "all" && req.area.toUpperCase() !== filterArea) return false;
      const represented = isRepresented(req);
      if (filterRepresented === "yes" && !represented) return false;
      if (filterRepresented === "no" && represented) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!req.code.toLowerCase().includes(q) && !req.description.toLowerCase().includes(q) && !req.source.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [requirements, filterClassification, filterArea, filterRepresented, search]);

  const handleCopyMarkdown = async () => {
    const header = "| Code | Area | Description | Source | Classification | Represented |\n|------|------|-------------|--------|---------------|-------------|";
    const rows = filtered.map((req) => {
      const represented = isRepresented(req) ? "Yes" : "No";
      return `| ${req.code} | ${req.area} | ${req.description} | ${req.source} | ${req.classification} | ${represented} |`;
    });
    const markdown = [header, ...rows].join("\n");
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: ignore
    }
  };

  return (
    <div className="px-6 py-section">
      <div className="max-w-6xl mx-auto">
        <Link href="/product/initiatives" className="text-linear-text-tertiary text-sm hover:text-linear-text-muted mb-6 inline-block">
          ← Initiatives
        </Link>

        <Eyebrow className="text-linear-text-subtle mb-2">Product</Eyebrow>
        <DisplayMedium className="text-linear-text-ink mb-2">Requirements Catalog</DisplayMedium>
        <Body className="text-linear-text-muted mb-8">
          All functional requirements across initiatives. Click an FR tag in prototype views to jump here.
        </Body>

        {/* Search and filters */}
        <div className="flex flex-wrap gap-3 mb-4 items-center">
          <input
            type="text"
            placeholder="Search code, description, source…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-linear-surface-2 border border-linear-hairline-2 rounded-linear-md px-3 py-1.5 text-sm text-linear-text-ink placeholder-linear-text-tertiary focus:outline-none focus:ring-2 focus:ring-linear-accent flex-1 min-w-48"
          />

          <select
            value={filterClassification}
            onChange={(e) => setFilterClassification(e.target.value as typeof filterClassification)}
            className="bg-linear-surface-2 border border-linear-hairline-2 rounded-linear-md px-3 py-1.5 text-sm text-linear-text-ink focus:outline-none focus:ring-2 focus:ring-linear-accent"
          >
            <option value="all">All classifications</option>
            <option value="build">build</option>
            <option value="native">native</option>
            <option value="out">out</option>
          </select>

          <select
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
            className="bg-linear-surface-2 border border-linear-hairline-2 rounded-linear-md px-3 py-1.5 text-sm text-linear-text-ink focus:outline-none focus:ring-2 focus:ring-linear-accent"
          >
            <option value="all">All areas</option>
            {uniqueAreas.map((area) => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>

          <select
            value={filterRepresented}
            onChange={(e) => setFilterRepresented(e.target.value as typeof filterRepresented)}
            className="bg-linear-surface-2 border border-linear-hairline-2 rounded-linear-md px-3 py-1.5 text-sm text-linear-text-ink focus:outline-none focus:ring-2 focus:ring-linear-accent"
          >
            <option value="all">All (represented)</option>
            <option value="yes">Represented: Yes</option>
            <option value="no">Represented: No</option>
          </select>

          <Button variant="ghost" size="sm" onClick={handleCopyMarkdown}>
            {copied ? "Copied!" : "Copy as Markdown"}
          </Button>
        </div>

        <p className="text-xs text-linear-text-tertiary mb-4">
          {filtered.length} of {requirements.length} requirements
        </p>

        {/* Table */}
        <div className="border border-linear-hairline-2 rounded-linear-lg overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-linear-surface-1 border-b border-linear-hairline-2">
                <th className="text-left px-4 py-3 text-xs font-semibold text-linear-text-subtle uppercase tracking-wide">Code</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-linear-text-subtle uppercase tracking-wide">Area</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-linear-text-subtle uppercase tracking-wide">Description</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-linear-text-subtle uppercase tracking-wide">Source</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-linear-text-subtle uppercase tracking-wide">Classification</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-linear-text-subtle uppercase tracking-wide">Represented</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-linear-text-subtle uppercase tracking-wide">Where</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-linear-text-tertiary">
                    No requirements match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((req) => {
                  const represented = isRepresented(req);
                  const where = getWhereLabel(req);
                  const isHighlighted = req.code === highlightCode;
                  return (
                    <tr
                      key={req.id}
                      className={`border-b border-linear-hairline-1 last:border-0 transition-colors ${isHighlighted ? "bg-linear-accent/5" : "hover:bg-linear-surface-2"}`}
                    >
                      <td className="px-4 py-3">
                        <span className={`font-mono text-xs font-semibold text-linear-accent bg-linear-surface-3 px-2 py-0.5 rounded ${isHighlighted ? "ring-1 ring-linear-accent" : ""}`}>
                          {req.code}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-linear-text-muted font-mono">{req.area.toUpperCase()}</td>
                      <td className="px-4 py-3 text-linear-text-ink max-w-xs">{req.description}</td>
                      <td className="px-4 py-3 text-xs text-linear-text-tertiary">{req.source}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${classificationStyles[req.classification]}`}>
                          {req.classification}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {represented ? (
                          <span className="text-xs font-medium text-green-400">Yes</span>
                        ) : (
                          <span className="text-xs text-linear-text-tertiary">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {where ? (
                          <Link href={where.link} className="text-xs text-linear-accent hover:underline">
                            {where.label}
                          </Link>
                        ) : (
                          <span className="text-xs text-linear-text-tertiary">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="px-6 py-section text-linear-text-muted">Loading…</div>}>
      <CatalogContent />
    </Suspense>
  );
}
