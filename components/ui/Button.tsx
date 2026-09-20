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
  const base =
    "inline-flex items-center justify-center font-medium transition-colors duration-100 rounded-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-[#e4f222] text-[#0f0f0f] hover:bg-[#d4e01f]",
    secondary:
      "bg-[#f5f5f5] text-[#3b3b3b] border border-[#e0e0e0] hover:bg-[#ebebeb]",
    ghost: "text-[#6b6b6b] hover:bg-[rgba(0,0,0,0.05)] hover:text-[#0f0f0f]",
  };

  const sizes = {
    sm: "px-2.5 py-1 text-[12px] h-7",
    md: "px-3 py-1.5 text-[13px] h-8",
    lg: "px-4 py-2 text-[14px] h-9",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
