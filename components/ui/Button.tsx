"use client";

import { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  children,
  variant = "secondary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const base = "rounded-md font-inter transition-colors focus:outline-none focus:ring-2 focus:ring-acid-lime/40 disabled:opacity-40";

  const variants = {
    primary: "bg-acid-lime text-void hover:bg-[#f0fa44]",
    secondary: "bg-transparent border border-graphite text-mist hover:border-smoke hover:text-bone",
    ghost: "bg-transparent text-fog hover:text-mist hover:bg-graphite",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-caption",
    md: "px-4 py-2 text-body-sm",
    lg: "px-5 py-2.5 text-body",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      style={variant === "primary" ? { fontWeight: 510 } : undefined}
      {...props}
    >
      {children}
    </button>
  );
}
