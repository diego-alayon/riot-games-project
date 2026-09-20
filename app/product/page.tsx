import Link from "next/link";

const sections = [
  {
    id: "architecture",
    name: "Architecture",
    description: "Technical architecture documentation and decisions",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12L7 2l5 10" /><path d="M3.8 8.5h6.4" />
      </svg>
    ),
  },
  {
    id: "infrastructure",
    name: "Infrastructure",
    description: "Infrastructure components and deployment documentation",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="1.5" width="12" height="3" rx="1" /><rect x="1" y="5.5" width="12" height="3" rx="1" /><rect x="1" y="9.5" width="12" height="3" rx="1" />
      </svg>
    ),
  },
  {
    id: "initiatives",
    name: "Initiatives",
    description: "Product initiatives with functional requirements and traceability",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 1.5l1.6 4.1H13l-3.6 2.6 1.4 4.1L7 9.7l-3.8 2.6 1.4-4.1L1 5.6h4.4L7 1.5z" />
      </svg>
    ),
  },
  {
    id: "graph",
    name: "Knowledge Graph",
    description: "Visual graph of all platform nodes and relationships",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="3" cy="7" r="1.8" /><circle cx="11" cy="3" r="1.8" /><circle cx="11" cy="11" r="1.8" />
        <line x1="4.7" y1="6.2" x2="9.3" y2="3.8" /><line x1="4.7" y1="7.8" x2="9.3" y2="10.2" />
      </svg>
    ),
  },
];

const ChevronRight = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 2.5l3.5 3.5-3.5 3.5" />
  </svg>
);

export default function ProductPage() {
  return (
    <div className="px-8 py-6">
      <div style={{ maxWidth: 720 }}>
        <span
          className="block mb-2"
          style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.4px", textTransform: "uppercase", color: "#9b9b9b" }}
        >
          Product
        </span>
        <h1
          className="mb-1"
          style={{ fontSize: 20, fontWeight: 510, color: "#0f0f0f", letterSpacing: "-0.24px", lineHeight: 1.3 }}
        >
          Knowledge Base
        </h1>
        <p className="mb-6" style={{ fontSize: 14, color: "#6b6b6b", lineHeight: 1.5 }}>
          Architecture, infrastructure, initiatives, and core domain knowledge with full traceability.
        </p>

        <div style={{ border: "1px solid #ebebeb", borderRadius: 8, overflow: "hidden" }}>
          {sections.map((s, i) => (
            <Link
              key={s.id}
              href={`/product/${s.id}`}
              className="flex items-center gap-3 px-4 group"
              style={{
                height: 52,
                borderTop: i > 0 ? "1px solid #f0f0f0" : undefined,
                backgroundColor: "#ffffff",
                textDecoration: "none",
              }}
            >
              <span style={{ color: "#9b9b9b", display: "flex", flexShrink: 0 }}>{s.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 510, color: "#0f0f0f", flex: 1 }}>{s.name}</span>
              <span style={{ fontSize: 13, color: "#9b9b9b", marginRight: 8 }}>{s.description}</span>
              <span style={{ color: "#c4c4c4", display: "flex", flexShrink: 0 }}><ChevronRight /></span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
