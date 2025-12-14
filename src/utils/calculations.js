import { differenceInDays, format, subDays } from 'date-fns';

export const calculateGoalProgress = (goal) => {
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

export const calculateHabitConsistency = (habit, logs, goal) => {
  if (!goal) return { consistency: 0, completed: 0, expected: 0, currentStreak: 0, longestStreak: 0 };
  
  const startDate = new Date(goal.startDate);
  const endDate = new Date(goal.endDate);
  const today = new Date();
  const effectiveEndDate = today < endDate ? today : endDate;
  
  const recentLogs = logs.filter(log => {
    const logDate = new Date(log.date);
    return log.habitId === habit.id && logDate >= startDate && logDate <= effectiveEndDate;
  });
  
  const completedDays = recentLogs.filter(log => log.status === 'done').length;
  const totalExpectedDays = Math.max(1, differenceInDays(effectiveEndDate, startDate) + 1);
  
  const currentStreak = calculateCurrentStreak(logs, goal);
  const longestStreak = calculateLongestStreak(logs, goal);
  
  return {
    consistency: totalExpectedDays > 0 ? (completedDays / totalExpectedDays) * 100 : 0,
    completed: completedDays,
    expected: totalExpectedDays,
    currentStreak,
    longestStreak
  };
};

const calculateCurrentStreak = (logs, goal) => {
  if (!goal) return 0;
  
  const startDate = new Date(goal.startDate);
  const endDate = new Date(goal.endDate);
  const today = new Date();
  const effectiveEndDate = today < endDate ? today : endDate;
  
  const sortedLogs = logs
    .filter(log => {
      const logDate = new Date(log.date);
      return log.status === 'done' && logDate >= startDate && logDate <= effectiveEndDate;
    })
    .sort((a, b) => b.date.localeCompare(a.date));
  
  let streak = 0;
  let currentDate = effectiveEndDate;
  
  for (const log of sortedLogs) {
    const logDate = new Date(log.date);
    const daysDiff = differenceInDays(currentDate, logDate);
    
    if (daysDiff === streak) {
      streak++;
      currentDate = subDays(currentDate, 1);
    } else {
      break;
    }
    
    if (currentDate < startDate) break;
  }
  
  return streak;
};

const calculateLongestStreak = (logs, goal) => {
  if (!goal) return 0;
  
  const startDate = new Date(goal.startDate);
  const endDate = new Date(goal.endDate);
  
  const doneLogs = logs
    .filter(log => {
      const logDate = new Date(log.date);
      return log.status === 'done' && logDate >= startDate && logDate <= endDate;
    })
    .sort((a, b) => a.date.localeCompare(b.date));
  
  let maxStreak = 0;
  let currentStreak = 0;
  let lastDate = null;
  
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

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatDate = (date) => {
  return format(date, 'yyyy-MM-dd');
};