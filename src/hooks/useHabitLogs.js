import { useState, useCallback, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { generateId, formatDate } from '../utils/calculations';
import { isHabitScheduledForDate } from '../utils/frequencyRules';

export const useHabitLogs = () => {
  const { user } = useAuth();
  const [habitLogs, setHabitLogs] = useState([]);

  useEffect(() => {
    if (!user) {
      setHabitLogs([]);
      return;
    }
    const unsubscribe = onSnapshot(
      collection(db, 'users', user.uid, 'habitLogs'),
      (snapshot) => {
        const logsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setHabitLogs(logsData);
      },
      (error) => console.error('Habit logs sync error:', error)
    );
    return unsubscribe;
  }, [user]);
  
  const logHabit = useCallback(async (habitId, status, habit, dateStr = null) => {
    if (!user) return Promise.reject('No user');
    const targetDate = dateStr || formatDate(new Date());
    const targetDateObj = dateStr ? new Date(dateStr) : new Date();
    
    if (habit && !isHabitScheduledForDate(habit, targetDateObj)) {
      return Promise.reject('Habit not scheduled for this date');
    }
    
    try {
      const existingLog = habitLogs.find(log => log.habitId === habitId && log.date === targetDate);
      
      if (status === 'remove' && existingLog) {
        await deleteDoc(doc(db, 'users', user.uid, 'habitLogs', existingLog.id));
      } else if (existingLog) {
        await setDoc(doc(db, 'users', user.uid, 'habitLogs', existingLog.id), {
          ...existingLog,
          status,
          loggedAt: new Date().toISOString()
        });
      } else if (status !== 'remove') {
        const logId = generateId();
        await setDoc(doc(db, 'users', user.uid, 'habitLogs', logId), {
          id: logId,
          habitId,
          date: targetDate,
          status,
          loggedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Log habit error:', error);
      throw error;
    }
  }, [user, habitLogs]);
  
  const updateLog = useCallback(async (logId, updates) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid, 'habitLogs', logId), {
        ...updates,
        loggedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Update log error:', error);
    }
  }, [user]);
  
  return { logs: habitLogs, logHabit, updateLog };
};