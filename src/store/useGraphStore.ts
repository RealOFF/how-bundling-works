import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from '@xyflow/react';
import type { ModuleNode, ImportEdge, BundleResult } from '../types/graph';
import { runBundler } from '../engine/bundler';
import { getLayoutedElements } from '../utils/layout';

let nodeIdCounter = 0;

interface GraphState {
  nodes: ModuleNode[];
  edges: ImportEdge[];
  bundleResult: BundleResult | null;
  highlightedChunkId: number | null;

  onNodesChange: OnNodesChange<ModuleNode>;
  onEdgesChange: OnEdgesChange<ImportEdge>;
  onConnect: OnConnect;

  addModule: (position?: { x: number; y: number }) => void;
  removeNode: (nodeId: string) => void;
  renameNode: (nodeId: string, filename: string) => void;
  setEntryPoint: (nodeId: string) => void;
  toggleEdgeType: (edgeId: string) => void;
  removeEdge: (edgeId: string) => void;
  runBundler: () => void;
  clearGraph: () => void;
  loadExample: (nodes: ModuleNode[], edges: ImportEdge[]) => void;
  setHighlightedChunkId: (chunkId: number | null) => void;
}

export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: [],
  edges: [],
  bundleResult: null,
  highlightedChunkId: null,

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) as ModuleNode[] });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) as ImportEdge[] });
  },

  onConnect: (connection) => {
    const newEdge: ImportEdge = {
      ...connection,
      id: `e-${connection.source}-${connection.target}-${Date.now()}`,
      type: 'static-import',
      data: { importType: 'static' },
    } as ImportEdge;
    set({ edges: addEdge(newEdge, get().edges) as ImportEdge[] });
  },

  addModule: (position) => {
    const id = `module-${++nodeIdCounter}`;
    const newNode: ModuleNode = {
      id,
      type: 'module',
      position: position ?? { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
      data: { filename: `file${nodeIdCounter}.ts`, isEntry: get().nodes.length === 0 },
    };
    set({ nodes: [...get().nodes, newNode] });
  },

  removeNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      bundleResult: null,
    });
  },

  renameNode: (nodeId, filename) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, filename } } : n
      ),
    });
  },

  setEntryPoint: (nodeId) => {
    set({
      nodes: get().nodes.map((n) => ({
        ...n,
        data: { ...n.data, isEntry: n.id === nodeId },
      })),
    });
  },

  toggleEdgeType: (edgeId) => {
    set({
      edges: get().edges.map((e) => {
        if (e.id !== edgeId) return e;
        const newType = e.data?.importType === 'static' ? 'dynamic' : 'static';
        return {
          ...e,
          type: newType === 'static' ? 'static-import' : 'dynamic-import',
          data: { ...e.data, importType: newType },
        };
      }),
    });
  },

  removeEdge: (edgeId) => {
    set({
      edges: get().edges.filter((e) => e.id !== edgeId),
      bundleResult: null,
    });
  },

  runBundler: () => {
    const { nodes, edges } = get();
    const result = runBundler(nodes, edges);

    // Apply chunk colors to nodes
    const chunkMap = new Map<string, { color: string; chunkId: number }>();
    for (const chunk of result.chunks) {
      for (const modId of chunk.modules) {
        chunkMap.set(modId, { color: chunk.color, chunkId: chunk.id });
      }
    }

    const updatedNodes = nodes.map((n) => {
      const chunkInfo = chunkMap.get(n.id);
      const isUnreachable = result.unreachableModules.includes(n.id);
      return {
        ...n,
        data: {
          ...n.data,
          chunkColor: chunkInfo?.color,
          chunkId: chunkInfo?.chunkId,
          isUnreachable,
        },
      };
    });

    set({ nodes: updatedNodes, bundleResult: result });
  },

  clearGraph: () => {
    nodeIdCounter = 0;
    set({ nodes: [], edges: [], bundleResult: null, highlightedChunkId: null });
  },

  loadExample: (nodes, edges) => {
    // Reset counter
    nodeIdCounter = nodes.length;

    // Auto-layout
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);

    set({
      nodes: layoutedNodes,
      edges: layoutedEdges,
      bundleResult: null,
      highlightedChunkId: null,
    });
  },

  setHighlightedChunkId: (chunkId) => {
    set({ highlightedChunkId: chunkId });
  },
}));
