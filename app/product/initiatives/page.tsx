import { DisplayMedium, Eyebrow, Body } from "@/components/ui/Typography";

export default function InitiativesPage() {
  return (
    <div className="px-6 py-section">
      <div className="max-w-6xl mx-auto">
        <Eyebrow className="text-linear-text-subtle mb-2">Product / Initiatives</Eyebrow>
        <DisplayMedium className="text-linear-text-ink mb-4">
          Initiatives
        </DisplayMedium>
        <Body className="text-linear-text-muted">
          Product initiatives with functional requirements and traceability.
        </Body>
      </div>
    </div>
  );
}
