import React, { useMemo } from 'react';

const DiffViewer: React.FC<{ diffText: string, language?: string }> = ({ diffText, language = 'plaintext' }) => {
    
    const highlightedLines = useMemo(() => {
        const hljs = (window as any).hljs;
        if (!hljs) {
            // Fallback if highlight.js is not loaded
            return diffText.split('\n').map(line => ({
                sign: line.startsWith('+') ? '+' : line.startsWith('-') ? '-' : ' ',
                highlightedCode: line.substring(line.startsWith('+ ') || line.startsWith('- ') ? 2 : 0),
                bgClass: line.startsWith('+') ? 'bg-green-500/10' : line.startsWith('-') ? 'bg-red-500/10' : ''
            }));
        }

        return diffText.split('\n').map((line) => {
            const sign = line.startsWith('+') ? '+' : line.startsWith('-') ? '-' : ' ';
            const code = line.substring(line.startsWith('+ ') || line.startsWith('- ') ? 2 : 0);

            let bgClass = '';
            if (sign === '+') bgClass = 'bg-green-500/10';
            else if (sign === '-') bgClass = 'bg-red-500/10';

            const highlightedCode = hljs.highlight(code, { language, ignoreIllegals: true }).value;

            return {
                sign,
                highlightedCode,
                bgClass,
            };
        });
    }, [diffText, language]);

    return (
        <pre className="p-2 bg-space-blue-900/50 rounded-md text-xs font-mono whitespace-pre-wrap">
            <code>
                {highlightedLines.map((item, index) => (
                    <div key={index} className={`flex ${item.bgClass}`}>
                        <span className="w-5 text-center select-none text-gray-500">{item.sign}</span>
                        <span className="flex-1" dangerouslySetInnerHTML={{ __html: item.highlightedCode }} />
                    </div>
                ))}
            </code>
        </pre>
    );
};

export default DiffViewer;
