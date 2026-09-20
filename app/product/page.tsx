import Link from "next/link";
import { DisplayMedium, Eyebrow, Body } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Surface";
import { Button } from "@/components/ui/Button";

const sections = [
  {
    id: "architecture",
    name: "Architecture",
    description: "Technical architecture documentation and decisions",
    icon: "🏗️",
  },
  {
    id: "infrastructure",
    name: "Infrastructure",
    description: "Infrastructure components and deployment documentation",
    icon: "⚙️",
  },
  {
    id: "initiatives",
    name: "Initiatives",
    description: "Product initiatives with functional requirements and traceability",
    icon: "🎯",
  },
  {
    id: "core",
    name: "Core",
    description: "Core domain knowledge and shared entities",
    icon: "📚",
    comingSoon: true,
  },
];

export default function ProductPage() {
  return (
    <div className="px-6 py-96">
      <div className="max-w-6xl mx-auto">
        <Eyebrow className="text-fog mb-2">Product</Eyebrow>
        <DisplayMedium className="text-paper mb-4">
          Knowledge Base
        </DisplayMedium>
        <Body className="text-mist mb-12">
          Architecture, infrastructure, initiatives, and core domain knowledge with full traceability.
        </Body>

        <div className="mb-6 flex flex-wrap gap-3">
          <Link href="/product/graph">
            <span className="inline-flex items-center gap-2 text-body-sm text-acid-lime border border-linear-accent/30 bg-acid-lime/5 px-4 py-2 rounded-md hover:bg-acid-lime/10 transition-colors">
              Knowledge Graph →
            </span>
          </Link>
          <Link href="/product/traceability">
            <span className="inline-flex items-center gap-2 text-body-sm text-acid-lime border border-linear-accent/30 bg-acid-lime/5 px-4 py-2 rounded-md hover:bg-acid-lime/10 transition-colors">
              Traceability Chain →
            </span>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {sections.map((section) => (
            <Card key={section.id} level={1}>
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl">{section.icon}</span>
                <div className="flex-1">
                  <h3 className="text-heading-sm text-paper mb-2">
                    {section.name}
                  </h3>
                  <p className="text-mist mb-6">
                    {section.description}
                  </p>
                </div>
              </div>

              {section.comingSoon ? (
                <Button variant="ghost" disabled>
                  Coming Soon
                </Button>
              ) : (
                <Link href={`/product/${section.id}`}>
                  <Button variant="secondary">Open {section.name}</Button>
                </Link>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
