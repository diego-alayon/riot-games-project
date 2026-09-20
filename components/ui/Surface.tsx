import { ReactNode } from "react";

interface SurfaceProps {
  children: ReactNode;
  className?: string;
  level?: 1 | 2 | 3 | 4;
  bordered?: boolean;
}

export function Surface({ children, className = "", level = 1, bordered = true }: SurfaceProps) {
  const surfaceColors = {
    1: "var(--color-surface-1)",
    2: "var(--color-surface-2)",
    3: "var(--color-surface-3)",
    4: "var(--color-surface-4)",
  };

  const borderClass = bordered ? "border border-linear-hairline-1" : "";

  return (
    <div
      className={`${borderClass} ${className}`}
      style={{ backgroundColor: surfaceColors[level] }}
    >
      {children}
    </div>
  );
}

export function Card({ children, className = "", level = 1 }: Omit<SurfaceProps, "bordered">) {
  return (
    <Surface level={level} bordered className={`rounded-linear-lg p-6 ${className}`}>
      {children}
    </Surface>
  );
}

export function Panel({ children, className = "", level = 2 }: Omit<SurfaceProps, "bordered">) {
  return (
    <Surface level={level} bordered className={`rounded-linear-md p-4 ${className}`}>
      {children}
    </Surface>
  );
}
