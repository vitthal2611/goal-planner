import { generateId } from '../utils/calculations';

const currentYear = new Date().getFullYear();

export const sampleGoals = [
  {
    id: 'goal-1',
    title: 'Read 24 books',
    yearlyTarget: 24,
    actualProgress: 8,
    unit: 'books',
    year: 2025,
    startDate: '2025-01-01T00:00:00.000Z',
    endDate: '2025-12-31T23:59:59.999Z',
    createdAt: '2025-01-01T00:00:00.000Z',
    monthlyTargets: {
      '2025-01': 2, '2025-02': 2, '2025-03': 2, '2025-04': 2,
      '2025-05': 2, '2025-06': 2, '2025-07': 2, '2025-08': 2,
      '2025-09': 2, '2025-10': 2, '2025-11': 2, '2025-12': 2
    },
    monthlyData: {
      '2025-01': 1, '2025-02': 2, '2025-03': 1, '2025-04': 0,
      '2025-05': 0, '2025-06': 0, '2025-07': 0, '2025-08': 0,
      '2025-09': 0, '2025-10': 0, '2025-11': 0, '2025-12': 0
    }
  },
  {
    id: 'goal-2',
    title: 'Exercise 200 hours',
    yearlyTarget: 200,
    actualProgress: 45,
    unit: 'hours',
    year: 2025,
    startDate: '2025-01-01T00:00:00.000Z',
    endDate: '2025-12-31T23:59:59.999Z',
    createdAt: '2025-01-01T00:00:00.000Z',
    monthlyTargets: {
      '2025-01': 17, '2025-02': 17, '2025-03': 17, '2025-04': 17,
      '2025-05': 17, '2025-06': 17, '2025-07': 17, '2025-08': 17,
      '2025-09': 17, '2025-10': 17, '2025-11': 17, '2025-12': 15
    },
    monthlyData: {
      '2025-01': 20, '2025-02': 15, '2025-03': 10, '2025-04': 0,
      '2025-05': 0, '2025-06': 0, '2025-07': 0, '2025-08': 0,
      '2025-09': 0, '2025-10': 0, '2025-11': 0, '2025-12': 0
    }
  },
  {
    id: 'goal-3',
    title: 'Save $12,000',
    yearlyTarget: 12000,
    actualProgress: 3500,
    unit: 'dollars',
    year: 2025,
    startDate: '2025-01-01T00:00:00.000Z',
    endDate: '2025-12-31T23:59:59.999Z',
    createdAt: '2025-01-01T00:00:00.000Z',
    monthlyTargets: {
      '2025-01': 1000, '2025-02': 1000, '2025-03': 1000, '2025-04': 1000,
      '2025-05': 1000, '2025-06': 1000, '2025-07': 1000, '2025-08': 1000,
      '2025-09': 1000, '2025-10': 1000, '2025-11': 1000, '2025-12': 1000
    },
    monthlyData: {
      '2025-01': 1200, '2025-02': 800, '2025-03': 1500, '2025-04': 0,
      '2025-05': 0, '2025-06': 0, '2025-07': 0, '2025-08': 0,
      '2025-09': 0, '2025-10': 0, '2025-11': 0, '2025-12': 0
    }
  }
];

export const sampleHabits = [
  {
    id: 'habit-1',
    name: 'Read for 30 minutes',
    goalIds: ['goal-1'],
    trigger: 'After morning tea',
    time: '07:15',
    location: 'Living room',
    frequency: 'daily',
    isActive: true,
    startYear: 2025,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'habit-2',
    name: 'Morning workout',
    goalIds: ['goal-2'],
    trigger: 'After waking up',
    time: '06:00',
    location: 'Home gym',
    frequency: 'daily',
    isActive: true,
    startYear: 2025,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'habit-3',
    name: 'Evening walk',
    goalIds: ['goal-2'],
    trigger: 'After dinner',
    time: '19:00',
    location: 'Park',
    frequency: 'daily',
    isActive: true,
    startYear: 2025,
    createdAt: '2025-01-15T00:00:00.000Z'
  },
  {
    id: 'habit-4',
    name: 'Track expenses',
    goalIds: ['goal-3'],
    trigger: 'Before bed',
    time: '21:00',
    location: 'Bedroom',
    frequency: 'daily',
    isActive: true,
    startYear: 2025,
    createdAt: '2025-01-01T00:00:00.000Z'
  }
];

export const generateSampleLogs = (habits, daysBack = 30) => {
  const logs = [];
  const today = new Date();
  
  habits.forEach(habit => {
    for (let i = 0; i < daysBack; i++) {
      const logDate = new Date(today);
      logDate.setDate(logDate.getDate() - i);
      
      const random = Math.random();
      let status;
      
      if (random > 0.85) {
        status = 'skipped';
      } else if (random > 0.15) {
        status = 'done';
      } else {
        continue;
      }
      
      logs.push({
        id: generateId(),
        habitId: habit.id,
        date: logDate.toISOString().split('T')[0],
        status,
        notes: '',
        loggedAt: logDate.toISOString()
      });
    }
  });
  
  return logs;
};

export const sampleReviews = [
  {
    id: 'review-1',
    type: 'weekly',
    date: new Date('2024-03-10'),
    goalProgress: {
      'goal-1': 35,
      'goal-2': 28,
      'goal-3': 42,
      'goal-4': 30
    },
    habitStreaks: {
      'habit-1': 7,
      'habit-2': 5,
      'habit-3': 6,
      'habit-4': 7,
      'habit-5': 4
    },
    reflections: 'Good week overall. Reading habit is strong, need to focus more on exercise.',
    insights: [
      'Reading goal ahead of schedule',
      'Exercise consistency needs improvement',
      'Vocabulary learning on track'
    ],
    createdAt: new Date('2024-03-10')
  },
  {
    id: 'review-2',
    type: 'monthly',
    date: new Date('2024-03-01'),
    goalProgress: {
      'goal-1': 33,
      'goal-2': 25,
      'goal-3': 38,
      'goal-4': 28
    },
    habitStreaks: {
      'habit-1': 21,
      'habit-2': 18,
      'habit-3': 19,
      'habit-4': 22,
      'habit-5': 12
    },
    reflections: 'February was productive. All goals showing progress.',
    insights: [
      'Maintained consistency across all habits',
      'Savings goal slightly behind',
      'Reading habit strongest performer'
    ],
    createdAt: new Date('2024-03-01')
  }
];

export const getInitialData = () => ({
  goals: sampleGoals,
  habits: sampleHabits,
  logs: generateSampleLogs(sampleHabits, 30),
  reviews: sampleReviews
});
