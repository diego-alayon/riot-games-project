"use client";

import { useEffect, useState } from "react";
import { DisplayMedium, Eyebrow, Body } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Surface";
import { prototypeStore } from "@/lib/store/prototype-store";
import { pageStore } from "@/lib/store/page-store";
import { PrototypePageList } from "@/components/prototype/PrototypePageList";
import type { Page, Prototype } from "@/lib/types/graph";

const PROTOTYPE_NAME = "Riftbound Ticketing Portal";
const INITIAL_PAGES = ["Login", "Dashboard", "Ticket List", "Ticket Detail", "New Ticket"];

export default function RiftboundPrototypePage() {
  const [prototype, setPrototype] = useState<Prototype | null>(null);
  const [pages, setPages] = useState<Page[]>([]);

  useEffect(() => {
    let proto = prototypeStore.getByName(PROTOTYPE_NAME);
    if (!proto) {
      proto = prototypeStore.create(
        PROTOTYPE_NAME,
        "Main ticketing portal with frontend pages and behavior.",
        { isReserved: false }
      );
      for (const pageName of INITIAL_PAGES) {
        pageStore.create(proto.id, pageName);
      }
    }
    setPrototype(proto);
    setPages(pageStore.getForPrototype(proto.id));
  }, []);

  if (!prototype) return null;

  return (
    <div className="px-6 py-section">
      <div className="max-w-6xl mx-auto space-y-10">
        <div>
          <Eyebrow className="text-linear-text-subtle mb-2">
            Applications / Riftbound Ticketing Portal
          </Eyebrow>
          <div className="flex items-center gap-3 mb-4">
            <DisplayMedium className="text-linear-text-ink">
              Riftbound Ticketing Portal
            </DisplayMedium>
            <span className="text-xs font-medium text-linear-success bg-linear-surface-3 border border-linear-hairline-2 px-2 py-1 rounded-linear-sm">
              Has Frontend
            </span>
          </div>
          <Body className="text-linear-text-muted">
            Main ticketing portal prototype with frontend pages and behavior.
          </Body>
        </div>

        <PrototypePageList prototypeId={prototype.id} initialPages={pages} />

        <div>
          <Eyebrow className="text-linear-text-subtle mb-3">Integrations</Eyebrow>
          <Card level={1}>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-linear-text-ink mb-1">
                  GateFlow — Access Control
                </p>
                <p className="text-sm text-linear-text-muted">
                  Integrated access control layer embedded inside Riftbound. GateFlow has no frontend
                  of its own — it operates as a backend integration handling authentication and
                  authorization for this portal.
                </p>
              </div>
              <span className="text-xs text-linear-text-tertiary bg-linear-surface-2 border border-linear-hairline-1 px-2 py-1 rounded-linear-sm whitespace-nowrap">
                No Frontend
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
