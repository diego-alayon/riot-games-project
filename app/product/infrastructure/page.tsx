import { DisplayMedium, Eyebrow, Body } from "@/components/ui/Typography";

export default function InfrastructurePage() {
  return (
    <div className="px-6 py-section">
      <div className="max-w-6xl mx-auto">
        <Eyebrow className="text-linear-text-subtle mb-2">Product / Infrastructure</Eyebrow>
        <DisplayMedium className="text-linear-text-ink mb-4">
          Infrastructure
        </DisplayMedium>
        <Body className="text-linear-text-muted">
          Infrastructure components and deployment documentation.
        </Body>
      </div>
    </div>
  );
}
