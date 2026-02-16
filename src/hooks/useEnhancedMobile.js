import { useState, useEffect, useCallback, useRef } from 'react';

// Enhanced haptic feedback with more patterns
export const useHapticFeedback = () => {
  const isSupported = 'vibrate' in navigator;
  
  const vibrate = useCallback((pattern = [10]) => {
    if (isSupported && Array.isArray(pattern)) {
      try {
        navigator.vibrate(pattern);
      } catch (error) {
        console.warn('Haptic feedback failed:', error);
      }
    }
  }, [isSupported]);

  const patterns = {
    lightTap: [10],
    mediumTap: [20],
    heavyTap: [30],
    doubleTap: [10, 50, 10],
    success: [10, 50, 10, 50, 10],
    error: [50, 100, 50, 100, 50],
    warning: [30, 100, 30],
    notification: [20, 200, 20],
    selection: [5],
    longPress: [50]
  };

  const hapticMethods = {};
  Object.keys(patterns).forEach(key => {
    hapticMethods[key] = useCallback(() => vibrate(patterns[key]), [vibrate]);
  });

  return {
    isSupported,
    vibrate,
    ...hapticMethods
  };
};

// Enhanced pull-to-refresh with better UX
export const usePullToRefresh = (onRefresh, options = {}) => {
  const {
    threshold = 80,
    maxPull = 120,
    resistance = 2.5,
    enabled = true
  } = options;

  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);

  const handleTouchStart = useCallback((e) => {
    if (!enabled || window.scrollY > 0) return;
    
    setStartY(e.touches[0].clientY);
    setIsPulling(false);
    setPullDistance(0);
  }, [enabled]);

  const handleTouchMove = useCallback((e) => {
    if (!enabled || startY === 0 || window.scrollY > 0) return;
    
    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;
    
    if (distance > 0) {
      setIsPulling(true);
      setCurrentY(currentY);
      
      // Apply resistance for smoother feel
      const resistedDistance = Math.min(distance / resistance, maxPull);
      setPullDistance(resistedDistance);
      
      // Prevent default scrolling when pulling
      if (distance > 10) {
        e.preventDefault();
      }
    }
  }, [enabled, startY, resistance, maxPull]);

  const handleTouchEnd = useCallback(async () => {
    if (!enabled || !isPulling) return;
    
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh?.();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setIsPulling(false);
    setPullDistance(0);
    setStartY(0);
    setCurrentY(0);
  }, [enabled, isPulling, pullDistance, threshold, isRefreshing, onRefresh]);

  return {
    isPulling: isPulling && pullDistance > 0,
    pullDistance,
    isRefreshing,
    canRefresh: pullDistance >= threshold,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
};

// Enhanced gesture navigation with more gestures
export const useGestureNavigation = (options = {}) => {
  const {
    swipeThreshold = 50,
    velocityThreshold = 0.3,
    timeThreshold = 300,
    enabled = true
  } = options;

  const [touchStart, setTouchStart] = useState({ x: 0, y: 0, time: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0, time: 0 });
  const [isGesturing, setIsGesturing] = useState(false);

  const handleTouchStart = useCallback((e) => {
    if (!enabled) return;
    
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    });
    setIsGesturing(true);
  }, [enabled]);

  const handleTouchMove = useCallback((e) => {
    if (!enabled || !isGesturing) return;
    
    const touch = e.touches[0];
    setTouchEnd({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    });
  }, [enabled, isGesturing]);

  const handleTouchEnd = useCallback((callbacks = {}) => {
    if (!enabled || !isGesturing) return;
    
    const deltaX = touchStart.x - touchEnd.x;
    const deltaY = touchStart.y - touchEnd.y;
    const deltaTime = touchEnd.time - touchStart.time;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / deltaTime;

    // Determine gesture type
    const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
    const isVertical = Math.abs(deltaY) > Math.abs(deltaX);
    const isQuick = deltaTime < timeThreshold;
    const isFast = velocity > velocityThreshold;

    if (distance > swipeThreshold && (isQuick || isFast)) {
      if (isHorizontal) {
        if (deltaX > 0 && callbacks.onSwipeLeft) {
          callbacks.onSwipeLeft({ distance, velocity, deltaTime });
        } else if (deltaX < 0 && callbacks.onSwipeRight) {
          callbacks.onSwipeRight({ distance, velocity, deltaTime });
        }
      } else if (isVertical) {
        if (deltaY > 0 && callbacks.onSwipeUp) {
          callbacks.onSwipeUp({ distance, velocity, deltaTime });
        } else if (deltaY < 0 && callbacks.onSwipeDown) {
          callbacks.onSwipeDown({ distance, velocity, deltaTime });
        }
      }
    }

    // Long press detection
    if (distance < 10 && deltaTime > 500 && callbacks.onLongPress) {
      callbacks.onLongPress({ x: touchStart.x, y: touchStart.y, duration: deltaTime });
    }

    // Tap detection
    if (distance < 10 && deltaTime < 200 && callbacks.onTap) {
      callbacks.onTap({ x: touchStart.x, y: touchStart.y });
    }

    setIsGesturing(false);
  }, [enabled, isGesturing, touchStart, touchEnd, swipeThreshold, velocityThreshold, timeThreshold]);

  return {
    isGesturing,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
};

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    memoryUsage: 0,
    fps: 0
  });
  
  const renderStartTime = useRef(0);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  const startRender = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  const endRender = useCallback(() => {
    const renderTime = performance.now() - renderStartTime.current;
    setMetrics(prev => ({ ...prev, renderTime }));
  }, []);

  const measureFPS = useCallback(() => {
    const now = performance.now();
    frameCount.current++;
    
    if (now - lastTime.current >= 1000) {
      const fps = Math.round((frameCount.current * 1000) / (now - lastTime.current));
      setMetrics(prev => ({ ...prev, fps }));
      frameCount.current = 0;
      lastTime.current = now;
    }
    
    requestAnimationFrame(measureFPS);
  }, []);

  useEffect(() => {
    const measureMemory = () => {
      if ('memory' in performance) {
        const memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
        setMetrics(prev => ({ ...prev, memoryUsage }));
      }
    };

    measureMemory();
    const interval = setInterval(measureMemory, 5000);
    requestAnimationFrame(measureFPS);

    return () => clearInterval(interval);
  }, [measureFPS]);

  return {
    metrics,
    startRender,
    endRender
  };
};

// Enhanced keyboard handling
export const useKeyboardHandler = () => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = viewportHeight - currentHeight;
      
      // More accurate keyboard detection
      const isKeyboard = heightDifference > 150 && 
                        window.innerWidth === window.screen.width &&
                        document.activeElement?.tagName?.toLowerCase() === 'input';
      
      setIsKeyboardOpen(isKeyboard);
      setKeyboardHeight(isKeyboard ? heightDifference : 0);
      
      if (!isKeyboard) {
        setViewportHeight(currentHeight);
      }
    };

    const handleVisualViewport = () => {
      if (window.visualViewport) {
        const isKeyboard = window.visualViewport.height < window.innerHeight * 0.75;
        const keyboardHeight = window.innerHeight - window.visualViewport.height;
        
        setIsKeyboardOpen(isKeyboard);
        setKeyboardHeight(isKeyboard ? keyboardHeight : 0);
      }
    };

    const handleFocusIn = () => {
      // Delay to allow keyboard to appear
      setTimeout(() => {
        if (window.visualViewport) {
          handleVisualViewport();
        } else {
          handleResize();
        }
      }, 300);
    };

    const handleFocusOut = () => {
      setTimeout(() => {
        setIsKeyboardOpen(false);
        setKeyboardHeight(0);
      }, 300);
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewport);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewport);
      }
    };
  }, [viewportHeight]);

  return {
    isKeyboardOpen,
    keyboardHeight,
    viewportHeight
  };
};

// Network status monitoring
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState('unknown');
  const [effectiveType, setEffectiveType] = useState('4g');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    const updateConnectionInfo = () => {
      if ('connection' in navigator) {
        const connection = navigator.connection;
        setConnectionType(connection.type || 'unknown');
        setEffectiveType(connection.effectiveType || '4g');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', updateConnectionInfo);
      updateConnectionInfo();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if ('connection' in navigator) {
        navigator.connection.removeEventListener('change', updateConnectionInfo);
      }
    };
  }, []);

  return {
    isOnline,
    connectionType,
    effectiveType,
    isSlowConnection: effectiveType === 'slow-2g' || effectiveType === '2g'
  };
};

// Device orientation handling
export const useDeviceOrientation = () => {
  const [orientation, setOrientation] = useState({
    angle: screen.orientation?.angle || 0,
    type: screen.orientation?.type || 'portrait-primary'
  });

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation({
        angle: screen.orientation?.angle || 0,
        type: screen.orientation?.type || 'portrait-primary'
      });
    };

    if (screen.orientation) {
      screen.orientation.addEventListener('change', handleOrientationChange);
      return () => screen.orientation.removeEventListener('change', handleOrientationChange);
    } else {
      // Fallback for older browsers
      window.addEventListener('orientationchange', handleOrientationChange);
      return () => window.removeEventListener('orientationchange', handleOrientationChange);
    }
  }, []);

  return {
    ...orientation,
    isPortrait: orientation.type.includes('portrait'),
    isLandscape: orientation.type.includes('landscape')
  };
};