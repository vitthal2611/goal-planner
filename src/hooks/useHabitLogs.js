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
        const initialData = getInitialData();
        set(logsRef, initialData.logs).catch(console.error);
      }
    });
    return unsubscribe;
  }, [user]);
  
  const logHabit = useCallback((habitId, status, habit) => {
    if (!user) return;
    const today = formatDate(new Date());
    const todayDate = new Date();
    
    if (habit && !isHabitScheduledForDate(habit, todayDate)) return;
    
    setHabitLogs(prev => {
      const existingLog = prev.find(log => log.habitId === habitId && log.date === today);
      let updated;
      
      if (existingLog) {
        updated = prev.map(log => 
          log.id === existingLog.id 
            ? { ...log, status, loggedAt: new Date().toISOString() }
            : log
        );
      } else {
        const newLog = {
          id: generateId(),
          habitId,
          date: today,
          status,
          loggedAt: new Date().toISOString(),
        };
        updated = [...prev, newLog];
      }
      
      set(ref(db, `users/${user.uid}/habitLogs`), updated).catch(console.error);
      return updated;
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