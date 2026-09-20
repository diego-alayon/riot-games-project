import { ReactNode } from "react";

interface TypographyProps {
  children: ReactNode;
  className?: string;
}

export function Display({ children, className = "" }: TypographyProps) {
  return <h1 className={`text-display text-paper ${className}`}>{children}</h1>;
}

export function HeadingLg({ children, className = "" }: TypographyProps) {
  return <h1 className={`text-heading-lg text-paper ${className}`}>{children}</h1>;
}

export function Heading({ children, className = "" }: TypographyProps) {
  return <h2 className={`text-heading text-paper ${className}`}>{children}</h2>;
}

export function Subheading({ children, className = "" }: TypographyProps) {
  return <h3 className={`text-subheading text-mist ${className}`}>{children}</h3>;
}

export function HeadingSm({ children, className = "" }: TypographyProps) {
  return <h4 className={`text-heading-sm text-mist ${className}`}>{children}</h4>;
}

export function BodyLg({ children, className = "" }: TypographyProps) {
  return <p className={`text-body-lg text-mist ${className}`}>{children}</p>;
}

export function Body({ children, className = "" }: TypographyProps) {
  return <p className={`text-body text-mist ${className}`}>{children}</p>;
}

export function BodySm({ children, className = "" }: TypographyProps) {
  return <p className={`text-body-sm text-fog ${className}`}>{children}</p>;
}

export function Caption({ children, className = "" }: TypographyProps) {
  return <p className={`text-caption text-fog ${className}`}>{children}</p>;
}

export function Label({ children, className = "" }: TypographyProps) {
  return <span className={`text-label text-ash ${className}`}>{children}</span>;
}

export function Eyebrow({ children, className = "" }: TypographyProps) {
  return <span className={`text-eyebrow text-fog ${className}`}>{children}</span>;
}

export function Code({ children, className = "" }: TypographyProps) {
  return (
    <code className={`font-mono text-caption text-mist bg-graphite px-1.5 py-0.5 rounded ${className}`}>
      {children}
    </code>
  );
}

/* Backward-compat aliases */
export const DisplayLarge = HeadingLg;
export const DisplayMedium = Heading;
export const DisplaySmall = Subheading;
