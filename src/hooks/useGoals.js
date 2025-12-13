import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { getInitialData } from '../data/sampleData';

const initialData = getInitialData();

export const useGoals = (deleteHabitFn, habits) => {
  const [goals, setGoals] = useLocalStorage('goals', initialData.goals);
  
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