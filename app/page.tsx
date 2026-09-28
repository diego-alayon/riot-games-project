import Link from "next/link";

const CARDS = [
  {
    eyebrow: "APPLICATIONS",
    title: "Prototyping Studio",
    body: "Build application prototypes with pages, behavior, and independent design systems.",
    href: "/applications",
    cta: "Open Applications",
  },
  {
    eyebrow: "PRODUCT",
    title: "Knowledge Base",
    body: "Architecture, infrastructure, initiatives, and requirements with full traceability.",
    href: "/product",
    cta: "Open Product",
  },
];

export default function Home() {
  return (
    <div className="px-8 py-6">
      <div style={{ maxWidth: 720 }}>
        <span
          className="block mb-2"
          style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.4px", textTransform: "uppercase", color: "#9b9b9b" }}
        >
          Riot-Games-Project
        </span>
        <h1
          className="mb-1"
          style={{ fontSize: 20, fontWeight: 510, color: "#0f0f0f", letterSpacing: "-0.24px", lineHeight: 1.3 }}
        >
          Prototyping &amp; Knowledge Platform
        </h1>
        <p className="mb-6" style={{ fontSize: 14, color: "#6b6b6b", lineHeight: 1.5 }}>
          Unified platform for building prototypes and managing product knowledge.
        </p>

        {/* Module cards */}
        <div className="grid grid-cols-2 gap-3">
          {CARDS.map((card) => (
            <div
              key={card.href}
              className="rounded-lg"
              style={{ backgroundColor: "#f9f9f9", border: "1px solid #ebebeb", padding: 16 }}
            >
              <span
                className="block mb-3"
                style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.4px", textTransform: "uppercase", color: "#9b9b9b" }}
              >
                {card.eyebrow}
              </span>
              <h3 style={{ fontSize: 16, fontWeight: 510, color: "#0f0f0f", letterSpacing: "-0.16px", marginBottom: 6 }}>
                {card.title}
              </h3>
              <p style={{ fontSize: 13, color: "#6b6b6b", lineHeight: 1.5, marginBottom: 16 }}>
                {card.body}
              </p>
              <Link
                href={card.href}
                className="inline-flex items-center rounded-md"
                style={{
                  height: 32,
                  paddingLeft: 12,
                  paddingRight: 12,
                  fontSize: 13,
                  fontWeight: 510,
                  backgroundColor: "#e4f222",
                  color: "#0f0f0f",
                  textDecoration: "none",
                }}
              >
                {card.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
