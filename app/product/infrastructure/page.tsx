"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { DocumentEditor } from "@/components/product/DocumentEditor";
import { documentStore } from "@/lib/store/document-store";
import type { Document } from "@/lib/types/graph";

const SECTION = "Infrastructure" as const;

function seedInfrastructure() {
  const existing = documentStore.getDocumentsForSection(SECTION);
  if (existing.length === 0) {
    documentStore.createDocument(
      SECTION,
      "Deployment Architecture",
      `# Deployment Architecture

## Overview

The Riftbound Ticketing Portal is deployed as a Next.js application on Vercel, leveraging edge-optimized delivery and serverless compute.

## Environments

| Environment | Purpose |
|-------------|---------|
| Development | Local dev with \`next dev --turbopack\` |
| Preview | Auto-deployed per PR via Vercel |
| Production | Main branch deploys to production |

## Runtime

- **Node.js 20.19+** (via nvm)
- **Next.js 16** with App Router and Turbopack
- **TypeScript 7** strict mode

## Data Storage

Currently using in-memory graph store (client-side singleton). No persistent backend is required for the prototyping phase.
`
    );
  }
}

export default function InfrastructurePage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [showEditor, setShowEditor] = useState(false);

  const load = () => setDocs(documentStore.getDocumentsForSection(SECTION));

  useEffect(() => {
    seedInfrastructure();
    load();
  }, []);

  const handleCreate = (title: string, content: string) => {
    documentStore.createDocument(SECTION, title, content);
    load();
    setShowEditor(false);
  };

  return (
    <div className="px-8 py-6">
      <div style={{ maxWidth: 720 }}>
        <span
          className="block mb-2"
          style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.4px", textTransform: "uppercase", color: "#9b9b9b" }}
        >
          Product / Infrastructure
        </span>
        <div className="flex items-center justify-between mb-6">
          <h1 style={{ fontSize: 20, fontWeight: 510, color: "#0f0f0f", letterSpacing: "-0.24px", lineHeight: 1.3 }}>
            Infrastructure
          </h1>
          <Button variant="secondary" size="sm" onClick={() => setShowEditor(!showEditor)}>
            {showEditor ? "Cancel" : "+ New Document"}
          </Button>
        </div>

        {showEditor && (
          <div className="mb-6">
            <DocumentEditor onSave={handleCreate} onCancel={() => setShowEditor(false)} />
          </div>
        )}

        <div style={{ border: "1px solid #ebebeb", borderRadius: 8, overflow: "hidden" }}>
          {docs.map((doc, i) => (
            <Link
              key={doc.id}
              href={`/product/infrastructure/${doc.id}`}
              className="flex items-center gap-4 px-4"
              style={{
                height: 52,
                borderTop: i > 0 ? "1px solid #f0f0f0" : undefined,
                backgroundColor: "#ffffff",
                textDecoration: "none",
              }}
            >
              <div className="flex-1 min-w-0">
                <span style={{ fontSize: 14, fontWeight: 510, color: "#0f0f0f", display: "block" }}>{doc.title}</span>
                <span
                  style={{ fontSize: 13, color: "#9b9b9b", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                >
                  {doc.content.replace(/^#.*/gm, "").trim().slice(0, 80)}
                </span>
              </div>
              <span style={{ fontSize: 12, color: "#9b9b9b", flexShrink: 0 }}>
                {new Date(doc.updatedAt).toLocaleDateString()}
              </span>
            </Link>
          ))}

          {docs.length === 0 && !showEditor && (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <p style={{ fontSize: 14, color: "#9b9b9b" }}>No documents yet.</p>
              <Button variant="secondary" size="sm" onClick={() => setShowEditor(true)}>
                Create first document
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
