import { ReactNode } from "react";

interface TypographyProps {
  children: ReactNode;
  className?: string;
}

export function DisplayLarge({ children, className = "" }: TypographyProps) {
  return <h1 className={`text-display-lg font-display ${className}`}>{children}</h1>;
}

export function DisplayMedium({ children, className = "" }: TypographyProps) {
  return <h2 className={`text-display-md font-display ${className}`}>{children}</h2>;
}

export function DisplaySmall({ children, className = "" }: TypographyProps) {
  return <h3 className={`text-display-sm font-display ${className}`}>{children}</h3>;
}

export function Eyebrow({ children, className = "" }: TypographyProps) {
  return <p className={`text-eyebrow font-text ${className}`}>{children}</p>;
}

export function Body({ children, className = "" }: TypographyProps) {
  return <p className={`text-base font-text ${className}`}>{children}</p>;
}

export function Code({ children, className = "" }: TypographyProps) {
  return <code className={`font-mono text-sm ${className}`}>{children}</code>;
}
