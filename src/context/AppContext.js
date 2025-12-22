import React, { createContext, useContext } from 'react';
import { useGoals } from '../hooks/useGoals';
import { useHabits } from '../hooks/useHabits';
import { useHabitLogs } from '../hooks/useHabitLogs';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const habits = useHabits();
  const goals = useGoals(habits.deleteHabit, habits.habits);
  const logs = useHabitLogs();
  
  return (
    <AppContext.Provider value={{ 
      ...goals, 
      ...habits, 
      ...logs
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