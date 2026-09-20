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
          <label className="block text-[12px] font-medium mb-1.5" style={{ color: "#6b6b6b" }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-3 py-1.5 rounded-md text-[13px] outline-none transition-colors ${className}`}
          style={{
            backgroundColor: "#ffffff",
            border: `1px solid ${error ? "#eb5757" : "#e0e0e0"}`,
            color: "#0f0f0f",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#0f0f0f")}
          onBlur={(e) => (e.currentTarget.style.borderColor = error ? "#eb5757" : "#e0e0e0")}
          {...props}
        />
        {error && (
          <p className="text-[12px] mt-1" style={{ color: "#eb5757" }}>{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
