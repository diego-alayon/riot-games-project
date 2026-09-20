"use client";

import { useTraceability } from "@/lib/context/traceability-context";
import { TraceabilityLabel } from "./TraceabilityLabel";
import type { UIFunctionality } from "@/lib/types/graph";

interface UIFunctionalityCardProps {
  functionality: UIFunctionality;
}

export function UIFunctionalityCard({ functionality }: UIFunctionalityCardProps) {
  const { showLabels } = useTraceability();

  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-paper">{functionality.name}</p>
        {functionality.description && (
          <p className="text-xs text-mist mt-0.5">{functionality.description}</p>
        )}
      </div>
      {showLabels && (
        <TraceabilityLabel code={functionality.requirementCode} />
      )}
    </div>
  );
}
