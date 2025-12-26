import { format, differenceInDays, startOfYear, endOfYear } from 'date-fns';

// Goal Level Metrics
export const calculateGoalMetrics = (goal, currentDate = new Date()) => {
  const startDate = new Date(goal.startDate || startOfYear(currentDate));
  const endDate = new Date(goal.endDate || endOfYear(currentDate));
  const totalDays = differenceInDays(endDate, startDate) + 1;
  const daysPassed = Math.max(0, differenceInDays(currentDate, startDate) + 1);
  const daysRemaining = Math.max(0, differenceInDays(endDate, currentDate));
  
  const completionRate = goal.yearlyTarget > 0 ? (goal.actualProgress / goal.yearlyTarget) * 100 : 0;
  const expectedProgress = (daysPassed / totalDays) * goal.yearlyTarget;
  const onTrack = goal.actualProgress >= expectedProgress;
  const requiredDailyRate = daysRemaining > 0 ? (goal.yearlyTarget - goal.actualProgress) / daysRemaining : 0;
  const projectedCompletion = daysPassed > 0 ? (goal.actualProgress / daysPassed) * totalDays : 0;
  
  return {
    completionRate: Math.round(completionRate),
    onTrack,
    daysRemaining,
    requiredDailyRate: Math.round(requiredDailyRate * 100) / 100,
    projectedCompletion: Math.round(projectedCompletion),
    expectedProgress: Math.round(expectedProgress),
    status: completionRate >= 100 ? 'completed' : onTrack ? 'on-track' : 'behind'
  };
};

// Habit Level Metrics
export const calculateHabitMetrics = (habit, logs, goals = []) => {
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today to include today
  
  // Get start date from linked goals
  let startDate = new Date(habit.createdAt || today);
  if (habit.goalIds && habit.goalIds.length > 0) {
    const linkedGoals = goals.filter(g => habit.goalIds.includes(g.id));
    if (linkedGoals.length > 0) {
      const earliestGoalStart = linkedGoals.reduce((earliest, goal) => {
        const goalStart = new Date(goal.startDate || today);
        return goalStart < earliest ? goalStart : earliest;
      }, new Date());
      startDate = earliestGoalStart;
    }
  }
  startDate.setHours(0, 0, 0, 0); // Start of start date
  
  const habitLogs = logs.filter(log => log.habitId === habit.id);
  const recentLogs = habitLogs.filter(log => {
    const logDate = new Date(log.date + 'T00:00:00'); // Ensure proper date parsing
    return logDate >= startDate && logDate <= today;
  });
  
  const completed = recentLogs.filter(log => log.status === 'done').length;
  const skipped = recentLogs.filter(log => log.status === 'skipped').length;
  
  const daysPassed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
  
  const completionRate = daysPassed > 0 ? Math.round((completed / daysPassed) * 100) : 0;
  const currentStreak = calculateCurrentStreak(habit, logs);
  const longestStreak = calculateLongestStreak(habit, logs);
  
  return {
    completionRate,
    completed,
    skipped,
    scheduled: daysPassed,
    currentStreak,
    longestStreak,
    consistency: completionRate >= 80 ? 'excellent' : completionRate >= 60 ? 'good' : completionRate >= 40 ? 'fair' : 'poor'
  };
};

export const calculateCurrentStreak = (habit, logs) => {
  const habitLogs = logs.filter(log => log.habitId === habit.id && log.status === 'done')
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  
  if (habitLogs.length === 0) return 0;
  
  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < habitLogs.length; i++) {
    const logDate = new Date(habitLogs[i].date);
    const expectedDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    
    if (format(logDate, 'yyyy-MM-dd') === format(expectedDate, 'yyyy-MM-dd')) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

export const calculateLongestStreak = (habit, logs) => {
  const habitLogs = logs.filter(log => log.habitId === habit.id && log.status === 'done')
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  
  if (habitLogs.length === 0) return 0;
  
  let maxStreak = 1;
  let currentStreak = 1;
  
  for (let i = 1; i < habitLogs.length; i++) {
    const prevDate = new Date(habitLogs[i - 1].date);
    const currDate = new Date(habitLogs[i].date);
    const dayDiff = differenceInDays(currDate, prevDate);
    
    if (dayDiff === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  
  return maxStreak;
};