import { differenceInDays, differenceInCalendarQuarters, differenceInCalendarMonths } from 'date-fns';

export const breakdownGoalTargets = (goal) => {
  const { yearlyTarget, startDate, endDate } = goal;
  
  const quarterlyTarget = yearlyTarget / 4;
  const monthlyTarget = yearlyTarget / 12;
  const weeklyTarget = yearlyTarget / 52;
  const dailyTarget = yearlyTarget / 365;
  
  return {
    yearly: yearlyTarget,
    quarterly: quarterlyTarget,
    monthly: monthlyTarget,
    weekly: weeklyTarget,
    daily: dailyTarget
  };
};

export const calculateGoalProgress = (goal, currentDate = new Date()) => {
  const { yearlyTarget, actualProgress, startDate, endDate } = goal;
  
  const totalDays = differenceInDays(endDate, startDate);
  const daysPassed = Math.max(0, differenceInDays(currentDate, startDate));
  const daysRemaining = Math.max(0, differenceInDays(endDate, currentDate));
  
  const targets = breakdownGoalTargets(goal);
  
  const yearlyProgress = (actualProgress / yearlyTarget) * 100;
  
  const expectedProgressByNow = totalDays > 0 
    ? (yearlyTarget * daysPassed) / totalDays 
    : 0;
  
  const onTrack = actualProgress >= expectedProgressByNow;
  
  const currentQuarter = Math.floor(differenceInCalendarMonths(currentDate, startDate) / 3);
  const quarterlyExpected = targets.quarterly * (currentQuarter + 1);
  const quarterlyProgress = (actualProgress / quarterlyExpected) * 100;
  
  const currentMonth = differenceInCalendarMonths(currentDate, startDate);
  const monthlyExpected = targets.monthly * (currentMonth + 1);
  const monthlyProgress = (actualProgress / monthlyExpected) * 100;
  
  const progressRate = daysPassed > 0 ? actualProgress / daysPassed : 0;
  const projectedTotal = progressRate * totalDays;
  const projectedCompletion = (projectedTotal / yearlyTarget) * 100;
  
  return {
    yearlyProgress: Math.min(yearlyProgress, 100),
    quarterlyProgress: Math.min(quarterlyProgress, 100),
    monthlyProgress: Math.min(monthlyProgress, 100),
    onTrack,
    targets,
    actual: actualProgress,
    expected: Math.round(expectedProgressByNow),
    remaining: yearlyTarget - actualProgress,
    daysRemaining,
    projectedCompletion: Math.round(projectedCompletion),
    progressRate: progressRate.toFixed(2)
  };
};

export const getGoalStatus = (goal) => {
  const progress = calculateGoalProgress(goal);
  
  if (progress.yearlyProgress >= 100) return 'completed';
  if (progress.onTrack) return 'on-track';
  if (progress.yearlyProgress >= 50) return 'behind';
  return 'critical';
};

export const calculateRequiredDailyRate = (goal, currentDate = new Date()) => {
  const { yearlyTarget, actualProgress, endDate } = goal;
  const remaining = yearlyTarget - actualProgress;
  const daysLeft = Math.max(1, differenceInDays(endDate, currentDate));
  
  return (remaining / daysLeft).toFixed(2);
};
