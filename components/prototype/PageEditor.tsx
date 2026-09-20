"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Surface";

interface PageEditorProps {
  onSave: (name: string) => void;
  onCancel: () => void;
}

export function PageEditor({ onSave, onCancel }: PageEditorProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim());
  };

  return (
    <Card level={2}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm font-semibold text-linear-text-ink">New Page</p>
        <div>
          <label className="block text-xs text-linear-text-subtle mb-1">
            Page Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Login"
            className="w-full px-3 py-2 text-sm rounded-linear-md bg-linear-surface-3 border border-linear-hairline-2 text-linear-text-ink placeholder-linear-text-tertiary focus:outline-none focus:ring-2 focus:ring-linear-accent-focus"
            autoFocus
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" variant="primary" size="sm" disabled={!name.trim()}>
            Add Page
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
