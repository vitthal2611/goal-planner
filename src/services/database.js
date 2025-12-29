import { ref, push, set, get, child } from 'firebase/database';
import { database } from '../config/firebase.js';

export const saveData = async (path, data) => {
  try {
    const dataRef = ref(database, path);
    await set(dataRef, data);
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

export const getData = async (path) => {
  try {
    const snapshot = await get(child(ref(database), path));
    if (snapshot.exists()) {
      return { success: true, data: snapshot.val() };
    } else {
      return { success: true, data: null };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};