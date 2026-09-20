"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { DisplayMedium, Eyebrow, Body } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Surface";
import { Button } from "@/components/ui/Button";
import { RequirementEditor } from "@/components/product/RequirementEditor";
import { RequirementLinkEditor } from "@/components/product/RequirementLinkEditor";
import { initiativeStore } from "@/lib/store/initiative-store";
import { requirementStore } from "@/lib/store/requirement-store";
import type { Initiative, FunctionalRequirement } from "@/lib/types/graph";

const RIFTBOUND_SEED_REQUIREMENTS = [
  {
    area: "LAY",
    description: "The login page must display company branding and a single sign-on entry point",
    source: "Product Design",
    classification: "build" as const,
    prototypeView: "Login",
  },
  {
    area: "AUTH",
    description: "Users must authenticate via SSO before accessing any portal feature",
    source: "Security Policy",
    classification: "native" as const,
  },
  {
    area: "TICK",
    description: "Users must be able to create, view, update, and close support tickets",
    source: "Business Requirements",
    classification: "build" as const,
    prototypeView: "Ticket List",
  },
];

const classificationStyles: Record<string, string> = {
  build: "bg-acid-lime/10 text-acid-lime border border-linear-accent/30",
  native: "bg-graphite text-mist border border-smoke",
  out: "bg-obsidian text-ash border border-graphite line-through",
};

export default function InitiativeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [initiative, setInitiative] = useState<Initiative | undefined>();
  const [requirements, setRequirements] = useState<FunctionalRequirement[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [expandedReqs, setExpandedReqs] = useState<Set<string>>(new Set());

  const toggleExpand = (reqId: string) => {
    setExpandedReqs((prev) => {
      const next = new Set(prev);
      if (next.has(reqId)) next.delete(reqId);
      else next.add(reqId);
      return next;
    });
  };

  useEffect(() => {
    const found = initiativeStore.getInitiative(id);
    setInitiative(found);

    if (found) {
      // Seed requirements for Riftbound
      const existing = requirementStore.getRequirementsForInitiative(id);
      if (found.name === "Riftbound Ticketing Portal" && existing.length === 0) {
        for (const seed of RIFTBOUND_SEED_REQUIREMENTS) {
          requirementStore.createRequirement(
            id,
            seed.area,
            seed.description,
            seed.source,
            seed.classification,
            undefined,
            seed.prototypeView
          );
        }
      }
      setRequirements(requirementStore.getRequirementsForInitiative(id));
    }
  }, [id]);

  const handleSaveRequirement = (data: {
    area: string;
    description: string;
    source: string;
    classification: "build" | "out" | "native";
    implementationNote?: string;
    prototypeView?: string;
  }) => {
    requirementStore.createRequirement(
      id,
      data.area,
      data.description,
      data.source,
      data.classification,
      data.implementationNote,
      data.prototypeView
    );
    setRequirements(requirementStore.getRequirementsForInitiative(id));
    setShowEditor(false);
  };

  if (!initiative) {
    return (
      <div className="px-6 py-96">
        <div className="max-w-4xl mx-auto">
          <p className="text-mist">Initiative not found.</p>
          <Link href="/product/initiatives" className="text-acid-lime text-body-sm mt-4 inline-block hover:underline">
            ← Back to Initiatives
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-96">
      <div className="max-w-4xl mx-auto">
        <Link href="/product/initiatives" className="text-ash text-body-sm hover:text-mist mb-6 inline-block">
          ← Initiatives
        </Link>

        <Eyebrow className="text-fog mb-2">Initiative</Eyebrow>
        <DisplayMedium className="text-paper mb-2">{initiative.name}</DisplayMedium>
        <Body className="text-mist mb-8">{initiative.description}</Body>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-w510 text-paper">
            Requirements
            <span className="ml-2 text-body-sm font-normal text-ash">
              ({requirements.length})
            </span>
          </h3>
          <Button variant="primary" size="sm" onClick={() => setShowEditor(!showEditor)}>
            {showEditor ? "Cancel" : "+ Add Requirement"}
          </Button>
        </div>

        {showEditor && (
          <div className="mb-6">
            <RequirementEditor onSave={handleSaveRequirement} onCancel={() => setShowEditor(false)} />
          </div>
        )}

        {requirements.length === 0 ? (
          <Card level={1}>
            <p className="text-ash text-center py-8 text-sm">
              No requirements yet. Add the first one.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {requirements.map((req) => {
              const isExpanded = expandedReqs.has(req.id);
              return (
                <Card key={req.id} level={1}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-label font-w510 text-acid-lime bg-graphite px-2 py-0.5 rounded">
                          {req.code}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-medium ${classificationStyles[req.classification]}`}
                        >
                          {req.classification}
                        </span>
                        {req.prototypeView && (
                          <span className="text-xs text-ash border border-graphite px-2 py-0.5 rounded">
                            view: {req.prototypeView}
                          </span>
                        )}
                      </div>
                      <p className="text-body-sm text-paper mt-1">{req.description}</p>
                      <p className="text-xs text-ash">Source: {req.source}</p>
                      {req.implementationNote && (
                        <p className="text-xs text-mist italic mt-1">{req.implementationNote}</p>
                      )}
                    </div>
                    <button
                      onClick={() => toggleExpand(req.id)}
                      className="text-ash hover:text-mist transition-colors p-1 flex-shrink-0"
                      aria-label={isExpanded ? "Collapse" : "Expand"}
                    >
                      <svg
                        className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  {isExpanded && (
                    <RequirementLinkEditor requirementId={req.id} />
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
