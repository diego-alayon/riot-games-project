import { DisplayMedium, Eyebrow, Body } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Surface";

export default function CorePage() {
  return (
    <div className="px-6 py-section">
      <div className="max-w-4xl mx-auto">
        <Eyebrow className="text-linear-text-subtle mb-2">Product / Core</Eyebrow>
        <DisplayMedium className="text-linear-text-ink mb-4">Core</DisplayMedium>
        <Body className="text-linear-text-muted mb-8">
          Foundational platform knowledge — shared services, cross-cutting concerns, and platform standards.
        </Body>

        <Card level={1}>
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-linear-lg border border-linear-hairline-2 mb-4">
              <span className="text-linear-text-tertiary text-lg">◷</span>
            </div>
            <p className="text-linear-text-muted font-medium mb-2">Coming Soon</p>
            <p className="text-linear-text-tertiary text-sm max-w-sm mx-auto">
              The Core section is planned for a future phase. It will cover shared services, platform standards, and cross-cutting concerns.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
