import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { getInitialData } from '../data/sampleData';

const initialData = getInitialData();

export const useHabits = () => {
  const [habits, setHabits] = useLocalStorage('habits', initialData.habits);
  
  const addHabit = useCallback((newHabit) => {
    setHabits(prev => [...prev, newHabit]);
  }, [setHabits]);
  
  const deleteHabit = useCallback((habitId) => {
    setHabits(prev => prev.filter(habit => habit.id !== habitId));
  }, [setHabits]);
  
  return { habits, addHabit, deleteHabit };
};