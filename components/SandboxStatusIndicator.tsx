
import React from 'react';
import { SandboxStatus } from '../types';

interface SandboxStatusIndicatorProps {
    status: SandboxStatus;
}

const SandboxStatusIndicator: React.FC<SandboxStatusIndicatorProps> = ({ status }) => {
    const statusConfig: Record<SandboxStatus, { color: string; text: string }> = {
        disconnected: { color: 'bg-gray-500', text: 'Sandbox Disconnected' },
        connecting: { color: 'bg-yellow-500 animate-pulse', text: 'Sandbox Connecting...' },
        connected: { color: 'bg-green-500', text: 'Sandbox Connected' },
        error: { color: 'bg-red-500', text: 'Sandbox Connection Error' },
    };

    const currentStatus = statusConfig[status] || statusConfig.disconnected;

    return (
        <div className="group relative flex items-center gap-2 cursor-help">
            <div className={`w-3 h-3 rounded-full transition-colors ${currentStatus.color}`}></div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {currentStatus.text}
            </div>
        </div>
    );
};

export default SandboxStatusIndicator;
