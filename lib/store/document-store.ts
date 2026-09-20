import { graphStore } from "./graph-store";
import type { Document } from "../types/graph";

function generateId(): string {
  return `doc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const documentStore = {
  createDocument(
    sectionName: "Architecture" | "Infrastructure",
    title: string,
    content: string
  ): Document {
    const now = new Date();
    const doc: Document = {
      id: generateId(),
      type: "Document",
      title,
      content,
      sectionName,
      createdAt: now,
      updatedAt: now,
    };
    graphStore.addNode(doc);
    return doc;
  },

  getDocument(id: string): Document | undefined {
    const node = graphStore.getNode(id);
    if (node?.type === "Document") return node as Document;
    return undefined;
  },

  getDocumentsForSection(sectionName: "Architecture" | "Infrastructure"): Document[] {
    return graphStore
      .getNodesByType("Document")
      .filter((n): n is Document => n.type === "Document" && n.sectionName === sectionName);
  },

  updateDocument(id: string, updates: Partial<Pick<Document, "title" | "content">>): Document | undefined {
    const updated = graphStore.updateNode(id, updates);
    if (updated?.type === "Document") return updated as Document;
    return undefined;
  },

  deleteDocument(id: string): boolean {
    return graphStore.deleteNode(id);
  },
};
