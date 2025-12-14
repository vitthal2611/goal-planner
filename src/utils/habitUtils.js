import { differenceInDays, subDays, parseISO, isAfter, isBefore, startOfDay, min as minDate, max as maxDate } from 'date-fns';
import { getExpectedCompletions, isHabitScheduledForDate } from './frequencyRules';

export const calculateHabitConsistency = (habit, logs, goal) => {
  if (!goal) return { consistency: 0, completionRate: 0, completed: 0, skipped: 0, missed: 0, expected: 0, currentStreak: 0, longestStreak: 0 };
  
  const startDate = startOfDay(parseISO(goal.startDate));
  const endDate = startOfDay(parseISO(goal.endDate));
  const today = startOfDay(new Date());
  const effectiveEndDate = minDate([today, endDate]);
  
  const relevantLogs = logs.filter(log => {
    const logDate = startOfDay(parseISO(log.date));
    return log.habitId === habit.id && 
           logDate >= startDate && 
           logDate <= effectiveEndDate;
  });
  
  const completedDays = relevantLogs.filter(log => log.status === 'done').length;
  const skippedDays = relevantLogs.filter(log => log.status === 'skipped').length;
  const totalLoggedDays = relevantLogs.length;
  
  const expectedDays = getExpectedCompletions(habit, startDate, effectiveEndDate);
  const missedDays = Math.max(0, expectedDays - totalLoggedDays);
  
  const consistency = expectedDays > 0 ? (completedDays / expectedDays) * 100 : 0;
  const completionRate = totalLoggedDays > 0 ? (completedDays / totalLoggedDays) * 100 : 0;
  
  return {
    consistency: Math.round(consistency),
    completionRate: Math.round(completionRate),
    completed: completedDays,
    skipped: skippedDays,
    missed: missedDays,
    expected: expectedDays,
    currentStreak: calculateCurrentStreak(habit, logs, goal),
    longestStreak: calculateLongestStreak(habit, logs, goal)
  };
};

export const calculateCurrentStreak = (habit, logs, goal) => {
  if (!goal) return 0;
  
  const startDate = startOfDay(parseISO(goal.startDate));
  const endDate = startOfDay(parseISO(goal.endDate));
  const today = startOfDay(new Date());
  
  const habitLogs = logs
    .filter(log => {
      const logDate = startOfDay(parseISO(log.date));
      return log.habitId === habit.id && 
             log.status === 'done' && 
             logDate >= startDate && 
             logDate <= endDate;
    })
    .sort((a, b) => b.date.localeCompare(a.date));
  
  if (habitLogs.length === 0) return 0;
  
  let streak = 0;
  let checkDate = minDate([today, endDate]);
  
  while (checkDate >= startDate) {
    if (!isHabitScheduledForDate(habit, checkDate)) {
      checkDate = subDays(checkDate, 1);
      continue;
    }
    
    const dateStr = checkDate.toISOString().split('T')[0];
    const log = habitLogs.find(l => l.date === dateStr);
    
    if (log) {
      streak++;
      checkDate = subDays(checkDate, 1);
    } else {
      break;
    }
  }
  
  return streak;
};

export const calculateLongestStreak = (habit, logs, goal) => {
  if (!goal) return 0;
  
  const startDate = startOfDay(parseISO(goal.startDate));
  const endDate = startOfDay(parseISO(goal.endDate));
  
  const habitLogs = logs
    .filter(log => {
      const logDate = startOfDay(parseISO(log.date));
      return log.habitId === habit.id && 
             log.status === 'done' && 
             logDate >= startDate && 
             logDate <= endDate;
    })
    .sort((a, b) => a.date.localeCompare(b.date));
  
  if (habitLogs.length === 0) return 0;
  
  let maxStreak = 0;
  let currentStreak = 0;
  let lastDate = null;
  
  for (const log of habitLogs) {
    const logDate = parseISO(log.date);
    
    if (!lastDate) {
      currentStreak = 1;
    } else {
      let checkDate = subDays(logDate, 1);
      let foundGap = false;
      
      while (checkDate > lastDate && differenceInDays(logDate, lastDate) <= 7) {
        if (isHabitScheduledForDate(habit, checkDate)) {
          foundGap = true;
          break;
        }
        checkDate = subDays(checkDate, 1);
      }
      
      if (!foundGap && differenceInDays(logDate, lastDate) <= 7) {
        currentStreak++;
      } else {
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 1;
      }
    }
    
    lastDate = logDate;
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

export const getHabitStatus = (habit, logs, goal) => {
  const consistency = calculateHabitConsistency(habit, logs, goal);
  
  if (consistency.consistency >= 90) return 'excellent';
  if (consistency.consistency >= 70) return 'good';
  if (consistency.consistency >= 50) return 'fair';
  return 'needs-attention';
};

export const getHabitsForGoal = (goalId, habits) => {
  return habits.filter(habit => habit.goalIds.includes(goalId));
};

export const calculateGoalHabitAlignment = (goal, habits, logs) => {
  const relatedHabits = getHabitsForGoal(goal.id, habits);
  
  if (relatedHabits.length === 0) return 0;
  
  const consistencies = relatedHabits.map(habit => 
    calculateHabitConsistency(habit, logs, goal).consistency
  );
  
  const avgConsistency = consistencies.reduce((sum, c) => sum + c, 0) / consistencies.length;
  
  return Math.round(avgConsistency);
};
