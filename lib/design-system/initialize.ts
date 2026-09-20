import { DesignSystemRegistry } from "./registry";

/**
 * Initialize the design system registry with Linear as the default.
 * This should be called once when the application starts.
 */
export function initializeDesignSystems() {
  try {
    // Initialize Linear as the default shell design system
    const linear = DesignSystemRegistry.initializeLinear();

    console.log(`✓ Design system initialized: ${linear.name} (default)`);

    return linear;
  } catch (error) {
    console.error("Failed to initialize design systems:", error);
    throw error;
  }
}

/**
 * Verify the shell always uses Linear tokens
 */
export function verifyShellDesignSystem() {
  const defaultDS = DesignSystemRegistry.getDefault();

  if (!defaultDS) {
    throw new Error("No default design system found");
  }

  if (defaultDS.name !== "Linear") {
    throw new Error(`Default design system should be Linear, but found: ${defaultDS.name}`);
  }

  // Verify Linear tokens are present
  const requiredTokens = ["accent", "canvas", "surface-1"];
  const missingTokens = requiredTokens.filter(
    (token) => !defaultDS.tokens.colors?.[token]
  );

  if (missingTokens.length > 0) {
    throw new Error(`Linear design system is missing tokens: ${missingTokens.join(", ")}`);
  }

  return true;
}
