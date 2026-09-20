import { graphStore } from "./graph-store";
import type { FunctionalRequirement } from "../types/graph";
import type { BelongsToLink } from "../types/links";

function generateId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Track next sequence number per area code
const areaSequences = new Map<string, number>();

function generateCode(area: string): string {
  const key = area.toUpperCase().slice(0, 4);
  const current = areaSequences.get(key) ?? 0;
  const next = current + 1;
  areaSequences.set(key, next);
  return `FR-${key}-${String(next).padStart(2, "0")}`;
}

class RequirementStore {
  createRequirement(
    initiativeId: string,
    area: string,
    description: string,
    source: string,
    classification: "build" | "out" | "native",
    implementationNote?: string,
    prototypeView?: string
  ): FunctionalRequirement {
    const now = new Date();
    const code = generateCode(area);

    const req: FunctionalRequirement = {
      id: generateId(),
      type: "FunctionalRequirement",
      code,
      area,
      description,
      source,
      classification,
      implementationNote,
      prototypeView: prototypeView ?? null,
      initiativeId,
      createdAt: now,
      updatedAt: now,
    };

    graphStore.addNode(req);

    const link: BelongsToLink = {
      id: `link-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type: "belongs-to",
      sourceId: req.id,
      sourceType: "FunctionalRequirement",
      targetId: initiativeId,
      targetType: "Initiative",
      createdAt: now,
    };
    graphStore.addLink(link);

    return req;
  }

  getRequirement(id: string): FunctionalRequirement | undefined {
    const node = graphStore.getNode(id);
    if (node?.type === "FunctionalRequirement") return node as FunctionalRequirement;
    return undefined;
  }

  getAllRequirements(): FunctionalRequirement[] {
    return graphStore.getNodesByType("FunctionalRequirement") as FunctionalRequirement[];
  }

  getRequirementsForInitiative(initiativeId: string): FunctionalRequirement[] {
    return this.getAllRequirements().filter((r) => r.initiativeId === initiativeId);
  }

  updateRequirement(
    id: string,
    updates: Partial<Omit<FunctionalRequirement, "id" | "type" | "createdAt" | "code">>
  ): FunctionalRequirement | undefined {
    const node = graphStore.getNode(id);
    if (!node || node.type !== "FunctionalRequirement") return undefined;
    return graphStore.updateNode(id, updates) as FunctionalRequirement;
  }

  deleteRequirement(id: string): boolean {
    return graphStore.deleteNode(id);
  }
}

export const requirementStore = new RequirementStore();
