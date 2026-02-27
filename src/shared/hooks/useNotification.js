import { useCallback } from 'react';
import { useApp } from '../../core/context/AppContext';

export const useNotification = () => {
  const { state, dispatch } = useApp();

  const show = useCallback((type, message) => {
    dispatch({ type: 'SET_NOTIFICATION', payload: { type, message } });
    if (navigator.vibrate) {
      navigator.vibrate(type === 'success' ? [50] : [100, 50, 100]);
    }
    setTimeout(() => {
      dispatch({ type: 'SET_NOTIFICATION', payload: { type: '', message: '' } });
    }, 3000);
  }, [dispatch]);

  return {
    notification: state.notification,
    show
  };
};
