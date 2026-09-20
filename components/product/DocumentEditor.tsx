"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Surface";

interface DocumentEditorProps {
  initialTitle?: string;
  initialContent?: string;
  onSave: (title: string, content: string) => void;
  onCancel: () => void;
}

export function DocumentEditor({
  initialTitle = "",
  initialContent = "",
  onSave,
  onCancel,
}: DocumentEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(title.trim(), content);
  };

  return (
    <Card level={2}>
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-linear-text-subtle mb-1 uppercase tracking-wide">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Document title"
            className="w-full bg-linear-surface-1 border border-linear-hairline-2 rounded-linear-md px-3 py-2 text-sm text-linear-text-ink placeholder:text-linear-text-tertiary focus:outline-none focus:ring-2 focus:ring-linear-accent"
          />
        </div>

        <div>
          <label className="block text-xs text-linear-text-subtle mb-1 uppercase tracking-wide">
            Content (Markdown)
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your document content here..."
            rows={10}
            className="w-full bg-linear-surface-1 border border-linear-hairline-2 rounded-linear-md px-3 py-2 text-sm text-linear-text-ink placeholder:text-linear-text-tertiary focus:outline-none focus:ring-2 focus:ring-linear-accent font-mono resize-y"
          />
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={!title.trim()}>
            Save Document
          </Button>
        </div>
      </div>
    </Card>
  );
}
