import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Notification, NotificationType } from '../types';
import Toast from '../components/ui/Toast';
import { generateId } from '../lib/utils';

type NotifierContextType = {
  notify: (message: string, type?: NotificationType) => void;
};

const NotifierContext = createContext<NotifierContextType | undefined>(undefined);

export const useNotifier = (): NotifierContextType => {
  const context = useContext(NotifierContext);
  if (!context) {
    throw new Error('useNotifier must be used within a NotifierProvider');
  }
  return context;
};

export const NotifierProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const toastContainer = document.getElementById('toast-container');

  const notify = useCallback((message: string, type: NotificationType = 'info') => {
    const newNotification: Notification = { id: generateId(), message, type };
    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotifierContext.Provider value={{ notify }}>
      {children}
      {toastContainer && createPortal(
        notifications.map(notification => (
          <Toast
            key={notification.id}
            notification={notification}
            onDismiss={dismissNotification}
          />
        )),
        toastContainer
      )}
    </NotifierContext.Provider>
  );
};