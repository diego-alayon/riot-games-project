import Link from "next/link";
import { DisplayMedium, Eyebrow, Body } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Surface";
import { Button } from "@/components/ui/Button";

const prototypes = [
  {
    id: "riftbound-ticketing-portal",
    name: "Riftbound Ticketing Portal",
    description: "Main ticketing portal with frontend pages and behavior",
    status: "active",
    hasFrontend: true,
  },
  {
    id: "onevenue-backoffice",
    name: "OneVenue Backoffice",
    description: "Reserved for future implementation",
    status: "reserved",
    hasFrontend: false,
  },
];

export default function ApplicationsPage() {
  return (
    <div className="px-6 py-section">
      <div className="max-w-6xl mx-auto">
        <Eyebrow className="text-linear-text-subtle mb-2">Applications</Eyebrow>
        <DisplayMedium className="text-linear-text-ink mb-4">
          Prototyping Studio
        </DisplayMedium>
        <Body className="text-linear-text-muted mb-12">
          Build and manage application prototypes with independent design systems.
        </Body>

        <div className="grid md:grid-cols-2 gap-6">
          {prototypes.map((prototype) => (
            <Card key={prototype.id} level={1}>
              <div className="flex items-start justify-between mb-3">
                <Eyebrow className="text-linear-text-subtle">
                  {prototype.status === "reserved" ? "Reserved" : "Active"}
                </Eyebrow>
                {prototype.hasFrontend && (
                  <span className="text-xs text-linear-success bg-linear-surface-3 px-2 py-1 rounded-linear-sm">
                    Has Frontend
                  </span>
                )}
              </div>

              <h3 className="text-xl font-semibold text-linear-text-ink mb-2">
                {prototype.name}
              </h3>
              <p className="text-linear-text-muted mb-6">
                {prototype.description}
              </p>

              {prototype.status === "active" ? (
                <Link href={`/applications/${prototype.id}`}>
                  <Button variant="secondary">Open Prototype</Button>
                </Link>
              ) : (
                <Button variant="ghost" disabled className="cursor-not-allowed opacity-50">
                  Reserved
                </Button>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
