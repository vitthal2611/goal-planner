import React, { createContext, useContext, useMemo } from 'react';
import { useGoals } from '../hooks/useGoals';
import { useHabits } from '../hooks/useHabits';
import { useHabitLogs } from '../hooks/useHabitLogs';
import { useYear } from './YearContext';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { selectedYear } = useYear();
  const habits = useHabits();
  const goals = useGoals(habits.deleteHabit, habits.habits);
  const logs = useHabitLogs();
  
  const yearFilteredGoals = useMemo(() => 
    goals.goals.filter(g => g.year === selectedYear),
    [goals.goals, selectedYear]
  );
  
  const yearFilteredHabits = useMemo(() => 
    habits.habits.filter(h => h.startYear <= selectedYear),
    [habits.habits, selectedYear]
  );
  
  const yearFilteredLogs = useMemo(() => 
    logs.logs.filter(l => new Date(l.date).getFullYear() === selectedYear),
    [logs.logs, selectedYear]
  );
  
  return (
    <AppContext.Provider value={{ 
      ...goals, 
      goals: yearFilteredGoals,
      ...habits, 
      habits: yearFilteredHabits,
      ...logs,
      logs: yearFilteredLogs
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};