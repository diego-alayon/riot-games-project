"use client";

import { useEffect, useState } from "react";
import { DisplayMedium, Eyebrow, Body } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Surface";
import { prototypeStore } from "@/lib/store/prototype-store";
import { pageStore } from "@/lib/store/page-store";
import { uiFunctionalityStore } from "@/lib/store/ui-functionality-store";
import { PrototypePageList } from "@/components/prototype/PrototypePageList";
import type { Page, Prototype } from "@/lib/types/graph";

const PROTOTYPE_NAME = "Riftbound Ticketing Portal";
const INITIAL_PAGES = ["Login", "Dashboard", "Ticket List", "Ticket Detail", "New Ticket"];

const LOGIN_FUNCS = [
  { label: "Login Form", requirementCode: "FR-LAY-01", description: "SSO entry form with branding" },
  { label: "SSO Button", requirementCode: "FR-AUTH-01", description: "Triggers SSO authentication flow" },
];

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
        const page = pageStore.create(proto.id, pageName);
        if (pageName === "Login") {
          for (const func of LOGIN_FUNCS) {
            try {
              const existing = uiFunctionalityStore.getUIFunctionalitiesForPage(page.id);
              if (!existing.some((f) => f.requirementCode === func.requirementCode)) {
                uiFunctionalityStore.create(page.id, func.label, func.requirementCode, func.description);
              }
            } catch {}
          }
        }
      }
    } else {
      // Seed login page functionalities if not yet seeded
      const protoPages = pageStore.getForPrototype(proto.id);
      const loginPage = protoPages.find((p) => p.name === "Login");
      if (loginPage) {
        const existing = uiFunctionalityStore.getUIFunctionalitiesForPage(loginPage.id);
        for (const func of LOGIN_FUNCS) {
          if (!existing.some((f) => f.requirementCode === func.requirementCode)) {
            try {
              uiFunctionalityStore.create(loginPage.id, func.label, func.requirementCode, func.description);
            } catch {}
          }
        }
      }
    }

    setPrototype(proto);
    setPages(pageStore.getForPrototype(proto.id));
  }, []);

  if (!prototype) return null;

  return (
    <div className="px-6 py-96">
      <div className="max-w-6xl mx-auto space-y-10">
        <div>
          <Eyebrow className="text-fog mb-2">
            Applications / Riftbound Ticketing Portal
          </Eyebrow>
          <div className="flex items-center gap-3 mb-4">
            <DisplayMedium className="text-paper">
              Riftbound Ticketing Portal
            </DisplayMedium>
            <span className="text-xs font-medium text-pulse-green bg-graphite border border-smoke px-2 py-1 rounded">
              Has Frontend
            </span>
          </div>
          <Body className="text-mist">
            Main ticketing portal prototype with frontend pages and behavior.
          </Body>
        </div>

        <PrototypePageList prototypeId={prototype.id} initialPages={pages} />

        <div>
          <Eyebrow className="text-fog mb-3">Integrations</Eyebrow>
          <Card level={1}>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <p className="text-body-sm text-paper mb-1">
                  GateFlow — Access Control
                </p>
                <p className="text-body-sm text-mist">
                  Integrated access control layer embedded inside Riftbound. GateFlow has no frontend
                  of its own — it operates as a backend integration handling authentication and
                  authorization for this portal.
                </p>
              </div>
              <span className="text-xs text-ash bg-obsidian border border-graphite px-2 py-1 rounded whitespace-nowrap">
                No Frontend
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
