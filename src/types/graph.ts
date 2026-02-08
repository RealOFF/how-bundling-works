import type { Node, Edge } from '@xyflow/react';

export interface ModuleNodeData {
  filename: string;
  isEntry: boolean;
  chunkColor?: string;
  chunkId?: number;
  isUnreachable?: boolean;
  [key: string]: unknown;
}

export interface ImportEdgeData {
  importType: 'static' | 'dynamic';
  [key: string]: unknown;
}

export type ModuleNode = Node<ModuleNodeData, 'module'>;
export type ImportEdge = Edge<ImportEdgeData>;

export interface Chunk {
  id: number;
  type: 'main' | 'async' | 'shared';
  modules: string[];
  color: string;
  reason: string;
}

export interface BundleResult {
  chunks: Chunk[];
  unreachableModules: string[];
}
