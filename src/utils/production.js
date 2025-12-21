// Production utilities
export const isProd = import.meta.env.PROD;
export const isDev = import.meta.env.DEV;

// Error logging for production
export const logError = (error, context = '') => {
  if (isProd) {
    // In production, send to error tracking service
    console.error(`[${context}]`, error);
    // TODO: Send to Sentry, LogRocket, etc.
  } else {
    console.error(`[DEV ${context}]`, error);
  }
};

// Performance monitoring
export const trackPerformance = (name, fn) => {
  if (isProd) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`Performance [${name}]: ${end - start}ms`);
    return result;
  }
  return fn();
};

// Feature flags
export const features = {
  enableAnalytics: isProd,
  enableErrorReporting: isProd,
  enablePerformanceMonitoring: isProd
};