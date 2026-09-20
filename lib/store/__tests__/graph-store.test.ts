import { GraphStore } from "../graph-store";
import type { Product, Initiative, FunctionalRequirement } from "../../types/graph";
import type { BelongsToLink } from "../../types/links";

describe("GraphStore", () => {
  let store: GraphStore;

  beforeEach(() => {
    store = new GraphStore();
  });

  test("should add and retrieve a node", () => {
    const product: Product = {
      id: "prod-1",
      type: "Product",
      name: "Riftbound Ticketing Portal",
      description: "Main ticketing portal",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    store.addNode(product);
    const retrieved = store.getNode("prod-1");

    expect(retrieved).toEqual(product);
  });

  test("should filter nodes by type", () => {
    const product: Product = {
      id: "prod-1",
      type: "Product",
      name: "Test Product",
      description: "Test",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const initiative: Initiative = {
      id: "init-1",
      type: "Initiative",
      name: "Test Initiative",
      description: "Test",
      productId: "prod-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    store.addNode(product);
    store.addNode(initiative);

    const products = store.getNodesByType("Product");
    expect(products).toHaveLength(1);
    expect(products[0].type).toBe("Product");
  });

  test("should create valid link between nodes", () => {
    const initiative: Initiative = {
      id: "init-1",
      type: "Initiative",
      name: "Test",
      description: "Test",
      productId: "prod-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const requirement: FunctionalRequirement = {
      id: "req-1",
      type: "FunctionalRequirement",
      code: "FR-TEST-01",
      area: "Test",
      description: "Test requirement",
      source: "Test",
      classification: "build",
      initiativeId: "init-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    store.addNode(initiative);
    store.addNode(requirement);

    const link: BelongsToLink = {
      id: "link-1",
      type: "belongs-to",
      sourceId: "req-1",
      sourceType: "FunctionalRequirement",
      targetId: "init-1",
      targetType: "Initiative",
      createdAt: new Date(),
    };

    expect(() => store.addLink(link)).not.toThrow();

    const linksFrom = store.getLinksFrom("req-1");
    expect(linksFrom).toHaveLength(1);
    expect(linksFrom[0].targetId).toBe("init-1");
  });

  test("should reject invalid link types", () => {
    const product: Product = {
      id: "prod-1",
      type: "Product",
      name: "Test",
      description: "Test",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const initiative: Initiative = {
      id: "init-1",
      type: "Initiative",
      name: "Test",
      description: "Test",
      productId: "prod-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    store.addNode(product);
    store.addNode(initiative);

    // This should fail: "implements" cannot connect Product to Initiative
    const invalidLink: any = {
      id: "link-1",
      type: "implements",
      sourceId: "prod-1",
      sourceType: "Product",
      targetId: "init-1",
      targetType: "Initiative",
      createdAt: new Date(),
    };

    expect(() => store.addLink(invalidLink)).toThrow();
  });
});
