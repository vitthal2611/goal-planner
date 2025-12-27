import { useState, useCallback, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export const useHabits = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    if (!user) {
      setHabits([]);
      return;
    }
    const unsubscribe = onSnapshot(
      collection(db, 'users', user.uid, 'habits'),
      (snapshot) => {
        const habitsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setHabits(habitsData);
      },
      (error) => console.error('Habits sync error:', error)
    );
    return unsubscribe;
  }, [user]);
  
  const addHabit = useCallback(async (newHabit) => {
    if (!user) return;
    try {
      const habitId = newHabit.id || `habit_${Date.now()}`;
      await setDoc(doc(db, 'users', user.uid, 'habits', habitId), {
        ...newHabit,
        id: habitId,
        createdAt: newHabit.createdAt || Timestamp.now()
      });
    } catch (error) {
      console.error('Add habit error:', error);
    }
  }, [user]);
  
  const updateHabit = useCallback(async (habitId, updates) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid, 'habits', habitId), updates, { merge: true });
    } catch (error) {
      console.error('Update habit error:', error);
    }
  }, [user]);
  
  const deleteHabit = useCallback(async (habitId) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'habits', habitId));
    } catch (error) {
      console.error('Delete habit error:', error);
    }
  }, [user]);
  
  return { habits, addHabit, updateHabit, deleteHabit };
};