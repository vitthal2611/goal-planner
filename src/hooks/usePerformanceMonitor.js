import { useEffect, useRef, useCallback, useState } from 'react';

// Enhanced performance monitoring with detailed metrics
export const usePerformanceMonitor = (componentName, options = {}) => {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());
  const mountTime = useRef(performance.now());
  const { threshold = 16, enableLogging = process.env.NODE_ENV === 'development' } = options;

  useEffect(() => {
    renderCount.current += 1;
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;
    const totalTime = endTime - mountTime.current;
    
    if (enableLogging) {
      const isSlowRender = renderTime > threshold;
      const logLevel = isSlowRender ? 'warn' : 'log';
      
      console[logLevel](`${componentName} performance:`, {
        renderCount: renderCount.current,
        lastRenderTime: `${renderTime.toFixed(2)}ms`,
        totalTime: `${totalTime.toFixed(2)}ms`,
        isSlowRender,
        threshold: `${threshold}ms`
      });
      
      if (isSlowRender) {
        console.warn(`⚠️ Slow render detected in ${componentName}`);
      }
    }
    
    startTime.current = performance.now();
  });

  return {
    renderCount: renderCount.current,
    isSlowComponent: renderCount.current > 10 // Flag components that re-render frequently
  };
};

// Enhanced render tracking with prop change detection
export const useRenderTracker = (componentName, props, options = {}) => {
  const prevProps = useRef();
  const { enableLogging = process.env.NODE_ENV === 'development' } = options;
  
  useEffect(() => {
    if (prevProps.current && enableLogging) {
      const changedProps = Object.keys(props).filter(
        key => {
          const prevValue = prevProps.current[key];
          const currentValue = props[key];
          
          // Deep comparison for objects and arrays
          if (typeof currentValue === 'object' && currentValue !== null) {
            return JSON.stringify(prevValue) !== JSON.stringify(currentValue);
          }
          
          return prevValue !== currentValue;
        }
      );
      
      if (changedProps.length > 0) {
        console.log(`${componentName} re-rendered due to:`, {
          changedProps,
          changes: changedProps.reduce((acc, key) => {
            acc[key] = {
              from: prevProps.current[key],
              to: props[key]
            };
            return acc;
          }, {})
        });
      }
    }
    
    prevProps.current = props;
  });
};

// Memory usage monitoring
export const useMemoryMonitor = (componentName, interval = 5000) => {
  const memoryRef = useRef({ used: 0, total: 0 });
  
  useEffect(() => {
    if (!performance.memory) return;
    
    const checkMemory = () => {
      const memory = performance.memory;
      const used = Math.round(memory.usedJSHeapSize / 1048576); // MB
      const total = Math.round(memory.totalJSHeapSize / 1048576); // MB
      
      memoryRef.current = { used, total };
      
      if (process.env.NODE_ENV === 'development') {
        const usage = (used / total) * 100;
        if (usage > 80) {
          console.warn(`${componentName} high memory usage: ${used}MB/${total}MB (${usage.toFixed(1)}%)`);
        }
      }
    };
    
    const intervalId = setInterval(checkMemory, interval);
    checkMemory(); // Initial check
    
    return () => clearInterval(intervalId);
  }, [componentName, interval]);
  
  return memoryRef.current;
};

// FPS monitoring for smooth animations
export const useFPSMonitor = (componentName) => {
  const fpsRef = useRef(0);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  
  useEffect(() => {
    let animationId;
    
    const measureFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime.current >= 1000) {
        fpsRef.current = Math.round((frameCount.current * 1000) / (currentTime - lastTime.current));
        
        if (process.env.NODE_ENV === 'development' && fpsRef.current < 30) {
          console.warn(`${componentName} low FPS detected: ${fpsRef.current}fps`);
        }
        
        frameCount.current = 0;
        lastTime.current = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };
    
    animationId = requestAnimationFrame(measureFPS);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [componentName]);
  
  return fpsRef.current;
};

// Bundle size and loading performance
export const useLoadingPerformance = () => {
  const metrics = useRef({});
  
  useEffect(() => {
    // Measure initial page load performance
    if (performance.timing) {
      const timing = performance.timing;
      metrics.current = {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        pageLoad: timing.loadEventEnd - timing.navigationStart,
        domReady: timing.domComplete - timing.navigationStart,
        firstPaint: 0,
        firstContentfulPaint: 0
      };
    }
    
    // Measure paint metrics
    if (performance.getEntriesByType) {
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach(entry => {
        if (entry.name === 'first-paint') {
          metrics.current.firstPaint = entry.startTime;
        } else if (entry.name === 'first-contentful-paint') {
          metrics.current.firstContentfulPaint = entry.startTime;
        }
      });
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Loading Performance Metrics:', metrics.current);
    }
  }, []);
  
  return metrics.current;
};

// Debounced performance optimization hook
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

// Throttled function execution
export const useThrottle = (callback, delay) => {
  const lastRun = useRef(Date.now());
  
  return useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]);
};

// Intersection Observer for lazy loading optimization
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef();
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );
    
    observer.observe(element);
    
    return () => {
      observer.unobserve(element);
    };
  }, [hasIntersected, options]);
  
  return { elementRef, isIntersecting, hasIntersected };
};