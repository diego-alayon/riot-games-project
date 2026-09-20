"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DisplayMedium, Eyebrow, Body } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Surface";
import { initiativeStore } from "@/lib/store/initiative-store";
import { requirementStore } from "@/lib/store/requirement-store";
import { documentStore } from "@/lib/store/document-store";
import { graphStore } from "@/lib/store/graph-store";
import type { Initiative, FunctionalRequirement, Document, UIFunctionality } from "@/lib/types/graph";

const SEED_INITIATIVES = [
  { name: "Riftbound Ticketing Portal", description: "Core ticketing app." },
  { name: "GateFlow - Access Control", description: "Access control integration." },
  { name: "OneVenue Backoffice", description: "Reserved for future." },
];

interface ChainStep {
  label: string;
  value: string;
  href?: string;
  badge?: string;
}

export default function TraceabilityPage() {
  const [chain, setChain] = useState<ChainStep[]>([]);
  const [status, setStatus] = useState<"ok" | "partial" | "empty">("empty");

  useEffect(() => {
    // Ensure data is seeded
    const existing = initiativeStore.getAllInitiatives();
    const existingNames = new Set(existing.map((i) => i.name));
    for (const s of SEED_INITIATIVES) {
      if (!existingNames.has(s.name)) initiativeStore.createInitiative(s.name, s.description);
    }

    const riftbound = initiativeStore.getAllInitiatives().find((i: Initiative) => i.name === "Riftbound Ticketing Portal");
    if (!riftbound) return;

    // Seed requirements if needed
    if (requirementStore.getRequirementsForInitiative(riftbound.id).length === 0) {
      requirementStore.createRequirement(riftbound.id, "LAY", "The login page must display company branding and a single sign-on entry point", "Product Design", "build", undefined, "Login");
      requirementStore.createRequirement(riftbound.id, "AUTH", "Users must authenticate via SSO before accessing any portal feature", "Security Policy", "native");
      requirementStore.createRequirement(riftbound.id, "TICK", "Users must be able to create, view, update, and close support tickets", "Business Requirements", "build", undefined, "Ticket List");
    }

    // Seed architecture doc if needed
    if (documentStore.getDocumentsForSection("Architecture").length === 0) {
      documentStore.createDocument("Architecture", "System Overview", "Riftbound platform architecture overview.");
    }

    const reqs = requirementStore.getRequirementsForInitiative(riftbound.id);
    const layReq = reqs.find((r: FunctionalRequirement) => r.code.startsWith("FR-LAY"));

    if (!layReq) return;

    // Link architecture doc to FR-LAY-01 if not already linked
    const archDocs = documentStore.getDocumentsForSection("Architecture");
    const sysOverview = archDocs.find((d: Document) => d.title === "System Overview");
    if (sysOverview) {
      const alreadyLinked = requirementStore.getLinkedDocuments(layReq.id).some((d: Document) => d.id === sysOverview.id);
      if (!alreadyLinked) {
        try {
          requirementStore.linkToDocument(layReq.id, sysOverview.id);
        } catch {
          // ignore duplicate
        }
      }
    }

    // Find UIFunctionality for Login page that references FR-LAY
    const allFuncs = graphStore.getNodesByType("UIFunctionality") as UIFunctionality[];
    const loginFuncs = allFuncs.filter((f) => f.requirementCode === layReq.code);

    // Build the chain
    const steps: ChainStep[] = [
      {
        label: "Product",
        value: "Riot Games Project",
        href: "/product",
        badge: "Product",
      },
      {
        label: "Initiative",
        value: riftbound.name,
        href: `/product/initiatives/${riftbound.id}`,
        badge: "Initiative",
      },
      {
        label: "Functional Requirement",
        value: `${layReq.code}: ${layReq.description}`,
        href: `/product/initiatives/catalog?code=${layReq.code}`,
        badge: layReq.classification,
      },
    ];

    if (loginFuncs.length > 0) {
      steps.push({
        label: "UI Functionality",
        value: `${loginFuncs[0].name} (${loginFuncs[0].requirementCode})`,
        href: `/applications/riftbound-ticketing-portal`,
        badge: "UIFunctionality",
      });
    }

    if (sysOverview) {
      const archDocId = sysOverview.id;
      steps.push({
        label: "Documentation",
        value: sysOverview.title,
        href: `/product/architecture/${archDocId}`,
        badge: "Document",
      });
    }

    setChain(steps);
    setStatus(steps.length >= 5 ? "ok" : steps.length >= 3 ? "partial" : "empty");
  }, []);

  const badgeColor: Record<string, string> = {
    "Initiative": "bg-green-900/30 text-green-400 border-green-700/40",
    "Product": "bg-acid-lime/10 text-acid-lime border-linear-accent/30",
    "build": "bg-amber-900/20 text-amber-400 border-amber-700/30",
    "native": "bg-graphite text-mist border-smoke",
    "UIFunctionality": "bg-emerald-900/20 text-emerald-400 border-emerald-700/30",
    "Document": "bg-violet-900/20 text-violet-400 border-violet-700/30",
  };

  return (
    <div className="px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/product" className="text-ash text-body-sm hover:text-mist mb-6 inline-block">
          ← Product
        </Link>

        <Eyebrow className="text-fog mb-2">End-to-End</Eyebrow>
        <DisplayMedium className="text-paper mb-2">Traceability Chain</DisplayMedium>
        <Body className="text-mist mb-8">
          Full chain: Product → Initiative → Requirement → UI Functionality → Documentation.
          Click any step to navigate to that entity.
        </Body>

        <div
          className={`mb-8 p-4 rounded-md border text-caption font-mono ${
            status === "ok"
              ? "bg-obsidian border-pulse-green text-pulse-green"
              : status === "partial"
              ? "bg-obsidian border-amber-600 text-amber-400"
              : "bg-obsidian border-smoke text-ash"
          }`}
        >
          {status === "ok" && "✓ Full traceability chain verified — all 5 steps linked"}
          {status === "partial" && "⚠ Partial chain — some steps not yet linked (visit prototype and initiative pages to seed data)"}
          {status === "empty" && "○ No chain data found — visit /applications and /product/initiatives to seed"}
        </div>

        {/* Chain visualization */}
        <div className="space-y-2">
          {chain.map((step, i) => (
            <div key={i} className="flex items-stretch gap-3">
              {/* Connector line */}
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 mt-4 ${
                  status === "ok" ? "border-pulse-green bg-pulse-green" : "border-smoke bg-graphite"
                }`} />
                {i < chain.length - 1 && (
                  <div className="w-px flex-1 bg-linear-hairline-2 my-1" />
                )}
              </div>

              {/* Step card */}
              <div className="flex-1 mb-2">
                {step.href ? (
                  <Link href={step.href}>
                    <Card level={1} className="hover:border-smoke transition-colors cursor-pointer">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs text-ash mb-1">{step.label}</p>
                          <p className="text-body-sm text-paper">{step.value}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {step.badge && (
                            <span className={`text-xs px-2 py-0.5 rounded border ${badgeColor[step.badge] ?? "bg-graphite text-mist border-smoke"}`}>
                              {step.badge}
                            </span>
                          )}
                          <svg className="w-3.5 h-3.5 text-ash" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ) : (
                  <Card level={1}>
                    <p className="text-xs text-ash mb-1">{step.label}</p>
                    <p className="text-body-sm text-paper">{step.value}</p>
                  </Card>
                )}
              </div>
            </div>
          ))}
        </div>

        {chain.length === 0 && (
          <Card level={1}>
            <p className="text-ash text-center py-8 text-sm">
              Visit <Link href="/applications/riftbound-ticketing-portal" className="text-acid-lime hover:underline">/applications/riftbound-ticketing-portal</Link> and <Link href="/product/initiatives" className="text-acid-lime hover:underline">/product/initiatives</Link> first to seed the data.
            </p>
          </Card>
        )}

        {/* Bidirectional note */}
        {chain.length > 0 && (
          <div className="mt-8 p-4 bg-obsidian border border-smoke rounded-md">
            <p className="text-xs text-fog font-w510 uppercase tracking-wide mb-2">Bidirectional Navigation</p>
            <p className="text-body-sm text-mist">
              From any FR label in the prototype view → click to jump to catalog. From catalog → click requirement → initiative detail. From initiative → graph view at{" "}
              <Link href="/product/graph" className="text-acid-lime hover:underline">/product/graph</Link>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
