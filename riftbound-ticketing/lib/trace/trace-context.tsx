"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * Presenter preferences, per browser.
 *  - trace: shows requirement markers. Off by default so demos to stakeholders
 *    show a clean UI. Toggle with ⌥T / Alt+T, or ?trace=on|off.
 */
interface TraceState {
  trace: boolean;
  setTrace: (v: boolean) => void;
}

const Ctx = createContext<TraceState>({ trace: false, setTrace: () => {} });
const KEY = "riftbound-presenter-v1";

export function TraceProvider({ children }: { children: ReactNode }) {
  const [trace, setTraceState] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<{ trace: boolean }>;
      const param = new URLSearchParams(window.location.search).get("trace");
      setTraceState(param ? param === "on" || param === "1" : !!saved.trace);
    } catch {}
  }, []);

  const persist = (patch: object) => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? "{}");
      localStorage.setItem(KEY, JSON.stringify({ ...saved, ...patch }));
    } catch {}
  };

  const setTrace = useCallback((v: boolean) => {
    setTraceState(v);
    persist({ trace: v });
  }, []);


  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && e.code === "KeyT") {
        e.preventDefault();
        setTraceState((t) => {
          persist({ trace: !t });
          return !t;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return <Ctx.Provider value={{ trace, setTrace }}>{children}</Ctx.Provider>;
}

export const useTrace = () => useContext(Ctx);
