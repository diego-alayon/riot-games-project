"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Surface";
import { Eyebrow } from "@/components/ui/Typography";

interface RequirementData {
  area: string;
  description: string;
  source: string;
  classification: "build" | "out" | "native";
  implementationNote?: string;
  prototypeView?: string;
}

interface RequirementEditorProps {
  onSave: (data: RequirementData) => void;
  onCancel: () => void;
  initial?: Partial<RequirementData>;
}

export function RequirementEditor({ onSave, onCancel, initial }: RequirementEditorProps) {
  const [area, setArea] = useState(initial?.area ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [source, setSource] = useState(initial?.source ?? "");
  const [classification, setClassification] = useState<"build" | "out" | "native">(
    initial?.classification ?? "build"
  );
  const [implementationNote, setImplementationNote] = useState(initial?.implementationNote ?? "");
  const [prototypeView, setPrototypeView] = useState(initial?.prototypeView ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!area.trim() || !description.trim() || !source.trim()) return;
    onSave({
      area: area.trim().toUpperCase().slice(0, 4),
      description: description.trim(),
      source: source.trim(),
      classification,
      implementationNote: implementationNote.trim() || undefined,
      prototypeView: prototypeView.trim() || undefined,
    });
  };

  return (
    <Card level={2}>
      <Eyebrow className="text-linear-text-subtle mb-4">New Requirement</Eyebrow>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Area Code"
            placeholder="e.g. LAY, AUTH, TICK"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            required
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-linear-text-subtle uppercase tracking-wider">
              Classification
            </label>
            <select
              value={classification}
              onChange={(e) => setClassification(e.target.value as "build" | "out" | "native")}
              className="h-10 rounded-linear-md border border-linear-hairline-2 bg-linear-surface-2 px-3 text-sm text-linear-text-ink focus:outline-none focus:ring-2 focus:ring-linear-accent"
            >
              <option value="build">Build</option>
              <option value="native">Native</option>
              <option value="out">Out of scope</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-linear-text-subtle uppercase tracking-wider">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What must the system do?"
            required
            rows={3}
            className="rounded-linear-md border border-linear-hairline-2 bg-linear-surface-2 px-3 py-2 text-sm text-linear-text-ink placeholder:text-linear-text-tertiary focus:outline-none focus:ring-2 focus:ring-linear-accent resize-none"
          />
        </div>

        <Input
          label="Source"
          placeholder="e.g. Product Design, Security Policy"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          required
        />

        <Input
          label="Prototype View (optional)"
          placeholder="e.g. Login, Ticket List"
          value={prototypeView}
          onChange={(e) => setPrototypeView(e.target.value)}
        />

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-linear-text-subtle uppercase tracking-wider">
            Implementation Note (optional)
          </label>
          <textarea
            value={implementationNote}
            onChange={(e) => setImplementationNote(e.target.value)}
            placeholder="Any additional notes..."
            rows={2}
            className="rounded-linear-md border border-linear-hairline-2 bg-linear-surface-2 px-3 py-2 text-sm text-linear-text-ink placeholder:text-linear-text-tertiary focus:outline-none focus:ring-2 focus:ring-linear-accent resize-none"
          />
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Add Requirement
          </Button>
        </div>
      </form>
    </Card>
  );
}
