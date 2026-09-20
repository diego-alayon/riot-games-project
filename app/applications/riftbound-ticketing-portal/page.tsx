import { DisplayMedium, Eyebrow, Body } from "@/components/ui/Typography";

export default function RiftboundPrototypePage() {
  return (
    <div className="px-6 py-section">
      <div className="max-w-6xl mx-auto">
        <Eyebrow className="text-linear-text-subtle mb-2">Applications / Riftbound Ticketing Portal</Eyebrow>
        <DisplayMedium className="text-linear-text-ink mb-4">
          Riftbound Ticketing Portal
        </DisplayMedium>
        <Body className="text-linear-text-muted">
          Main ticketing portal prototype with frontend pages and behavior.
        </Body>
      </div>
    </div>
  );
}
