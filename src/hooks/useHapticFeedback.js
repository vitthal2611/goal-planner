export const useHapticFeedback = () => {
  const trigger = (pattern = 'light') => {
    if (!navigator.vibrate) return;
    
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 50,
      success: [10, 50, 10],
      error: [50, 100, 50],
      warning: [30, 50, 30]
    };
    
    navigator.vibrate(patterns[pattern] || 10);
  };

  return { trigger };
};
