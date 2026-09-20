"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DisplayMedium, Eyebrow, Body } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Surface";
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

## Design System Assets

Linear design tokens are shipped as CSS custom properties in \`globals.css\` — no external font or CDN dependencies.
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
    <div className="px-6 py-section">
      <div className="max-w-4xl mx-auto">
        <Eyebrow className="text-linear-text-subtle mb-2">Product / Infrastructure</Eyebrow>
        <div className="flex items-start justify-between mb-6">
          <div>
            <DisplayMedium className="text-linear-text-ink mb-2">Infrastructure</DisplayMedium>
            <Body className="text-linear-text-muted">Deployment, environments, and operational documentation.</Body>
          </div>
          <Button variant="primary" size="sm" onClick={() => setShowEditor(!showEditor)}>
            {showEditor ? "Cancel" : "+ New Document"}
          </Button>
        </div>

        {showEditor && (
          <div className="mb-6">
            <DocumentEditor
              onSave={handleCreate}
              onCancel={() => setShowEditor(false)}
            />
          </div>
        )}

        <div className="space-y-3">
          {docs.map((doc) => (
            <Link key={doc.id} href={`/product/infrastructure/${doc.id}`}>
              <Card level={1} className="cursor-pointer hover:border-linear-hairline-3 transition-colors">
                <h3 className="text-base font-semibold text-linear-text-ink mb-1">{doc.title}</h3>
                <p className="text-sm text-linear-text-muted line-clamp-2">
                  {doc.content.replace(/^#.*/gm, "").trim().slice(0, 160)}
                </p>
                <p className="text-xs text-linear-text-tertiary mt-2">
                  {new Date(doc.updatedAt).toLocaleDateString()}
                </p>
              </Card>
            </Link>
          ))}

          {docs.length === 0 && !showEditor && (
            <Card level={1}>
              <p className="text-linear-text-tertiary text-center py-8 text-sm">
                No documents yet. Create one to get started.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
