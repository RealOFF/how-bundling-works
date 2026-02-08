import { useState, useCallback, useRef, useEffect } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ModuleNode as ModuleNodeType } from '../../types/graph';
import { useGraphStore } from '../../store/useGraphStore';

export function ModuleNode({ id, data }: NodeProps<ModuleNodeType>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.filename);
  const inputRef = useRef<HTMLInputElement>(null);
  const renameNode = useGraphStore((s) => s.renameNode);
  const highlightedChunkId = useGraphStore((s) => s.highlightedChunkId);

  const isHighlighted = highlightedChunkId === null || data.chunkId === highlightedChunkId;
  const isDimmed = highlightedChunkId !== null && data.chunkId !== highlightedChunkId;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = useCallback(() => {
    setEditValue(data.filename);
    setIsEditing(true);
  }, [data.filename]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (editValue.trim()) {
      renameNode(id, editValue.trim());
    }
  }, [id, editValue, renameNode]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleBlur();
      } else if (e.key === 'Escape') {
        setIsEditing(false);
        setEditValue(data.filename);
      }
    },
    [handleBlur, data.filename]
  );

  const chunkOverlay = data.chunkColor ? `${data.chunkColor}20` : 'transparent';

  return (
    <div
      className="relative rounded-md border transition-all duration-300"
      style={{
        borderColor: data.isEntry ? '#facc15' : data.isUnreachable ? '#333' : (data.chunkColor ?? '#222222'),
        background: data.isUnreachable
          ? '#1a1a1a'
          : `linear-gradient(to bottom, #111111, #111111) padding-box, linear-gradient(to bottom, ${chunkOverlay}, ${chunkOverlay}) border-box`,
        backgroundColor: '#111111',
        opacity: isDimmed ? 0.3 : data.isUnreachable ? 0.5 : 1,
        transform: isHighlighted && !data.isUnreachable ? 'scale(1)' : 'scale(0.97)',
        minWidth: 160,
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-[#555] !w-2.5 !h-2.5 !border-0" />

      {data.isEntry && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">
          Entry
        </div>
      )}

      <div className="px-4 py-3">
        {isEditing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="bg-[#0a0a0a] text-white text-xs w-full px-1 py-0.5 rounded outline-none border border-[#333] focus:border-[#555]"
          />
        ) : (
          <div
            onDoubleClick={handleDoubleClick}
            className="text-white text-xs cursor-text truncate"
            title="Double-click to rename"
          >
            {data.filename}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-[#555] !w-2.5 !h-2.5 !border-0" />
    </div>
  );
}
