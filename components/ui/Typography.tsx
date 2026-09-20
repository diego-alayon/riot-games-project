import { ReactNode } from "react";

interface TypoProps {
  children: ReactNode;
  className?: string;
}

export function Display({ children, className = "" }: TypoProps) {
  return <h1 className={`text-display ${className}`}>{children}</h1>;
}

export function HeadingLg({ children, className = "" }: TypoProps) {
  return <h1 className={`text-heading-lg ${className}`}>{children}</h1>;
}

export function Heading({ children, className = "" }: TypoProps) {
  return <h2 className={`text-heading ${className}`}>{children}</h2>;
}

export function Subheading({ children, className = "" }: TypoProps) {
  return <h3 className={`text-subheading ${className}`}>{children}</h3>;
}

export function HeadingSm({ children, className = "" }: TypoProps) {
  return <h4 className={`text-heading-sm ${className}`}>{children}</h4>;
}

export function BodyLg({ children, className = "" }: TypoProps) {
  return <p className={`text-body-lg ${className}`}>{children}</p>;
}

export function Body({ children, className = "" }: TypoProps) {
  return <p className={`text-body ${className}`}>{children}</p>;
}

export function BodySm({ children, className = "" }: TypoProps) {
  return <p className={`text-body-sm ${className}`}>{children}</p>;
}

export function Caption({ children, className = "" }: TypoProps) {
  return <p className={`text-caption ${className}`}>{children}</p>;
}

export function Label({ children, className = "" }: TypoProps) {
  return <span className={`text-label ${className}`}>{children}</span>;
}

export function Eyebrow({ children, className = "" }: TypoProps) {
  return <span className={`text-eyebrow ${className}`}>{children}</span>;
}

// Backward compat aliases
export const DisplayLarge = HeadingLg;
export const DisplayMedium = Heading;
export const DisplaySmall = Subheading;
export const BodySmall = BodySm;
export const Code = ({ children, className = "" }: TypoProps) => (
  <code className={`font-mono text-[13px] ${className}`}>{children}</code>
);
