"use client";

import { useState } from "react";
import type { Page } from "@/lib/types/graph";
import { pageStore } from "@/lib/store/page-store";
import { uiFunctionalityStore } from "@/lib/store/ui-functionality-store";
import { Card } from "@/components/ui/Surface";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Typography";
import { PageEditor } from "./PageEditor";
import { UIFunctionalityEditor } from "./UIFunctionalityEditor";
import { UIFunctionalityCard } from "./UIFunctionalityCard";
import type { UIFunctionality } from "@/lib/types/graph";

interface PageWithFuncs {
  page: Page;
  functionalities: UIFunctionality[];
  showFuncEditor: boolean;
}

interface PrototypePageListProps {
  prototypeId: string;
  initialPages: Page[];
}

export function PrototypePageList({ prototypeId, initialPages }: PrototypePageListProps) {
  const [pageItems, setPageItems] = useState<PageWithFuncs[]>(() =>
    initialPages.map((page) => ({
      page,
      functionalities: uiFunctionalityStore.getUIFunctionalitiesForPage(page.id),
      showFuncEditor: false,
    }))
  );
  const [showPageEditor, setShowPageEditor] = useState(false);

  const handleAddPage = (name: string) => {
    const newPage = pageStore.create(prototypeId, name);
    setPageItems((prev) => [
      ...prev,
      { page: newPage, functionalities: [], showFuncEditor: false },
    ]);
    setShowPageEditor(false);
  };

  const handleDeletePage = (id: string) => {
    pageStore.delete(id);
    setPageItems((prev) => prev.filter((item) => item.page.id !== id));
  };

  const handleAddFunctionality = (
    pageId: string,
    label: string,
    requirementCode: string,
    description?: string
  ) => {
    try {
      const func = uiFunctionalityStore.create(pageId, label, requirementCode, description);
      setPageItems((prev) =>
        prev.map((item) =>
          item.page.id === pageId
            ? { ...item, functionalities: [...item.functionalities, func], showFuncEditor: false }
            : item
        )
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };

  const toggleFuncEditor = (pageId: string, show: boolean) => {
    setPageItems((prev) =>
      prev.map((item) =>
        item.page.id === pageId ? { ...item, showFuncEditor: show } : item
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Eyebrow className="text-linear-text-subtle">Pages</Eyebrow>
        <Button variant="secondary" size="sm" onClick={() => setShowPageEditor(true)}>
          + Add Page
        </Button>
      </div>

      {showPageEditor && (
        <PageEditor onSave={handleAddPage} onCancel={() => setShowPageEditor(false)} />
      )}

      {pageItems.length === 0 && !showPageEditor && (
        <Card level={1}>
          <p className="text-linear-text-tertiary text-center py-6 text-sm">
            No pages yet. Add your first page.
          </p>
        </Card>
      )}

      {pageItems.map(({ page, functionalities, showFuncEditor }) => (
        <Card key={page.id} level={1}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-linear-text-ink">{page.name}</p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFuncEditor(page.id, true)}
              >
                + Functionality
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeletePage(page.id)}
                className="text-linear-text-tertiary hover:text-red-400"
              >
                Remove
              </Button>
            </div>
          </div>

          {functionalities.length > 0 && (
            <div className="border-t border-linear-hairline-1 pt-3 space-y-1">
              {functionalities.map((func) => (
                <UIFunctionalityCard key={func.id} functionality={func} />
              ))}
            </div>
          )}

          {showFuncEditor && (
            <div className="mt-3">
              <UIFunctionalityEditor
                onSave={(label, code, desc) => handleAddFunctionality(page.id, label, code, desc)}
                onCancel={() => toggleFuncEditor(page.id, false)}
              />
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
