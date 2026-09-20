"use client";

import { useEffect, useState } from "react";
import { DisplayMedium, Eyebrow, Body } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { DesignSystemEditor } from "@/components/design-system/DesignSystemEditor";
import { DesignSystemSelector } from "@/components/design-system/DesignSystemSelector";
import { DesignSystemProvider } from "@/components/design-system/DesignSystemProvider";
import { DesignSystemRegistry } from "@/lib/design-system/registry";
import { initializeDesignSystems, verifyShellDesignSystem } from "@/lib/design-system/initialize";
import type { DesignSystem } from "@/lib/types/graph";

export default function DesignSystemsPage() {
  const [systems, setSystems] = useState<DesignSystem[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [showEditor, setShowEditor] = useState(false);
  const [verification, setVerification] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    // Initialize design systems
    try {
      initializeDesignSystems();
      loadSystems();

      // Verify shell design system
      const isValid = verifyShellDesignSystem();
      setVerification({
        success: isValid,
        message: "✓ Shell design system verified: Linear is default with all required tokens",
      });
    } catch (error) {
      setVerification({
        success: false,
        message: `✗ Verification failed: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }, []);

  const loadSystems = () => {
    const allSystems = DesignSystemRegistry.getAll();
    setSystems(allSystems);
    if (allSystems.length > 0 && !selectedId) {
      setSelectedId(allSystems[0].id);
    }
  };

  const handleCreate = (name: string, colors: Record<string, string>) => {
    try {
      DesignSystemRegistry.create(name, { colors }, false);
      loadSystems();
      setShowEditor(false);
    } catch (error) {
      alert(`Failed to create design system: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this design system?")) {
      try {
        DesignSystemRegistry.delete(id);
        loadSystems();
      } catch (error) {
        alert(`Failed to delete: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  };

  const selectedSystem = systems.find((s) => s.id === selectedId);

  return (
    <div className="px-6 py-section">
      <div className="max-w-6xl mx-auto">
        <Eyebrow className="text-linear-text-subtle mb-2">Design Systems</Eyebrow>
        <DisplayMedium className="text-linear-text-ink mb-4">
          Design System Registry
        </DisplayMedium>
        <Body className="text-linear-text-muted mb-8">
          Manage design systems for the shell and prototypes. Linear is the default for the shell.
        </Body>

        {verification && (
          <div
            className={`mb-8 p-4 rounded-linear-md border ${
              verification.success
                ? "bg-linear-surface-2 border-linear-success text-linear-success"
                : "bg-linear-surface-2 border-red-500 text-red-500"
            }`}
          >
            <p className="text-sm font-mono">{verification.message}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-linear-text-ink">Available Systems</h3>
              <Button variant="primary" size="sm" onClick={() => setShowEditor(!showEditor)}>
                {showEditor ? "Cancel" : "+ New System"}
              </Button>
            </div>

            {showEditor && (
              <div className="mb-6">
                <DesignSystemEditor
                  onSave={handleCreate}
                  onCancel={() => setShowEditor(false)}
                />
              </div>
            )}

            <DesignSystemSelector
              systems={systems}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onDelete={handleDelete}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-linear-text-ink mb-4">Preview</h3>
            {selectedSystem && (
              <DesignSystemProvider designSystem={selectedSystem}>
                <div className="p-6 rounded-linear-lg border border-linear-hairline-2" style={{ backgroundColor: "var(--color-surface-1)" }}>
                  <p className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-ink)" }}>
                    {selectedSystem.name} Design System
                  </p>
                  <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
                    {selectedSystem.isDefault ? "This is the default shell design system." : "This design system can be applied to prototypes."}
                  </p>

                  {selectedSystem.tokens.colors && (
                    <div className="grid grid-cols-4 gap-2">
                      {Object.entries(selectedSystem.tokens.colors).slice(0, 12).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div
                            className="w-full h-12 rounded-linear-md mb-1 border border-linear-hairline-1"
                            style={{ backgroundColor: value }}
                          />
                          <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                            {key}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </DesignSystemProvider>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
