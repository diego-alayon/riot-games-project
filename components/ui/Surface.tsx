import { ReactNode } from "react";

interface SurfaceProps {
  children: ReactNode;
  className?: string;
  level?: 1 | 2 | 3;
  bordered?: boolean;
}

const surfaceColors: Record<number, string> = {
  1: "#0f1011", // Carbon
  2: "#161718", // Obsidian
  3: "#23252a", // Graphite
};

export function Surface({ children, className = "", level = 1, bordered = true }: SurfaceProps) {
  return (
    <div
      className={`${bordered ? "border border-graphite" : ""} ${className}`}
      style={{ backgroundColor: surfaceColors[level] }}
    >
      {children}
    </div>
  );
}

export function Card({ children, className = "", level = 1 }: Omit<SurfaceProps, "bordered">) {
  return (
    <div
      className={`rounded-xl p-6 border border-graphite ${className}`}
      style={{
        backgroundColor: surfaceColors[level],
        boxShadow: "rgb(35, 37, 42) 0px 0px 0px 1px inset",
      }}
    >
      {children}
    </div>
  );
}

export function Panel({ children, className = "", level = 2 }: Omit<SurfaceProps, "bordered">) {
  return (
    <div
      className={`rounded-xl p-4 border border-graphite ${className}`}
      style={{ backgroundColor: surfaceColors[level] }}
    >
      {children}
    </div>
  );
}
