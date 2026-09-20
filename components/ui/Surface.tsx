import { ReactNode } from "react";

interface SurfaceProps {
  children: ReactNode;
  className?: string;
  level?: 1 | 2 | 3;
  bordered?: boolean;
}

const levelColors: Record<number, string> = {
  1: "#f9f9f9",
  2: "#f5f5f5",
  3: "#efefef",
};

export function Surface({
  children,
  className = "",
  level = 1,
  bordered = true,
}: SurfaceProps) {
  return (
    <div
      className={`${bordered ? "border" : ""} ${className}`}
      style={{
        backgroundColor: levelColors[level],
        borderColor: "#ebebeb",
      }}
    >
      {children}
    </div>
  );
}

export function Card({
  children,
  className = "",
  level = 1,
}: Omit<SurfaceProps, "bordered">) {
  return (
    <Surface level={level} bordered className={`rounded-xl p-5 ${className}`}>
      {children}
    </Surface>
  );
}

export function Panel({
  children,
  className = "",
  level = 2,
}: Omit<SurfaceProps, "bordered">) {
  return (
    <Surface level={level} bordered className={`rounded-lg p-4 ${className}`}>
      {children}
    </Surface>
  );
}
