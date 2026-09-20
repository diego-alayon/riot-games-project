import type { GraphNode, NodeType } from "../types/graph";
import type { GraphLink, LinkType } from "../types/links";
import { validateLink } from "../types/links";

export class GraphStore {
  private nodes: Map<string, GraphNode>;
  private links: Map<string, GraphLink>;
  private nodesByType: Map<NodeType, Set<string>>;
  private linksByType: Map<LinkType, Set<string>>;
  private linksBySource: Map<string, Set<string>>;
  private linksByTarget: Map<string, Set<string>>;

  constructor() {
    this.nodes = new Map();
    this.links = new Map();
    this.nodesByType = new Map();
    this.linksByType = new Map();
    this.linksBySource = new Map();
    this.linksByTarget = new Map();
  }

  // Node CRUD operations

  addNode(node: GraphNode): void {
    this.nodes.set(node.id, node);

    if (!this.nodesByType.has(node.type)) {
      this.nodesByType.set(node.type, new Set());
    }
    this.nodesByType.get(node.type)!.add(node.id);
  }

  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  updateNode(id: string, updates: Partial<GraphNode>): GraphNode | undefined {
    const node = this.nodes.get(id);
    if (!node) return undefined;

    const updatedNode = { ...node, ...updates, updatedAt: new Date() } as GraphNode;
    this.nodes.set(id, updatedNode);
    return updatedNode;
  }

  deleteNode(id: string): boolean {
    const node = this.nodes.get(id);
    if (!node) return false;

    // Remove from type index
    this.nodesByType.get(node.type)?.delete(id);

    // Remove associated links
    const sourceLinks = this.linksBySource.get(id) || new Set();
    const targetLinks = this.linksByTarget.get(id) || new Set();

    for (const linkId of [...sourceLinks, ...targetLinks]) {
      this.deleteLink(linkId);
    }

    return this.nodes.delete(id);
  }

  getNodesByType(type: NodeType): GraphNode[] {
    const nodeIds = this.nodesByType.get(type) || new Set();
    return Array.from(nodeIds)
      .map(id => this.nodes.get(id))
      .filter((node): node is GraphNode => node !== undefined);
  }

  // Link CRUD operations

  addLink(link: GraphLink): boolean {
    // Validate link type constraints
    if (!validateLink(link.type, link.sourceType, link.targetType)) {
      throw new Error(
        `Invalid link: ${link.type} cannot connect ${link.sourceType} to ${link.targetType}`
      );
    }

    // Check that both nodes exist
    if (!this.nodes.has(link.sourceId) || !this.nodes.has(link.targetId)) {
      throw new Error("Cannot create link: source or target node does not exist");
    }

    this.links.set(link.id, link);

    // Update indexes
    if (!this.linksByType.has(link.type)) {
      this.linksByType.set(link.type, new Set());
    }
    this.linksByType.get(link.type)!.add(link.id);

    if (!this.linksBySource.has(link.sourceId)) {
      this.linksBySource.set(link.sourceId, new Set());
    }
    this.linksBySource.get(link.sourceId)!.add(link.id);

    if (!this.linksByTarget.has(link.targetId)) {
      this.linksByTarget.set(link.targetId, new Set());
    }
    this.linksByTarget.get(link.targetId)!.add(link.id);

    return true;
  }

  getLink(id: string): GraphLink | undefined {
    return this.links.get(id);
  }

  deleteLink(id: string): boolean {
    const link = this.links.get(id);
    if (!link) return false;

    // Remove from indexes
    this.linksByType.get(link.type)?.delete(id);
    this.linksBySource.get(link.sourceId)?.delete(id);
    this.linksByTarget.get(link.targetId)?.delete(id);

    return this.links.delete(id);
  }

  getLinksFrom(nodeId: string, linkType?: LinkType): GraphLink[] {
    const linkIds = this.linksBySource.get(nodeId) || new Set();
    return Array.from(linkIds)
      .map(id => this.links.get(id))
      .filter((link): link is GraphLink =>
        link !== undefined && (linkType === undefined || link.type === linkType)
      );
  }

  getLinksTo(nodeId: string, linkType?: LinkType): GraphLink[] {
    const linkIds = this.linksByTarget.get(nodeId) || new Set();
    return Array.from(linkIds)
      .map(id => this.links.get(id))
      .filter((link): link is GraphLink =>
        link !== undefined && (linkType === undefined || link.type === linkType)
      );
  }

  // Query operations

  getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  getAllLinks(): GraphLink[] {
    return Array.from(this.links.values());
  }

  clear(): void {
    this.nodes.clear();
    this.links.clear();
    this.nodesByType.clear();
    this.linksByType.clear();
    this.linksBySource.clear();
    this.linksByTarget.clear();
  }
}

// Singleton instance
export const graphStore = new GraphStore();
