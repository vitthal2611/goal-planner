import { useState, useCallback, useEffect } from 'react';
import { ref, set, onValue } from 'firebase/database';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { getInitialData } from '../data/sampleData';
import { ensureGoalDates, parseGoalDates } from '../utils/dateUtils';

export const useGoals = (deleteHabitFn, habits) => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    if (!user) {
      setGoals([]);
      return;
    }
    const goalsRef = ref(db, `users/${user.uid}/goals`);
    const unsubscribe = onValue(goalsRef, (snapshot) => {
      if (snapshot.exists()) {
        const goalsData = Object.values(snapshot.val());
        // Parse dates consistently from Firebase
        const processedGoals = goalsData.map(goal => parseGoalDates(goal));
        setGoals(processedGoals);
      } else {
        setGoals([]);
      }
    });
    return unsubscribe;
  }, [user]);
  
  const addGoal = useCallback((newGoal) => {
    if (!user) return;
    // Ensure dates are properly formatted for Firebase
    const goalWithDates = ensureGoalDates(newGoal);
    setGoals(prev => {
      const updated = [...prev, goalWithDates];
      set(ref(db, `users/${user.uid}/goals`), updated).catch(console.error);
      return updated;
    });
  }, [user]);
  
  const updateGoal = useCallback((goalId, updates) => {
    if (!user) return;
    // Ensure dates are properly formatted for Firebase
    const updatesWithDates = ensureGoalDates(updates);
    setGoals(prev => {
      const updated = prev.map(goal => 
        goal.id === goalId ? { ...goal, ...updatesWithDates } : goal
      );
      set(ref(db, `users/${user.uid}/goals`), updated).catch(console.error);
      return updated;
    });
  }, [user]);
  
  const deleteGoal = useCallback((goalId) => {
    if (!user) return;
    // Delete associated habits first
    habits?.filter(h => h.goalIds?.includes(goalId)).forEach(h => deleteHabitFn(h.id));
    // Then delete the goal
    setGoals(prev => {
      const updated = prev.filter(goal => goal.id !== goalId);
      set(ref(db, `users/${user.uid}/goals`), updated.length ? updated : null).catch(console.error);
      return updated;
    });
  }, [user, deleteHabitFn, habits]);
  
  return { goals, addGoal, updateGoal, deleteGoal };
};