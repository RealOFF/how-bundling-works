import { useState, useRef, useEffect } from 'react';
import { useGraphStore } from '../../store/useGraphStore';
import { examples } from '../../data/examples';

export function Toolbar() {
  const [showMenu, setShowMenu] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const addModule = useGraphStore((s) => s.addModule);
  const runBundler = useGraphStore((s) => s.runBundler);
  const isBundling = useGraphStore((s) => s.isBundling);
  const clearGraph = useGraphStore((s) => s.clearGraph);
  const loadExample = useGraphStore((s) => s.loadExample);
  const nodes = useGraphStore((s) => s.nodes);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowExamples(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-[#111111] border-b border-[#1a1a1a] shrink-0">
      <div className="flex items-center gap-2 px-3 py-2 md:py-3">
        <h1 className="text-sm font-semibold text-white mr-auto tracking-tight whitespace-nowrap min-w-0 truncate">How Bundling Works</h1>

        <button
          onClick={() => addModule()}
          className="px-3 py-1.5 bg-white hover:bg-neutral-200 text-black text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0"
        >
          + Add Module
        </button>

        <button
          onClick={runBundler}
          disabled={nodes.length === 0 || isBundling}
          className="px-3 py-1.5 bg-[#00dc82] hover:bg-[#00c472] disabled:bg-[#222222] disabled:text-[#666666] text-black text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0"
        >
          {isBundling ? 'Bundling...' : 'Bundle'}
        </button>

        {/* Desktop: inline buttons */}
        <div className="relative shrink-0 hidden md:block" ref={dropdownRef}>
          <button
            onClick={() => setShowExamples(!showExamples)}
            className="px-3 py-1.5 bg-transparent border border-[#333] hover:border-[#555] text-[#a0a0a0] hover:text-white text-xs font-medium rounded-md transition-colors whitespace-nowrap"
          >
            Examples
          </button>

          {showExamples && (
            <div className="absolute top-full right-0 mt-1 w-72 bg-[#1a1a1a] border border-[#222222] rounded-md z-50 overflow-hidden">
              {examples.map((example, i) => (
                <button
                  key={i}
                  onClick={() => {
                    loadExample(example.nodes, example.edges);
                    setShowExamples(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-[#222222] transition-colors first:rounded-t-md last:rounded-b-md"
                >
                  <div className="text-white text-xs font-medium">{example.name}</div>
                  <div className="text-[#666666] text-[11px] mt-0.5">{example.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={clearGraph}
          className="hidden md:block px-3 py-1.5 bg-transparent border border-[#333] hover:border-red-800 text-[#a0a0a0] hover:text-red-400 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0"
        >
          Clear
        </button>

        {/* Mobile: "..." menu */}
        <div className="relative shrink-0 md:hidden" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="px-2 py-1.5 bg-transparent border border-[#333] hover:border-[#555] text-[#a0a0a0] hover:text-white text-xs font-medium rounded-md transition-colors"
            aria-label="More options"
          >
            &#x22EE;
          </button>

          {showMenu && (
            <div className="absolute top-full right-0 mt-1 w-72 bg-[#1a1a1a] border border-[#222222] rounded-md z-50 overflow-hidden">
              <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-[#555] font-semibold">
                Examples
              </div>
              {examples.map((example, i) => (
                <button
                  key={i}
                  onClick={() => {
                    loadExample(example.nodes, example.edges);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-2.5 hover:bg-[#222222] transition-colors"
                >
                  <div className="text-white text-xs font-medium">{example.name}</div>
                  <div className="text-[#666666] text-[11px] mt-0.5">{example.description}</div>
                </button>
              ))}
              <div className="border-t border-[#222222]" />
              <button
                onClick={() => {
                  clearGraph();
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2.5 text-red-400 hover:bg-red-900/20 text-xs font-medium transition-colors"
              >
                Clear Graph
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
