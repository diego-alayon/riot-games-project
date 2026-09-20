"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Surface";
import { Eyebrow } from "@/components/ui/Typography";

interface ColorToken {
  key: string;
  value: string;
}

interface DesignSystemEditorProps {
  initialName?: string;
  initialColors?: Record<string, string>;
  onSave?: (name: string, colors: Record<string, string>) => void;
  onCancel?: () => void;
}

export function DesignSystemEditor({
  initialName = "",
  initialColors = {},
  onSave,
  onCancel,
}: DesignSystemEditorProps) {
  const [name, setName] = useState(initialName);
  const [colors, setColors] = useState<ColorToken[]>(
    Object.entries(initialColors).map(([key, value]) => ({ key, value }))
  );

  const addColor = () => {
    setColors([...colors, { key: "", value: "#000000" }]);
  };

  const updateColor = (index: number, field: "key" | "value", value: string) => {
    const newColors = [...colors];
    newColors[index][field] = value;
    setColors(newColors);
  };

  const removeColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const colorTokens = colors.reduce((acc, { key, value }) => {
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>);

    onSave?.(name, colorTokens);
  };

  return (
    <Card level={2} className="max-w-2xl">
      <Eyebrow className="text-fog mb-4">Design System Editor</Eyebrow>

      <div className="space-y-6">
        <Input
          label="Design System Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., My Design System"
        />

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-mist">
              Color Tokens
            </label>
            <Button variant="ghost" size="sm" onClick={addColor}>
              + Add Color
            </Button>
          </div>

          <div className="space-y-2">
            {colors.map((color, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1">
                  <input
                    type="text"
                    value={color.key}
                    onChange={(e) => updateColor(index, "key", e.target.value)}
                    placeholder="Token name (e.g., primary)"
                    className="w-full px-3 py-2 rounded-md bg-graphite border border-smoke text-paper placeholder:text-ash focus:outline-none focus:ring-2 focus:ring-acid-lime/40 text-sm"
                  />
                </div>
                <div className="w-32">
                  <input
                    type="color"
                    value={color.value}
                    onChange={(e) => updateColor(index, "value", e.target.value)}
                    className="w-full h-10 rounded-md border border-smoke cursor-pointer"
                  />
                </div>
                <div className="w-24">
                  <input
                    type="text"
                    value={color.value}
                    onChange={(e) => updateColor(index, "value", e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-graphite border border-smoke text-paper text-caption font-mono focus:outline-none focus:ring-2 focus:ring-acid-lime/40"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeColor(index)}
                >
                  ✕
                </Button>
              </div>
            ))}

            {colors.length === 0 && (
              <p className="text-body-sm text-ash text-center py-4">
                No colors defined. Click "Add Color" to create tokens.
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-graphite">
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button variant="primary" onClick={handleSave}>
            Save Design System
          </Button>
        </div>
      </div>
    </Card>
  );
}
