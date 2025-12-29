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
      console.log('No authenticated user for saving');
      return { success: false, error: 'No authenticated user' };
    }
    console.log('Saving to path:', getStoragePath()); // Debug log
    const result = await saveData(getStoragePath(), {
      ...data,
      lastUpdated: new Date().toISOString()
    });
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
      console.log('No authenticated user');
      return null;
    }
    const result = await getData(getStoragePath());
    console.log('Firebase result:', result); // Debug log
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Failed to load from Firebase:', error);
    return null;
  }
};

export const clearLocalStorage = async () => {
  try {
    const result = await saveData(getStoragePath(), null);
    return result;
  } catch (error) {
    console.error('Failed to clear Firebase data:', error);
    return { success: false, error: error.message };
  }
};

// Use global envelope structure
export const getDefaultEnvelopes = getGlobalEnvelopes;