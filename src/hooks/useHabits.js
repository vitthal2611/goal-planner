import { useState, useCallback, useEffect } from 'react';
import { ref, set, onValue } from 'firebase/database';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { getInitialData } from '../data/sampleData';

export const useHabits = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    if (!user) {
      setHabits([]);
      return;
    }
    try {
      const habitsRef = ref(db, `users/${user.uid}/habits`);
      const unsubscribe = onValue(habitsRef, async (snapshot) => {
        if (snapshot.exists()) {
          setHabits(Object.values(snapshot.val()));
        } else {
          const initialData = getInitialData();
          setHabits(initialData.habits);
        }
      });
      return unsubscribe;
    } catch (error) {
      console.error('Firebase error:', error);
      const initialData = getInitialData();
      setHabits(initialData.habits);
    }
  }, [user]);
  
  const addHabit = useCallback((newHabit) => {
    if (!user) return;
    setHabits(prev => {
      const updated = [...prev, newHabit];
      set(ref(db, `users/${user.uid}/habits`), updated);
      return updated;
    });
  }, [user]);
  
  const updateHabit = useCallback((habitId, updates) => {
    if (!user) return;
    setHabits(prev => {
      const updated = prev.map(habit => 
        habit.id === habitId ? { ...habit, ...updates } : habit
      );
      set(ref(db, `users/${user.uid}/habits`), updated);
      return updated;
    });
  }, [user]);
  
  const deleteHabit = useCallback((habitId) => {
    if (!user) return;
    setHabits(prev => {
      const updated = prev.filter(habit => habit.id !== habitId);
      set(ref(db, `users/${user.uid}/habits`), updated.length ? updated : null);
      return updated;
    });
  }, [user]);
  
  return { habits, addHabit, updateHabit, deleteHabit };
};