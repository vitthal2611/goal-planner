import { isAfter, isBefore, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

/**
 * Goal Timeline Rules
 */

// Check if a date is within goal timeline
export const isDateInGoalTimeline = (date, goal) => {
  const checkDate = startOfDay(new Date(date));
  const start = startOfDay(new Date(goal.startDate));
  const end = endOfDay(new Date(goal.endDate));
  
  return isWithinInterval(checkDate, { start, end });
};

// Get goal status based on dates
export const getGoalTimelineStatus = (goal, currentDate = new Date()) => {
  const now = startOfDay(currentDate);
  const start = startOfDay(new Date(goal.startDate));
  const end = endOfDay(new Date(goal.endDate));
  
  if (isBefore(now, start)) return 'upcoming';
  if (isAfter(now, end)) return 'ended';
  if (goal.actualProgress >= goal.yearlyTarget) return 'completed';
  return 'active';
};

// Check if goal is currently active
export const isGoalActive = (goal, currentDate = new Date()) => {
  const status = getGoalTimelineStatus(goal, currentDate);
  return status === 'active' || status === 'completed';
};

// Get default dates for new goal
export const getDefaultGoalDates = (year) => {
  const today = new Date();
  const startDate = today;
  const endDate = new Date(year, 11, 31, 23, 59, 59);
  
  return { startDate, endDate };
};
