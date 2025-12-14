import { Goal } from '../models/Goal';

export const categorizeGoalsForRollover = (goals) => {
  const completed = goals.filter(goal => goal.isCompleted());
  const incomplete = goals.filter(goal => !goal.isCompleted());
  
  return { completed, incomplete };
};

export const createRolledOverGoal = (originalGoal, newYear) => {
  const startDate = new Date(newYear, 0, 1);
  const endDate = new Date(newYear, 11, 31);
  
  return new Goal({
    id: `${originalGoal.id}_rollover_${newYear}`,
    title: originalGoal.title,
    yearlyTarget: originalGoal.yearlyTarget,
    actualProgress: 0,
    unit: originalGoal.unit,
    startDate,
    endDate,
    year: newYear,
    isRollover: true,
    originalGoalId: originalGoal.id,
    createdAt: new Date()
  });
};

export const processGoalRollover = (selectedGoals, newYear) => {
  return selectedGoals.map(goal => createRolledOverGoal(goal, newYear));
};