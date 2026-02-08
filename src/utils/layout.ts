import type { ModuleNode, ImportEdge } from '../types/graph';

const NODE_WIDTH = 180;
const NODE_HEIGHT = 60;
const H_GAP = 60;
const V_GAP = 80;

/**
 * Simple top-down layered layout using BFS ranking.
 * No external dependencies needed.
 */
export function getLayoutedElements(
  nodes: ModuleNode[],
  edges: ImportEdge[],
): { nodes: ModuleNode[]; edges: ImportEdge[] } {
  if (nodes.length === 0) return { nodes, edges };

  // Build adjacency (source → targets) and track in-degrees
  const children = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  for (const n of nodes) {
    children.set(n.id, []);
    inDegree.set(n.id, 0);
  }
  for (const e of edges) {
    children.get(e.source)?.push(e.target);
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1);
  }

  // BFS to assign layers (rank)
  const rank = new Map<string, number>();
  const queue: string[] = [];

  // Start from roots (in-degree 0). If none, start from first node.
  for (const n of nodes) {
    if ((inDegree.get(n.id) ?? 0) === 0) {
      queue.push(n.id);
      rank.set(n.id, 0);
    }
  }
  if (queue.length === 0) {
    queue.push(nodes[0].id);
    rank.set(nodes[0].id, 0);
  }

  let head = 0;
  while (head < queue.length) {
    const current = queue[head++];
    const currentRank = rank.get(current) ?? 0;
    for (const child of children.get(current) ?? []) {
      const existingRank = rank.get(child);
      if (existingRank === undefined) {
        rank.set(child, currentRank + 1);
        queue.push(child);
      } else {
        // Push deeper if reached from a later rank
        rank.set(child, Math.max(existingRank, currentRank + 1));
      }
    }
  }

  // Assign rank 0 to any unvisited nodes
  for (const n of nodes) {
    if (!rank.has(n.id)) rank.set(n.id, 0);
  }

  // Group nodes by rank
  const layers = new Map<number, string[]>();
  for (const n of nodes) {
    const r = rank.get(n.id)!;
    if (!layers.has(r)) layers.set(r, []);
    layers.get(r)!.push(n.id);
  }

  // Position nodes
  const positions = new Map<string, { x: number; y: number }>();
  const maxLayerWidth = Math.max(...[...layers.values()].map((l) => l.length));
  const totalWidth = maxLayerWidth * (NODE_WIDTH + H_GAP) - H_GAP;

  for (const [r, ids] of layers) {
    const layerWidth = ids.length * (NODE_WIDTH + H_GAP) - H_GAP;
    const offsetX = (totalWidth - layerWidth) / 2;
    ids.forEach((id, i) => {
      positions.set(id, {
        x: offsetX + i * (NODE_WIDTH + H_GAP),
        y: r * (NODE_HEIGHT + V_GAP),
      });
    });
  }

  const layoutedNodes = nodes.map((node) => ({
    ...node,
    position: positions.get(node.id) ?? { x: 0, y: 0 },
  }));

  return { nodes: layoutedNodes, edges };
}
