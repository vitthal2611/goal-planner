import { isHabitScheduledForDate } from './frequencyRules';

/**
 * Handle frequency change mid-year
 * Only affects future logs, past logs remain unchanged
 */
export const handleFrequencyChange = (habit, newFrequency, newConfig) => {
  return {
    ...habit,
    frequency: newFrequency,
    frequencyConfig: newConfig,
    frequencyChangedAt: new Date().toISOString()
  };
};

/**
 * Check if habit is future-dated
 */
export const isFutureHabit = (habit) => {
  const habitStart = new Date(habit.createdAt);
  const today = new Date();
  return habitStart > today;
};

/**
 * Safe date boundary check (handles timezone)
 */
export const isScheduledToday = (habit) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return isHabitScheduledForDate(habit, today);
};
