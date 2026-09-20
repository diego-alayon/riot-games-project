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
  const baseStyles = "rounded-linear-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-linear-accent-focus";

  const variantStyles = {
    primary: "bg-linear-accent text-white hover:bg-linear-accent-hover",
    secondary: "bg-linear-surface-2 text-linear-text-ink border border-linear-hairline-2 hover:bg-linear-surface-3",
    ghost: "text-linear-text-muted hover:text-linear-text-ink hover:bg-linear-surface-2",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
