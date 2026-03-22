import { useState, useCallback } from 'react';

let notificationId = 0;

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((type, message, duration = 4000) => {
    const id = ++notificationId;
    setNotifications(prev => [...prev, { id, type, message }]);
    
    if (duration > 0) {
      setTimeout(() => removeNotification(id), duration);
    }
    
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const success = useCallback((message, duration) => 
    addNotification('success', message, duration), [addNotification]);
  
  const error = useCallback((message, duration) => 
    addNotification('error', message, duration), [addNotification]);
  
  const warning = useCallback((message, duration) => 
    addNotification('warning', message, duration), [addNotification]);
  
  const info = useCallback((message, duration) => 
    addNotification('info', message, duration), [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info
  };
};
