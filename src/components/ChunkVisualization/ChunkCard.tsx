import type { Chunk } from '../../types/graph';
import { useGraphStore } from '../../store/useGraphStore';

interface ChunkCardProps {
  chunk: Chunk;
  nodes: { id: string; filename: string }[];
}

const TYPE_LABELS: Record<Chunk['type'], string> = {
  main: 'Main Bundle',
  async: 'Async Chunk',
  shared: 'Shared Chunk',
};

export function ChunkCard({ chunk, nodes }: ChunkCardProps) {
  const setHighlightedChunkId = useGraphStore((s) => s.setHighlightedChunkId);
  const highlightedChunkId = useGraphStore((s) => s.highlightedChunkId);
  const isHighlighted = highlightedChunkId === chunk.id;

  const moduleNames = chunk.modules.map((modId) => {
    const node = nodes.find((n) => n.id === modId);
    return node?.filename ?? modId;
  });

  return (
    <div
      className="rounded-md border p-4 transition-all duration-200 cursor-pointer"
      style={{
        borderColor: isHighlighted ? chunk.color : `${chunk.color}40`,
        backgroundColor: `${chunk.color}10`,
        transform: isHighlighted ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isHighlighted ? `0 0 12px ${chunk.color}25` : 'none',
      }}
      onMouseEnter={() => setHighlightedChunkId(chunk.id)}
      onMouseLeave={() => setHighlightedChunkId(null)}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: chunk.color }}
        />
        <span className="text-white font-medium text-xs">
          {TYPE_LABELS[chunk.type]}
        </span>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide"
          style={{
            backgroundColor: `${chunk.color}20`,
            color: chunk.color,
          }}
        >
          {chunk.type}
        </span>
      </div>

      <div className="space-y-1 mb-3">
        {moduleNames.map((name, i) => (
          <div key={i} className="text-[#a0a0a0] text-xs pl-2 border-l" style={{ borderColor: chunk.color }}>
            {name}
          </div>
        ))}
      </div>

      <p className="text-[#666666] text-[11px] leading-relaxed">
        {chunk.reason}
      </p>
    </div>
  );
}
