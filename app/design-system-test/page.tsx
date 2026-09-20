import { DisplayLarge, DisplayMedium, DisplaySmall, Eyebrow, Body, Code } from "@/components/ui/Typography";
import { Surface, Card, Panel } from "@/components/ui/Surface";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function DesignSystemTestPage() {
  return (
    <div className="px-6 py-section space-y-12">
      <div className="bg-linear-surface-1 border border-linear-hairline-2 rounded-linear-lg p-6">
        <Eyebrow className="text-linear-accent mb-2">Linear Design System Test</Eyebrow>
        <p className="text-linear-text-muted text-sm">
          Accent color (#5e6ad2) appears only in: brand, focus rings, and one primary CTA per section.
          All components use proper focus rings with accent color.
        </p>
      </div>
      <section>
        <Eyebrow className="text-linear-text-subtle mb-4">Typography Scale</Eyebrow>

        <div className="space-y-8">
          <div>
            <DisplayLarge className="text-linear-accent">Display Large (80px, -3.0px tracking)</DisplayLarge>
            <p className="text-linear-text-tertiary text-sm mt-2">Used for hero sections and major headings</p>
          </div>

          <div>
            <DisplayMedium className="text-linear-text-ink">Display Medium (48px, -1.5px tracking)</DisplayMedium>
            <p className="text-linear-text-tertiary text-sm mt-2">Used for section headings</p>
          </div>

          <div>
            <DisplaySmall className="text-linear-text-ink">Display Small (32px, -0.8px tracking)</DisplaySmall>
            <p className="text-linear-text-tertiary text-sm mt-2">Used for subsection headings</p>
          </div>

          <div>
            <Eyebrow className="text-linear-text-muted">Eyebrow Text (+0.4px tracking)</Eyebrow>
            <p className="text-linear-text-tertiary text-sm mt-2">Used for labels and categories</p>
          </div>

          <div>
            <Body className="text-linear-text-ink">Body text with -0.05px tracking for optimal readability</Body>
            <p className="text-linear-text-tertiary text-sm mt-2">Default paragraph text</p>
          </div>

          <div>
            <Code className="text-linear-text-muted">const code = "Monospace font";</Code>
            <p className="text-linear-text-tertiary text-sm mt-2">Code and technical content</p>
          </div>
        </div>
      </section>

      <section>
        <Eyebrow className="text-linear-text-subtle mb-4">Surface Scale (No Shadows)</Eyebrow>

        <div className="space-y-4">
          <Surface level={1} className="p-6 rounded-linear-lg">
            <p className="text-sm text-linear-text-ink">Surface Level 1 (#0f1011)</p>
            <p className="text-xs text-linear-text-tertiary mt-1">Lowest elevation with hairline border</p>
          </Surface>

          <Surface level={2} className="p-6 rounded-linear-lg">
            <p className="text-sm text-linear-text-ink">Surface Level 2 (#141516)</p>
            <p className="text-xs text-linear-text-tertiary mt-1">Second elevation level</p>
          </Surface>

          <Surface level={3} className="p-6 rounded-linear-lg">
            <p className="text-sm text-linear-text-ink">Surface Level 3 (#18191a)</p>
            <p className="text-xs text-linear-text-tertiary mt-1">Third elevation level</p>
          </Surface>

          <Surface level={4} className="p-6 rounded-linear-lg">
            <p className="text-sm text-linear-text-ink">Surface Level 4 (#191a1b)</p>
            <p className="text-xs text-linear-text-tertiary mt-1">Highest elevation level</p>
          </Surface>
        </div>
      </section>

      <section>
        <Eyebrow className="text-linear-text-subtle mb-4">Card & Panel Components</Eyebrow>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <p className="text-sm text-linear-text-ink font-semibold mb-2">Card Component</p>
            <p className="text-sm text-linear-text-muted">12px border radius with 1px hairline</p>
          </Card>

          <Panel>
            <p className="text-sm text-linear-text-ink font-semibold mb-2">Panel Component</p>
            <p className="text-sm text-linear-text-muted">Smaller radius and padding</p>
          </Panel>
        </div>
      </section>

      <section>
        <Eyebrow className="text-linear-text-subtle mb-4">Buttons</Eyebrow>

        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="ghost">Ghost Button</Button>
        </div>

        <div className="flex flex-wrap gap-4 mt-4">
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="md">Medium</Button>
          <Button variant="primary" size="lg">Large</Button>
        </div>
      </section>

      <section>
        <Eyebrow className="text-linear-text-subtle mb-4">Input Fields</Eyebrow>

        <div className="max-w-md space-y-4">
          <Input label="Project Name" placeholder="Enter project name..." />
          <Input label="Description" placeholder="Enter description..." />
          <Input label="Error Example" placeholder="Invalid input" error="This field is required" />
        </div>
      </section>
    </div>
  );
}
