import Link from "next/link";

export default function Home() {
  return (
    <div className="px-8 py-6">
      <div className="max-w-3xl">
        <span className="text-eyebrow block mb-3">Riot-Games-Project</span>
        <h1 className="text-heading mb-2">Prototyping & Knowledge Platform</h1>
        <p className="text-body mb-8" style={{ color: "#6b6b6b" }}>
          Unified platform for building prototypes and managing product knowledge with full traceability.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div
            className="rounded-xl p-5 border"
            style={{ backgroundColor: "#f9f9f9", borderColor: "#ebebeb" }}
          >
            <span className="text-eyebrow block mb-3">Applications</span>
            <h3 className="text-heading-sm mb-1.5">Prototyping Studio</h3>
            <p className="text-body-sm mb-5">
              Build application prototypes with pages, behavior, and independent design systems.
            </p>
            <Link
              href="/applications"
              className="inline-flex items-center h-8 px-3 rounded-md text-[13px] font-medium transition-colors"
              style={{ backgroundColor: "#e4f222", color: "#0f0f0f" }}
            >
              Open Applications
            </Link>
          </div>

          <div
            className="rounded-xl p-5 border"
            style={{ backgroundColor: "#f9f9f9", borderColor: "#ebebeb" }}
          >
            <span className="text-eyebrow block mb-3">Product</span>
            <h3 className="text-heading-sm mb-1.5">Knowledge Base</h3>
            <p className="text-body-sm mb-5">
              Architecture, infrastructure, initiatives, and functional requirements with full traceability.
            </p>
            <Link
              href="/product"
              className="inline-flex items-center h-8 px-3 rounded-md text-[13px] font-medium transition-colors"
              style={{ backgroundColor: "#e4f222", color: "#0f0f0f" }}
            >
              Open Product
            </Link>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="flex gap-6 mt-8 pt-6" style={{ borderTop: "1px solid #ebebeb" }}>
          {[
            { label: "Applications", value: "2" },
            { label: "Design Systems", value: "1" },
            { label: "Initiatives", value: "3" },
            { label: "Requirements", value: "12+" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-[20px] font-[510] leading-none mb-1" style={{ color: "#0f0f0f" }}>
                {stat.value}
              </div>
              <div className="text-caption">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
