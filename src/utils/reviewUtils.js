import { startOfWeek, startOfMonth, startOfQuarter, endOfWeek, endOfMonth, endOfQuarter } from 'date-fns';
import { calculateGoalProgress } from './goalUtils';
import { calculateHabitConsistency } from './habitUtils';

export const generateReview = (type, goals, habits, logs, date = new Date()) => {
  const { startDate, endDate } = getReviewPeriod(type, date);
  
  const goalProgress = {};
  goals.forEach(goal => {
    const progress = calculateGoalProgress(goal, endDate);
    goalProgress[goal.id] = {
      percentage: progress.yearlyProgress,
      actual: progress.actual,
      expected: progress.expected,
      onTrack: progress.onTrack
    };
  });
  
  const habitStreaks = {};
  habits.forEach(habit => {
    const consistency = calculateHabitConsistency(habit, logs, 30);
    habitStreaks[habit.id] = {
      currentStreak: consistency.currentStreak,
      longestStreak: consistency.longestStreak,
      consistency: consistency.consistency
    };
  });
  
  const insights = generateInsights(goals, habits, logs, goalProgress, habitStreaks);
  
  return {
    type,
    date: endDate,
    goalProgress,
    habitStreaks,
    insights,
    summary: generateSummary(goalProgress, habitStreaks)
  };
};

const getReviewPeriod = (type, date) => {
  switch (type) {
    case 'daily':
      return { startDate: date, endDate: date };
    case 'weekly':
      return { startDate: startOfWeek(date), endDate: endOfWeek(date) };
    case 'monthly':
      return { startDate: startOfMonth(date), endDate: endOfMonth(date) };
    case 'quarterly':
      return { startDate: startOfQuarter(date), endDate: endOfQuarter(date) };
    default:
      return { startDate: date, endDate: date };
  }
};

const generateInsights = (goals, habits, logs, goalProgress, habitStreaks) => {
  const insights = [];
  
  const onTrackGoals = Object.values(goalProgress).filter(g => g.onTrack).length;
  const totalGoals = goals.length;
  
  if (onTrackGoals === totalGoals && totalGoals > 0) {
    insights.push({
      type: 'positive',
      message: 'All goals are on track! Keep up the excellent work.'
    });
  } else if (onTrackGoals < totalGoals / 2) {
    insights.push({
      type: 'warning',
      message: 'More than half of your goals are behind schedule. Consider reviewing your habits.'
    });
  }
  
  const excellentHabits = Object.values(habitStreaks).filter(h => h.consistency >= 90).length;
  if (excellentHabits > 0) {
    insights.push({
      type: 'positive',
      message: `${excellentHabits} habit${excellentHabits > 1 ? 's' : ''} with 90%+ consistency!`
    });
  }
  
  const strugglingHabits = Object.values(habitStreaks).filter(h => h.consistency < 50).length;
  if (strugglingHabits > 0) {
    insights.push({
      type: 'action',
      message: `${strugglingHabits} habit${strugglingHabits > 1 ? 's need' : ' needs'} attention. Review triggers and timing.`
    });
  }
  
  return insights;
};

const generateSummary = (goalProgress, habitStreaks) => {
  const avgGoalProgress = Object.values(goalProgress).length > 0
    ? Object.values(goalProgress).reduce((sum, g) => sum + g.percentage, 0) / Object.values(goalProgress).length
    : 0;
  
  const avgHabitConsistency = Object.values(habitStreaks).length > 0
    ? Object.values(habitStreaks).reduce((sum, h) => sum + h.consistency, 0) / Object.values(habitStreaks).length
    : 0;
  
  return {
    avgGoalProgress: Math.round(avgGoalProgress),
    avgHabitConsistency: Math.round(avgHabitConsistency),
    totalGoals: Object.keys(goalProgress).length,
    totalHabits: Object.keys(habitStreaks).length
  };
};
