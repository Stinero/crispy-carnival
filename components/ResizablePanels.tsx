import React, { useRef, useCallback, useEffect, useState } from 'react';

const LAYOUT_STORAGE_KEY = 'gemini-chat-layout-v3-responsive';

interface ResizablePanelsProps {
  leftPanel: React.ReactNode;
  centerPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  isLeftPanelOpen: boolean;
  setLeftPanelOpen: (isOpen: boolean) => void;
  isRightPanelOpen: boolean;
  setRightPanelOpen: (isOpen: boolean) => void;
}

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, [matches, query]);
  return matches;
};

const ResizablePanels: React.FC<ResizablePanelsProps> = ({
  leftPanel, centerPanel, rightPanel,
  isLeftPanelOpen, setLeftPanelOpen,
  isRightPanelOpen, setRightPanelOpen,
}) => {
  const leftIsDrawer = useMediaQuery('(max-width: 1023px)');
  const rightIsDrawer = useMediaQuery('(max-width: 767px)');
  
  const [panelWidths, setPanelWidths] = useState(() => {
    try {
        const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (typeof parsed.left === 'number' && typeof parsed.right === 'number') {
                return parsed;
            }
        }
    } catch (e) { console.error("Failed to load panel layout", e); }
    return { left: 320, right: 420 };
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const isResizingLeft = useRef(false);
  const isResizingRight = useRef(false);

  const handleMouseDown = (divider: 'left' | 'right') => (e: React.MouseEvent) => {
    e.preventDefault();
    if (divider === 'left') isResizingLeft.current = true;
    if (divider === 'right') isResizingRight.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };
  
  const handleMouseUp = useCallback(() => {
    isResizingLeft.current = false;
    isResizingRight.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current || (!isResizingLeft.current && !isResizingRight.current)) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    
    setPanelWidths(prevWidths => {
        let newLeft = prevWidths.left;
        let newRight = prevWidths.right;

        if (isResizingLeft.current) {
            const newWidth = e.clientX - containerRect.left;
            const minWidth = 280;
            const maxWidth = containerRect.width - prevWidths.right - 400;
            newLeft = Math.max(minWidth, Math.min(newWidth, maxWidth));
        } else if (isResizingRight.current) {
            const newWidth = containerRect.right - e.clientX;
            const minWidth = 320;
            const maxWidth = containerRect.width - prevWidths.left - 400;
            newRight = Math.max(minWidth, Math.min(newWidth, maxWidth));
        }
        return { left: newLeft, right: newRight };
    });
  }, []);
  
  useEffect(() => {
    try {
        localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(panelWidths));
    } catch (e) {
        console.error("Failed to save panel layout", e);
    }
  }, [panelWidths]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div ref={containerRef} className="flex h-full w-full relative">
      {/* Left Panel/Drawer */}
      {leftIsDrawer ? (
        <>
          {isLeftPanelOpen && <div onClick={() => setLeftPanelOpen(false)} className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm lg:hidden" />}
          <aside className={`fixed top-0 left-0 h-full z-40 w-80 transform transition-transform duration-300 ease-in-out bg-space-blue-900/80 backdrop-blur-lg border-r border-space-blue-700/50 ${isLeftPanelOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            {leftPanel}
          </aside>
        </>
      ) : (
        isLeftPanelOpen && (
          <>
            <aside style={{ width: `${panelWidths.left}px` }} className="h-full flex-shrink-0 bg-space-blue-900/50 backdrop-blur-lg border-r border-space-blue-700/50">
              {leftPanel}
            </aside>
            <div
              onMouseDown={handleMouseDown('left')}
              className="w-1.5 h-full flex-shrink-0 transition-colors duration-200 cursor-col-resize bg-space-blue-800/50 hover:bg-accent-cyan/20 group"
            >
              <div className="w-px h-full bg-accent-cyan/10 group-hover:bg-accent-cyan/80 mx-auto transition-colors duration-200"></div>
            </div>
          </>
        )
      )}

      {/* Center Panel */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {centerPanel}
      </div>

      {/* Right Panel/Drawer */}
      {rightIsDrawer ? (
        <>
          {isRightPanelOpen && <div onClick={() => setRightPanelOpen(false)} className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm md:hidden" />}
          <aside className={`fixed top-0 right-0 h-full z-40 w-96 max-w-[90vw] transform transition-transform duration-300 ease-in-out bg-space-blue-900/80 backdrop-blur-lg border-l border-space-blue-700/50 ${isRightPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            {rightPanel}
          </aside>
        </>
      ) : (
        isRightPanelOpen && (
          <>
            <div
              onMouseDown={handleMouseDown('right')}
              className="w-1.5 h-full flex-shrink-0 transition-colors duration-200 cursor-col-resize bg-space-blue-800/50 hover:bg-accent-cyan/20 group"
            >
              <div className="w-px h-full bg-accent-cyan/10 group-hover:bg-accent-cyan/80 mx-auto transition-colors duration-200"></div>
            </div>
            <aside style={{ width: `${panelWidths.right}px` }} className="h-full flex-shrink-0 bg-space-blue-900/50 backdrop-blur-lg border-l border-space-blue-700/50">
              {rightPanel}
            </aside>
          </>
        )
      )}
    </div>
  );
};

export default ResizablePanels;