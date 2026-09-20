// Core Graph Node Types

export type NodeType =
  | "Product"
  | "Section"
  | "Initiative"
  | "FunctionalRequirement"
  | "Prototype"
  | "Page"
  | "UIFunctionality"
  | "Document"
  | "Component"
  | "DesignSystem";

export interface BaseNode {
  id: string;
  type: NodeType;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product extends BaseNode {
  type: "Product";
  name: string;
  description: string;
}

export interface Section extends BaseNode {
  type: "Section";
  name: "Architecture" | "Infrastructure" | "Initiatives" | "Core";
  description: string;
}

export interface Initiative extends BaseNode {
  type: "Initiative";
  name: string;
  description: string;
  productId: string;
}

export interface FunctionalRequirement extends BaseNode {
  type: "FunctionalRequirement";
  code: string; // e.g., "FR-LAY-01"
  area: string; // e.g., "Layouts"
  description: string;
  source: string; // e.g., "Riot requirement", "Design decision"
  classification: "build" | "out" | "native";
  implementationNote?: string;
  prototypeView?: string | null;
  initiativeId: string;
}

export interface Prototype extends BaseNode {
  type: "Prototype";
  name: string;
  description: string;
  designSystemId?: string;
  isReserved: boolean; // For OneVenue Backoffice placeholder
}

export interface Page extends BaseNode {
  type: "Page";
  name: string;
  prototypeId: string;
  content?: any; // Prototype page content/structure
}

export interface UIFunctionality extends BaseNode {
  type: "UIFunctionality";
  name: string;
  description: string;
  pageId: string;
  requirementCode: string; // Links to FunctionalRequirement
}

export interface Document extends BaseNode {
  type: "Document";
  title: string;
  content: string;
  sectionName: "Architecture" | "Infrastructure";
}

export interface Component extends BaseNode {
  type: "Component";
  name: string;
  description: string;
  technical: string; // Technical details
}

export interface DesignSystem extends BaseNode {
  type: "DesignSystem";
  name: string;
  tokens: {
    colors?: Record<string, string>;
    typography?: Record<string, any>;
    spacing?: Record<string, string>;
    radii?: Record<string, string>;
  };
  isDefault: boolean; // Linear is the default for shell
}

export type GraphNode =
  | Product
  | Section
  | Initiative
  | FunctionalRequirement
  | Prototype
  | Page
  | UIFunctionality
  | Document
  | Component
  | DesignSystem;
