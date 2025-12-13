import { useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { getInitialData } from '../data/sampleData';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

const initialData = getInitialData();

export const useHabits = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useLocalStorage('habits', initialData.habits);

  // Sync to Firestore
  useEffect(() => {
    if (user && habits.length > 0) {
      setDoc(doc(db, 'users', user.uid), { habits }, { merge: true });
    }
  }, [habits, user]);

  // Listen to Firestore changes
  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists() && doc.data().habits) {
        setHabits(doc.data().habits);
      }
    });
    return unsubscribe;
  }, [user]);
  
  const addHabit = useCallback((newHabit) => {
    setHabits(prev => [...prev, newHabit]);
  }, [setHabits]);
  
  const deleteHabit = useCallback((habitId) => {
    setHabits(prev => prev.filter(habit => habit.id !== habitId));
  }, [setHabits]);
  
  return { habits, addHabit, deleteHabit };
};