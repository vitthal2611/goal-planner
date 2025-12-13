import { useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { generateId, formatDate } from '../utils/calculations';
import { getInitialData } from '../data/sampleData';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

const initialData = getInitialData();

export const useHabitLogs = () => {
  const { user } = useAuth();
  const [habitLogs, setHabitLogs] = useLocalStorage('habitLogs', initialData.logs);

  // Sync to Firestore
  useEffect(() => {
    if (user && habitLogs.length > 0) {
      setDoc(doc(db, 'users', user.uid), { habitLogs }, { merge: true });
    }
  }, [habitLogs, user]);

  // Listen to Firestore changes
  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists() && doc.data().habitLogs) {
        setHabitLogs(doc.data().habitLogs);
      }
    });
    return unsubscribe;
  }, [user]);
  
  const logHabit = useCallback((habitId, status) => {
    const today = formatDate(new Date());
    const existingLog = habitLogs.find(log => log.habitId === habitId && log.date === today);
    
    if (existingLog) {
      setHabitLogs(prev => 
        prev.map(log => 
          log.id === existingLog.id 
            ? { ...log, status, loggedAt: new Date() }
            : log
        )
      );
    } else {
      const newLog = {
        id: generateId(),
        habitId,
        date: today,
        status,
        loggedAt: new Date(),
      };
      setHabitLogs(prev => [...prev, newLog]);
    }
  }, [habitLogs, setHabitLogs]);
  
  return { habitLogs, logHabit };
};