"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DisplayMedium, Eyebrow, Body } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Surface";
import { DocumentEditor } from "@/components/product/DocumentEditor";
import { documentStore } from "@/lib/store/document-store";
import type { Document } from "@/lib/types/graph";

const SECTION = "Architecture" as const;

function seedArchitecture() {
  const existing = documentStore.getDocumentsForSection(SECTION);
  if (existing.length === 0) {
    documentStore.createDocument(
      SECTION,
      "System Overview",
      `# Riftbound Platform — System Overview

## Architecture Summary

The Riftbound Ticketing Portal is a web-based application built on a modern frontend stack (Next.js 16, React 19, TypeScript). It provides ticket lifecycle management for Riot Games internal teams.

## Core Modules

- **Shell**: Navigation, routing, and global design system (Linear)
- **Applications**: Prototype studio — Riftbound Ticketing Portal is the only active frontend prototype
- **Product Knowledge Base**: Architecture, Infrastructure, Initiatives, and Requirements catalog

## Key Design Decisions

- All UI components follow the Linear design system (canvas #010102, accent #5e6ad2)
- Graph-based in-memory data model with typed links for full traceability
- GateFlow Access Control integrates within Riftbound as a backend service — no separate frontend

## External Integrations

| System | Role |
|--------|------|
| GateFlow | Access control layer (backend integration) |
`
    );
  }
}

export default function ArchitecturePage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [showEditor, setShowEditor] = useState(false);

  const load = () => setDocs(documentStore.getDocumentsForSection(SECTION));

  useEffect(() => {
    seedArchitecture();
    load();
  }, []);

  const handleCreate = (title: string, content: string) => {
    documentStore.createDocument(SECTION, title, content);
    load();
    setShowEditor(false);
  };

  return (
    <div className="px-6 py-96">
      <div className="max-w-4xl mx-auto">
        <Eyebrow className="text-fog mb-2">Product / Architecture</Eyebrow>
        <div className="flex items-start justify-between mb-6">
          <div>
            <DisplayMedium className="text-paper mb-2">Architecture</DisplayMedium>
            <Body className="text-mist">Technical architecture documentation and decisions.</Body>
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
            <Link key={doc.id} href={`/product/architecture/${doc.id}`}>
              <Card level={1} className="cursor-pointer hover:border-smoke transition-colors">
                <h3 className="text-base font-w510 text-paper mb-1">{doc.title}</h3>
                <p className="text-body-sm text-mist line-clamp-2">
                  {doc.content.replace(/^#.*/gm, "").trim().slice(0, 160)}
                </p>
                <p className="text-xs text-ash mt-2">
                  {new Date(doc.updatedAt).toLocaleDateString()}
                </p>
              </Card>
            </Link>
          ))}

          {docs.length === 0 && !showEditor && (
            <Card level={1}>
              <p className="text-ash text-center py-8 text-sm">
                No documents yet. Create one to get started.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
