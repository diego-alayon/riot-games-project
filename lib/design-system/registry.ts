import type { DesignSystem } from "../types/graph";
import { graphStore } from "../store/graph-store";

export interface DesignSystemTokens {
  colors?: Record<string, string>;
  typography?: {
    fontFamily?: Record<string, string>;
    fontSize?: Record<string, string>;
    fontWeight?: Record<string, string>;
    letterSpacing?: Record<string, string>;
  };
  spacing?: Record<string, string>;
  radii?: Record<string, string>;
  shadows?: Record<string, string>;
}

export interface DesignSystemValidationResult {
  valid: boolean;
  errors: string[];
}

export class DesignSystemRegistry {
  /**
   * Validate design system schema
   */
  static validate(designSystem: Partial<DesignSystem>): DesignSystemValidationResult {
    const errors: string[] = [];

    if (!designSystem.name || designSystem.name.trim().length === 0) {
      errors.push("Design system name is required");
    }

    if (designSystem.name && designSystem.name.length > 100) {
      errors.push("Design system name must be 100 characters or less");
    }

    if (designSystem.tokens) {
      if (designSystem.tokens.colors) {
        for (const [key, value] of Object.entries(designSystem.tokens.colors)) {
          if (typeof value !== "string" || !value.match(/^#[0-9a-fA-F]{6}$/)) {
            errors.push(`Invalid color value for "${key}": must be a valid hex color`);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Create a new design system
   */
  static create(
    name: string,
    tokens: DesignSystemTokens,
    isDefault: boolean = false
  ): DesignSystem {
    const validation = this.validate({ name, tokens });

    if (!validation.valid) {
      throw new Error(`Invalid design system: ${validation.errors.join(", ")}`);
    }

    const designSystem: DesignSystem = {
      id: `ds-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "DesignSystem",
      name,
      tokens,
      isDefault,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    graphStore.addNode(designSystem);
    return designSystem;
  }

  /**
   * Get all design systems
   */
  static getAll(): DesignSystem[] {
    return graphStore.getNodesByType("DesignSystem") as DesignSystem[];
  }

  /**
   * Get design system by ID
   */
  static getById(id: string): DesignSystem | undefined {
    const node = graphStore.getNode(id);
    return node?.type === "DesignSystem" ? (node as DesignSystem) : undefined;
  }

  /**
   * Get the default design system (Linear)
   */
  static getDefault(): DesignSystem | undefined {
    const systems = this.getAll();
    return systems.find((ds) => ds.isDefault);
  }

  /**
   * Update design system
   */
  static update(id: string, updates: Partial<DesignSystem>): DesignSystem | undefined {
    const validation = this.validate(updates);

    if (!validation.valid) {
      throw new Error(`Invalid design system updates: ${validation.errors.join(", ")}`);
    }

    return graphStore.updateNode(id, updates) as DesignSystem | undefined;
  }

  /**
   * Delete design system
   */
  static delete(id: string): boolean {
    const ds = this.getById(id);
    if (!ds) return false;

    if (ds.isDefault) {
      throw new Error("Cannot delete the default design system");
    }

    return graphStore.deleteNode(id);
  }

  /**
   * Initialize Linear as the default design system
   */
  static initializeLinear(): DesignSystem {
    const existing = this.getDefault();
    if (existing && existing.name === "Linear") {
      return existing;
    }

    return this.create(
      "Linear",
      {
        colors: {
          accent: "#5e6ad2",
          "accent-hover": "#828fff",
          "accent-focus": "#5e69d1",
          canvas: "#010102",
          "surface-1": "#0f1011",
          "surface-2": "#141516",
          "surface-3": "#18191a",
          "surface-4": "#191a1b",
          "hairline-1": "#23252a",
          "hairline-2": "#34343a",
          "hairline-3": "#3e3e44",
          "text-ink": "#f7f8f8",
          "text-muted": "#d0d6e0",
          "text-subtle": "#8a8f98",
          "text-tertiary": "#62666d",
          success: "#27a644",
        },
        typography: {
          fontFamily: {
            display: "Inter, SF Pro Display, system-ui, sans-serif",
            text: "Inter, SF Pro Display, system-ui, sans-serif",
            mono: "JetBrains Mono, Monaco, Courier New, monospace",
          },
          letterSpacing: {
            "display-tight": "-3.0px",
            "display-normal": "-0.05px",
            eyebrow: "0.4px",
          },
        },
        spacing: {
          section: "96px",
        },
        radii: {
          sm: "4px",
          base: "6px",
          md: "8px",
          lg: "12px",
          xl: "16px",
          "2xl": "24px",
        },
      },
      true // isDefault
    );
  }
}
