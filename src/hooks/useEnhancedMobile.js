import { useState, useEffect, useCallback, useRef } from 'react';

// Enhanced mobile detection hook
export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [orientation, setOrientation] = useState('portrait');
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({ width, height });
      setIsMobile(width <= 768);
      setIsTablet(width > 768 && width <= 1024);
      setOrientation(width > height ? 'landscape' : 'portrait');
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  return { isMobile, isTablet, orientation, screenSize };
};

// Enhanced touch interaction hook
export const useEnhancedTouch = () => {
  const [touchState, setTouchState] = useState({
    isPressed: false,
    startTime: 0,
    startPos: { x: 0, y: 0 }
  });

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    setTouchState({
      isPressed: true,
      startTime: Date.now(),
      startPos: { x: touch.clientX, y: touch.clientY }
    });

    // Light haptic feedback on touch start
    if (navigator.vibrate) {
      navigator.vibrate(5);
    }
  }, []);

  const handleTouchEnd = useCallback((callback) => {
    const duration = Date.now() - touchState.startTime;
    
    if (duration < 200) { // Quick tap
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
      callback?.('tap');
    } else if (duration > 500) { // Long press
      if (navigator.vibrate) {
        navigator.vibrate([20, 10, 20]);
      }
      callback?.('longpress');
    }

    setTouchState({
      isPressed: false,
      startTime: 0,
      startPos: { x: 0, y: 0 }
    });
  }, [touchState]);

  return {
    touchState,
    handleTouchStart,
    handleTouchEnd
  };
};

// Virtual keyboard detection hook
export const useVirtualKeyboard = () => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const initialViewportHeight = useRef(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialViewportHeight.current - currentHeight;
      
      if (heightDifference > 150) {
        setIsKeyboardOpen(true);
        setKeyboardHeight(heightDifference);
      } else {
        setIsKeyboardOpen(false);
        setKeyboardHeight(0);
        initialViewportHeight.current = currentHeight;
      }
    };

    const handleFocusIn = (e) => {
      if (e.target.matches('input, textarea, select')) {
        setTimeout(handleResize, 300); // Delay to allow keyboard animation
      }
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

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  return { isKeyboardOpen, keyboardHeight };
};

// Enhanced scroll behavior hook
export const useEnhancedScroll = () => {
  const [scrollState, setScrollState] = useState({
    scrollY: 0,
    isScrolling: false,
    direction: 'down'
  });

  useEffect(() => {
    let timeoutId;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const direction = currentScrollY > lastScrollY ? 'down' : 'up';

      setScrollState({
        scrollY: currentScrollY,
        isScrolling: true,
        direction
      });

      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setScrollState(prev => ({ ...prev, isScrolling: false }));
      }, 150);

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const scrollToElement = useCallback((elementId, offset = 0) => {
    const element = document.getElementById(elementId);
    if (element) {
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({ top: elementPosition, behavior: 'smooth' });
    }
  }, []);

  return { scrollState, scrollToTop, scrollToElement };
};

// Mobile-optimized form validation hook
export const useMobileFormValidation = (initialValues) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const setValue = useCallback((field, value) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  const setFieldTouched = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const validateField = useCallback((field, value, rules) => {
    let error = null;

    if (rules.required && (!value || value.toString().trim() === '')) {
      error = `${field} is required`;
    } else if (rules.min && parseFloat(value) < rules.min) {
      error = `${field} must be at least ${rules.min}`;
    } else if (rules.max && parseFloat(value) > rules.max) {
      error = `${field} must be at most ${rules.max}`;
    } else if (rules.pattern && !rules.pattern.test(value)) {
      error = rules.message || `${field} format is invalid`;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  }, []);

  const validateForm = useCallback((validationRules) => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(field => {
      const value = values[field];
      const rules = validationRules[field];
      
      if (!validateField(field, value, rules)) {
        isValid = false;
      }
    });

    return isValid;
  }, [values, validateField]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateField,
    validateForm,
    resetForm
  };
};

// Performance monitoring hook for mobile
export const useMobilePerformance = () => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    memoryUsage: 0,
    isLowEndDevice: false
  });

  useEffect(() => {
    // Detect low-end devices
    const isLowEnd = navigator.hardwareConcurrency <= 2 || 
                     navigator.deviceMemory <= 2 ||
                     /Android.*Chrome\/[0-5]/.test(navigator.userAgent);

    setMetrics(prev => ({ ...prev, isLowEndDevice: isLowEnd }));

    // Monitor performance
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'measure') {
          setMetrics(prev => ({ ...prev, renderTime: entry.duration }));
        }
      });
    });

    observer.observe({ entryTypes: ['measure'] });

    return () => observer.disconnect();
  }, []);

  const measureRender = useCallback((name, fn) => {
    performance.mark(`${name}-start`);
    const result = fn();
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    return result;
  }, []);

  return { metrics, measureRender };
};