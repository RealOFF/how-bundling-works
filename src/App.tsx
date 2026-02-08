import { ReactFlowProvider } from '@xyflow/react';
import { Toolbar } from './components/GraphEditor/Toolbar';
import { GraphEditor } from './components/GraphEditor/GraphEditor';
import { ChunkPanel } from './components/ChunkVisualization/ChunkPanel';

export default function App() {
  return (
    <ReactFlowProvider>
      <div className="h-screen w-screen flex flex-col bg-[#0a0a0a] text-white font-sans">
        <Toolbar />
        <div className="flex-1 flex min-h-0">
          <div className="flex-[65] min-w-0">
            <GraphEditor />
          </div>
          <div className="flex-[35] min-w-0">
            <ChunkPanel />
          </div>
        </div>
      </div>
    </ReactFlowProvider>
  );
}
