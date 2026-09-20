import { DisplayMedium, Eyebrow, Body } from "@/components/ui/Typography";

export default function CorePage() {
  return (
    <div className="px-6 py-section">
      <div className="max-w-6xl mx-auto">
        <Eyebrow className="text-linear-text-subtle mb-2">Product / Core</Eyebrow>
        <DisplayMedium className="text-linear-text-ink mb-4">
          Core
        </DisplayMedium>
        <Body className="text-linear-text-muted">
          Core domain knowledge and shared entities. Coming soon.
        </Body>
      </div>
    </div>
  );
}
