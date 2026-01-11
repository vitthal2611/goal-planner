import { useState, useCallback, useRef } from 'react';

// Enhanced error handling hook with comprehensive error states
export const useErrorHandler = () => {
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const errorId = useRef(0);

  const addError = useCallback((error, context = '', severity = 'error') => {
    const errorObj = {
      id: ++errorId.current,
      message: error.message || error,
      context,
      severity,
      timestamp: Date.now(),
      type: 'error'
    };
    
    setErrors(prev => [...prev, errorObj]);
    
    // Auto-remove based on severity
    const timeout = severity === 'critical' ? 10000 : 5000;
    setTimeout(() => {
      setErrors(prev => prev.filter(e => e.id !== errorObj.id));
    }, timeout);
    
    return errorObj.id;
  }, []);

  const removeError = useCallback((id) => {
    setErrors(prev => prev.filter(e => e.id !== id));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const handleAsync = useCallback(async (asyncFn, context = '', onSuccess, onError) => {
    setIsLoading(true);
    try {
      const result = await asyncFn();
      setIsLoading(false);
      if (onSuccess) onSuccess(result);
      return { success: true, data: result };
    } catch (error) {
      setIsLoading(false);
      const errorId = addError(error, context);
      if (onError) onError(error, errorId);
      return { success: false, error, errorId };
    }
  }, [addError]);

  // Network error handler
  const handleNetworkError = useCallback((error, operation) => {
    const isOffline = !navigator.onLine;
    const message = isOffline 
      ? `Operation failed: You're offline. ${operation} will be retried when connection is restored.`
      : `Network error during ${operation}. Please check your connection and try again.`;
    
    return addError({ message }, 'Network', isOffline ? 'warning' : 'error');
  }, [addError]);

  // Firebase error handler
  const handleFirebaseError = useCallback((error, operation) => {
    let message = `Firebase error during ${operation}: `;
    
    switch (error.code) {
      case 'auth/network-request-failed':
        message += 'Network connection failed. Please check your internet connection.';
        break;
      case 'auth/too-many-requests':
        message += 'Too many failed attempts. Please try again later.';
        break;
      case 'permission-denied':
        message += 'Access denied. Please check your permissions.';
        break;
      case 'unavailable':
        message += 'Service temporarily unavailable. Please try again.';
        break;
      default:
        message += error.message || 'An unexpected error occurred.';
    }
    
    return addError({ message }, 'Firebase', 'error');
  }, [addError]);

  return {
    errors,
    isLoading,
    addError,
    removeError,
    clearErrors,
    handleAsync,
    handleNetworkError,
    handleFirebaseError
  };
};

// Loading states hook with granular control
export const useLoadingStates = () => {
  const [loadingStates, setLoadingStates] = useState({});

  const setLoading = useCallback((key, isLoading, message = '') => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading ? { loading: true, message } : false
    }));
  }, []);

  const isLoading = useCallback((key) => {
    return loadingStates[key]?.loading || false;
  }, [loadingStates]);

  const getLoadingMessage = useCallback((key) => {
    return loadingStates[key]?.message || '';
  }, [loadingStates]);

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(state => state?.loading);
  }, [loadingStates]);

  return { setLoading, isLoading, getLoadingMessage, isAnyLoading };
};

// Enhanced user feedback hook with better categorization
export const useUserFeedback = () => {
  const [notifications, setNotifications] = useState([]);
  const notificationId = useRef(0);

  const showNotification = useCallback((message, type = 'info', duration = 3000, persistent = false) => {
    const notification = {
      id: ++notificationId.current,
      message,
      type,
      timestamp: Date.now(),
      persistent
    };

    setNotifications(prev => [...prev, notification]);

    if (duration > 0 && !persistent) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, duration);
    }

    return notification.id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const showSuccess = useCallback((message, duration = 3000) => {
    return showNotification(message, 'success', duration);
  }, [showNotification]);

  const showError = useCallback((message, persistent = false) => {
    return showNotification(message, 'error', persistent ? 0 : 5000, persistent);
  }, [showNotification]);

  const showWarning = useCallback((message, duration = 4000) => {
    return showNotification(message, 'warning', duration);
  }, [showNotification]);

  const showInfo = useCallback((message, duration = 3000) => {
    return showNotification(message, 'info', duration);
  }, [showNotification]);

  // Batch operations feedback
  const showBatchResult = useCallback((results, operation) => {
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    
    if (failed === 0) {
      showSuccess(`${operation} completed successfully (${successful} items)`);
    } else if (successful === 0) {
      showError(`${operation} failed for all ${failed} items`);
    } else {
      showWarning(`${operation} partially completed: ${successful} successful, ${failed} failed`);
    }
  }, [showSuccess, showError, showWarning]);

  return {
    notifications,
    showNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showBatchResult
  };
};

// Enhanced undo functionality with better state management
export const useUndoRedo = (maxHistorySize = 10) => {
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const addAction = useCallback((action, undoAction, description) => {
    const newAction = {
      id: Date.now(),
      action,
      undoAction,
      description,
      timestamp: Date.now()
    };

    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push(newAction);
      return newHistory.slice(-maxHistorySize);
    });
    
    setCurrentIndex(prev => Math.min(prev + 1, maxHistorySize - 1));
  }, [currentIndex, maxHistorySize]);

  const undo = useCallback(async () => {
    if (currentIndex >= 0) {
      const action = history[currentIndex];
      try {
        await action.undoAction();
        setCurrentIndex(prev => prev - 1);
        return { success: true, description: action.description };
      } catch (error) {
        return { success: false, error: error.message || 'Undo failed' };
      }
    }
    return { success: false, error: 'Nothing to undo' };
  }, [history, currentIndex]);

  const redo = useCallback(async () => {
    if (currentIndex < history.length - 1) {
      const action = history[currentIndex + 1];
      try {
        await action.action();
        setCurrentIndex(prev => prev + 1);
        return { success: true, description: action.description };
      } catch (error) {
        return { success: false, error: error.message || 'Redo failed' };
      }
    }
    return { success: false, error: 'Nothing to redo' };
  }, [history, currentIndex]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  const canUndo = currentIndex >= 0;
  const canRedo = currentIndex < history.length - 1;
  const lastAction = currentIndex >= 0 ? history[currentIndex]?.description : null;

  return {
    addAction,
    undo,
    redo,
    clearHistory,
    canUndo,
    canRedo,
    lastAction,
    history: history.slice(0, currentIndex + 1)
  };
};