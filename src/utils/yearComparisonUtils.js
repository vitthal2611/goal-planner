export const calculateYearOverYearMetrics = (currentYearData, previousYearData) => {
  const currentGoals = currentYearData.goals || [];
  const previousGoals = previousYearData.goals || [];
  const currentHabits = currentYearData.habits || [];
  const previousHabits = previousYearData.habits || [];
  const currentLogs = currentYearData.habitLogs || [];
  const previousLogs = previousYearData.habitLogs || [];

  // Goal completion percentage
  const currentGoalCompletion = currentGoals.length > 0 
    ? (currentGoals.filter(g => g.isCompleted()).length / currentGoals.length) * 100 
    : 0;
  const previousGoalCompletion = previousGoals.length > 0 
    ? (previousGoals.filter(g => g.isCompleted()).length / previousGoals.length) * 100 
    : 0;

  // Total goals completed
  const currentGoalsCompleted = currentGoals.filter(g => g.isCompleted()).length;
  const previousGoalsCompleted = previousGoals.filter(g => g.isCompleted()).length;

  // Habit consistency
  const calculateHabitConsistency = (habits, logs) => {
    if (habits.length === 0) return 0;
    const consistencies = habits.map(habit => {
      const habitLogs = logs.filter(log => log.habitId === habit.id && log.status === 'done');
      const totalDays = 365; // Assuming full year
      return (habitLogs.length / totalDays) * 100;
    });
    return consistencies.reduce((sum, c) => sum + c, 0) / consistencies.length;
  };

  const currentHabitConsistency = calculateHabitConsistency(currentHabits, currentLogs);
  const previousHabitConsistency = calculateHabitConsistency(previousHabits, previousLogs);

  return {
    goalCompletion: {
      current: currentGoalCompletion,
      previous: previousGoalCompletion
    },
    goalsCompleted: {
      current: currentGoalsCompleted,
      previous: previousGoalsCompleted
    },
    habitConsistency: {
      current: currentHabitConsistency,
      previous: previousHabitConsistency
    }
  };
};