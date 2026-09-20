import { graphStore } from "./graph-store";
import type { Prototype } from "../types/graph";

function generateId(): string {
  return `prototype-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

class PrototypeStoreClass {
  create(
    name: string,
    description: string,
    options: { designSystemId?: string; isReserved?: boolean } = {}
  ): Prototype {
    const now = new Date();
    const prototype: Prototype = {
      id: generateId(),
      type: "Prototype",
      name,
      description,
      designSystemId: options.designSystemId,
      isReserved: options.isReserved ?? false,
      createdAt: now,
      updatedAt: now,
    };
    graphStore.addNode(prototype);
    return prototype;
  }

  get(id: string): Prototype | undefined {
    const node = graphStore.getNode(id);
    return node?.type === "Prototype" ? (node as Prototype) : undefined;
  }

  getAll(): Prototype[] {
    return graphStore.getNodesByType("Prototype") as Prototype[];
  }

  getByName(name: string): Prototype | undefined {
    return this.getAll().find((p) => p.name === name);
  }

  update(id: string, updates: Partial<Pick<Prototype, "name" | "description" | "designSystemId" | "isReserved">>): Prototype | undefined {
    const updated = graphStore.updateNode(id, updates);
    return updated?.type === "Prototype" ? (updated as Prototype) : undefined;
  }

  delete(id: string): boolean {
    return graphStore.deleteNode(id);
  }
}

export const prototypeStore = new PrototypeStoreClass();
