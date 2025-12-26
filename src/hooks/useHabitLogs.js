import { useState, useCallback, useEffect } from 'react';
import { ref, set, onValue } from 'firebase/database';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { generateId, formatDate } from '../utils/calculations';
import { getInitialData } from '../data/sampleData';
import { isHabitScheduledForDate } from '../utils/frequencyRules';

export const useHabitLogs = () => {
  const { user } = useAuth();
  const [habitLogs, setHabitLogs] = useState([]);

  useEffect(() => {
    if (!user) {
      setHabitLogs([]);
      return;
    }
    const logsRef = ref(db, `users/${user.uid}/habitLogs`);
    const unsubscribe = onValue(logsRef, (snapshot) => {
      if (snapshot.exists()) {
        setHabitLogs(Object.values(snapshot.val()));
      } else {
        setHabitLogs([]);
      }
    });
    return unsubscribe;
  }, [user]);
  
  const logHabit = useCallback(async (habitId, status, habit, dateStr = null) => {
    if (!user) return Promise.reject('No user');
    const targetDate = dateStr || formatDate(new Date());
    const targetDateObj = dateStr ? new Date(dateStr) : new Date();
    
    if (habit && !isHabitScheduledForDate(habit, targetDateObj)) {
      return Promise.reject('Habit not scheduled for this date');
    }
    
    return new Promise((resolve, reject) => {
      setHabitLogs(prev => {
        const existingLog = prev.find(log => log.habitId === habitId && log.date === targetDate);
        let updated;
        
        if (status === 'remove' && existingLog) {
          updated = prev.filter(log => log.id !== existingLog.id);
        } else if (existingLog) {
          updated = prev.map(log => 
            log.id === existingLog.id 
              ? { ...log, status, loggedAt: new Date().toISOString() }
              : log
          );
        } else if (status !== 'remove') {
          const newLog = {
            id: generateId(),
            habitId,
            date: targetDate,
            status,
            loggedAt: new Date().toISOString(),
          };
          updated = [...prev, newLog];
        } else {
          resolve();
          return prev;
        }
        
        set(ref(db, `users/${user.uid}/habitLogs`), updated)
          .then(() => resolve())
          .catch(reject);
        return updated;
      });
    });
  }, [user]);
  
  const updateLog = useCallback((logId, updates) => {
    if (!user) return;
    setHabitLogs(prev => {
      const updated = prev.map(log => 
        log.id === logId ? { ...log, ...updates, loggedAt: new Date().toISOString() } : log
      );
      set(ref(db, `users/${user.uid}/habitLogs`), updated).catch(console.error);
      return updated;
    });
  }, [user]);
  
  return { logs: habitLogs, logHabit, updateLog };
};