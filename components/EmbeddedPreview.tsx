


import React, { useState } from 'react';
import { marked } from 'marked';
import { PreviewType } from '../types';
import { CodeIcon, PaletteIcon, RefreshCwIcon } from '../constants';
import Button from './ui/Button';

type Theme = 'light' | 'dark';

interface EmbeddedPreviewProps {
  title: string;
  type: PreviewType;
  code: string;
}

const EmbeddedPreview: React.FC<EmbeddedPreviewProps> = ({ title, type, code }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [rerunKey, setRerunKey] = useState(0);
  const [theme] = useState<Theme>(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  
  const getIframeSrcDoc = (iframeType: 'p5js' | 'html', codeToRender?: string) => `
    <!DOCTYPE html>
    <html class="${theme}">
      <head>
        ${iframeType === 'p5js' ? '<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.2/p5.js"></script>' : ''}
        <style>
          body { 
            margin: 0; 
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
              ${iframeType === 'p5js' ? codeToRender : ''}
          } catch (e) {
              const errorDiv = document.createElement('div');
              errorDiv.style.fontFamily = 'monospace';
              errorDiv.style.color = 'red';
              errorDiv.innerText = 'Error: ' + e.message;
              document.body.appendChild(errorDiv);
          }
        </script>
        ${iframeType === 'html' ? codeToRender : ''}
      </body>
    </html>
  `;

  const renderContent = () => {
    switch (type) {
        case 'p5js':
            return <iframe key={`${rerunKey}-${theme}`} srcDoc={getIframeSrcDoc('p5js', code)} className="w-full h-full border-0" title="p5.js Preview" sandbox="allow-scripts" />;
        case 'html':
            return <iframe key={`${rerunKey}-${theme}`} srcDoc={getIframeSrcDoc('html', code)} className="w-full h-full border-0" title="HTML Preview" sandbox="allow-scripts" />;
        case 'markdown':
            const html = marked.parse(code, { gfm: true, breaks: true });
            return <div className="p-4 prose-custom-styles w-full h-full overflow-y-auto" dangerouslySetInnerHTML={{ __html: html }} />;
        default:
            return null;
    }
  }

  return (
    <div className="my-4 rounded-xl border border-gray-200 dark:border-gray-700/80 bg-gray-50 dark:bg-gray-800/60 overflow-hidden shadow-sm">
        <div className={`flex items-center justify-between px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 bg-gray-100/70 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-700/80`}>
            <div className="flex items-center gap-2.5">
                <PaletteIcon className="h-5 w-5 text-purple-500" />
                <span className="capitalize">{title || `${type} Preview`}</span>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
                {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
        </div>
        
        {isExpanded && (
             <div className="flex flex-col md:flex-row h-96 overflow-hidden animate-fade-in">
                <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900 overflow-hidden relative">
                  {renderContent()}
                </div>
                <div className="w-full md:w-2/5 h-full border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700/50 flex flex-col">
                    <div className="flex-shrink-0 p-2 text-sm font-semibold bg-gray-100 dark:bg-gray-800/50 flex items-center justify-between border-b border-gray-200 dark:border-gray-700/50">
                        <div className="flex items-center gap-2">
                          <CodeIcon />
                          <span>Source</span>
                        </div>
                    </div>
                    <div className="flex-grow overflow-y-auto bg-gray-50/50 dark:bg-gray-800/20">
                      <pre className="p-3 text-xs text-gray-800 dark:text-gray-200 font-mono h-full">
                            <code>{code}</code>
                      </pre>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default EmbeddedPreview;