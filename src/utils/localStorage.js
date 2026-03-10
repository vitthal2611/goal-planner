// Local storage utility functions - Updated to work without Firebase
import { getGlobalEnvelopes } from './globalEnvelopes.js';

export const saveToLocalStorage = async (data) => {
  try {
    const dataToSave = {
      ...data,
      lastUpdated: new Date().toISOString()
    };
    
    // Save to localStorage for persistence
    localStorage.setItem('budgetData', JSON.stringify(dataToSave));
    // Also save to sessionStorage for instant access
    sessionStorage.setItem('budgetCache', JSON.stringify(dataToSave));
    
    return { success: true };
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return { success: false, error: error.message };
  }
};

export const loadFromLocalStorage = async () => {
  try {
    // Try sessionStorage first (instant)
    const cached = sessionStorage.getItem('budgetCache');
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Try localStorage
    const stored = localStorage.getItem('budgetData');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Update sessionStorage cache
      sessionStorage.setItem('budgetCache', stored);
      return parsed;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
};

export const clearLocalStorage = async () => {
  try {
    sessionStorage.removeItem('budgetCache');
    localStorage.removeItem('budgetData');
    return { success: true };
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
    return { success: false, error: error.message };
  }
};

// Use global envelope structure
export const getDefaultEnvelopes = getGlobalEnvelopes;