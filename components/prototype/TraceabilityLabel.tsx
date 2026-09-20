"use client";

import { useRouter } from "next/navigation";
import { useTraceability } from "@/lib/context/traceability-context";

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
    <button
      onClick={handleClick}
      className="font-mono text-[11px] px-1.5 py-0.5 rounded cursor-pointer transition-colors"
      style={{ backgroundColor: "#f0f0f0", color: "#3b3b3b", border: "1px solid #e0e0e0" }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "#ebebeb")}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "#f0f0f0")}
      title={`View requirement ${code}`}
    >
      {code}
    </button>
  );
}
