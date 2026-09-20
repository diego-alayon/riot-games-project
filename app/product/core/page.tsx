import { DisplayMedium, Eyebrow, Body } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Surface";

export default function CorePage() {
  return (
    <div className="px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <Eyebrow className="text-fog mb-2">Product / Core</Eyebrow>
        <DisplayMedium className="text-paper mb-4">Core</DisplayMedium>
        <Body className="text-mist mb-8">
          Foundational platform knowledge — shared services, cross-cutting concerns, and platform standards.
        </Body>

        <Card level={1}>
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl border border-smoke mb-4">
              <span className="text-ash text-lg">◷</span>
            </div>
            <p className="text-mist font-medium mb-2">Coming Soon</p>
            <p className="text-ash text-body-sm max-w-sm mx-auto">
              The Core section is planned for a future phase. It will cover shared services, platform standards, and cross-cutting concerns.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
