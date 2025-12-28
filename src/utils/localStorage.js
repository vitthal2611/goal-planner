// localStorage utility functions
const STORAGE_KEY = 'envelopeBudget_v1';

export const saveToLocalStorage = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...data,
      lastUpdated: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

export const loadFromLocalStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
};

export const clearLocalStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
};

// Default envelope structure
export const getDefaultEnvelopes = () => ({
  needs: {
    housing: { budgeted: 0, spent: 0, rollover: 0 },
    groceries: { budgeted: 0, spent: 0, rollover: 0 },
    utilities: { budgeted: 0, spent: 0, rollover: 0 },
    transport: { budgeted: 0, spent: 0, rollover: 0 },
    medical: { budgeted: 0, spent: 0, rollover: 0 },
    emi: { budgeted: 0, spent: 0, rollover: 0 },
    insurance: { budgeted: 0, spent: 0, rollover: 0 }
  },
  savings: {
    emergency: { budgeted: 0, spent: 0, rollover: 0 },
    sip: { budgeted: 0, spent: 0, rollover: 0 },
    longterm: { budgeted: 0, spent: 0, rollover: 0 }
  },
  wants: {
    dining: { budgeted: 0, spent: 0, rollover: 0 },
    shopping: { budgeted: 0, spent: 0, rollover: 0 },
    entertainment: { budgeted: 0, spent: 0, rollover: 0 }
  }
});