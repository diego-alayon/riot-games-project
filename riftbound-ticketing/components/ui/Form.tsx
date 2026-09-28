"use client";

import type { InputHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";
import { IconMinus, IconPlus } from "@/components/icons";
import { IconButton } from "./Button";

export function Checkbox({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="flex gap-3 items-start cursor-pointer text-body text-muted">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 size-4 shrink-0 accent-(--color-accent) cursor-pointer"
      />
      <span>{children}</span>
    </label>
  );
}

/** Bordered list of radio rows (payment method style). */
export function RadioList<T extends string>({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: ReactNode; hint?: ReactNode; disabled?: boolean }>;
}) {
  return (
    <div className="bg-surface border border-line rounded-lg divide-y divide-line">
      {options.map((o) => (
        <label
          key={o.value}
          className={cx("flex items-center gap-3 px-5 min-h-14", o.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer")}
        >
          <input
            type="radio"
            name={name}
            checked={value === o.value}
            disabled={o.disabled}
            onChange={() => onChange(o.value)}
            className="size-4 accent-(--color-accent)"
          />
          <span className="flex-1 text-body-lg text-ink">{o.label}</span>
          {o.hint && <span className="text-body text-muted">{o.hint}</span>}
        </label>
      ))}
    </div>
  );
}

export function TextInput({ label, className, ...rest }: { label?: string; className?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cx("flex min-w-0 flex-col gap-1.5", className)}>
      {label && <span className="text-micro uppercase text-subtle">{label}</span>}
      <input
        // 16px text below md so mobile browsers don't zoom the page on focus.
        className="w-full min-w-0 h-11 px-3.5 rounded-md bg-surface border border-line-strong max-md:text-body-lg text-body text-ink placeholder:text-disabled"
        {...rest}
      />
    </label>
  );
}

/** − 1 + stepper. Kept in the system because a comp shows it; RN-03 limits passes to 1. */
export function QuantityStepper({ value, min = 1, max = 1, onChange }: { value: number; min?: number; max?: number; onChange: (v: number) => void }) {
  return (
    <div className="inline-flex items-center gap-4">
      <IconButton label="Decrease" disabled={value <= min} onClick={() => onChange(value - 1)}>
        <IconMinus size={14} />
      </IconButton>
      <span className="w-4 text-center text-body-lg text-ink tabular-nums">{value}</span>
      <IconButton label="Increase" disabled={value >= max} onClick={() => onChange(value + 1)}>
        <IconPlus size={14} />
      </IconButton>
    </div>
  );
}
