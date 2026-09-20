"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-caption text-fog mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-3.5 py-3 rounded-md
            border border-graphite text-mist text-body-sm
            placeholder:text-ash
            focus:outline-none focus:border-mist
            transition-colors
            ${error ? "border-coral-red" : ""}
            ${className}
          `}
          style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
          {...props}
        />
        {error && (
          <p className="text-caption text-coral-red mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
