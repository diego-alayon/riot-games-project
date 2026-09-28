import { DisplayMedium, Eyebrow, Body } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Surface";

/**
 * Riftbound Ticketing is a standalone app (./riftbound-ticketing) with its own
 * design system. This page only links out to it; nothing of the portal is
 * rendered or styled here.
 */
const RIFTBOUND_URL = process.env.NEXT_PUBLIC_RIFTBOUND_URL ?? "http://localhost:3001";

export default function RiftboundPortalPage() {
  return (
    <div className="px-8 py-8">
      <div className="max-w-6xl mx-auto space-y-10">
        <div>
          <Eyebrow className="text-fog mb-2">
            Applications / Riftbound Ticketing Portal
          </Eyebrow>
          <DisplayMedium className="text-paper mb-4">
            Riftbound Ticketing Portal
          </DisplayMedium>
          <Body className="text-mist">
            Standalone web application with its own design system. It runs separately from this platform.
          </Body>
        </div>

        <Card level={1}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-body-sm text-paper mb-1">Open application</p>
              <p className="text-body-sm text-mist">{RIFTBOUND_URL}</p>
            </div>
            <a
              href={RIFTBOUND_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-body-sm text-acid-lime border border-smoke px-3 py-2 rounded hover:bg-graphite whitespace-nowrap"
            >
              Open Riftbound ↗
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
