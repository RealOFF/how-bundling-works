const CHUNK_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f97316', // orange
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
];

export function getChunkColor(index: number): string {
  return CHUNK_COLORS[index % CHUNK_COLORS.length];
}
