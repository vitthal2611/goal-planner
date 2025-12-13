import { differenceInDays, format, subDays, addDays } from 'date-fns';
import { Goal, GoalProgress, Habit, HabitLog, HabitConsistency } from '../types';

export const calculateGoalProgress = (goal: Goal): GoalProgress => {
  const totalDays = differenceInDays(goal.endDate, goal.startDate);
  const daysPassed = differenceInDays(new Date(), goal.startDate);
  
  const quarterlyTarget = goal.yearlyTarget / 4;
  const monthlyTarget = goal.yearlyTarget / 12;
  const expectedProgress = Math.max(0, (goal.yearlyTarget * daysPassed) / totalDays);
  
  return {
    yearlyProgress: (goal.actualProgress / goal.yearlyTarget) * 100,
    quarterlyProgress: ((goal.actualProgress % quarterlyTarget) / quarterlyTarget) * 100,
    monthlyProgress: ((goal.actualProgress % monthlyTarget) / monthlyTarget) * 100,
    onTrack: goal.actualProgress >= expectedProgress,
    targets: {
      yearly: goal.yearlyTarget,
      quarterly: quarterlyTarget,
      monthly: monthlyTarget,
      expected: Math.round(expectedProgress)
    }
  };
};

export const calculateHabitConsistency = (
  habit: Habit,
  logs: HabitLog[],
  days: number = 30
): HabitConsistency => {
  const endDate = new Date();
  const startDate = subDays(endDate, days);
  
  const recentLogs = logs.filter(log => {
    const logDate = new Date(log.date);
    return logDate >= startDate && logDate <= endDate;
  });
  
  const completedDays = recentLogs.filter(log => log.status === 'done').length;
  const totalExpectedDays = days;
  
  const currentStreak = calculateCurrentStreak(logs);
  const longestStreak = calculateLongestStreak(logs);
  
  return {
    consistency: totalExpectedDays > 0 ? (completedDays / totalExpectedDays) * 100 : 0,
    completed: completedDays,
    expected: totalExpectedDays,
    currentStreak,
    longestStreak
  };
};

const calculateCurrentStreak = (logs: HabitLog[]): number => {
  const sortedLogs = logs
    .filter(log => log.status === 'done')
    .sort((a, b) => b.date.localeCompare(a.date));
  
  let streak = 0;
  let currentDate = new Date();
  
  for (const log of sortedLogs) {
    const logDate = new Date(log.date);
    const daysDiff = differenceInDays(currentDate, logDate);
    
    if (daysDiff === streak) {
      streak++;
      currentDate = subDays(currentDate, 1);
    } else {
      break;
    }
  }
  
  return streak;
};

const calculateLongestStreak = (logs: HabitLog[]): number => {
  const doneLogs = logs
    .filter(log => log.status === 'done')
    .sort((a, b) => a.date.localeCompare(b.date));
  
  let maxStreak = 0;
  let currentStreak = 0;
  let lastDate: Date | null = null;
  
  for (const log of doneLogs) {
    const logDate = new Date(log.date);
    
    if (lastDate && differenceInDays(logDate, lastDate) === 1) {
      currentStreak++;
    } else {
      currentStreak = 1;
    }
    
    maxStreak = Math.max(maxStreak, currentStreak);
    lastDate = logDate;
  }
  
  return maxStreak;
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};