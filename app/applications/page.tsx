import Link from "next/link";
import { Button } from "@/components/ui/Button";

const prototypes = [
  {
    id: "riftbound-ticketing-portal",
    name: "Riftbound Ticketing Portal",
    description: "Main ticketing portal with frontend pages and behavior",
    status: "active",
  },
  {
    id: "onevenue-backoffice",
    name: "OneVenue Backoffice",
    description: "Reserved for future implementation",
    status: "reserved",
  },
];

const ProtoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="2" width="12" height="10" rx="1.5" />
    <path d="M4.5 5.5h5M7 5.5v3" />
  </svg>
);

export default function ApplicationsPage() {
  return (
    <div className="px-8 py-6">
      <div style={{ maxWidth: 720 }}>
        <span
          className="block mb-2"
          style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.4px", textTransform: "uppercase", color: "#9b9b9b" }}
        >
          Applications
        </span>
        <h1
          className="mb-1"
          style={{ fontSize: 20, fontWeight: 510, color: "#0f0f0f", letterSpacing: "-0.24px", lineHeight: 1.3 }}
        >
          Prototyping Studio
        </h1>
        <p className="mb-6" style={{ fontSize: 14, color: "#6b6b6b", lineHeight: 1.5 }}>
          Build and manage application prototypes with independent design systems.
        </p>

        {/* List */}
        <div style={{ border: "1px solid #ebebeb", borderRadius: 8, overflow: "hidden" }}>
          {prototypes.map((p, i) => (
            <div
              key={p.id}
              className="flex items-center gap-3 px-4"
              style={{
                height: 52,
                borderTop: i > 0 ? "1px solid #f0f0f0" : undefined,
                backgroundColor: "#ffffff",
              }}
            >
              <span style={{ color: "#9b9b9b", display: "flex", flexShrink: 0 }}>
                <ProtoIcon />
              </span>
              <div className="flex-1 min-w-0">
                <span style={{ fontSize: 14, fontWeight: 510, color: "#0f0f0f" }}>{p.name}</span>
                <span
                  className="ml-2 inline-flex items-center rounded-full"
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    padding: "1px 6px",
                    backgroundColor: p.status === "active" ? "rgba(39,166,68,0.1)" : "rgba(0,0,0,0.05)",
                    color: p.status === "active" ? "#1a8a37" : "#9b9b9b",
                  }}
                >
                  {p.status === "active" ? "Active" : "Reserved"}
                </span>
              </div>
              <span style={{ fontSize: 13, color: "#9b9b9b", flexShrink: 0, marginRight: 8 }}>
                {p.description}
              </span>
              {p.status === "active" ? (
                <Link href={`/applications/${p.id}`}>
                  <Button variant="secondary" size="sm">Open</Button>
                </Link>
              ) : (
                <Button variant="ghost" size="sm" disabled>Reserved</Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
