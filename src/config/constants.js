// Design System Constants
export const DESIGN_TOKENS = {
  // Touch targets (minimum 44x44px for mobile)
  TOUCH_TARGET_MIN: '44px',
  TOUCH_TARGET_COMFORTABLE: '48px',
  
  // Spacing scale
  SPACING: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },
  
  // Typography scale
  FONT_SIZE: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    xxl: '24px',
    xxxl: '32px'
  },
  
  // Z-index scale
  Z_INDEX: {
    base: 1,
    dropdown: 100,
    sticky: 200,
    modal: 1000,
    notification: 2000,
    tooltip: 3000
  },
  
  // Breakpoints
  BREAKPOINTS: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px'
  }
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'Budget Tracker',
  VERSION: '2.0.0',
  MIN_YEAR: 2026,
  MAX_FUTURE_MONTHS: 36,
  
  // Performance
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 150,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  
  // Limits
  MAX_TRANSACTIONS_DISPLAY: 50,
  MAX_ENVELOPES_PER_CATEGORY: 20,
  MAX_PAYMENT_METHODS: 15,
  
  // Validation
  MIN_AMOUNT: 0.01,
  MAX_AMOUNT: 10000000,
  MAX_DESCRIPTION_LENGTH: 100
};

// Transaction Types
export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
  TRANSFER: 'transfer'
};

// Envelope Categories
export const ENVELOPE_CATEGORIES = {
  NEEDS: 'needs',
  WANTS: 'wants',
  SAVINGS: 'savings'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
};

// Month Names
export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const MONTH_NAMES_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Icons
export const ICONS = {
  INCOME: '💰',
  EXPENSE: '💸',
  TRANSFER: '🔄',
  PROFILE: '👤',
  EMPTY: '📭',
  SUCCESS: '✓',
  ERROR: '✗',
  WARNING: '⚠️',
  INFO: 'ℹ️'
};
