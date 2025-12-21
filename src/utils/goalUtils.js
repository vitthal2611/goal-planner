import { differenceInDays, differenceInCalendarQuarters, differenceInCalendarMonths, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

export const breakdownGoalTargets = (goal) => {
  const { yearlyTarget } = goal;
  const target = yearlyTarget || 0;
  
  return {
    yearly: target,
    quarterly: target / 4,
    monthly: target / 12,
    weekly: target / 52,
    daily: target / 365
  };
};

export const calculateGoalProgress = (goal, currentDate = new Date()) => {
  const { yearlyTarget = 0, actualProgress = 0, startDate, endDate } = goal;
  
  // Validate dates
  if (!startDate || !endDate) {
    return {
      yearlyProgress: 0,
      quarterlyProgress: 0,
      monthlyProgress: 0,
      onTrack: false,
      targets: breakdownGoalTargets(goal),
      actual: actualProgress,
      expected: 0,
      remaining: yearlyTarget - actualProgress,
      daysRemaining: 0,
      projectedCompletion: 0,
      progressRate: "0.00"
    };
  }
  
  const start = startOfDay(new Date(startDate));
  const end = endOfDay(new Date(endDate));
  const now = startOfDay(currentDate);
  
  // Validate parsed dates
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return {
      yearlyProgress: 0,
      quarterlyProgress: 0,
      monthlyProgress: 0,
      onTrack: false,
      targets: breakdownGoalTargets(goal),
      actual: actualProgress,
      expected: 0,
      remaining: yearlyTarget - actualProgress,
      daysRemaining: 0,
      projectedCompletion: 0,
      progressRate: "0.00"
    };
  }
  
  // Only calculate if within timeline
  const isActive = isWithinInterval(now, { start, end });
  
  const totalDays = Math.max(1, differenceInDays(end, start) + 1);
  const daysPassed = Math.max(0, Math.min(differenceInDays(now, start), totalDays));
  const daysRemaining = Math.max(0, differenceInDays(end, now));
  
  const targets = breakdownGoalTargets(goal);
  
  const yearlyProgress = yearlyTarget > 0 ? (actualProgress / yearlyTarget) * 100 : 0;
  
  const expectedProgressByNow = totalDays > 0 
    ? (yearlyTarget * daysPassed) / totalDays 
    : 0;
  
  const onTrack = actualProgress >= expectedProgressByNow;
  
  const currentQuarter = Math.max(0, Math.floor(differenceInCalendarMonths(currentDate, start) / 3));
  const quarterlyExpected = targets.quarterly * (currentQuarter + 1);
  const quarterlyProgress = quarterlyExpected > 0 ? (actualProgress / quarterlyExpected) * 100 : 0;
  
  const currentMonth = Math.max(0, differenceInCalendarMonths(currentDate, start));
  const monthlyExpected = targets.monthly * (currentMonth + 1);
  const monthlyProgress = monthlyExpected > 0 ? (actualProgress / monthlyExpected) * 100 : 0;
  
  const progressRate = daysPassed > 0 ? actualProgress / daysPassed : 0;
  const projectedTotal = progressRate * totalDays;
  const projectedCompletion = yearlyTarget > 0 ? (projectedTotal / yearlyTarget) * 100 : 0;
  
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
  
  if (!endDate || isNaN(new Date(endDate).getTime())) {
    return "0.00";
  }
  
  const remaining = yearlyTarget - actualProgress;
  const daysLeft = Math.max(1, differenceInDays(new Date(endDate), currentDate));
  
  return (remaining / daysLeft).toFixed(2);
};
