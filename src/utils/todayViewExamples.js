// Today view filtering examples

export const todayViewExamples = {
  // Scenario 1: Active goal (Jan 1 - Dec 31), today is June 15
  activeGoal: {
    goal: {
      id: 'goal-1',
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2024, 11, 31)
    },
    habit: {
      id: 'habit-1',
      name: 'Read 30 minutes',
      goalIds: ['goal-1']
    },
    today: new Date(2024, 5, 15),
    expected: 'SHOW' // Goal is active
  },
  
  // Scenario 2: Upcoming goal (starts Dec 1), today is Nov 15
  upcomingGoal: {
    goal: {
      id: 'goal-2',
      startDate: new Date(2024, 11, 1),
      endDate: new Date(2024, 11, 31)
    },
    habit: {
      id: 'habit-2',
      name: 'Exercise',
      goalIds: ['goal-2']
    },
    today: new Date(2024, 10, 15),
    expected: 'HIDE' // Goal hasn\'t started yet
  },
  
  // Scenario 3: Ended goal (Jan 1 - Mar 31), today is June 15
  endedGoal: {
    goal: {
      id: 'goal-3',
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2024, 2, 31)
    },
    habit: {
      id: 'habit-3',
      name: 'Learn vocabulary',
      goalIds: ['goal-3']
    },
    today: new Date(2024, 5, 15),
    expected: 'HIDE' // Goal has ended
  },
  
  // Scenario 4: Habit with no goal
  noGoal: {
    habit: {
      id: 'habit-4',
      name: 'Meditation',
      goalIds: []
    },
    today: new Date(2024, 5, 15),
    expected: 'SHOW' // Always show if no goal linked
  }
};
