import { useState, useEffect, useCallback } from 'react';

// Pull-to-refresh hook
export const usePullToRefresh = (onRefresh, threshold = 80) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);

  const handleTouchStart = useCallback((e) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (startY === 0 || window.scrollY > 0) return;
    
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY);
    
    if (distance > 0) {
      setIsPulling(true);
      setPullDistance(Math.min(distance, threshold * 1.5));
      
      if (distance > 10) {
        e.preventDefault();
      }
    }
  }, [startY, threshold]);

  const handleTouchEnd = useCallback(() => {
    if (pullDistance > threshold) {
      onRefresh();
    }
    setIsPulling(false);
    setPullDistance(0);
    setStartY(0);
  }, [pullDistance, threshold, onRefresh]);

  return {
    isPulling,
    pullDistance,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
};

// Haptic feedback hook
export const useHapticFeedback = () => {
  const vibrate = useCallback((pattern = [10]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  const lightTap = useCallback(() => vibrate([10]), [vibrate]);
  const mediumTap = useCallback(() => vibrate([20]), [vibrate]);
  const heavyTap = useCallback(() => vibrate([30]), [vibrate]);
  const success = useCallback(() => vibrate([10, 50, 10]), [vibrate]);
  const error = useCallback(() => vibrate([50, 100, 50]), [vibrate]);

  return { lightTap, mediumTap, heavyTap, success, error };
};

// Enhanced gesture navigation
export const useGestureNavigation = () => {
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });

  const handleTouchStart = useCallback((e) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  }, []);

  const handleTouchMove = useCallback((e) => {
    setTouchEnd({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  }, []);

  const handleTouchEnd = useCallback((callbacks = {}) => {
    const deltaX = touchStart.x - touchEnd.x;
    const deltaY = touchStart.y - touchEnd.y;
    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0 && callbacks.onSwipeLeft) {
          callbacks.onSwipeLeft();
        } else if (deltaX < 0 && callbacks.onSwipeRight) {
          callbacks.onSwipeRight();
        }
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0 && callbacks.onSwipeUp) {
          callbacks.onSwipeUp();
        } else if (deltaY < 0 && callbacks.onSwipeDown) {
          callbacks.onSwipeDown();
        }
      }
    }
  }, [touchStart, touchEnd]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
};