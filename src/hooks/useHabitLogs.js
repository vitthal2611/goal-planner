import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { generateId, formatDate } from '../utils/calculations';
import { getInitialData } from '../data/sampleData';

const initialData = getInitialData();

export const useHabitLogs = () => {
  const [habitLogs, setHabitLogs] = useLocalStorage('habitLogs', initialData.logs);
  
  const logHabit = useCallback((habitId, status) => {
    const today = formatDate(new Date());
    const existingLog = habitLogs.find(log => log.habitId === habitId && log.date === today);
    
    if (existingLog) {
      setHabitLogs(prev => 
        prev.map(log => 
          log.id === existingLog.id 
            ? { ...log, status, loggedAt: new Date() }
            : log
        )
      );
    } else {
      const newLog = {
        id: generateId(),
        habitId,
        date: today,
        status,
        loggedAt: new Date(),
      };
      setHabitLogs(prev => [...prev, newLog]);
    }
  }, [habitLogs, setHabitLogs]);
  
  return { habitLogs, logHabit };
};