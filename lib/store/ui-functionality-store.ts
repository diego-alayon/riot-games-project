import { graphStore } from "./graph-store";
import type { UIFunctionality } from "../types/graph";

function generateId(): string {
  return `uifunc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

class UIFunctionalityStore {
  create(
    pageId: string,
    label: string,
    requirementCode: string,
    description?: string
  ): UIFunctionality {
    if (!requirementCode || !requirementCode.trim()) {
      throw new Error("requirementCode is mandatory for UIFunctionality");
    }

    const node: UIFunctionality = {
      id: generateId(),
      type: "UIFunctionality",
      name: label,
      description: description ?? "",
      pageId,
      requirementCode: requirementCode.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    graphStore.addNode(node);
    graphStore.addLink({
      id: `link-${node.id}-page`,
      type: "belongs-to",
      sourceId: node.id,
      sourceType: "UIFunctionality",
      targetId: pageId,
      targetType: "Page",
      createdAt: new Date(),
    });

    return node;
  }

  getUIFunctionality(id: string): UIFunctionality | undefined {
    const node = graphStore.getNode(id);
    return node?.type === "UIFunctionality" ? node : undefined;
  }

  getUIFunctionalitiesForPage(pageId: string): UIFunctionality[] {
    const all = graphStore.getNodesByType("UIFunctionality") as UIFunctionality[];
    return all.filter((n) => n.pageId === pageId);
  }

  updateUIFunctionality(
    id: string,
    updates: Partial<Omit<UIFunctionality, "id" | "type" | "createdAt">>
  ): UIFunctionality {
    const existing = this.getUIFunctionality(id);
    if (!existing) throw new Error(`UIFunctionality ${id} not found`);
    if (updates.requirementCode !== undefined && !updates.requirementCode.trim()) {
      throw new Error("requirementCode cannot be empty");
    }
    const updated = graphStore.updateNode(id, { ...updates, updatedAt: new Date() });
    return updated as UIFunctionality;
  }

  deleteUIFunctionality(id: string): void {
    graphStore.deleteNode(id);
  }
}

export const uiFunctionalityStore = new UIFunctionalityStore();
