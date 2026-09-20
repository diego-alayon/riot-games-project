import { ReactNode } from "react";

interface SurfaceProps {
  children: ReactNode;
  className?: string;
  level?: 1 | 2 | 3;
  bordered?: boolean;
}

export function Surface({
  children,
  className = "",
  level = 1,
  bordered = true,
}: SurfaceProps) {
  const bg = level === 2 ? "#f5f5f5" : level === 3 ? "#efefef" : "#f9f9f9";
  return (
    <div
      className={`${bordered ? "border" : ""} ${className}`}
      style={{ backgroundColor: bg, borderColor: "#ebebeb" }}
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
    <Surface level={level} bordered className={`rounded-lg p-4 ${className}`}>
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
    <Surface level={level} bordered className={`rounded-md p-3 ${className}`}>
      {children}
    </Surface>
  );
}
