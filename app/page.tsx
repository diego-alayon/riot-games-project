import Link from "next/link";
import { Card } from "@/components/ui/Surface";
import { DisplayMedium, Eyebrow, Body } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <Eyebrow className="text-acid-lime mb-2">Riot-Games-Project</Eyebrow>
        <DisplayMedium className="text-paper mb-4">
          Prototyping & Knowledge Platform
        </DisplayMedium>
        <Body className="text-mist mb-12">
          Unified platform for building prototypes and managing product knowledge with full traceability.
        </Body>

        <div className="grid md:grid-cols-2 gap-6">
          <Card level={1}>
            <Eyebrow className="text-fog mb-3">Applications</Eyebrow>
            <h3 className="text-heading-sm text-paper mb-2">Prototyping Studio</h3>
            <p className="text-body-sm text-fog mb-6">
              Build application prototypes with pages, behavior, and independent design systems.
            </p>
            <Link href="/applications">
              <Button variant="primary">Open Applications</Button>
            </Link>
          </Card>

          <Card level={1}>
            <Eyebrow className="text-fog mb-3">Product</Eyebrow>
            <h3 className="text-heading-sm text-paper mb-2">Knowledge Base</h3>
            <p className="text-body-sm text-fog mb-6">
              Architecture, infrastructure, initiatives, and functional requirements with full traceability.
            </p>
            <Link href="/product">
              <Button variant="primary">Open Product</Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
