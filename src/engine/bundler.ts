import type { ModuleNode, ImportEdge, BundleResult, Chunk } from '../types/graph';
import { getChunkColor } from '../utils/colors';

export function runBundler(nodes: ModuleNode[], edges: ImportEdge[]): BundleResult {
  const entryNode = nodes.find((n) => n.data.isEntry);
  if (!entryNode) {
    return { chunks: [], unreachableModules: nodes.map((n) => n.id) };
  }

  // Build adjacency lists
  const staticAdj = new Map<string, string[]>();
  const dynamicAdj = new Map<string, string[]>();

  for (const node of nodes) {
    staticAdj.set(node.id, []);
    dynamicAdj.set(node.id, []);
  }

  for (const edge of edges) {
    const type = edge.data?.importType ?? 'static';
    if (type === 'static') {
      staticAdj.get(edge.source)?.push(edge.target);
    } else {
      dynamicAdj.get(edge.source)?.push(edge.target);
    }
  }

  const chunks: Chunk[] = [];
  const moduleToChunks = new Map<string, number[]>();
  let chunkIdCounter = 0;

  // DFS following only static imports, collecting dynamic boundaries
  function collectStaticReachable(startId: string, visited: Set<string>): { modules: string[]; dynamicTargets: string[] } {
    const modules: string[] = [];
    const dynamicTargets: string[] = [];
    const stack = [startId];

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (visited.has(current)) continue;
      visited.add(current);
      modules.push(current);

      for (const target of staticAdj.get(current) ?? []) {
        if (!visited.has(target)) {
          stack.push(target);
        }
      }

      for (const target of dynamicAdj.get(current) ?? []) {
        dynamicTargets.push(target);
      }
    }

    return { modules, dynamicTargets };
  }

  // Process entry point: main chunk
  const globalVisited = new Set<string>();
  const pendingDynamic: { targetId: string; sourceChunkId: number }[] = [];

  const mainResult = collectStaticReachable(entryNode.id, new Set<string>());
  const mainChunkId = chunkIdCounter++;
  const mainChunk: Chunk = {
    id: mainChunkId,
    type: 'main',
    modules: mainResult.modules,
    color: getChunkColor(mainChunkId),
    reason: 'Entry point and its static dependencies form the main bundle.',
  };
  chunks.push(mainChunk);

  for (const mod of mainResult.modules) {
    globalVisited.add(mod);
    const existing = moduleToChunks.get(mod) ?? [];
    existing.push(mainChunkId);
    moduleToChunks.set(mod, existing);
  }

  for (const target of mainResult.dynamicTargets) {
    pendingDynamic.push({ targetId: target, sourceChunkId: mainChunkId });
  }

  // Process dynamic import boundaries
  const processedDynamic = new Set<string>();

  while (pendingDynamic.length > 0) {
    const { targetId } = pendingDynamic.shift()!;
    if (processedDynamic.has(targetId)) continue;
    processedDynamic.add(targetId);

    const asyncResult = collectStaticReachable(targetId, new Set<string>());
    const asyncChunkId = chunkIdCounter++;

    const targetNode = nodes.find((n) => n.id === targetId);
    const targetName = targetNode?.data.filename ?? targetId;

    const asyncChunk: Chunk = {
      id: asyncChunkId,
      type: 'async',
      modules: asyncResult.modules,
      color: getChunkColor(asyncChunkId),
      reason: `"${targetName}" is loaded with a dynamic import(), so it becomes a separate async chunk that is only downloaded when needed.`,
    };
    chunks.push(asyncChunk);

    for (const mod of asyncResult.modules) {
      globalVisited.add(mod);
      const existing = moduleToChunks.get(mod) ?? [];
      existing.push(asyncChunkId);
      moduleToChunks.set(mod, existing);
    }

    for (const target of asyncResult.dynamicTargets) {
      pendingDynamic.push({ targetId: target, sourceChunkId: asyncChunkId });
    }
  }

  // Extract shared modules (appear in 2+ chunks)
  const sharedModules: string[] = [];
  for (const [modId, chunkIds] of moduleToChunks) {
    if (chunkIds.length >= 2) {
      sharedModules.push(modId);
    }
  }

  if (sharedModules.length > 0) {
    const sharedChunkId = chunkIdCounter++;
    const sharedNames = sharedModules.map((id) => {
      const node = nodes.find((n) => n.id === id);
      return node?.data.filename ?? id;
    });

    const sharedChunk: Chunk = {
      id: sharedChunkId,
      type: 'shared',
      modules: sharedModules,
      color: getChunkColor(sharedChunkId),
      reason: `${sharedNames.join(', ')} ${sharedModules.length === 1 ? 'is' : 'are'} imported by multiple chunks, so the bundler extracts ${sharedModules.length === 1 ? 'it' : 'them'} into a shared chunk to avoid duplication.`,
    };
    chunks.push(sharedChunk);

    // Remove shared modules from their original chunks
    for (const chunk of chunks) {
      if (chunk.type !== 'shared') {
        chunk.modules = chunk.modules.filter((m) => !sharedModules.includes(m));
      }
    }
  }

  // Find unreachable modules
  const unreachableModules = nodes
    .filter((n) => !globalVisited.has(n.id))
    .map((n) => n.id);

  return { chunks: chunks.filter((c) => c.modules.length > 0), unreachableModules };
}
