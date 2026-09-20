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
  build: "bg-acid-lime/10 text-acid-lime border border-linear-accent/30",
  native: "bg-graphite text-mist border border-smoke",
  out: "bg-obsidian text-ash border border-graphite line-through",
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
    <div className="px-6 py-96">
      <div className="max-w-6xl mx-auto">
        <Link href="/product/initiatives" className="text-ash text-body-sm hover:text-mist mb-6 inline-block">
          ← Initiatives
        </Link>

        <Eyebrow className="text-fog mb-2">Product</Eyebrow>
        <DisplayMedium className="text-paper mb-2">Requirements Catalog</DisplayMedium>
        <Body className="text-mist mb-8">
          All functional requirements across initiatives. Click an FR tag in prototype views to jump here.
        </Body>

        {/* Search and filters */}
        <div className="flex flex-wrap gap-3 mb-4 items-center">
          <input
            type="text"
            placeholder="Search code, description, source…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-obsidian border border-smoke rounded-md px-3 py-1.5 text-body-sm text-paper placeholder-linear-text-tertiary focus:outline-none focus:ring-2 focus:ring-acid-lime flex-1 min-w-48"
          />

          <select
            value={filterClassification}
            onChange={(e) => setFilterClassification(e.target.value as typeof filterClassification)}
            className="bg-obsidian border border-smoke rounded-md px-3 py-1.5 text-body-sm text-paper focus:outline-none focus:ring-2 focus:ring-acid-lime"
          >
            <option value="all">All classifications</option>
            <option value="build">build</option>
            <option value="native">native</option>
            <option value="out">out</option>
          </select>

          <select
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
            className="bg-obsidian border border-smoke rounded-md px-3 py-1.5 text-body-sm text-paper focus:outline-none focus:ring-2 focus:ring-acid-lime"
          >
            <option value="all">All areas</option>
            {uniqueAreas.map((area) => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>

          <select
            value={filterRepresented}
            onChange={(e) => setFilterRepresented(e.target.value as typeof filterRepresented)}
            className="bg-obsidian border border-smoke rounded-md px-3 py-1.5 text-body-sm text-paper focus:outline-none focus:ring-2 focus:ring-acid-lime"
          >
            <option value="all">All (represented)</option>
            <option value="yes">Represented: Yes</option>
            <option value="no">Represented: No</option>
          </select>

          <Button variant="ghost" size="sm" onClick={handleCopyMarkdown}>
            {copied ? "Copied!" : "Copy as Markdown"}
          </Button>
        </div>

        <p className="text-xs text-ash mb-4">
          {filtered.length} of {requirements.length} requirements
        </p>

        {/* Table */}
        <div className="border border-smoke rounded-xl overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-carbon border-b border-smoke">
                <th className="text-left px-4 py-3 text-label font-w510 text-fog uppercase tracking-wide">Code</th>
                <th className="text-left px-4 py-3 text-label font-w510 text-fog uppercase tracking-wide">Area</th>
                <th className="text-left px-4 py-3 text-label font-w510 text-fog uppercase tracking-wide">Description</th>
                <th className="text-left px-4 py-3 text-label font-w510 text-fog uppercase tracking-wide">Source</th>
                <th className="text-left px-4 py-3 text-label font-w510 text-fog uppercase tracking-wide">Classification</th>
                <th className="text-left px-4 py-3 text-label font-w510 text-fog uppercase tracking-wide">Represented</th>
                <th className="text-left px-4 py-3 text-label font-w510 text-fog uppercase tracking-wide">Where</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-ash">
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
                      className={`border-b border-graphite last:border-0 transition-colors ${isHighlighted ? "bg-acid-lime/5" : "hover:bg-obsidian"}`}
                    >
                      <td className="px-4 py-3">
                        <span className={`font-mono text-label font-w510 text-acid-lime bg-graphite px-2 py-0.5 rounded ${isHighlighted ? "ring-1 ring-acid-lime" : ""}`}>
                          {req.code}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-label text-mist font-mono">{req.area.toUpperCase()}</td>
                      <td className="px-4 py-3 text-paper max-w-xs">{req.description}</td>
                      <td className="px-4 py-3 text-label text-ash">{req.source}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${classificationStyles[req.classification]}`}>
                          {req.classification}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {represented ? (
                          <span className="text-xs font-medium text-green-400">Yes</span>
                        ) : (
                          <span className="text-xs text-ash">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {where ? (
                          <Link href={where.link} className="text-xs text-acid-lime hover:underline">
                            {where.label}
                          </Link>
                        ) : (
                          <span className="text-xs text-ash">—</span>
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
    <Suspense fallback={<div className="px-6 py-96 text-mist">Loading…</div>}>
      <CatalogContent />
    </Suspense>
  );
}
