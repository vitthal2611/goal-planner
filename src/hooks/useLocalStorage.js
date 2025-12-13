import { useState } from 'react';

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Validate data structure
      if (key === 'goals' && !Array.isArray(valueToStore)) {
        throw new Error('Goals must be an array');
      }
      if (key === 'habits' && !Array.isArray(valueToStore)) {
        throw new Error('Habits must be an array');
      }
      if (key === 'habitLogs' && !Array.isArray(valueToStore)) {
        throw new Error('Habit logs must be an array');
      }
      
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}