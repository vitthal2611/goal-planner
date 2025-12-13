import { differenceInDays, subDays, parseISO, isAfter, isBefore, startOfDay } from 'date-fns';

export const calculateHabitConsistency = (habit, logs, days = 30) => {
  const endDate = new Date();
  const startDate = subDays(endDate, days);
  
  const relevantLogs = logs.filter(log => {
    const logDate = parseISO(log.date);
    return log.habitId === habit.id && 
           isAfter(logDate, startDate) && 
           isBefore(logDate, endDate);
  });
  
  const completedDays = relevantLogs.filter(log => log.status === 'done').length;
  const skippedDays = relevantLogs.filter(log => log.status === 'skipped').length;
  const totalLoggedDays = relevantLogs.length;
  
  const expectedDays = getExpectedDays(habit, startDate, endDate);
  const missedDays = expectedDays - totalLoggedDays;
  
  const consistency = expectedDays > 0 ? (completedDays / expectedDays) * 100 : 0;
  const completionRate = totalLoggedDays > 0 ? (completedDays / totalLoggedDays) * 100 : 0;
  
  return {
    consistency: Math.round(consistency),
    completionRate: Math.round(completionRate),
    completed: completedDays,
    skipped: skippedDays,
    missed: missedDays,
    expected: expectedDays,
    currentStreak: calculateCurrentStreak(habit, logs),
    longestStreak: calculateLongestStreak(habit, logs)
  };
};

export const calculateCurrentStreak = (habit, logs) => {
  const habitLogs = logs
    .filter(log => log.habitId === habit.id && log.status === 'done')
    .sort((a, b) => b.date.localeCompare(a.date));
  
  if (habitLogs.length === 0) return 0;
  
  let streak = 0;
  let checkDate = startOfDay(new Date());
  
  for (const log of habitLogs) {
    const logDate = startOfDay(parseISO(log.date));
    const daysDiff = differenceInDays(checkDate, logDate);
    
    if (daysDiff === streak) {
      streak++;
      checkDate = subDays(checkDate, 1);
    } else if (daysDiff > streak) {
      break;
    }
  }
  
  return streak;
};

export const calculateLongestStreak = (habit, logs) => {
  const habitLogs = logs
    .filter(log => log.habitId === habit.id && log.status === 'done')
    .sort((a, b) => a.date.localeCompare(b.date));
  
  if (habitLogs.length === 0) return 0;
  
  let maxStreak = 0;
  let currentStreak = 1;
  
  for (let i = 1; i < habitLogs.length; i++) {
    const prevDate = parseISO(habitLogs[i - 1].date);
    const currDate = parseISO(habitLogs[i].date);
    const daysDiff = differenceInDays(currDate, prevDate);
    
    if (daysDiff === 1) {
      currentStreak++;
    } else {
      maxStreak = Math.max(maxStreak, currentStreak);
      currentStreak = 1;
    }
  }
  
  return Math.max(maxStreak, currentStreak);
};

export const getExpectedDays = (habit, startDate, endDate) => {
  const totalDays = differenceInDays(endDate, startDate);
  
  switch (habit.frequency) {
    case 'daily':
      return totalDays;
    case 'weekly':
      return Math.floor(totalDays / 7);
    case 'monthly':
      return Math.floor(totalDays / 30);
    default:
      return totalDays;
  }
};

export const getHabitStatus = (habit, logs) => {
  const consistency = calculateHabitConsistency(habit, logs, 7);
  
  if (consistency.consistency >= 90) return 'excellent';
  if (consistency.consistency >= 70) return 'good';
  if (consistency.consistency >= 50) return 'fair';
  return 'needs-attention';
};

export const getHabitsForGoal = (goalId, habits) => {
  return habits.filter(habit => habit.goalIds.includes(goalId));
};

export const calculateGoalHabitAlignment = (goalId, habits, logs) => {
  const relatedHabits = getHabitsForGoal(goalId, habits);
  
  if (relatedHabits.length === 0) return 0;
  
  const consistencies = relatedHabits.map(habit => 
    calculateHabitConsistency(habit, logs).consistency
  );
  
  const avgConsistency = consistencies.reduce((sum, c) => sum + c, 0) / consistencies.length;
  
  return Math.round(avgConsistency);
};
