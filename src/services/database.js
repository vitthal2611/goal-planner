import { ref, push, set, get, child } from 'firebase/database';
import { database } from '../config/firebase.js';

// Aggressive caching
const cache = new Map();
const CACHE_DURATION = 30000; // 30 seconds
const pendingRequests = new Map();

export const saveData = async (path, data) => {
  try {
    const dataRef = ref(database, path);
    await set(dataRef, data);
    cache.set(path, { data, timestamp: Date.now() });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const addData = async (path, data) => {
  try {
    const dataRef = ref(database, path);
    const newRef = await push(dataRef, data);
    return { success: true, id: newRef.key };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getData = async (path, useCache = true) => {
  try {
    // Check cache
    if (useCache && cache.has(path)) {
      const cached = cache.get(path);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        return { success: true, data: cached.data, fromCache: true };
      }
    }
    
    // Deduplicate concurrent requests
    if (pendingRequests.has(path)) {
      return pendingRequests.get(path);
    }
    
    const requestPromise = (async () => {
      try {
        const snapshot = await get(child(ref(database), path));
        const data = snapshot.exists() ? snapshot.val() : null;
        cache.set(path, { data, timestamp: Date.now() });
        return { success: true, data };
      } finally {
        pendingRequests.delete(path);
      }
    })();
    
    pendingRequests.set(path, requestPromise);
    return requestPromise;
  } catch (error) {
    pendingRequests.delete(path);
    return { success: false, error: error.message };
  }
};