// Example goal objects with timeline

export const goalTimelineExamples = {
  // Full year goal (Jan 1 - Dec 31)
  fullYear: {
    id: 'goal-1',
    title: 'Read 24 books',
    yearlyTarget: 24,
    actualProgress: 8,
    unit: 'books',
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 11, 31),
    year: 2024,
    status: 'active'
  },
  
  // Mid-year goal (started June 1)
  midYear: {
    id: 'goal-2',
    title: 'Exercise 100 times',
    yearlyTarget: 100,
    actualProgress: 30,
    unit: 'sessions',
    startDate: new Date(2024, 5, 1),
    endDate: new Date(2024, 11, 31),
    year: 2024,
    status: 'active'
  },
  
  // Future goal (starts next month)
  upcoming: {
    id: 'goal-3',
    title: 'Learn 500 words',
    yearlyTarget: 500,
    actualProgress: 0,
    unit: 'words',
    startDate: new Date(2024, 11, 1),
    endDate: new Date(2024, 11, 31),
    year: 2024,
    status: 'upcoming'
  },
  
  // Ended goal
  ended: {
    id: 'goal-4',
    title: 'Q1 Savings',
    yearlyTarget: 5000,
    actualProgress: 4800,
    unit: 'dollars',
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 2, 31),
    year: 2024,
    status: 'ended'
  },
  
  // Completed goal
  completed: {
    id: 'goal-5',
    title: 'Complete course',
    yearlyTarget: 10,
    actualProgress: 10,
    unit: 'modules',
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 11, 31),
    year: 2024,
    status: 'completed'
  }
};
