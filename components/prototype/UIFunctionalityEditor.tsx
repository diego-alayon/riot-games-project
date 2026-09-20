"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Surface";
import { Eyebrow } from "@/components/ui/Typography";

interface UIFunctionalityEditorProps {
  onSave: (label: string, requirementCode: string, description?: string) => void;
  onCancel: () => void;
}

export function UIFunctionalityEditor({ onSave, onCancel }: UIFunctionalityEditorProps) {
  const [label, setLabel] = useState("");
  const [requirementCode, setRequirementCode] = useState("");
  const [description, setDescription] = useState("");
  const [codeError, setCodeError] = useState("");

  const handleSave = () => {
    if (!requirementCode.trim()) {
      setCodeError("Requirement code is required (e.g. FR-LAY-01)");
      return;
    }
    if (!label.trim()) return;
    onSave(label.trim(), requirementCode.trim(), description.trim() || undefined);
  };

  return (
    <Card level={2}>
      <Eyebrow className="text-linear-text-subtle mb-4">New UI Functionality</Eyebrow>
      <div className="space-y-4">
        <Input
          label="Label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Login Form"
        />
        <div>
          <Input
            label="Requirement Code *"
            value={requirementCode}
            onChange={(e) => {
              setRequirementCode(e.target.value);
              if (e.target.value.trim()) setCodeError("");
            }}
            placeholder="e.g. FR-LAY-01"
            error={codeError}
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-linear-text-muted">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this UI element"
            rows={2}
            className="w-full px-3 py-2 text-sm rounded-linear-md border border-linear-hairline-2 bg-linear-surface-2 text-linear-text-ink placeholder:text-linear-text-tertiary focus:outline-none focus:ring-2 focus:ring-linear-accent focus:border-transparent resize-none"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={!label.trim()}>
            Save
          </Button>
        </div>
      </div>
    </Card>
  );
}
