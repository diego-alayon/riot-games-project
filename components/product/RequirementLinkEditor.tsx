"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { requirementStore } from "@/lib/store/requirement-store";
import { documentStore } from "@/lib/store/document-store";
import { componentStore } from "@/lib/store/component-store";
import type { Document, Component } from "@/lib/types/graph";

interface RequirementLinkEditorProps {
  requirementId: string;
  onLinksChanged?: () => void;
}

export function RequirementLinkEditor({ requirementId, onLinksChanged }: RequirementLinkEditorProps) {
  const [linkedDocs, setLinkedDocs] = useState<Document[]>([]);
  const [linkedComps, setLinkedComps] = useState<Component[]>([]);
  const [availableDocs, setAvailableDocs] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState("");
  const [newCompName, setNewCompName] = useState("");
  const [newCompDesc, setNewCompDesc] = useState("");

  const reload = () => {
    setLinkedDocs(requirementStore.getLinkedDocuments(requirementId));
    setLinkedComps(requirementStore.getLinkedComponents(requirementId));
    const allDocs = [
      ...documentStore.getDocumentsForSection("Architecture"),
      ...documentStore.getDocumentsForSection("Infrastructure"),
    ];
    setAvailableDocs(allDocs);
  };

  useEffect(() => {
    reload();
  }, [requirementId]);

  const handleLinkDoc = () => {
    if (!selectedDocId) return;
    try {
      requirementStore.linkToDocument(requirementId, selectedDocId);
      setSelectedDocId("");
      reload();
      onLinksChanged?.();
    } catch {
      // already linked or error — ignore
    }
  };

  const handleCreateAndLinkComp = () => {
    if (!newCompName.trim()) return;
    try {
      const comp = componentStore.createComponent(newCompName.trim(), newCompDesc.trim());
      requirementStore.linkToComponent(requirementId, comp.id);
      setNewCompName("");
      setNewCompDesc("");
      reload();
      onLinksChanged?.();
    } catch {
      // ignore
    }
  };

  const unlinkedDocs = availableDocs.filter(
    (d) => !linkedDocs.some((ld) => ld.id === d.id)
  );

  return (
    <div className="space-y-4 pt-3 border-t border-linear-hairline-1">
      {/* Linked Documents */}
      <div>
        <p className="text-xs font-semibold text-linear-text-subtle uppercase tracking-wide mb-2">Linked Documents</p>
        {linkedDocs.length === 0 ? (
          <p className="text-xs text-linear-text-tertiary">None</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {linkedDocs.map((doc) => (
              <span
                key={doc.id}
                className="text-xs bg-linear-surface-3 border border-linear-hairline-2 px-2 py-0.5 rounded text-linear-text-muted"
              >
                {doc.title} <span className="text-linear-text-tertiary">({doc.sectionName})</span>
              </span>
            ))}
          </div>
        )}

        {unlinkedDocs.length > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="bg-linear-surface-2 border border-linear-hairline-2 rounded-linear-md px-2 py-1 text-xs text-linear-text-ink focus:outline-none focus:ring-1 focus:ring-linear-accent"
            >
              <option value="">Select a document…</option>
              {unlinkedDocs.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.title} ({doc.sectionName})
                </option>
              ))}
            </select>
            <Button variant="ghost" size="sm" onClick={handleLinkDoc} disabled={!selectedDocId}>
              Add Link
            </Button>
          </div>
        )}
      </div>

      {/* Linked Components */}
      <div>
        <p className="text-xs font-semibold text-linear-text-subtle uppercase tracking-wide mb-2">Linked Components</p>
        {linkedComps.length === 0 ? (
          <p className="text-xs text-linear-text-tertiary">None</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {linkedComps.map((comp) => (
              <span
                key={comp.id}
                className="text-xs bg-linear-surface-3 border border-linear-hairline-2 px-2 py-0.5 rounded text-linear-text-muted"
              >
                {comp.name}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <input
            type="text"
            placeholder="Component name…"
            value={newCompName}
            onChange={(e) => setNewCompName(e.target.value)}
            className="bg-linear-surface-2 border border-linear-hairline-2 rounded-linear-md px-2 py-1 text-xs text-linear-text-ink placeholder-linear-text-tertiary focus:outline-none focus:ring-1 focus:ring-linear-accent"
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newCompDesc}
            onChange={(e) => setNewCompDesc(e.target.value)}
            className="bg-linear-surface-2 border border-linear-hairline-2 rounded-linear-md px-2 py-1 text-xs text-linear-text-ink placeholder-linear-text-tertiary focus:outline-none focus:ring-1 focus:ring-linear-accent flex-1"
          />
          <Button variant="ghost" size="sm" onClick={handleCreateAndLinkComp} disabled={!newCompName.trim()}>
            Create &amp; Link
          </Button>
        </div>
      </div>
    </div>
  );
}
