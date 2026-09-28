import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";

export type ButtonVariant =
  | "primary"    // orange fill — main CTA (Select, Add, Continue to checkout, Pay)
  | "secondary"  // white outline — alternate CTA (View invoice, Browse more events, Add)
  | "selected"   // white outline, ink text — "Selected" state of a pass
  | "success"    // green outline — "Registered"
  | "fan"        // violet fill — Fan First pre-registration
  | "dark";      // navy pill — wallet actions

export type ButtonSize = "lg" | "md" | "sm" | "xs";

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-on-accent hover:bg-accent-hover disabled:bg-accent-disabled disabled:hover:bg-accent-disabled",
  secondary:
    "bg-surface text-ink border border-line-strong hover:bg-canvas disabled:text-disabled",
  selected: "bg-surface text-ink border border-line-strong",
  success: "bg-success-soft text-success border border-success",
  fan: "bg-fan text-on-accent hover:bg-fan-hover",
  dark: "bg-surface-dark text-on-dark hover:bg-surface-darker",
};

const SIZE: Record<ButtonSize, string> = {
  lg: "h-12 px-6 text-button rounded-md",
  md: "h-10 px-5 text-button rounded-md",
  sm: "h-9 px-4 text-button-sm rounded-md",
  xs: "h-7 px-3 text-micro rounded-pill",
};

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  className?: string;
  children: ReactNode;
}

function classes({ variant = "primary", size = "md", block, className }: CommonProps) {
  return cx(
    "inline-flex items-center justify-center gap-2 uppercase whitespace-nowrap select-none transition-colors",
    VARIANT[variant],
    SIZE[size],
    block && "w-full",
    className,
  );
}

type ButtonProps = CommonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className">;

export function Button({ variant, size, block, iconLeft, iconRight, className, children, type = "button", ...rest }: ButtonProps) {
  return (
    <button type={type} className={classes({ variant, size, block, className, children })} {...rest}>
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}

type LinkButtonProps = CommonProps & { href: string; target?: string };

export function LinkButton({ variant, size, block, iconLeft, iconRight, className, children, href, target }: LinkButtonProps) {
  return (
    <Link href={href} target={target} className={classes({ variant, size, block, className, children })}>
      {iconLeft}
      {children}
      {iconRight}
    </Link>
  );
}

/** Square icon button (quantity stepper, menus, dismiss). */
export function IconButton({
  label,
  children,
  className,
  tone = "outline",
  ...rest
}: { label: string; children: ReactNode; className?: string; tone?: "outline" | "ghost" } & Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "className"
>) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx(
        "inline-flex items-center justify-center size-9 rounded-md text-ink transition-colors disabled:text-disabled",
        tone === "outline" ? "border border-line-strong bg-surface hover:bg-canvas" : "hover:bg-surface-muted",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
