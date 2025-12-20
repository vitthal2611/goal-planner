import { parseISO, startOfDay, eachDayOfInterval, min as minDate, max as maxDate, subDays } from 'date-fns';
import { getExpectedCompletions, isHabitScheduledForDate } from './frequencyRules';

// Step 2: Get habit date range from linked goal
export const getHabitDateRange = (habit, goals) => {
  if (!habit.goalIds || habit.goalIds.length === 0) return null;
  
  const linkedGoal = goals.find(g => habit.goalIds.includes(g.id));
  if (!linkedGoal) return null;
  
  return {
    startDate: startOfDay(typeof linkedGoal.startDate === 'string' ? parseISO(linkedGoal.startDate) : new Date(linkedGoal.startDate)),
    endDate: startOfDay(typeof linkedGoal.endDate === 'string' ? parseISO(linkedGoal.endDate) : new Date(linkedGoal.endDate))
  };
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
  const dateRange = getHabitDateRange(habit, goals);
  if (!dateRange) return { consistency: 0, completed: 0, expected: 0 };
  
  const today = startOfDay(new Date());
  const effectiveEndDate = minDate([today, dateRange.endDate]);
  const effectiveStartDate = maxDate([
    dateRange.startDate,
    subDays(effectiveEndDate, days - 1)
  ]);
  
  const expected = getExpectedHabitOccurrences(habit, effectiveStartDate, effectiveEndDate);
  const completed = getCompletedHabitCount(habit.id, logs, effectiveStartDate, effectiveEndDate);
  
  return {
    consistency: expected > 0 ? Math.round((completed / expected) * 100) : 0,
    completed,
    expected
  };
};

export const calculateOverallConsistency = (habit, logs, goals) => {
  const dateRange = getHabitDateRange(habit, goals);
  if (!dateRange) return { consistency: 0, completed: 0, expected: 0 };
  
  const today = startOfDay(new Date());
  const effectiveEndDate = minDate([today, dateRange.endDate]);
  
  const expected = getExpectedHabitOccurrences(habit, dateRange.startDate, effectiveEndDate);
  const completed = getCompletedHabitCount(habit.id, logs, dateRange.startDate, effectiveEndDate);
  
  return {
    consistency: expected > 0 ? Math.round((completed / expected) * 100) : 0,
    completed,
    expected
  };
};

// Step 6: Calculate current streak (only scheduled days)
export const getCurrentStreak = (habit, logs, goals) => {
  const dateRange = getHabitDateRange(habit, goals);
  if (!dateRange) return 0;
  
  const today = startOfDay(new Date());
  const effectiveEndDate = minDate([today, dateRange.endDate]);
  
  let streak = 0;
  let checkDate = effectiveEndDate;
  
  while (checkDate >= dateRange.startDate) {
    if (!isHabitScheduledForDate(habit, checkDate)) {
      checkDate = subDays(checkDate, 1);
      continue;
    }
    
    const dateStr = checkDate.toISOString().split('T')[0];
    const log = logs.find(l => l.habitId === habit.id && l.date === dateStr && l.status === 'done');
    
    if (log) {
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
  const dateRange = getHabitDateRange(habit, goals);
  if (!dateRange) return 0;
  
  const today = startOfDay(new Date());
  const effectiveEndDate = minDate([today, dateRange.endDate]);
  
  // Validate dates before calling eachDayOfInterval
  if (isNaN(dateRange.startDate.getTime()) || isNaN(effectiveEndDate.getTime()) || dateRange.startDate > effectiveEndDate) {
    return 0;
  }
  
  const scheduledDays = eachDayOfInterval({ 
    start: dateRange.startDate, 
    end: effectiveEndDate 
  }).filter(day => isHabitScheduledForDate(habit, day));
  
  let maxStreak = 0;
  let currentStreak = 0;
  
  for (const day of scheduledDays) {
    const dateStr = day.toISOString().split('T')[0];
    const log = logs.find(l => l.habitId === habit.id && l.date === dateStr && l.status === 'done');
    
    if (log) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  
  return maxStreak;
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
