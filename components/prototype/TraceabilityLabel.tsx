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
      className="font-mono text-label text-acid-lime bg-graphite border border-graphite px-1.5 py-0.5 rounded cursor-pointer hover:border-smoke transition-colors"
      title={`View requirement ${code}`}
    >
      {code}
    </button>
  );
}
