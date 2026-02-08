import { useEffect, useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Toolbar } from './components/GraphEditor/Toolbar';
import { GraphEditor } from './components/GraphEditor/GraphEditor';
import { ChunkPanel } from './components/ChunkVisualization/ChunkPanel';
import { useGraphStore } from './store/useGraphStore';
import { examples } from './data/examples';

export default function App() {
  const loadExample = useGraphStore((s) => s.loadExample);
  const runBundler = useGraphStore((s) => s.runBundler);
  const hasNodes = useGraphStore((s) => s.nodes.length > 0);
  const [mobileTab, setMobileTab] = useState<'graph' | 'results'>('graph');

  useEffect(() => {
    if (!hasNodes) {
      const example = examples[1];
      loadExample(example.nodes, example.edges);
      queueMicrotask(() => runBundler());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ReactFlowProvider>
      <div className="h-screen w-screen flex flex-col bg-[#0a0a0a] text-white font-sans">
        <Toolbar />

        {/* Desktop: side-by-side */}
        <div className="flex-1 hidden md:flex min-h-0">
          <div className="flex-1 min-w-0">
            <GraphEditor />
          </div>
          <div className="w-[380px] shrink-0 min-w-0">
            <ChunkPanel />
          </div>
        </div>

        {/* Mobile: tabbed */}
        <div className="flex-1 flex flex-col md:hidden min-h-0">
          <div className={`flex-1 min-h-0 ${mobileTab === 'graph' ? '' : 'hidden'}`}>
            <GraphEditor />
          </div>
          <div className={`flex-1 min-h-0 overflow-y-auto ${mobileTab === 'results' ? '' : 'hidden'}`}>
            <ChunkPanel />
          </div>
          <div className="flex border-t border-[#1a1a1a] bg-[#111111] shrink-0">
            <button
              onClick={() => setMobileTab('graph')}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                mobileTab === 'graph'
                  ? 'text-white bg-[#1a1a1a]'
                  : 'text-[#666] hover:text-[#888]'
              }`}
            >
              Graph
            </button>
            <button
              onClick={() => setMobileTab('results')}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                mobileTab === 'results'
                  ? 'text-white bg-[#1a1a1a]'
                  : 'text-[#666] hover:text-[#888]'
              }`}
            >
              Results
            </button>
          </div>
        </div>
      </div>
    </ReactFlowProvider>
  );
}
