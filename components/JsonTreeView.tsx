


import React, { useState } from 'react';
import { ChevronDownIcon } from '../constants';

const getDataType = (value: any) => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
}

const DataValue: React.FC<{ type: string; value: any }> = ({ type, value }) => {
    let className = 'font-mono ';
    switch (type) {
        case 'string':
            className += 'text-green-600 dark:text-green-400';
            return <span className={className}>"{value}"</span>;
        case 'number':
            className += 'text-cyan-600 dark:text-cyan-400';
            break;
        case 'boolean':
            className += 'text-purple-600 dark:text-purple-400 font-semibold';
            break;
        case 'null':
             className += 'text-gray-500 font-semibold';
             return <span className={className}>null</span>;
        default:
            className += 'text-gray-500';
    }
    return <span className={className}>{String(value)}</span>
};

const JsonTreeView: React.FC<{ data: any; rootName?: string }> = ({ data, rootName = 'session' }) => {
  return (
    <div className="text-sm">
      <JsonNode data={data} name={rootName} isRoot />
    </div>
  );
};

const JsonNode: React.FC<{ data: any; name: string; isRoot?: boolean }> = ({ data, name, isRoot = false }) => {
  const [isOpen, setIsOpen] = useState(isRoot);
  const type = getDataType(data);

  const isExpandable = type === 'object' || type === 'array';
  const entries = isExpandable ? Object.entries(data) : [];
  
  const Summary: React.FC = () => {
    if (!isExpandable) {
        return <DataValue type={type} value={data} />;
    }
    if (type === 'array') {
        return <span className="text-gray-500">Array({entries.length})</span>
    }
    return <span className="text-gray-500">Object {'{...}'}</span>
  }
  
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if(isExpandable) setIsOpen(!isOpen);
  }

  return (
    <div className={isRoot ? '' : 'ml-4'}>
      <div onClick={handleToggle} className={`flex items-start ${isExpandable ? 'cursor-pointer' : 'cursor-default'} group py-0.5`}>
        {isExpandable ? (
            <ChevronDownIcon className={`w-4 h-4 flex-shrink-0 mr-1 mt-0.5 text-gray-400 group-hover:text-gray-600 transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`} />
        ) : (
            <div className="w-4 mr-1 flex-shrink-0"></div>
        )}
        <span className="text-gray-800 dark:text-gray-300 mr-2 font-mono">{name}:</span>
        {isOpen && isExpandable ? null : <Summary />}
      </div>
      {isOpen && isExpandable && (
        <div className="border-l border-gray-200 dark:border-gray-700">
          {entries.map(([key, value]) => (
            <JsonNode key={key} data={value} name={key} />
          ))}
        </div>
      )}
    </div>
  );
};

export default JsonTreeView;