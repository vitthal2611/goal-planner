// Date utilities for consistent Firebase persistence and retrieval

export const toFirebaseDate = (date) => {
  if (!date) return null;
  if (typeof date === 'string') return date;
  if (date instanceof Date) return date.toISOString();
  return new Date(date).toISOString();
};

export const fromFirebaseDate = (dateString) => {
  if (!dateString) return null;
  if (dateString instanceof Date) return dateString;
  return new Date(dateString);
};

export const formatDateForInput = (date) => {
  if (!date) return '';
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toISOString().split('T')[0];
};

export const ensureGoalDates = (goal) => ({
  ...goal,
  startDate: toFirebaseDate(goal.startDate),
  endDate: toFirebaseDate(goal.endDate),
  createdAt: toFirebaseDate(goal.createdAt || new Date())
});

export const parseGoalDates = (goal) => ({
  ...goal,
  startDate: fromFirebaseDate(goal.startDate),
  endDate: fromFirebaseDate(goal.endDate),
  createdAt: fromFirebaseDate(goal.createdAt)
});