


import React, { useRef, useEffect, useState } from 'react';
import { PreviewState } from '../types';
import p5 from 'p5';
import { marked } from 'marked';
import { Chart, registerables } from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import { XIcon, RefreshCwIcon } from '../constants';
import Button from './ui/Button';

type Theme = 'light' | 'dark';

const PreviewDrawer: React.FC<{
  previewState: PreviewState;
  setPreviewState: React.Dispatch<React.SetStateAction<PreviewState>>;
  theme: Theme;
}> = ({ previewState, setPreviewState, theme }) => {
  const p5DrawingRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);
  
  const chartCanvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  
  const [rerunKey, setRerunKey] = useState(0);

  const getIframeSrcDoc = (iframeType: 'p5js' | 'html', code?: string) => `
    <!DOCTYPE html>
    <html class="${theme}">
      <head>
        ${iframeType === 'p5js' ? '<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.2/p5.js"></script>' : ''}
        <style>
          body, html { 
            margin: 0; 
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: auto; 
            background-color: ${theme === 'dark' ? '#111827' : '#ffffff'};
            color: ${theme === 'dark' ? '#e5e7eb' : '#1f2937'};
            font-family: sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          body > * { max-width: 100%; }
        </style>
      </head>
      <body>
        <script>
          try {
              ${iframeType === 'p5js' ? code : ''}
          } catch (e) {
              const errorDiv = document.createElement('div');
              errorDiv.style.fontFamily = 'monospace';
              errorDiv.style.color = 'red';
              errorDiv.innerText = 'Error: ' + e.message;
              document.body.appendChild(errorDiv);
          }
        </script>
        ${iframeType === 'html' ? code : ''}
      </body>
    </html>
  `;

  useEffect(() => {
    // Cleanup previous instances
    if (p5InstanceRef.current) {
      p5InstanceRef.current.remove();
      p5InstanceRef.current = null;
    }
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    if (!previewState.isOpen) return;

    if (previewState.type === 'drawing' && p5DrawingRef.current && previewState.instructions) {
      const sketch = (p: p5) => {
        p.setup = () => {
          p.createCanvas(p5DrawingRef.current!.clientWidth, p5DrawingRef.current!.clientHeight).parent(p5DrawingRef.current!);
          p.background(theme === 'dark' ? '#111827' : '#ffffff');
          previewState.instructions!.forEach(instr => {
            if (instr.fill) p.fill(instr.fill); else p.noFill();
            if (instr.stroke) p.stroke(instr.stroke); else p.noStroke();
            if (instr.lineWidth) p.strokeWeight(instr.lineWidth); else p.strokeWeight(1);
            switch (instr.shape) {
              case 'rect': p.rect(instr.x, instr.y, instr.width!, instr.height!); break;
              case 'circle': p.circle(instr.x, instr.y, instr.radius! * 2); break;
              case 'line': p.line(instr.x, instr.y, instr.x2!, instr.y2!); break;
              case 'text': if (instr.font) p.textFont(instr.font); p.text(instr.text!, instr.x, instr.y); break;
            }
          });
        };
      };
      p5InstanceRef.current = new p5(sketch);
    } else if (previewState.type === 'chartjs' && chartCanvasRef.current && previewState.chartConfig) {
      const ctx = chartCanvasRef.current.getContext('2d');
      if (ctx) {
        const isDark = theme === 'dark';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const textColor = isDark ? '#E5E7EB' : '#1F2937';
        
        const themedConfig = {
            ...previewState.chartConfig,
            options: {
                ...previewState.chartConfig.options,
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: textColor } },
                    title: { display: true, text: previewState.title, color: textColor, font: { size: 16 } }
                },
                scales: {
                    x: { ...previewState.chartConfig.options?.scales?.x, grid: { color: gridColor }, ticks: { color: textColor } },
                    y: { ...previewState.chartConfig.options?.scales?.y, grid: { color: gridColor }, ticks: { color: textColor } }
                }
            }
        };

        chartInstanceRef.current = new Chart(ctx, themedConfig);
      }
    }
    
    // Cleanup function
    return () => {
      if (p5InstanceRef.current) { p5InstanceRef.current.remove(); p5InstanceRef.current = null; }
      if (chartInstanceRef.current) { chartInstanceRef.current.destroy(); chartInstanceRef.current = null; }
    };
  }, [previewState, theme, rerunKey]);

  const renderContent = () => {
    if (!previewState.isOpen) return null;

    switch (previewState.type) {
      case 'p5js':
        return <iframe key={`${rerunKey}-${theme}`} srcDoc={getIframeSrcDoc('p5js', previewState.code)} className="w-full h-full border-0" title={previewState.title} sandbox="allow-scripts" />;
      case 'html':
        return <iframe key={`${rerunKey}-${theme}`} srcDoc={getIframeSrcDoc('html', previewState.code)} className="w-full h-full border-0" title={previewState.title} sandbox="allow-scripts" />;
      case 'markdown':
        const html = marked.parse(previewState.code || '', { gfm: true, breaks: true });
        return <div className="p-4 prose-custom-styles w-full h-full overflow-y-auto" dangerouslySetInnerHTML={{ __html: html }} />;
      case 'drawing':
        return <div ref={p5DrawingRef} className="w-full h-full"></div>;
      case 'chartjs':
        return <div className="w-full h-full p-4"><canvas ref={chartCanvasRef}></canvas></div>;
      default:
        return <div className="text-center text-sm text-gray-500">Preview type not supported.</div>;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-800/50">
      <div className="flex-shrink-0 flex justify-between items-center p-2 border-b border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-800 dark:text-gray-100 capitalize">{previewState.title || 'Preview'}</h4>
        <div>
          {(previewState.type === 'p5js' || previewState.type === 'html' || previewState.type === 'drawing' || previewState.type === 'chartjs') && (
            <Button onClick={() => setRerunKey(k => k + 1)} variant="ghost" size="sm" title="Rerun">
              <RefreshCwIcon />
            </Button>
          )}
          <Button onClick={() => setPreviewState(ps => ({ ...ps, isOpen: false }))} variant="ghost" size="sm" title="Close Preview">
            <XIcon />
          </Button>
        </div>
      </div>
      <div className="flex-grow overflow-auto">
        {previewState.isOpen ? (
          renderContent()
        ) : (
          <div className="p-4 text-center text-sm text-gray-500 h-full flex items-center justify-center">
            No active preview.
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewDrawer;