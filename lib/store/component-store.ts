import { graphStore } from "./graph-store";
import type { Component } from "../types/graph";

function generateId(): string {
  return `comp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

class ComponentStore {
  createComponent(name: string, description = "", technical = ""): Component {
    const now = new Date();
    const comp: Component = {
      id: generateId(),
      type: "Component",
      name,
      description,
      technical,
      createdAt: now,
      updatedAt: now,
    };
    graphStore.addNode(comp);
    return comp;
  }

  getComponent(id: string): Component | undefined {
    const node = graphStore.getNode(id);
    return node?.type === "Component" ? (node as Component) : undefined;
  }

  getAllComponents(): Component[] {
    return graphStore.getNodesByType("Component") as Component[];
  }
}

export const componentStore = new ComponentStore();
