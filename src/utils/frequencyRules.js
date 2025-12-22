import { FREQUENCY_TYPES } from './frequencyConstants';
import { getDay, eachDayOfInterval } from 'date-fns';

/**
 * Check if a habit is scheduled for a specific date
 */
export const isHabitScheduledForDate = (habit, date, goals = []) => {
  if (!habit.isActive) return false;

  const checkDate = new Date(date);
  
  // Check if date is after habit creation date
  if (habit.createdAt) {
    const createdDate = new Date(habit.createdAt);
    if (checkDate < createdDate) return false;
  }
  
  // Check linked goals' end dates
  if (habit.goalIds && habit.goalIds.length > 0 && goals.length > 0) {
    const linkedGoals = goals.filter(g => habit.goalIds.includes(g.id));
    if (linkedGoals.length > 0) {
      // If any linked goal has ended, don't show the habit
      const hasActiveGoal = linkedGoals.some(goal => {
        if (!goal.endDate) return true; // No end date means always active
        const goalEndDate = new Date(goal.endDate);
        return checkDate <= goalEndDate;
      });
      if (!hasActiveGoal) return false;
    }
  }

  const { frequency, frequencyConfig = {} } = habit;

  switch (frequency) {
    case FREQUENCY_TYPES.DAILY:
      return true;

    case FREQUENCY_TYPES.WEEKLY:
      // Always scheduled, but completion tracked per week
      return true;

    case FREQUENCY_TYPES.SPECIFIC_DAYS: {
      const dayOfWeek = getDay(date);
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Mon=0, Sun=6
      return (frequencyConfig.days || []).includes(adjustedDay);
    }

    case FREQUENCY_TYPES.MONTHLY:
      // Always scheduled, but completion tracked per month
      return true;

    case FREQUENCY_TYPES.MONTHLY_DATES: {
      const dayOfMonth = date.getDate();
      return (frequencyConfig.dates || []).includes(dayOfMonth);
    }

    default:
      return true;
  }
};

/**
 * Get expected completions for a date range
 */
export const getExpectedCompletions = (habit, startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  
  // Ensure dates are valid Date objects
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);
  
  // Check for invalid dates or invalid interval
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 0;
  
  const { frequency, frequencyConfig = {} } = habit;
  const days = eachDayOfInterval({ start, end });

  switch (frequency) {
    case FREQUENCY_TYPES.DAILY:
      return days.length;

    case FREQUENCY_TYPES.WEEKLY: {
      const weeks = Math.ceil(days.length / 7);
      return weeks * (frequencyConfig.daysPerWeek || 1);
    }

    case FREQUENCY_TYPES.SPECIFIC_DAYS:
      return days.filter(day => isHabitScheduledForDate(habit, day)).length;

    case FREQUENCY_TYPES.MONTHLY: {
      const months = new Set(days.map(d => `${d.getFullYear()}-${d.getMonth()}`)).size;
      return months * (frequencyConfig.timesPerMonth || 1);
    }

    case FREQUENCY_TYPES.MONTHLY_DATES:
      return days.filter(day => isHabitScheduledForDate(habit, day)).length;

    default:
      return days.length;
  }
};

/**
 * Check if a date should count as "missed" (scheduled but not completed)
 */
export const shouldCountAsMissed = (habit, date, logs) => {
  if (!isHabitScheduledForDate(habit, date)) return false;
  
  const dateStr = date.toISOString().split('T')[0];
  const log = logs.find(l => l.habitId === habit.id && l.date === dateStr);
  
  return !log || log.status !== 'done';
};

/**
 * Get human-readable frequency label
 */
export const getFrequencyLabel = (habit) => {
  const { frequency, frequencyConfig = {} } = habit;
  
  switch (frequency) {
    case FREQUENCY_TYPES.DAILY:
      return 'Daily';
    
    case FREQUENCY_TYPES.WEEKLY:
      return `${frequencyConfig.daysPerWeek || 1}× per week`;
    
    case FREQUENCY_TYPES.SPECIFIC_DAYS: {
      const days = frequencyConfig.days || [];
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return days.map(d => dayNames[d]).join(', ');
    }
    
    case FREQUENCY_TYPES.MONTHLY:
      return `${frequencyConfig.timesPerMonth || 1}× per month`;
    
    case FREQUENCY_TYPES.MONTHLY_DATES: {
      const dates = frequencyConfig.dates || [];
      return dates.join(', ') + (dates.length === 1 ? 'st' : 'th');
    }
    
    default:
      return 'Daily';
  }
};
