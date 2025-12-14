export const generateNextYearSuggestions = (yearData) => {
  const { goals = [], habits = [], habitLogs = [] } = yearData;
  const suggestions = [];

  // Analyze goal completion rates
  goals.forEach(goal => {
    const completionRate = (goal.actualProgress / goal.yearlyTarget) * 100;
    
    if (completionRate >= 80 && completionRate < 100) {
      suggestions.push({
        id: `goal_increase_${goal.id}`,
        type: 'increase',
        category: 'Goal Growth',
        title: 'Consider Increasing Target',
        message: `You completed ${Math.round(completionRate)}% of your "${goal.title}" goal. Consider increasing the target by 20-30% next year.`,
        actionable: true,
        goalId: goal.id,
        suggestedTarget: Math.round(goal.yearlyTarget * 1.25)
      });
    } else if (completionRate < 50) {
      suggestions.push({
        id: `goal_reduce_${goal.id}`,
        type: 'focus',
        category: 'Goal Focus',
        title: 'Consider Reducing Scope',
        message: `Your "${goal.title}" goal reached ${Math.round(completionRate)}%. Consider setting a more achievable target or breaking it into smaller goals.`,
        actionable: true,
        goalId: goal.id,
        suggestedTarget: Math.round(goal.yearlyTarget * 0.7)
      });
    }
  });

  // Analyze habit consistency
  const habitConsistencies = habits.map(habit => {
    const habitLogs = habitLogs.filter(log => log.habitId === habit.id && log.status === 'done');
    const consistency = (habitLogs.length / 365) * 100;
    return { habit, consistency };
  });

  const avgConsistency = habitConsistencies.reduce((sum, h) => sum + h.consistency, 0) / habitConsistencies.length;

  if (avgConsistency < 60) {
    suggestions.push({
      id: 'habit_focus',
      type: 'habit',
      category: 'Habit Strategy',
      title: 'Focus on Fewer Habits',
      message: `Your average habit consistency was ${Math.round(avgConsistency)}%. Consider focusing on 2-3 core habits rather than many.`,
      actionable: false
    });
  }

  // Rollover analysis
  const incompleteGoals = goals.filter(goal => !goal.isCompleted());
  if (incompleteGoals.length > 2) {
    suggestions.push({
      id: 'rollover_warning',
      type: 'focus',
      category: 'Goal Planning',
      title: 'Avoid Over-Committing',
      message: `You have ${incompleteGoals.length} incomplete goals. Consider rolling over only your top 2-3 priorities.`,
      actionable: false
    });
  }

  // Positive reinforcement
  const completedGoals = goals.filter(goal => goal.isCompleted());
  if (completedGoals.length > 0) {
    suggestions.push({
      id: 'celebration',
      type: 'increase',
      category: 'Motivation',
      title: 'Build on Success',
      message: `Great job completing ${completedGoals.length} goal${completedGoals.length > 1 ? 's' : ''}! You're ready for bigger challenges next year.`,
      actionable: false
    });
  }

  return suggestions;
};