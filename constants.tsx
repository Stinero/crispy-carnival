

import React from 'react';
import { NeuralNetName, Profile } from './types';
import { ALL_TOOLS } from './tools';

// --- Icon Components ---

export const BotIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 8V4H8"></path>
        <rect width="16" height="12" x="4" y="8" rx="2"></rect>
        <path d="M2 14h2"></path>
        <path d="M20 14h2"></path>
        <path d="M15 13v2"></path>
        <path d="M9 13v2"></path>
    </svg>
);

export const UserIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);

export const SearchIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

export const ErrorIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
);

export const ToolIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
);

export const CopyIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
);

export const CheckIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"></polyline></svg>
);

export const EditIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);

export const RefreshCwIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M3 21v-5h5"></path></svg>
);

export const Volume2Icon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
);

export const ChevronDownIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="6 9 12 15 18 9"></polyline></svg>
);

export const BrainCircuitIcon = ({className}: {className?: string}) => (
     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 5a3 3 0 1 0-5.993.142"></path><path d="M18 5a3 3 0 1 0-5.993.142"></path><path d="M15 13a3 3 0 1 0-5.993.142"></path><path d="M9 13a3 3 0 1 0-5.993.142"></path><path d="M12 18a3 3 0 1 0-5.993.142"></path><path d="M18 18a3 3 0 1 0-5.993.142"></path><path d="M12 5a3 3 0 1 0-5.993.142"></path><path d="M18 5a3 3 0 1 0-5.993.142"></path><path d="M15 13a3 3 0 1 0-5.993.142"></path><path d="M9 13a3 3 0 1 0-5.993.142"></path><path d="M12 18a3 3 0 1 0-5.993.142"></path><path d="M18 18a3 3 0 1 0-5.993.142"></path><path d="M12 8V5"></path><path d="M15 13h-3"></path><path d="M9 13H6"></path><path d="M12 18v-2"></path><path d="M18 18v-2"></path><path d="M18 8V5"></path><path d="M14.007 6.5A2.5 2.5 0 0 0 12 8a2.5 2.5 0 0 0-2.007-1.5"></path><path d="M14.007 14.5a2.5 2.5 0 0 0-2.007 1.5 2.5 2.5 0 0 0-2.007-1.5"></path><path d="M10.007 11.5a2.5 2.5 0 0 0-2.007 1.5 2.5 2.5 0 0 0-2.007-1.5"></path><path d="M17.007 11.5a2.5 2.5 0 0 0-2.007 1.5 2.5 2.5 0 0 0-2.007-1.5"></path><path d="m15 8-3 5"></path><path d="m9 8 3 5"></path><path d="m12 13-1.5 2.5"></path></svg>
);

export const BrainIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15A2.5 2.5 0 0 1 9.5 22h-2A2.5 2.5 0 0 1 5 19.5v-15A2.5 2.5 0 0 1 7.5 2h2Z"></path><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 2.5 2.5h2a2.5 2.5 0 0 0 2.5-2.5v-15A2.5 2.5 0 0 0 16.5 2h-2Z"></path></svg>
);

export const DatabaseIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
);
export const GlobeIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
);

export const ZapIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
);

export const PaletteIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.47-1.125-.29-.289-.652-.469-1.078-.469a1.65 1.65 0 0 0-1.648 1.667c0 .92.748 1.633 1.648 1.633.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.47-1.125-.29-.289-.652-.469-1.078-.469a1.65 1.65 0 0 0-1.648 1.667c0 .92.748 1.633 1.648 1.633.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.47-1.125-.29-.289-.652-.469-1.078-.469a1.65 1.65 0 0 0-1.648 1.667c0 .92.748 1.633 1.648 1.633.926 0 1.648-.746 1.648-1.688V2.616A10 10 0 1 0 12 22Z"></path></svg>
);
export const FolderIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
);

export const ShieldCheckIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
);

export const RouteIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="6" cy="19" r="3"></circle><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"></path><circle cx="18" cy="5" r="3"></circle></svg>
);

export const PieChartIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
);
export const CheckCircle2 = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
);
export const AlertCircle = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
);
export const Info = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
);

export const SendIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m22 2-7 20-4-9-9-4Z"/><path d="m22 2-11 11"/></svg>
);

export const MicIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line></svg>
);

export const PaperclipIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.59a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
);

export const XIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
export const StopIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
);

export const MenuIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);

export const CommandIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path></svg>
);

export const SunIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
);

export const MoonIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
);

export const SettingsIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.4l-.15-.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2.4l.15.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);

export const SlidersIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
);

export const TerminalIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
);

export const SparklesIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"/><path d="M22 12L20 17 15 19 20 21 22 26 24 21 29 19 24 17 22 12zM10 2L9 4 7 5 9 6 10 8 11 6 13 5 11 4 10 2z"/></svg>
);

export const ResetIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M21 21v-5h-5"></path></svg>
);

export const UndoIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 14H6.24a3.5 3.5 0 1 1 0-7H15"></path><polyline points="11 18 6 14 11 10"></polyline></svg>
);

export const SaveIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
);
export const LoadIcon = ({className}: {className?: string}) => (
     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
);

export const BookmarkIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path></svg>
);
export const PlusCircleIcon = ({className}: {className?: string}) => (
     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
);

export const TrashIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);
export const WandIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 4V2"></path><path d="M15 16v-2"></path><path d="M14 9l1.5-1.5"></path><path d="M19.5 11.5L21 10"></path><path d="M3 21l9-9"></path><path d="M12.5 5.5L14 4"></path><path d="M6 13H4"></path><path d="M22 13h-2"></path><path d="M10 18l-1.5 1.5"></path><path d="M4.5 6.5L3 8"></path></svg>
);
export const KeyIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
);

export const SandboxIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
);

export const FileIcon = ({className}: {className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
);

export const RewindIcon = ({className}: {className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="11 19 2 12 11 5 11 19"></polygon><polygon points="22 19 13 12 22 5 22 19"></polygon></svg>
);

export const FileJsonIcon = ({className}: {className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1"></path><path d="M14 16a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1"></path></svg>
);

export const DollarSignIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
);

export const CodeIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
);

export const LayoutDashboardIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
);

export const FlaskConicalIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M8.5 2h7l5 11-2.5 2.5L13 22h-2l-4.5-6.5L4 13l5-11z"/><path d="M6 13h12"/><path d="M10 9l1 1"/><path d="M13 9l-1 1"/></svg>
);
export const FileCheckIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg>
);
export const GitCompareIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><path d="M11 18H8a2 2 0 0 1-2-2V9"/></svg>
);

export const ImageIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
);

export const ConsciousnessIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="3"/>
        <path d="M22 12c-4.5 4.5-15.5 4.5-20 0"/>
        <path d="M2 12C6.5 7.5 17.5 7.5 22 12"/>
        <path d="M12 2v2"/>
        <path d="M12 20v2"/>
        <path d="m4.93 4.93 1.41 1.41"/>
        <path d="m17.66 17.66 1.41 1.41"/>
        <path d="M2 12h2"/>
        <path d="M20 12h2"/>
        <path d="m4.93 19.07 1.41-1.41"/>
        <path d="m17.66 6.34 1.41-1.41"/>
    </svg>
);


// --- Agent & Model Constants ---

export const AVAILABLE_MODELS = [
    'gemini-2.5-flash',
];

export const TOOL_NET_MAP: Record<string, NeuralNetName> = {
    search_web: 'WEB_SEARCH',
    wikipedia_search: 'WEB_SEARCH',
    wikipedia_summary: 'WEB_SEARCH',
    e2b_browser_fetch: 'WEB_SEARCH',
    e2b_python: 'EXECUTION',
    run_python: 'EXECUTION',
    run_bash: 'EXECUTION',
    e2b_bash: 'EXECUTION',
    e2b_write_file: 'FILE_IO',
    e2b_read_file: 'FILE_IO',
    e2b_list_files: 'FILE_IO',
    e2b_create_directory: 'FILE_IO',
    e2b_move_file: 'FILE_IO',
    e2b_delete: 'FILE_IO',
    e2b_create_word_doc: 'FILE_IO',
    e2b_create_excel_file: 'FILE_IO',
    create_project_scaffold: 'FILE_IO',
    generate_documentation: 'FILE_IO',
    edit_file: 'FILE_IO',
    delegate_task: 'ORCHESTRATION',
    render_markdown: 'SYNTHESIS',
    render_p5js_sketch: 'CREATIVITY',
    draw_on_canvas: 'CREATIVITY',
    create_report: 'SYNTHESIS',
    create_interactive_poll: 'SYNTHESIS',
    generate_3d_text_scene: 'CREATIVITY',
    generate_image: 'CREATIVITY',
    commit_memory: 'MEMORY',
    recall_memory: 'MEMORY',
    code_linter: 'ALGORITHMS',
    run_tests: 'EXECUTION',
    dependency_inspector: 'ALGORITHMS',
    refactor_code: 'ALGORITHMS',
    code_reviewer: 'ALGORITHMS',
    sort_data: 'ALGORITHMS',
    graph_traverse: 'ALGORITHMS',
    diff_text: 'ALGORITHMS',
    execute_algorithm: 'ALGORITHMS',
    execute_sql: 'DATABASE',
    schema_designer: 'DATABASE',
    visualize_db_schema: 'DATABASE',
    generate_unit_tests: 'ALGORITHMS',
    api_endpoint_tester: 'EXECUTION',
    sentiment_analyzer: 'ANALYTICS',
    code_complexity_analyzer: 'ANALYTICS',
    csv_to_json: 'ANALYTICS',
    data_analyzer: 'ANALYTICS',
    generate_chart: 'ANALYTICS',
    text_to_structured_data: 'ANALYTICS',
    code_debugger: 'EXECUTION',
};

export const NEURAL_NET_DEFINITIONS: Record<NeuralNetName, { title: string; description: string; }> = {
    CONSCIOUSNESS: { title: "Consciousness", description: "Evaluates and refines responses for holistic alignment." },
    ORCHESTRATION: { title: "Orchestration", description: "Central coordinator, routing tasks to other nets." },
    PLANNING: { title: "Planning", description: "Devises and revises multi-step plans." },
    MEMORY: { title: "Memory", description: "Handles long-term storage and retrieval." },
    EXECUTION: { title: "Execution", description: "Runs code and commands in sandboxed environments." },
    FILE_IO: { title: "File I/O", description: "Manages reading, writing, and modifying files." },
    WEB_SEARCH: { title: "Web Search", description: "Accesses and processes information from the web." },
    SYNTHESIS: { title: "Synthesis", description: "Generates the final, user-facing responses." },
    CREATIVITY: { title: "Creativity", description: "Generates novel content like images and scenes." },
    ALGORITHMS: { title: "Algorithms", description: "Performs logical operations like sorting and code analysis."},
    DATABASE: { title: "Database", description: "Manages structured data and SQL execution."},
    ANALYTICS: { title: "Analytics", description: "Analyzes data to extract insights and generate charts."},
    NEUTRAL: { title: "Idle", description: "The agent is awaiting input." },
};

export const NEURAL_NET_ORDER: NeuralNetName[] = [
    'CONSCIOUSNESS', 'PLANNING', 'MEMORY', 'WEB_SEARCH', 'FILE_IO', 'DATABASE', 'ALGORITHMS', 'ANALYTICS', 'EXECUTION', 'CREATIVITY', 'SYNTHESIS'
]

export const NEURAL_NET_COLORS: Record<NeuralNetName, string> = {
    CONSCIOUSNESS: 'text-yellow-300',
    PLANNING: 'text-indigo-400',
    MEMORY: 'text-sky-400',
    EXECUTION: 'text-amber-400',
    FILE_IO: 'text-lime-400',
    WEB_SEARCH: 'text-blue-400',
    SYNTHESIS: 'text-fuchsia-400',
    CREATIVITY: 'text-rose-400',
    ORCHESTRATION: 'text-gray-400',
    ALGORITHMS: 'text-teal-400',
    DATABASE: 'text-cyan-400',
    ANALYTICS: 'text-orange-400',
    NEUTRAL: 'text-gray-500',
};

export const NEURAL_NET_HEX_COLORS: Record<NeuralNetName, string> = {
    CONSCIOUSNESS: '#fde047', // yellow-300
    PLANNING: '#818cf8', // indigo-400
    MEMORY: '#38bdf8', // sky-400
    EXECUTION: '#f59e0b', // amber-400
    FILE_IO: '#a3e635', // lime-400
    WEB_SEARCH: '#60a5fa', // blue-400
    SYNTHESIS: '#f0abfc', // fuchsia-400
    CREATIVITY: '#fb7185', // rose-400
    ORCHESTRATION: '#9ca3af', // gray-400
    ALGORITHMS: '#2dd4bf', // teal-400
    DATABASE: '#22d3ee', // cyan-400
    ANALYTICS: '#fb923c', // orange-400
    NEUTRAL: '#6b7280', // gray-500
};

export const COMPONENT_ICON_MAP: Record<string, React.FC<{className?:string}>> = {
    info: Info,
    success: CheckCircle2,
    warning: AlertCircle,
    error: AlertCircle,
    zap: ZapIcon,
    sparkles: SparklesIcon,
    brain: BrainIcon,
    search: SearchIcon,
    tool: ToolIcon,
    file: FileIcon,
    folder: FolderIcon,
    database: DatabaseIcon,
    chart: PieChartIcon,
};

// --- Default Configuration Profiles ---

export const DEFAULT_PROFILES: Profile[] = [
  {
    id: 'default-creative',
    name: 'Creative Assistant',
    isDefault: true,
    config: {
      model: 'gemini-2.5-flash',
      temperature: 0.8,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 4096,
      systemPrompt: "You are a friendly and creative assistant. You are helpful and harmless. For software development or complex data analysis, delegate to the 'Developer Agent' or 'Data Analyst' respectively using the `delegate_task` tool.",
      useJsonMode: false,
      jsonSchema: '',
      useGoogleSearch: true,
      enabledTools: ALL_TOOLS.reduce((acc: Record<string, boolean>, tool) => {
        const creativeTools = ['generate_image', 'search_web', 'render_p5js_sketch', 'create_interactive_poll', 'generate_3d_text_scene', 'delegate_task'];
        if (creativeTools.includes(tool.name)) {
          acc[tool.name] = true;
        }
        return acc;
      }, {}),
      autoApprove: true,
    }
  },
  {
    id: 'default-developer',
    name: 'Developer Agent',
    config: {
      model: 'gemini-2.5-flash',
      temperature: 0.2,
      topP: 0.9,
      topK: 32,
      maxOutputTokens: 8192,
      systemPrompt: "You are a senior software engineer agent. You can read and write files, run tests, and use a browser. Your goal is to complete the user's software development tasks. Reason step-by-step and use tools to achieve your goals. When editing files, use the `edit_file` tool which is safer than reading then writing. For creative writing (like blog posts) or image generation, delegate to the 'Creative Assistant'. For complex data analysis or chart generation from raw data, delegate to the 'Data Analyst'.",
      useJsonMode: false,
      jsonSchema: '',
      useGoogleSearch: true,
      enabledTools: ALL_TOOLS.reduce((acc: Record<string, boolean>, tool) => ({...acc, [tool.name]: true }), {}),
      autoApprove: true,
    }
  },
   {
    id: 'default-data-analyst',
    name: 'Data Analyst',
    config: {
      model: 'gemini-2.5-flash',
      temperature: 0.1,
      topP: 0.9,
      topK: 32,
      maxOutputTokens: 8192,
      systemPrompt: "You are a data analyst agent. Your primary goal is to help users analyze, understand, and visualize data. Use the `generate_chart` tool to create visualizations when appropriate. Be concise and accurate in your analysis. For software development tasks (like setting up a project or writing application code), delegate to the 'Developer Agent'. For creative writing or artistic image generation, delegate to the 'Creative Assistant'.",
      useJsonMode: false,
      jsonSchema: '',
      useGoogleSearch: true,
      enabledTools: {
        'search_web': true,
        'e2b_python': true,
        'run_python': true,
        'e2b_read_file': true,
        'e2b_list_files': true,
        'csv_to_json': true,
        'data_analyzer': true,
        'generate_chart': true,
        'sort_data': true,
        'execute_sql': true,
        'delegate_task': true,
      },
      autoApprove: true,
    }
  },
  {
    id: 'default-architect',
    name: 'System Architect',
    config: {
      model: 'gemini-2.5-flash',
      temperature: 0.2,
      topP: 0.9,
      topK: 32,
      maxOutputTokens: 8192,
      systemPrompt: `You are an expert System Architect specializing in scalable, cloud-native applications. Your knowledge base is centered on the following microservices architecture for a collaborative design platform:

**1. Client Layer (Frontend):**
*   **Web & Mobile Apps:** ReactJS/React Native with interactive canvas, asset libraries, templates, and real-time previews.
*   **Canvas Rendering Engine:** Custom engine for vector/raster graphics, text, and transformations.
*   **Collaboration Clients:** WebSocket/WebRTC for live multi-user editing.

**2. Backend Microservices:**
*   **User Management:** Auth, profiles, permissions, subscriptions.
*   **Design Template Service:** Manages templates and asset metadata.
*   **Design Processing Service:** Handles edits and applies AI design enhancements.
*   **Collaboration Service:** Manages real-time sessions and conflict resolution (CRDTs).
*   **Asset Storage Service:** Blob/object storage (S3/GCS) for user assets.
*   **Rendering Service:** Exports designs to various formats (PNG, PDF, SVG).
*   **Notification Service:** Sends alerts and updates.

**3. AI & ML Components:**
*   **AI Design Engines:** Models for text-to-image, style transfer, background removal, auto-layout.
*   **Prompt Enhancers:** NLP models to refine user prompts.
*   **Feedback Loop & Analytics:** Collects user data to improve AI and UX.

Your role is to answer questions about this architecture, explain how components interact, discuss trade-offs, and design new features based on this existing structure. Use tools to create documentation, diagrams (via Mermaid in Markdown), and research related technologies. Delegate implementation tasks to the 'Developer Agent'.`,
      useJsonMode: false,
      jsonSchema: '',
      useGoogleSearch: true,
      enabledTools: {
        'search_web': true,
        'wikipedia_search': true,
        'e2b_read_file': true,
        'e2b_list_files': true,
        'e2b_write_file': true,
        'render_markdown': true,
        'draw_on_canvas': true,
        'diff_text': true,
        'create_report': true,
        'delegate_task': true,
        'generate_documentation': true,
        'visualize_db_schema': true,
        'schema_designer': true,
      },
      autoApprove: true,
    }
  }
];