"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DisplayMedium, Eyebrow, Body } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Surface";
import { initiativeStore } from "@/lib/store/initiative-store";
import { requirementStore } from "@/lib/store/requirement-store";
import type { Initiative } from "@/lib/types/graph";

const SEED_INITIATIVES = [
  { name: "Riftbound Ticketing Portal", description: "The core ticketing application for managing support requests and operations." },
  { name: "GateFlow - Access Control", description: "Access control integration layer inside Riftbound. No independent frontend." },
  { name: "OneVenue Backoffice", description: "Reserved for a future phase. Backoffice management for OneVenue operations." },
];

export default function InitiativesPage() {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);

  useEffect(() => {
    const existing = initiativeStore.getAllInitiatives();
    const existingNames = new Set(existing.map((i) => i.name));

    for (const seed of SEED_INITIATIVES) {
      if (!existingNames.has(seed.name)) {
        initiativeStore.createInitiative(seed.name, seed.description);
      }
    }

    setInitiatives(initiativeStore.getAllInitiatives());
  }, []);

  return (
    <div className="px-6 py-section">
      <div className="max-w-4xl mx-auto">
        <Eyebrow className="text-linear-text-subtle mb-2">Product</Eyebrow>
        <DisplayMedium className="text-linear-text-ink mb-4">Initiatives</DisplayMedium>
        <Body className="text-linear-text-muted mb-8">
          Product initiatives and their functional requirements.
        </Body>

        <div className="space-y-3">
          {initiatives.map((initiative) => {
            const reqCount = requirementStore.getRequirementsForInitiative(initiative.id).length;
            return (
              <Link key={initiative.id} href={`/product/initiatives/${initiative.id}`}>
                <Card level={1} className="hover:border-linear-hairline-3 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-linear-text-ink mb-1">
                        {initiative.name}
                      </h3>
                      <p className="text-sm text-linear-text-muted">{initiative.description}</p>
                    </div>
                    <div className="ml-4 flex items-center gap-2">
                      <span className="text-xs text-linear-text-tertiary">
                        {reqCount} requirement{reqCount !== 1 ? "s" : ""}
                      </span>
                      <svg className="w-4 h-4 text-linear-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
