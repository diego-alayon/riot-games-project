import type { NodeType } from "./graph";

// Link Types

export type LinkType =
  | "implements"
  | "documented-by"
  | "depends-on"
  | "integrates-with"
  | "belongs-to";

export interface BaseLink {
  id: string;
  type: LinkType;
  sourceId: string;
  sourceType: NodeType;
  targetId: string;
  targetType: NodeType;
  createdAt: Date;
}

// Type-safe link definitions

export interface ImplementsLink extends BaseLink {
  type: "implements";
  sourceType: "FunctionalRequirement";
  targetType: "Component";
}

export interface DocumentedByLink extends BaseLink {
  type: "documented-by";
  sourceType: "FunctionalRequirement";
  targetType: "Document";
}

export interface DependsOnLink extends BaseLink {
  type: "depends-on";
  sourceType: "FunctionalRequirement";
  targetType: "FunctionalRequirement";
}

export interface IntegratesWithLink extends BaseLink {
  type: "integrates-with";
  sourceType: "Initiative";
  targetType: "Prototype";
}

export interface BelongsToLink extends BaseLink {
  type: "belongs-to";
  sourceType: "Page" | "UIFunctionality" | "FunctionalRequirement";
  targetType: "Prototype" | "Page" | "Initiative";
}

export type GraphLink =
  | ImplementsLink
  | DocumentedByLink
  | DependsOnLink
  | IntegratesWithLink
  | BelongsToLink;

// Link validation rules
export const linkRules: Record<LinkType, { source: NodeType[]; target: NodeType[] }> = {
  "implements": {
    source: ["FunctionalRequirement"],
    target: ["Component"],
  },
  "documented-by": {
    source: ["FunctionalRequirement"],
    target: ["Document"],
  },
  "depends-on": {
    source: ["FunctionalRequirement"],
    target: ["FunctionalRequirement"],
  },
  "integrates-with": {
    source: ["Initiative"],
    target: ["Prototype"],
  },
  "belongs-to": {
    source: ["Page", "UIFunctionality", "FunctionalRequirement"],
    target: ["Prototype", "Page", "Initiative"],
  },
};

export function validateLink(
  linkType: LinkType,
  sourceType: NodeType,
  targetType: NodeType
): boolean {
  const rules = linkRules[linkType];
  return rules.source.includes(sourceType) && rules.target.includes(targetType);
}
