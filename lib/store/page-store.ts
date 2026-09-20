import { graphStore } from "./graph-store";
import type { Page } from "../types/graph";
import type { BelongsToLink } from "../types/links";

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

class PageStoreClass {
  create(prototypeId: string, name: string): Page {
    const prototypeNode = graphStore.getNode(prototypeId);
    if (!prototypeNode || prototypeNode.type !== "Prototype") {
      throw new Error(`Prototype not found: ${prototypeId}`);
    }

    const now = new Date();
    const page: Page = {
      id: generateId("page"),
      type: "Page",
      name,
      prototypeId,
      createdAt: now,
      updatedAt: now,
    };
    graphStore.addNode(page);

    const link: BelongsToLink = {
      id: generateId("link"),
      type: "belongs-to",
      sourceId: page.id,
      sourceType: "Page",
      targetId: prototypeId,
      targetType: "Prototype",
      createdAt: now,
    };
    graphStore.addLink(link);

    return page;
  }

  get(id: string): Page | undefined {
    const node = graphStore.getNode(id);
    return node?.type === "Page" ? (node as Page) : undefined;
  }

  getForPrototype(prototypeId: string): Page[] {
    const links = graphStore.getLinksTo(prototypeId, "belongs-to");
    return links
      .filter((l) => l.sourceType === "Page")
      .map((l) => graphStore.getNode(l.sourceId))
      .filter((n): n is Page => n?.type === "Page");
  }

  update(id: string, updates: Partial<Pick<Page, "name" | "content">>): Page | undefined {
    const updated = graphStore.updateNode(id, updates);
    return updated?.type === "Page" ? (updated as Page) : undefined;
  }

  delete(id: string): boolean {
    return graphStore.deleteNode(id);
  }
}

export const pageStore = new PageStoreClass();
