"use client";

import type { DesignSystem } from "@/lib/types/graph";
import { Card } from "@/components/ui/Surface";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Typography";

interface DesignSystemSelectorProps {
  systems: DesignSystem[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function DesignSystemSelector({
  systems,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}: DesignSystemSelectorProps) {
  return (
    <div className="space-y-4">
      <Eyebrow className="text-fog">Available Design Systems</Eyebrow>

      {systems.map((system) => (
        <div
          key={system.id}
          className="cursor-pointer transition-all"
          onClick={() => onSelect(system.id)}
        >
          <Card
            level={selectedId === system.id ? 3 : 1}
            className={selectedId === system.id ? "ring-2 ring-acid-lime" : ""}
          >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-heading-sm text-paper">
                  {system.name}
                </h3>
                {system.isDefault && (
                  <span className="text-xs bg-acid-lime text-white px-2 py-0.5 rounded">
                    Default
                  </span>
                )}
              </div>

              {system.tokens.colors && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {Object.entries(system.tokens.colors).slice(0, 8).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center gap-2 text-xs"
                      title={`${key}: ${value}`}
                    >
                      <div
                        className="w-6 h-6 rounded border border-smoke"
                        style={{ backgroundColor: value }}
                      />
                      <span className="text-ash">{key}</span>
                    </div>
                  ))}
                  {Object.keys(system.tokens.colors).length > 8 && (
                    <span className="text-xs text-ash">
                      +{Object.keys(system.tokens.colors).length - 8} more
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2 ml-4">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(system.id);
                  }}
                >
                  Edit
                </Button>
              )}
              {onDelete && !system.isDefault && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(system.id);
                  }}
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
          </Card>
        </div>
      ))}

      {systems.length === 0 && (
        <Card level={1}>
          <p className="text-ash text-center py-8">
            No design systems available.
          </p>
        </Card>
      )}
    </div>
  );
}
