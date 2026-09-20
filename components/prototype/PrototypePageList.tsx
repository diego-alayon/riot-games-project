"use client";

import { useState } from "react";
import type { Page } from "@/lib/types/graph";
import { pageStore } from "@/lib/store/page-store";
import { Card } from "@/components/ui/Surface";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Typography";
import { PageEditor } from "./PageEditor";

interface PrototypePageListProps {
  prototypeId: string;
  initialPages: Page[];
}

export function PrototypePageList({ prototypeId, initialPages }: PrototypePageListProps) {
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [showEditor, setShowEditor] = useState(false);

  const handleAddPage = (name: string) => {
    const newPage = pageStore.create(prototypeId, name);
    setPages((prev) => [...prev, newPage]);
    setShowEditor(false);
  };

  const handleDeletePage = (id: string) => {
    pageStore.delete(id);
    setPages((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Eyebrow className="text-linear-text-subtle">Pages</Eyebrow>
        <Button variant="secondary" size="sm" onClick={() => setShowEditor(true)}>
          + Add Page
        </Button>
      </div>

      {showEditor && (
        <PageEditor onSave={handleAddPage} onCancel={() => setShowEditor(false)} />
      )}

      {pages.length === 0 && !showEditor && (
        <Card level={1}>
          <p className="text-linear-text-tertiary text-center py-6 text-sm">
            No pages yet. Add your first page.
          </p>
        </Card>
      )}

      {pages.map((page) => (
        <Card key={page.id} level={1}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-linear-text-ink">{page.name}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeletePage(page.id)}
              className="text-linear-text-tertiary hover:text-red-400"
            >
              Remove
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
