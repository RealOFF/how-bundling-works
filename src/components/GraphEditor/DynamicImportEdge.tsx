import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';
import type { ImportEdge } from '../../types/graph';
import { useGraphStore } from '../../store/useGraphStore';

export function DynamicImportEdge(props: EdgeProps<ImportEdge>) {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition } = props;
  const toggleEdgeType = useGraphStore((s) => s.toggleEdgeType);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        {...props}
        path={edgePath}
        style={{
          stroke: '#f59e0b',
          strokeWidth: 2,
          strokeDasharray: '8 4',
          animation: 'dash 0.5s linear infinite',
        }}
        markerEnd="url(#arrow-dynamic)"
      />
      <EdgeLabelRenderer>
        <button
          className="edge-label-badge"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
            background: '#1f1709',
            border: '1px solid #5c3a06',
            color: '#f59e0b',
            whiteSpace: 'nowrap',
          }}
          onClick={() => toggleEdgeType(id)}
        >
          import()
        </button>
      </EdgeLabelRenderer>
    </>
  );
}
