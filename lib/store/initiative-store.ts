import { graphStore } from "./graph-store";
import type { Initiative } from "../types/graph";
import type { IntegratesWithLink } from "../types/links";

function generateId(): string {
  return `initiative-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

class InitiativeStore {
  createInitiative(
    name: string,
    description = "",
    prototypeId?: string
  ): Initiative {
    const now = new Date();
    const initiative: Initiative = {
      id: generateId(),
      type: "Initiative",
      name,
      description,
      productId: "product-root",
      createdAt: now,
      updatedAt: now,
    };

    graphStore.addNode(initiative);

    if (prototypeId) {
      const prototype = graphStore.getNode(prototypeId);
      if (prototype) {
        const link: IntegratesWithLink = {
          id: `link-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          type: "integrates-with",
          sourceId: initiative.id,
          sourceType: "Initiative",
          targetId: prototypeId,
          targetType: "Prototype",
          createdAt: now,
        };
        graphStore.addLink(link);
      }
    }

    return initiative;
  }

  getInitiative(id: string): Initiative | undefined {
    const node = graphStore.getNode(id);
    if (node?.type === "Initiative") return node as Initiative;
    return undefined;
  }

  getAllInitiatives(): Initiative[] {
    return graphStore.getNodesByType("Initiative") as Initiative[];
  }

  updateInitiative(id: string, updates: Partial<Omit<Initiative, "id" | "type" | "createdAt">>): Initiative | undefined {
    const node = graphStore.getNode(id);
    if (!node || node.type !== "Initiative") return undefined;
    return graphStore.updateNode(id, updates) as Initiative;
  }

  deleteInitiative(id: string): boolean {
    return graphStore.deleteNode(id);
  }
}

export const initiativeStore = new InitiativeStore();
