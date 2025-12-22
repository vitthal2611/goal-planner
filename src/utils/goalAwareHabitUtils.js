import { parseISO, startOfDay, eachDayOfInterval, min as minDate, max as maxDate, subDays } from 'date-fns';
import { getExpectedCompletions, isHabitScheduledForDate } from './frequencyRules';

// Step 2: Get habit date range from linked goal
export const getHabitDateRange = (habit, goals) => {
  if (!habit.goalIds || habit.goalIds.length === 0) return null;
  
  const linkedGoal = goals.find(g => habit.goalIds.includes(g.id));
  if (!linkedGoal) return null;
  
  const startDate = startOfDay(typeof linkedGoal.startDate === 'string' ? parseISO(linkedGoal.startDate) : new Date(linkedGoal.startDate));
  const endDate = startOfDay(typeof linkedGoal.endDate === 'string' ? parseISO(linkedGoal.endDate) : new Date(linkedGoal.endDate));
  
  // Validate dates
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return null;
  }
  
  return { startDate, endDate };
};

// Step 3: Get expected habit occurrences within date range
export const getExpectedHabitOccurrences = (habit, startDate, endDate) => {
  return getExpectedCompletions(habit, startDate, endDate);
};

// Step 4: Get completed habit count within date range
export const getCompletedHabitCount = (habitId, logs, startDate, endDate) => {
  return logs.filter(log => {
    if (log.habitId !== habitId || log.status !== 'done') return false;
    const logDate = startOfDay(parseISO(log.date));
    return logDate >= startDate && logDate <= endDate;
  }).length;
};

// Step 5: Calculate consistency within goal timeline
export const calculateGoalAwareConsistency = (habit, logs, goals, days = 30) => {
  const today = startOfDay(new Date());
  const startDate = subDays(today, days - 1);
  
  const completed = logs.filter(log => {
    if (log.habitId !== habit.id || log.status !== 'done') return false;
    const logDate = startOfDay(parseISO(log.date));
    return logDate >= startDate && logDate <= today;
  }).length;
  
  return {
    consistency: days > 0 ? Math.round((completed / days) * 100) : 0,
    completed,
    expected: days
  };
};

export const calculateOverallConsistency = (habit, logs, goals) => {
  const completed = logs.filter(log => log.habitId === habit.id && log.status === 'done').length;
  const total = logs.filter(log => log.habitId === habit.id).length;
  
  return {
    consistency: total > 0 ? Math.round((completed / total) * 100) : 0,
    completed,
    expected: total
  };
};

// Step 6: Calculate current streak (only scheduled days)
export const getCurrentStreak = (habit, logs, goals) => {
  const today = startOfDay(new Date());
  
  // Get all completed logs for this habit, sorted by date descending
  const completedLogs = logs
    .filter(log => log.habitId === habit.id && log.status === 'done')
    .sort((a, b) => b.date.localeCompare(a.date));
  
  if (completedLogs.length === 0) return 0;
  
  let streak = 0;
  let checkDate = today;
  
  // Count consecutive days from today backwards
  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    const hasLog = completedLogs.some(log => log.date === dateStr);
    
    if (hasLog) {
      streak++;
      checkDate = subDays(checkDate, 1);
    } else {
      break;
    }
  }
  
  return streak;
};

// Step 6: Calculate best streak (only scheduled days)
export const getBestStreak = (habit, logs, goals) => {
  // Get all completed logs for this habit, sorted by date
  const completedLogs = logs
    .filter(log => log.habitId === habit.id && log.status === 'done')
    .sort((a, b) => a.date.localeCompare(b.date));
  
  if (completedLogs.length === 0) return 0;
  
  let maxStreak = 0;
  let currentStreak = 0;
  let lastDate = null;
  
  for (const log of completedLogs) {
    const logDate = parseISO(log.date);
    
    if (!lastDate) {
      currentStreak = 1;
    } else {
      const daysDiff = Math.abs((logDate - lastDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
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

// Step 7: Get all metrics for habit card
export const getHabitCardMetrics = (habit, logs, goals) => {
  const thirtyDayConsistency = calculateGoalAwareConsistency(habit, logs, goals, 30);
  const overallConsistency = calculateOverallConsistency(habit, logs, goals);
  const currentStreak = getCurrentStreak(habit, logs, goals);
  const bestStreak = getBestStreak(habit, logs, goals);
  
  return {
    thirtyDayConsistency: thirtyDayConsistency.consistency,
    completed: overallConsistency.completed,
    expected: overallConsistency.expected,
    currentStreak,
    bestStreak
  };
};
