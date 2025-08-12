import React from 'react';

interface ToggleProps {
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ label, enabled, onChange }) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-300">{label}</span>
      <button
        type="button"
        className={`${
          enabled ? 'bg-accent-cyan' : 'bg-space-blue-700'
        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-space-blue-800 focus:ring-accent-cyan`}
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
      >
        <span
          aria-hidden="true"
          className={`${
            enabled ? 'translate-x-5' : 'translate-x-0'
          } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-space-blue-900 shadow ring-0 transition duration-200 ease-in-out`}
        />
      </button>
    </div>
  );
};

export default Toggle;