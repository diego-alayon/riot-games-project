import type { GraphNode, NodeType } from "../types/graph";
import type { GraphLink, LinkType } from "../types/links";
import { graphStore } from "./graph-store";

export interface TraversalResult {
  node: GraphNode;
  depth: number;
  path: string[]; // IDs of nodes in the path
  link?: GraphLink;
}

export class GraphQueries {
  /**
   * Traverse forward from a node following outgoing links
   */
  static traverseForward(
    startNodeId: string,
    linkType?: LinkType,
    maxDepth: number = Infinity
  ): TraversalResult[] {
    const results: TraversalResult[] = [];
    const visited = new Set<string>();

    const traverse = (nodeId: string, depth: number, path: string[], link?: GraphLink) => {
      if (depth > maxDepth || visited.has(nodeId)) return;

      const node = graphStore.getNode(nodeId);
      if (!node) return;

      visited.add(nodeId);
      results.push({ node, depth, path: [...path, nodeId], link });

      const outgoingLinks = graphStore.getLinksFrom(nodeId, linkType);
      for (const outLink of outgoingLinks) {
        traverse(outLink.targetId, depth + 1, [...path, nodeId], outLink);
      }
    };

    traverse(startNodeId, 0, []);
    return results;
  }

  /**
   * Traverse backward from a node following incoming links
   */
  static traverseBackward(
    startNodeId: string,
    linkType?: LinkType,
    maxDepth: number = Infinity
  ): TraversalResult[] {
    const results: TraversalResult[] = [];
    const visited = new Set<string>();

    const traverse = (nodeId: string, depth: number, path: string[], link?: GraphLink) => {
      if (depth > maxDepth || visited.has(nodeId)) return;

      const node = graphStore.getNode(nodeId);
      if (!node) return;

      visited.add(nodeId);
      results.push({ node, depth, path: [...path, nodeId], link });

      const incomingLinks = graphStore.getLinksTo(nodeId, linkType);
      for (const inLink of incomingLinks) {
        traverse(inLink.sourceId, depth + 1, [...path, nodeId], inLink);
      }
    };

    traverse(startNodeId, 0, []);
    return results;
  }

  /**
   * Bidirectional traversal from a node
   */
  static traverseBidirectional(
    startNodeId: string,
    linkType?: LinkType,
    maxDepth: number = Infinity
  ): { forward: TraversalResult[]; backward: TraversalResult[] } {
    return {
      forward: this.traverseForward(startNodeId, linkType, maxDepth),
      backward: this.traverseBackward(startNodeId, linkType, maxDepth),
    };
  }

  /**
   * Find all nodes connected to a given node (both directions)
   */
  static getConnectedNodes(nodeId: string, linkType?: LinkType): GraphNode[] {
    const outgoingLinks = graphStore.getLinksFrom(nodeId, linkType);
    const incomingLinks = graphStore.getLinksTo(nodeId, linkType);

    const connectedNodeIds = new Set<string>();

    for (const link of outgoingLinks) {
      connectedNodeIds.add(link.targetId);
    }

    for (const link of incomingLinks) {
      connectedNodeIds.add(link.sourceId);
    }

    return Array.from(connectedNodeIds)
      .map(id => graphStore.getNode(id))
      .filter((node): node is GraphNode => node !== undefined);
  }

  /**
   * Filter nodes by type and optional predicate
   */
  static filterNodes<T extends GraphNode>(
    type: NodeType,
    predicate?: (node: T) => boolean
  ): T[] {
    const nodes = graphStore.getNodesByType(type) as T[];

    if (predicate) {
      return nodes.filter(predicate);
    }

    return nodes;
  }

  /**
   * Find path between two nodes
   */
  static findPath(
    sourceId: string,
    targetId: string,
    linkType?: LinkType
  ): string[] | null {
    const visited = new Set<string>();
    const queue: { nodeId: string; path: string[] }[] = [{ nodeId: sourceId, path: [sourceId] }];

    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!;

      if (nodeId === targetId) {
        return path;
      }

      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      const outgoingLinks = graphStore.getLinksFrom(nodeId, linkType);
      for (const link of outgoingLinks) {
        if (!visited.has(link.targetId)) {
          queue.push({ nodeId: link.targetId, path: [...path, link.targetId] });
        }
      }
    }

    return null; // No path found
  }

  /**
   * Get all nodes of a specific type connected to a node
   */
  static getConnectedNodesByType(
    nodeId: string,
    targetType: NodeType,
    linkType?: LinkType
  ): GraphNode[] {
    const connectedNodes = this.getConnectedNodes(nodeId, linkType);
    return connectedNodes.filter(node => node.type === targetType);
  }
}
