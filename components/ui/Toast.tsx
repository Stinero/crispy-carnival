import React, { useState, useEffect } from 'react';
import { Notification, NotificationType } from '../../types';
import { CheckIcon, ErrorIcon, XIcon } from '../../constants';

interface ToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

export const InfoIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
);

const toastConfig: Record<NotificationType, { icon: React.FC<{className?:string}>; classes: string }> = {
  success: {
    icon: ({className}) => <CheckIcon className={className}/>,
    classes: 'bg-green-50 border-green-400 text-green-700 dark:bg-green-900/50 dark:border-green-600/50 dark:text-green-200',
  },
  error: {
    icon: ErrorIcon,
    classes: 'bg-red-50 border-red-400 text-red-700 dark:bg-red-900/50 dark:border-red-600/50 dark:text-red-200',
  },
  info: {
    icon: InfoIcon,
    classes: 'bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-900/50 dark:border-blue-600/50 dark:text-blue-200',
  },
};

const Toast: React.FC<ToastProps> = ({ notification, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);
  const { icon: Icon, classes } = toastConfig[notification.type];
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(notification.id), 300); // Wait for animation
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(notification.id), 300);
  };
  
  return (
    <div
      className={`
        w-full max-w-sm rounded-lg shadow-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden border
        ${classes}
        ${isExiting ? 'animate-fade-out' : 'animate-fade-in animate-slide-in-up'}
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="rounded-md inline-flex text-current opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
              onClick={handleDismiss}
            >
              <span className="sr-only">Close</span>
              <XIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default Toast;