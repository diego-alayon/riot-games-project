"use client";

import React, { useState } from "react";

// ── Generic sign-up / invite form ─────────────────────────────────────────────

interface SignupProps {
  title?: string;
  description?: string;
  fields?: { key: string; label: string; type?: string; placeholder?: string }[];
  submitLabel?: string;
  onSubmit?: (values: Record<string, string>) => Promise<void> | void;
}

const DEFAULT_FIELDS = [
  { key: "name",     label: "Full name",     type: "text",     placeholder: "Jane Smith" },
  { key: "email",    label: "Email address", type: "email",    placeholder: "jane@example.com" },
  { key: "password", label: "Password",      type: "password", placeholder: "••••••••" },
];

export function Signup({
  title = "Create account",
  description,
  fields = DEFAULT_FIELDS,
  submitLabel = "Sign up",
  onSubmit,
}: SignupProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSubmit?.(values);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 360, width: "100%" }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: "#0f0f0f", letterSpacing: "-0.2px", marginBottom: description ? 6 : 20 }}>
        {title}
      </h2>
      {description && (
        <p style={{ fontSize: 12, color: "#6b6b6b", marginBottom: 20, lineHeight: 1.5 }}>{description}</p>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {fields.map(f => (
          <div key={f.key}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#3b3b3b", marginBottom: 5 }}>
              {f.label}
            </label>
            <input
              type={f.type ?? "text"}
              placeholder={f.placeholder}
              value={values[f.key] ?? ""}
              onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
              required
              style={{ width: "100%", padding: "7px 10px", fontSize: 12, border: "1px solid #e5e5e5", borderRadius: 6, outline: "none", color: "#0f0f0f", backgroundColor: "#fff", boxSizing: "border-box" }}
              onFocus={e => (e.currentTarget.style.borderColor = "#6366f1")}
              onBlur={e => (e.currentTarget.style.borderColor = "#e5e5e5")}
            />
          </div>
        ))}

        {error && <p style={{ fontSize: 12, color: "#eb5757" }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{ padding: "8px 16px", fontSize: 12, fontWeight: 500, backgroundColor: loading ? "#e5e5e5" : "#0f0f0f", color: loading ? "#9b9b9b" : "#fff", border: "none", borderRadius: 6, cursor: loading ? "default" : "pointer" }}
          onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.backgroundColor = "#3b3b3b"; }}
          onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLElement).style.backgroundColor = "#0f0f0f"; }}
        >
          {loading ? "Loading…" : submitLabel}
        </button>
      </form>
    </div>
  );
}
