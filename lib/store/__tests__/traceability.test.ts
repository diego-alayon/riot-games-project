import { GraphStore } from "../graph-store";
import type {
  Initiative, FunctionalRequirement, Document, Component,
  UIFunctionality, Page, Prototype,
} from "../../types/graph";
import type { BelongsToLink, DocumentedByLink, ImplementsLink } from "../../types/links";

describe("Traceability Integration", () => {
  let store: GraphStore;

  beforeEach(() => {
    store = new GraphStore();
  });

  function makeId(prefix: string) {
    return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
  }

  test("FR-LAY-01 → UIFunctionality → Page chain", () => {
    const now = new Date();

    const initiative: Initiative = {
      id: makeId("init"),
      type: "Initiative",
      name: "Riftbound Ticketing Portal",
      description: "Core ticketing app",
      productId: "prod-1",
      createdAt: now, updatedAt: now,
    };

    const req: FunctionalRequirement = {
      id: makeId("req"),
      type: "FunctionalRequirement",
      code: "FR-LAY-01",
      area: "LAY",
      description: "Login page branding and SSO entry",
      source: "Product Design",
      classification: "build",
      initiativeId: initiative.id,
      prototypeView: "Login",
      createdAt: now, updatedAt: now,
    };

    const prototype: Prototype = {
      id: makeId("proto"),
      type: "Prototype",
      name: "Riftbound Ticketing Portal",
      description: "Core ticketing prototype",
      isReserved: false,
      createdAt: now, updatedAt: now,
    };

    const page: Page = {
      id: makeId("page"),
      type: "Page",
      name: "Login",
      prototypeId: prototype.id,
      createdAt: now, updatedAt: now,
    };

    const uiFunc: UIFunctionality = {
      id: makeId("uifunc"),
      type: "UIFunctionality",
      name: "Login Form",
      description: "SSO entry form",
      pageId: page.id,
      requirementCode: "FR-LAY-01",
      createdAt: now, updatedAt: now,
    };

    store.addNode(initiative);
    store.addNode(req);
    store.addNode(prototype);
    store.addNode(page);
    store.addNode(uiFunc);

    // Link: req belongs-to initiative
    const reqLink: BelongsToLink = {
      id: makeId("link"),
      type: "belongs-to",
      sourceId: req.id,
      sourceType: "FunctionalRequirement",
      targetId: initiative.id,
      targetType: "Initiative",
      createdAt: now,
    };
    store.addLink(reqLink);

    // Link: page belongs-to prototype
    const pageLink: BelongsToLink = {
      id: makeId("link"),
      type: "belongs-to",
      sourceId: page.id,
      sourceType: "Page",
      targetId: prototype.id,
      targetType: "Prototype",
      createdAt: now,
    };
    store.addLink(pageLink);

    // Link: uiFunc belongs-to page
    const uiFuncLink: BelongsToLink = {
      id: makeId("link"),
      type: "belongs-to",
      sourceId: uiFunc.id,
      sourceType: "UIFunctionality",
      targetId: page.id,
      targetType: "Page",
      createdAt: now,
    };
    store.addLink(uiFuncLink);

    // Verify: UIFunctionality references FR-LAY-01
    const allFuncs = store.getNodesByType("UIFunctionality") as UIFunctionality[];
    const linked = allFuncs.filter((f) => f.requirementCode === req.code);
    expect(linked).toHaveLength(1);
    expect(linked[0].name).toBe("Login Form");

    // Verify bidirectional: page → uiFunc
    const pageIncomingLinks = store.getLinksTo(page.id, "belongs-to");
    const uiFuncLink2 = pageIncomingLinks.find((l) => l.sourceId === uiFunc.id);
    expect(uiFuncLink2).toBeDefined();
  });

  test("FR → documented-by → Document link", () => {
    const now = new Date();

    const initiative: Initiative = {
      id: makeId("init"),
      type: "Initiative",
      name: "Riftbound",
      description: "Test",
      productId: "prod-1",
      createdAt: now, updatedAt: now,
    };

    const req: FunctionalRequirement = {
      id: makeId("req"),
      type: "FunctionalRequirement",
      code: "FR-LAY-01",
      area: "LAY",
      description: "Login branding",
      source: "Product Design",
      classification: "build",
      initiativeId: initiative.id,
      createdAt: now, updatedAt: now,
    };

    const doc: Document = {
      id: makeId("doc"),
      type: "Document",
      title: "System Overview",
      content: "Architecture overview",
      sectionName: "Architecture",
      createdAt: now, updatedAt: now,
    };

    store.addNode(initiative);
    store.addNode(req);
    store.addNode(doc);

    const docLink: DocumentedByLink = {
      id: makeId("link"),
      type: "documented-by",
      sourceId: req.id,
      sourceType: "FunctionalRequirement",
      targetId: doc.id,
      targetType: "Document",
      createdAt: now,
    };
    store.addLink(docLink);

    const links = store.getLinksFrom(req.id, "documented-by");
    expect(links).toHaveLength(1);
    expect(links[0].targetId).toBe(doc.id);

    // Verify target is a Document
    const linkedDoc = store.getNode(links[0].targetId);
    expect(linkedDoc?.type).toBe("Document");
  });

  test("FR → implements → Component link", () => {
    const now = new Date();

    const initiative: Initiative = {
      id: makeId("init"),
      type: "Initiative",
      name: "Riftbound",
      description: "Test",
      productId: "prod-1",
      createdAt: now, updatedAt: now,
    };

    const req: FunctionalRequirement = {
      id: makeId("req"),
      type: "FunctionalRequirement",
      code: "FR-AUTH-01",
      area: "AUTH",
      description: "SSO authentication",
      source: "Security Policy",
      classification: "native",
      initiativeId: initiative.id,
      createdAt: now, updatedAt: now,
    };

    const comp: Component = {
      id: makeId("comp"),
      type: "Component",
      name: "SSOButton",
      description: "Single sign-on button",
      technical: "React component",
      createdAt: now, updatedAt: now,
    };

    store.addNode(initiative);
    store.addNode(req);
    store.addNode(comp);

    const implLink: ImplementsLink = {
      id: makeId("link"),
      type: "implements",
      sourceId: req.id,
      sourceType: "FunctionalRequirement",
      targetId: comp.id,
      targetType: "Component",
      createdAt: now,
    };
    store.addLink(implLink);

    const links = store.getLinksFrom(req.id, "implements");
    expect(links).toHaveLength(1);

    const linkedComp = store.getNode(links[0].targetId) as Component;
    expect(linkedComp.name).toBe("SSOButton");
  });

  test("Full chain: Initiative → FR → UIFunctionality → Document", () => {
    const now = new Date();

    const initiative: Initiative = {
      id: "init-full",
      type: "Initiative",
      name: "Riftbound Ticketing Portal",
      description: "Core ticketing",
      productId: "prod-1",
      createdAt: now, updatedAt: now,
    };

    const req: FunctionalRequirement = {
      id: "req-full",
      type: "FunctionalRequirement",
      code: "FR-LAY-01",
      area: "LAY",
      description: "Login branding",
      source: "Product Design",
      classification: "build",
      initiativeId: initiative.id,
      prototypeView: "Login",
      createdAt: now, updatedAt: now,
    };

    const doc: Document = {
      id: "doc-full",
      type: "Document",
      title: "System Overview",
      content: "Architecture",
      sectionName: "Architecture",
      createdAt: now, updatedAt: now,
    };

    const page: Page = {
      id: "page-full",
      type: "Page",
      name: "Login",
      prototypeId: "proto-full",
      createdAt: now, updatedAt: now,
    };

    const uiFunc: UIFunctionality = {
      id: "uifunc-full",
      type: "UIFunctionality",
      name: "Login Form",
      description: "SSO entry form",
      pageId: page.id,
      requirementCode: "FR-LAY-01",
      createdAt: now, updatedAt: now,
    };

    store.addNode(initiative);
    store.addNode(req);
    store.addNode(doc);
    store.addNode(page);
    store.addNode(uiFunc);

    // req belongs-to initiative
    store.addLink({ id: "l1", type: "belongs-to", sourceId: req.id, sourceType: "FunctionalRequirement", targetId: initiative.id, targetType: "Initiative", createdAt: now });
    // req documented-by doc
    store.addLink({ id: "l2", type: "documented-by", sourceId: req.id, sourceType: "FunctionalRequirement", targetId: doc.id, targetType: "Document", createdAt: now });
    // uiFunc belongs-to page
    store.addLink({ id: "l3", type: "belongs-to", sourceId: uiFunc.id, sourceType: "UIFunctionality", targetId: page.id, targetType: "Page", createdAt: now });

    // Chain traversal assertions
    const initReqs = store.getLinksTo(initiative.id, "belongs-to").filter((l) => l.sourceType === "FunctionalRequirement");
    expect(initReqs.length).toBeGreaterThan(0);

    const reqDocs = store.getLinksFrom(req.id, "documented-by");
    expect(reqDocs).toHaveLength(1);

    const allFuncs = store.getNodesByType("UIFunctionality") as UIFunctionality[];
    const matchingFuncs = allFuncs.filter((f) => f.requirementCode === req.code);
    expect(matchingFuncs).toHaveLength(1);

    // Verify UIFunctionality's page is linked
    const uiFuncPageLinks = store.getLinksFrom(uiFunc.id, "belongs-to");
    expect(uiFuncPageLinks).toHaveLength(1);
    expect(uiFuncPageLinks[0].targetId).toBe(page.id);
  });
});
