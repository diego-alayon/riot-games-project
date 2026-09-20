"use client";

import { createContext, useContext, ReactNode, useMemo } from "react";
import type { DesignSystem } from "@/lib/types/graph";

interface DesignSystemContextValue {
  designSystem: DesignSystem | null;
  isShellDesignSystem: boolean;
}

const DesignSystemContext = createContext<DesignSystemContextValue>({
  designSystem: null,
  isShellDesignSystem: true,
});

export function useDesignSystem() {
  return useContext(DesignSystemContext);
}

interface DesignSystemProviderProps {
  designSystem?: DesignSystem;
  children: ReactNode;
}

/**
 * DesignSystemProvider isolates design system tokens for prototypes.
 * When a designSystem is provided, it injects scoped CSS variables.
 * The shell always uses Linear (global CSS variables).
 */
export function DesignSystemProvider({
  designSystem,
  children,
}: DesignSystemProviderProps) {
  const isShellDesignSystem = !designSystem;

  // Generate scoped CSS variables from design system tokens
  const scopedStyles = useMemo(() => {
    if (!designSystem || !designSystem.tokens) {
      return {};
    }

    const styles: Record<string, string> = {};

    // Map color tokens
    if (designSystem.tokens.colors) {
      Object.entries(designSystem.tokens.colors).forEach(([key, value]) => {
        styles[`--ds-color-${key}`] = value;
      });
    }

    // Map spacing tokens
    if (designSystem.tokens.spacing) {
      Object.entries(designSystem.tokens.spacing).forEach(([key, value]) => {
        styles[`--ds-spacing-${key}`] = value;
      });
    }

    // Map radii tokens
    if (designSystem.tokens.radii) {
      Object.entries(designSystem.tokens.radii).forEach(([key, value]) => {
        styles[`--ds-radius-${key}`] = value;
      });
    }

    return styles;
  }, [designSystem]);

  const value: DesignSystemContextValue = {
    designSystem: designSystem || null,
    isShellDesignSystem,
  };

  // If using shell design system, render children normally (uses global CSS vars)
  if (isShellDesignSystem) {
    return (
      <DesignSystemContext.Provider value={value}>
        {children}
      </DesignSystemContext.Provider>
    );
  }

  // For prototype design systems, wrap in isolated container with scoped CSS vars
  return (
    <DesignSystemContext.Provider value={value}>
      <div
        className="design-system-scope"
        style={scopedStyles}
        data-design-system={designSystem?.name}
      >
        {children}
      </div>
    </DesignSystemContext.Provider>
  );
}

/**
 * Hook to get a color token from the current design system
 */
export function useDesignSystemColor(tokenName: string): string {
  const { isShellDesignSystem, designSystem } = useDesignSystem();

  if (isShellDesignSystem) {
    // Use global Linear tokens
    return `var(--color-${tokenName})`;
  }

  // Use scoped prototype tokens
  if (designSystem?.tokens.colors?.[tokenName]) {
    return designSystem.tokens.colors[tokenName];
  }

  // Fallback to shell token if not found
  return `var(--color-${tokenName})`;
}
