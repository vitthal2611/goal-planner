import { useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { getInitialData } from '../data/sampleData';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

const initialData = getInitialData();

export const useGoals = (deleteHabitFn, habits) => {
  const { user } = useAuth();
  const [goals, setGoals] = useLocalStorage('goals', initialData.goals);

  // Sync to Firestore when goals change
  useEffect(() => {
    if (user && goals.length > 0) {
      setDoc(doc(db, 'users', user.uid), { goals }, { merge: true });
    }
  }, [goals, user]);

  // Listen to Firestore changes
  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists() && doc.data().goals) {
        setGoals(doc.data().goals);
      }
    });
    return unsubscribe;
  }, [user]);
  
  const addGoal = useCallback((newGoal) => {
    setGoals(prev => [...prev, newGoal]);
  }, [setGoals]);
  
  const updateGoal = useCallback((goalId, newProgress) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId ? { ...goal, actualProgress: newProgress } : goal
    ));
  }, [setGoals]);
  
  const deleteGoal = useCallback((goalId) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
    habits?.filter(h => h.goalIds?.includes(goalId)).forEach(h => deleteHabitFn(h.id));
  }, [setGoals, deleteHabitFn, habits]);
  
  return { goals, addGoal, updateGoal, deleteGoal };
};