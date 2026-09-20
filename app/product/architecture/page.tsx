import { DisplayMedium, Eyebrow, Body } from "@/components/ui/Typography";

export default function ArchitecturePage() {
  return (
    <div className="px-6 py-section">
      <div className="max-w-6xl mx-auto">
        <Eyebrow className="text-linear-text-subtle mb-2">Product / Architecture</Eyebrow>
        <DisplayMedium className="text-linear-text-ink mb-4">
          Architecture
        </DisplayMedium>
        <Body className="text-linear-text-muted">
          Technical architecture documentation and decisions.
        </Body>
      </div>
    </div>
  );
}
