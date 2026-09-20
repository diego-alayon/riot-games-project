"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { initiativeStore } from "@/lib/store/initiative-store";
import { requirementStore } from "@/lib/store/requirement-store";
import type { Initiative } from "@/lib/types/graph";

const SEED_INITIATIVES = [
  { name: "Riftbound Ticketing Portal", description: "The core ticketing application for managing support requests and operations." },
  { name: "GateFlow - Access Control", description: "Access control integration layer inside Riftbound. No independent frontend." },
  { name: "OneVenue Backoffice", description: "Reserved for a future phase. Backoffice management for OneVenue operations." },
];

const ChevronRight = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 2.5l3.5 3.5-3.5 3.5" />
  </svg>
);

const InitIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 1.5l1.6 4.1H13l-3.6 2.6 1.4 4.1L7 9.7l-3.8 2.6 1.4-4.1L1 5.6h4.4L7 1.5z" />
  </svg>
);

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
    <div className="px-8 py-6">
      <div style={{ maxWidth: 720 }}>
        <span
          className="block mb-2"
          style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.4px", textTransform: "uppercase", color: "#9b9b9b" }}
        >
          Product
        </span>
        <div className="flex items-center justify-between mb-6">
          <h1 style={{ fontSize: 20, fontWeight: 510, color: "#0f0f0f", letterSpacing: "-0.24px", lineHeight: 1.3 }}>
            Initiatives
          </h1>
          <Link
            href="/product/initiatives/catalog"
            style={{ fontSize: 13, color: "#6b6b6b", textDecoration: "none" }}
          >
            Requirements Catalog →
          </Link>
        </div>

        <div style={{ border: "1px solid #ebebeb", borderRadius: 8, overflow: "hidden" }}>
          {initiatives.map((initiative, i) => {
            const reqCount = requirementStore.getRequirementsForInitiative(initiative.id).length;
            return (
              <Link
                key={initiative.id}
                href={`/product/initiatives/${initiative.id}`}
                className="flex items-center gap-3 px-4"
                style={{
                  height: 52,
                  borderTop: i > 0 ? "1px solid #f0f0f0" : undefined,
                  backgroundColor: "#ffffff",
                  textDecoration: "none",
                }}
              >
                <span style={{ color: "#9b9b9b", display: "flex", flexShrink: 0 }}>
                  <InitIcon />
                </span>
                <div className="flex-1 min-w-0">
                  <span style={{ fontSize: 14, fontWeight: 510, color: "#0f0f0f" }}>{initiative.name}</span>
                  <span
                    style={{ fontSize: 13, color: "#9b9b9b", marginLeft: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  >
                    {initiative.description}
                  </span>
                </div>
                <span style={{ fontSize: 12, color: "#9b9b9b", flexShrink: 0, marginRight: 8 }}>
                  {reqCount} req{reqCount !== 1 ? "s" : ""}
                </span>
                <span style={{ color: "#c4c4c4", display: "flex", flexShrink: 0 }}>
                  <ChevronRight />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
