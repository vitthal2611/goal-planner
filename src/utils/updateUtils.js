import { calculateGoalProgress } from './goalUtils';
import { calculateHabitConsistency } from './habitUtils';

/**
 * Centralized update utilities for all models
 * Ensures immutable updates and automatic recalculations
 */

// ============================================
// GOAL UPDATES
// ============================================

export const updateGoal = (goal, updates) => {
  const updated = { ...goal, ...updates };
  
  // Recalculate derived fields
  if (updates.startDate || updates.endDate) {
    updated.year = new Date(updated.startDate).getFullYear();
  }
  
  // Validate
  if (updated.startDate >= updated.endDate) {
    throw new Error('Start date must be before end date');
  }
  
  if (updated.yearlyTarget <= 0) {
    throw new Error('Yearly target must be positive');
  }
  
  if (updated.actualProgress > updated.yearlyTarget) {
    updated.actualProgress = updated.yearlyTarget;
  }
  
  return updated;
};

export const updateGoalProgress = (goal, newProgress) => {
  return {
    ...goal,
    actualProgress: Math.max(0, Math.min(newProgress, goal.yearlyTarget))
  };
};

export const updateGoalMonthlyData = (goal, monthKey, value) => {
  const updatedMonthlyData = {
    ...goal.monthlyData,
    [monthKey]: parseFloat(value) || 0
  };
  
  const totalProgress = Object.values(updatedMonthlyData)
    .reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  
  return {
    ...goal,
    monthlyData: updatedMonthlyData,
    actualProgress: Math.min(totalProgress, goal.yearlyTarget)
  };
};

// ============================================
// HABIT UPDATES
// ============================================

export const updateHabit = (habit, updates) => {
  const updated = { ...habit, ...updates };
  
  // Validate
  if (updated.name?.trim().length === 0) {
    throw new Error('Habit name cannot be empty');
  }
  
  if (updated.goalIds?.length === 0) {
    throw new Error('Habit must be linked to at least one goal');
  }
  
  if (updated.frequency && !['daily', 'weekly', 'monthly', 'custom'].includes(updated.frequency)) {
    throw new Error('Invalid frequency');
  }
  
  return updated;
};

export const updateHabitGoalLink = (habit, goalId, action = 'add') => {
  const goalIds = [...habit.goalIds];
  
  if (action === 'add' && !goalIds.includes(goalId)) {
    goalIds.push(goalId);
  } else if (action === 'remove') {
    const index = goalIds.indexOf(goalId);
    if (index > -1) goalIds.splice(index, 1);
  }
  
  if (goalIds.length === 0) {
    throw new Error('Habit must be linked to at least one goal');
  }
  
  return { ...habit, goalIds };
};

export const updateHabitFrequency = (habit, frequency, frequencyConfig = {}) => {
  return {
    ...habit,
    frequency,
    frequencyConfig
  };
};

// ============================================
// DAILY LOG UPDATES
// ============================================

export const updateDailyLog = (log, updates) => {
  const updated = {
    ...log,
    ...updates,
    loggedAt: new Date().toISOString()
  };
  
  // Validate
  if (updated.status && !['done', 'skipped'].includes(updated.status)) {
    throw new Error('Invalid status');
  }
  
  return updated;
};

export const toggleLogStatus = (log) => {
  return updateDailyLog(log, {
    status: log.status === 'done' ? 'skipped' : 'done'
  });
};

// ============================================
// BATCH UPDATES
// ============================================

export const updateMultipleGoals = (goals, goalId, updates) => {
  return goals.map(g => g.id === goalId ? updateGoal(g, updates) : g);
};

export const updateMultipleHabits = (habits, habitId, updates) => {
  return habits.map(h => h.id === habitId ? updateHabit(h, updates) : h);
};

export const updateMultipleLogs = (logs, logId, updates) => {
  return logs.map(l => l.id === logId ? updateDailyLog(l, updates) : l);
};

// ============================================
// VALIDATION HELPERS
// ============================================

export const validateGoalEdit = (goal, updates) => {
  const errors = [];
  
  if (updates.startDate && updates.endDate && updates.startDate >= updates.endDate) {
    errors.push('Start date must be before end date');
  }
  
  if (updates.yearlyTarget !== undefined && updates.yearlyTarget <= 0) {
    errors.push('Yearly target must be positive');
  }
  
  if (updates.actualProgress !== undefined && updates.actualProgress < 0) {
    errors.push('Progress cannot be negative');
  }
  
  return errors;
};

export const validateHabitEdit = (habit, updates) => {
  const errors = [];
  
  if (updates.name !== undefined && updates.name.trim().length === 0) {
    errors.push('Habit name cannot be empty');
  }
  
  if (updates.goalIds !== undefined && updates.goalIds.length === 0) {
    errors.push('Habit must be linked to at least one goal');
  }
  
  return errors;
};

// ============================================
// IMPACT ANALYSIS
// ============================================

export const analyzeGoalEditImpact = (goal, updates, habits) => {
  const impact = {
    affectsProgress: false,
    affectsTimeline: false,
    affectedHabits: [],
    warnings: []
  };
  
  if (updates.startDate || updates.endDate) {
    impact.affectsTimeline = true;
    impact.affectedHabits = habits.filter(h => h.goalIds.includes(goal.id));
    impact.warnings.push('Timeline change will recalculate progress percentages');
  }
  
  if (updates.yearlyTarget && updates.yearlyTarget < goal.actualProgress) {
    impact.warnings.push('New target is less than current progress');
  }
  
  if (updates.actualProgress !== undefined) {
    impact.affectsProgress = true;
  }
  
  return impact;
};

export const analyzeHabitEditImpact = (habit, updates, logs) => {
  const impact = {
    affectsConsistency: false,
    affectsLogs: false,
    warnings: []
  };
  
  if (updates.frequency) {
    impact.affectsConsistency = true;
    impact.affectsLogs = true;
    impact.warnings.push('Frequency change affects future logs and consistency calculation');
  }
  
  if (updates.goalIds && JSON.stringify(updates.goalIds) !== JSON.stringify(habit.goalIds)) {
    impact.warnings.push('Changing linked goals may affect tracking');
  }
  
  return impact;
};
