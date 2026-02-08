import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';
import type { ImportEdge } from '../../types/graph';
import { useGraphStore } from '../../store/useGraphStore';

export function StaticImportEdge(props: EdgeProps<ImportEdge>) {
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
          stroke: '#555',
          strokeWidth: 2,
        }}
        markerEnd="url(#arrow)"
      />
      <EdgeLabelRenderer>
        <button
          className="edge-label-badge"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
            background: '#1a1a1a',
            border: '1px solid #333',
            color: '#a0a0a0',
            whiteSpace: 'nowrap',
          }}
          onClick={() => toggleEdgeType(id)}
        >
          import
        </button>
      </EdgeLabelRenderer>
    </>
  );
}
