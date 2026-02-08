import { useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  MiniMap,
  type NodeMouseHandler,
  type EdgeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useGraphStore } from '../../store/useGraphStore';
import { ModuleNode } from './ModuleNode';
import { StaticImportEdge } from './StaticImportEdge';
import { DynamicImportEdge } from './DynamicImportEdge';
import { ContextMenu } from '../ContextMenu';

const nodeTypes = { module: ModuleNode };
const edgeTypes = {
  'static-import': StaticImportEdge,
  'dynamic-import': DynamicImportEdge,
};

interface MenuState {
  x: number;
  y: number;
  items: { label: string; onClick: () => void; danger?: boolean }[];
}

export function GraphEditor() {
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const onNodesChange = useGraphStore((s) => s.onNodesChange);
  const onEdgesChange = useGraphStore((s) => s.onEdgesChange);
  const onConnect = useGraphStore((s) => s.onConnect);
  const addModule = useGraphStore((s) => s.addModule);
  const removeNode = useGraphStore((s) => s.removeNode);
  const setEntryPoint = useGraphStore((s) => s.setEntryPoint);
  const toggleEdgeType = useGraphStore((s) => s.toggleEdgeType);
  const removeEdge = useGraphStore((s) => s.removeEdge);

  const [menu, setMenu] = useState<MenuState | null>(null);

  const onNodeContextMenu: NodeMouseHandler = useCallback(
    (event, node) => {
      event.preventDefault();
      setMenu({
        x: event.clientX,
        y: event.clientY,
        items: [
          {
            label: node.data.isEntry ? '✓ Entry Point' : 'Set as Entry Point',
            onClick: () => setEntryPoint(node.id),
          },
          {
            label: 'Delete Module',
            onClick: () => removeNode(node.id),
            danger: true,
          },
        ],
      });
    },
    [setEntryPoint, removeNode]
  );

  const onEdgeContextMenu: EdgeMouseHandler = useCallback(
    (event, edge) => {
      event.preventDefault();
      const isDynamic = edge.data?.importType === 'dynamic';
      setMenu({
        x: event.clientX,
        y: event.clientY,
        items: [
          {
            label: isDynamic ? 'Change to Static Import' : 'Change to Dynamic Import',
            onClick: () => toggleEdgeType(edge.id),
          },
          {
            label: 'Delete Connection',
            onClick: () => removeEdge(edge.id),
            danger: true,
          },
        ],
      });
    },
    [toggleEdgeType, removeEdge]
  );

  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      event.preventDefault();
      const reactFlowBounds = (event.target as HTMLElement).closest('.react-flow')?.getBoundingClientRect();
      if (reactFlowBounds) {
        setMenu({
          x: event.clientX,
          y: event.clientY,
          items: [
            {
              label: 'Add Module Here',
              onClick: () => {
                addModule({
                  x: event.clientX - reactFlowBounds.left,
                  y: event.clientY - reactFlowBounds.top,
                });
              },
            },
          ],
        });
      }
    },
    [addModule]
  );

  const onPaneClick = useCallback(() => {
    setMenu(null);
  }, []);

  return (
    <div className="h-full w-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        deleteKeyCode="Delete"
        className="bg-[#0a0a0a]"
      >
        <Background color="#222222" gap={20} size={1} />
        <MiniMap
          nodeColor={(n) => {
            if (n.data?.isUnreachable) return '#333';
            if (n.data?.chunkColor) return n.data.chunkColor as string;
            return '#444';
          }}
          className="!bg-[#111111] !border-[#1a1a1a]"
        />
        <svg>
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="10"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#555" />
            </marker>
            <marker
              id="arrow-dynamic"
              viewBox="0 0 10 10"
              refX="10"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
            </marker>
          </defs>
        </svg>
      </ReactFlow>
      {menu && <ContextMenu {...menu} onClose={() => setMenu(null)} />}
    </div>
  );
}
