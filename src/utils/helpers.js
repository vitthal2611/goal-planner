import { APP_CONFIG, MONTH_NAMES } from '../config/constants';

// Format currency
export const formatCurrency = (amount, options = {}) => {
  const { 
    showSymbol = true, 
    decimals = 0,
    locale = 'en-IN' 
  } = options;
  
  const formatted = Number(amount).toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  
  return showSymbol ? `₹${formatted}` : formatted;
};

// Format date
export const formatDate = (date, format = 'short') => {
  const d = new Date(date);
  
  if (format === 'short') {
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  
  if (format === 'long') {
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  
  if (format === 'time') {
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }
  
  return d.toLocaleDateString('en-IN');
};

// Generate period key (YYYY-MM)
export const generatePeriodKey = (year, month) => {
  return `${year}-${String(month).padStart(2, '0')}`;
};

// Parse period key
export const parsePeriodKey = (periodKey) => {
  const [year, month] = periodKey.split('-').map(Number);
  return { year, month };
};

// Get period label
export const getPeriodLabel = (periodKey) => {
  const { year, month } = parsePeriodKey(periodKey);
  return `${MONTH_NAMES[month - 1]} ${year}`;
};

// Navigate period
export const navigatePeriod = (currentPeriod, direction) => {
  const { year, month } = parsePeriodKey(currentPeriod);
  
  let newMonth = direction === 'next' ? month + 1 : month - 1;
  let newYear = year;
  
  if (newMonth > 12) {
    newMonth = 1;
    newYear++;
  } else if (newMonth < 1) {
    newMonth = 12;
    newYear--;
  }
  
  // Don't go before minimum year
  if (newYear < APP_CONFIG.MIN_YEAR) {
    return currentPeriod;
  }
  
  return generatePeriodKey(newYear, newMonth);
};

// Generate period options
export const generatePeriodOptions = (startYear = new Date().getFullYear(), count = APP_CONFIG.MAX_FUTURE_MONTHS) => {
  const periods = [];
  
  for (let i = 0; i < count; i++) {
    const date = new Date(startYear, i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    periods.push({
      key: generatePeriodKey(year, month),
      label: getPeriodLabel(generatePeriodKey(year, month)),
      year,
      month
    });
  }
  
  return periods;
};

// Debounce function
export const debounce = (func, delay = APP_CONFIG.DEBOUNCE_DELAY) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle function
export const throttle = (func, delay = APP_CONFIG.THROTTLE_DELAY) => {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

// Validate amount
export const validateAmount = (amount) => {
  const num = Number(amount);
  
  if (isNaN(num)) {
    throw new Error('Invalid amount');
  }
  
  if (num < APP_CONFIG.MIN_AMOUNT) {
    throw new Error(`Amount must be at least ₹${APP_CONFIG.MIN_AMOUNT}`);
  }
  
  if (num > APP_CONFIG.MAX_AMOUNT) {
    throw new Error(`Amount cannot exceed ₹${formatCurrency(APP_CONFIG.MAX_AMOUNT)}`);
  }
  
  return num;
};

// Validate description
export const validateDescription = (description) => {
  if (!description || description.trim().length === 0) {
    throw new Error('Description is required');
  }
  
  if (description.length > APP_CONFIG.MAX_DESCRIPTION_LENGTH) {
    throw new Error(`Description cannot exceed ${APP_CONFIG.MAX_DESCRIPTION_LENGTH} characters`);
  }
  
  return description.trim();
};

// Generate unique ID
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Calculate percentage
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Group by key
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

// Sort by date (descending)
export const sortByDateDesc = (a, b) => {
  return new Date(b.date) - new Date(a.date);
};

// Check if mobile device
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Get safe area insets
export const getSafeAreaInsets = () => {
  return {
    top: parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-top)')) || 0,
    bottom: parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)')) || 0
  };
};
