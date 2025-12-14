import { useState, useCallback, useEffect } from 'react';
import { ref, set, onValue } from 'firebase/database';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { getInitialData } from '../data/sampleData';

export const useGoals = (deleteHabitFn, habits) => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    if (!user) {
      setGoals([]);
      return;
    }
    try {
      const goalsRef = ref(db, `users/${user.uid}/goals`);
      const unsubscribe = onValue(goalsRef, async (snapshot) => {
        if (snapshot.exists()) {
          setGoals(Object.values(snapshot.val()));
        } else {
          const initialData = getInitialData();
          setGoals(initialData.goals);
        }
      });
      return unsubscribe;
    } catch (error) {
      console.error('Firebase error:', error);
      const initialData = getInitialData();
      setGoals(initialData.goals);
    }
  }, [user]);
  
  const addGoal = useCallback((newGoal) => {
    if (!user) return;
    setGoals(prev => {
      const updated = [...prev, newGoal];
      set(ref(db, `users/${user.uid}/goals`), updated);
      return updated;
    });
  }, [user]);
  
  const updateGoal = useCallback((goalId, updates) => {
    if (!user) return;
    setGoals(prev => {
      const updated = prev.map(goal => 
        goal.id === goalId ? { ...goal, ...updates } : goal
      );
      set(ref(db, `users/${user.uid}/goals`), updated);
      return updated;
    });
  }, [user]);
  
  const updateGoalProgress = useCallback((goalId, newProgress, monthlyData) => {
    if (!user) return;
    setGoals(prev => {
      const updated = prev.map(goal => 
        goal.id === goalId ? { ...goal, actualProgress: newProgress, ...(monthlyData && { monthlyData }) } : goal
      );
      set(ref(db, `users/${user.uid}/goals`), updated);
      return updated;
    });
  }, [user]);
  
  const deleteGoal = useCallback((goalId) => {
    if (!user) return;
    setGoals(prev => {
      const updated = prev.filter(goal => goal.id !== goalId);
      set(ref(db, `users/${user.uid}/goals`), updated.length ? updated : null);
      return updated;
    });
    habits?.filter(h => h.goalIds?.includes(goalId)).forEach(h => deleteHabitFn(h.id));
  }, [user, deleteHabitFn, habits]);
  
  return { goals, addGoal, updateGoal, updateGoalProgress, deleteGoal };
};