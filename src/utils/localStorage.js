// Firebase storage utility functions
import { saveData, getData } from '../services/database.js';
import { auth } from '../config/firebase.js';
import { getGlobalEnvelopes } from './globalEnvelopes.js';

const getStoragePath = () => {
  const user = auth.currentUser;
  return user ? `users/${user.uid}/envelopeBudget_v1` : 'envelopeBudget_v1';
};

export const saveToLocalStorage = async (data) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'No authenticated user' };
    }
    
    const dataToSave = {
      ...data,
      lastUpdated: new Date().toISOString()
    };
    
    // Save to sessionStorage immediately for instant access
    sessionStorage.setItem('budgetCache', JSON.stringify(dataToSave));
    
    // Save to Firebase in background
    const result = await saveData(getStoragePath(), dataToSave);
    return result;
  } catch (error) {
    console.error('Failed to save to Firebase:', error);
    return { success: false, error: error.message };
  }
};

export const loadFromLocalStorage = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return null;
    }
    
    // Try sessionStorage first (instant)
    const cached = sessionStorage.getItem('budgetCache');
    if (cached) {
      const parsed = JSON.parse(cached);
      // Load from Firebase in background to update cache
      getData(getStoragePath()).then(result => {
        if (result.success && result.data) {
          sessionStorage.setItem('budgetCache', JSON.stringify(result.data));
        }
      });
      return parsed;
    }
    
    // Load from Firebase
    const result = await getData(getStoragePath());
    if (result.success && result.data) {
      sessionStorage.setItem('budgetCache', JSON.stringify(result.data));
    }
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Failed to load from Firebase:', error);
    return null;
  }
};

export const clearLocalStorage = async () => {
  try {
    sessionStorage.removeItem('budgetCache');
    const result = await saveData(getStoragePath(), null);
    return result;
  } catch (error) {
    console.error('Failed to clear Firebase data:', error);
    return { success: false, error: error.message };
  }
};

// Use global envelope structure
export const getDefaultEnvelopes = getGlobalEnvelopes;