"use client";

import { useTraceability } from "@/lib/context/traceability-context";
import { useRouter } from "next/navigation";

interface TraceabilityLabelProps {
  code: string;
  onClick?: () => void;
}

export function TraceabilityLabel({ code, onClick }: TraceabilityLabelProps) {
  const { showLabels } = useTraceability();
  const router = useRouter();

  if (!showLabels) return null;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/product/initiatives/catalog?code=${encodeURIComponent(code)}`);
    }
  };

  return (
    <span
      onClick={handleClick}
      className="inline-flex items-center font-mono text-xs px-2 py-0.5 rounded-linear-sm border border-linear-hairline-2 cursor-pointer hover:border-linear-hairline-3 transition-colors"
      style={{
        backgroundColor: "var(--color-surface-3)",
        color: "var(--color-accent)",
      }}
      title={`View requirement ${code}`}
    >
      {code}
    </span>
  );
}
