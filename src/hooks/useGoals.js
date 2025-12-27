import { useState, useCallback, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { ensureGoalDates, parseGoalDates } from '../utils/dateUtils';

export const useGoals = (deleteHabitFn, habits) => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    if (!user) {
      setGoals([]);
      return;
    }
    const unsubscribe = onSnapshot(
      collection(db, 'users', user.uid, 'goals'),
      (snapshot) => {
        const goalsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return parseGoalDates({ id: doc.id, ...data });
        });
        setGoals(goalsData);
      },
      (error) => console.error('Goals sync error:', error)
    );
    return unsubscribe;
  }, [user]);
  
  const addGoal = useCallback(async (newGoal) => {
    if (!user) return;
    try {
      const goalId = newGoal.id || `goal_${Date.now()}`;
      const goalWithDates = ensureGoalDates(newGoal);
      await setDoc(doc(db, 'users', user.uid, 'goals', goalId), {
        ...goalWithDates,
        id: goalId,
        createdAt: newGoal.createdAt || Timestamp.now()
      });
    } catch (error) {
      console.error('Add goal error:', error);
    }
  }, [user]);
  
  const updateGoal = useCallback(async (goalId, updates) => {
    if (!user) return;
    try {
      const updatesWithDates = ensureGoalDates(updates);
      await setDoc(doc(db, 'users', user.uid, 'goals', goalId), updatesWithDates, { merge: true });
    } catch (error) {
      console.error('Update goal error:', error);
    }
  }, [user]);
  
  const deleteGoal = useCallback(async (goalId) => {
    if (!user) return;
    try {
      // Delete associated habits first
      const associatedHabits = habits?.filter(h => h.goalIds?.includes(goalId)) || [];
      await Promise.all(associatedHabits.map(h => deleteHabitFn(h.id)));
      // Then delete the goal
      await deleteDoc(doc(db, 'users', user.uid, 'goals', goalId));
    } catch (error) {
      console.error('Delete goal error:', error);
    }
  }, [user, deleteHabitFn, habits]);
  
  return { goals, addGoal, updateGoal, deleteGoal };
};