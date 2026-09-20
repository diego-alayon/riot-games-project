"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface TraceabilityContextValue {
  showLabels: boolean;
  toggleLabels: () => void;
}

const TraceabilityContext = createContext<TraceabilityContextValue>({
  showLabels: true,
  toggleLabels: () => {},
});

export function useTraceability() {
  return useContext(TraceabilityContext);
}

export function TraceabilityProvider({ children }: { children: ReactNode }) {
  const [showLabels, setShowLabels] = useState(true);

  return (
    <TraceabilityContext.Provider value={{ showLabels, toggleLabels: () => setShowLabels((v) => !v) }}>
      {children}
    </TraceabilityContext.Provider>
  );
}
