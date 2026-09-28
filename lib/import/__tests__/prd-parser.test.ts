import { parsePrdMarkdown } from "../prd-parser";
import { compareFrCodes, expandFrRange, FR_DEF_RE } from "../fr-codes";
import { parseFrontmatter, parseFlowList } from "../frontmatter";

describe("FR code handling", () => {
  it("keeps the letter suffix distinct from the bare number", () => {
    expect("FR5c".match(/\bFR\d+[a-z]?\b/)![0]).toBe("FR5c");
    expect(compareFrCodes("FR5", "FR5c")).toBeLessThan(0);
    expect(compareFrCodes("FR2", "FR10")).toBeLessThan(0);
    expect(compareFrCodes("FR10", "FR2")).toBeGreaterThan(0);
  });

  it("matches the three real BMAD definition shapes", () => {
    const cases: [string, string, string][] = [
      ["- FR1: Event Manager can complete a group", "FR1", "Event Manager can complete a group"],
      ["- **FR15:** Downgrades follow the same rule", "FR15", "Downgrades follow the same rule"],
      ["- **FR32** Change-price preview toggle", "FR32", "Change-price preview toggle"],
    ];
    for (const [line, code, desc] of cases) {
      const m = line.match(FR_DEF_RE);
      expect(m).not.toBeNull();
      expect(m![1]).toBe(code);
      expect(m![2]).toBe(desc);
    }
  });

  it("expands en-dash ranges used by architecture cluster tables", () => {
    expect(expandFrRange("FR15–FR18, FR22")).toEqual(["FR15", "FR16", "FR17", "FR18", "FR22"]);
    expect(expandFrRange("FR19–FR21")).toEqual(["FR19", "FR20", "FR21"]);
  });
});

describe("frontmatter", () => {
  it("reads scalars, flow lists and block scalars, and returns the body", () => {
    const md = [
      "---",
      "initiative: 'Riftbound Ticketing Portal'",
      "jiraKey: 'SMARTVN-66030'",
      "stepsCompleted: ['step-01-init', 'step-02-discovery']",
      "classification:",
      "  projectType: 'web_app + api_backend'",
      "  complexity: 'high'",
      "rationale: |",
      "  First line.",
      "  Second line.",
      "---",
      "",
      "# Title",
    ].join("\n");

    const fm = parseFrontmatter(md);
    expect(fm.present).toBe(true);
    expect(fm.values.initiative).toBe("Riftbound Ticketing Portal");
    expect(parseFlowList(fm.values.stepsCompleted)).toEqual(["step-01-init", "step-02-discovery"]);
    expect(fm.values.rationale).toBe("First line.\nSecond line.");
    expect(fm.blocks.classification).toContain("projectType");
    expect(fm.body.trim()).toBe("# Title");
  });

  it("treats a document without front-matter as all body", () => {
    const fm = parseFrontmatter("# Just a title\n");
    expect(fm.present).toBe(false);
    expect(fm.body).toContain("# Just a title");
  });
});

describe("parsePrdMarkdown", () => {
  it("assigns each FR the business area of its enclosing heading", () => {
    const md = [
      "---",
      "initiative: 'Complete Event Groups'",
      "jiraKey: 'SMARTVN-63712'",
      "---",
      "",
      "# Product Requirements Document",
      "",
      "**Author:** OV Team",
      "**Date:** 2026-09-22",
      "",
      "## Functional Requirements",
      "",
      "### Event Lifecycle Management",
      "",
      "- FR1: Event Manager can complete a group of events",
      "- FR2: System validates child events",
      "",
      "### Impact Preview",
      "",
      "- FR22: System provides an accurate count",
      "",
      "## Non-Functional Requirements",
      "",
      "### Performance",
      "",
      "- NFR1: sync API under 2s",
    ].join("\n");

    const prd = parsePrdMarkdown(md);

    expect(prd.metadata.initiative).toBe("Complete Event Groups");
    expect(prd.metadata.jiraKey).toBe("SMARTVN-63712");
    expect(prd.metadata.author).toBe("OV Team");
    expect(prd.metadata.hasRequirementsSection).toBe(true);
    expect(prd.requirements).toEqual([
      { code: "FR1", description: "Event Manager can complete a group of events", area: "Event Lifecycle Management" },
      { code: "FR2", description: "System validates child events", area: "Event Lifecycle Management" },
      { code: "FR22", description: "System provides an accurate count", area: "Impact Preview" },
    ]);
    // The NFR section must not leak into the functional list
    expect(prd.requirements.map(r => r.code)).not.toContain("NFR1");
  });

  it("parses a PRD that has not reached the requirements step yet", () => {
    const md = [
      "---",
      "stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision']",
      "initiative: 'Riftbound Ticketing Portal'",
      "jiraKey: 'SMARTVN-66030'",
      "classification:",
      "  projectType: 'web_app + api_backend'",
      "  complexity: 'high'",
      "---",
      "",
      "# Product Requirements Document - Riftbound Ticketing Portal",
      "",
      "**Author:** OV Team",
      "**Date:** 2026-09-22",
    ].join("\n");

    const prd = parsePrdMarkdown(md);

    expect(prd.metadata.initiative).toBe("Riftbound Ticketing Portal");
    expect(prd.metadata.complexity).toBe("high");
    expect(prd.metadata.stepsCompleted).toHaveLength(3);
    expect(prd.metadata.hasRequirementsSection).toBe(false);
    expect(prd.requirements).toEqual([]);
  });
});
