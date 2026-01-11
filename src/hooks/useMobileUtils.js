import { useEffect } from 'react';

// Simple mobile detection and enhancements
export const useMobileUtils = () => {
  useEffect(() => {
    // Add mobile class to body for CSS targeting
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      document.body.classList.add('mobile-device');
    }
    
    // Handle resize
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      document.body.classList.toggle('mobile-device', mobile);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return {
    isMobile: window.innerWidth <= 768,
    addHaptic: () => {
      if (navigator.vibrate) navigator.vibrate(10);
    }
  };
};