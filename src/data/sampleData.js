import { generateId } from '../utils/calculations';

const currentYear = new Date().getFullYear();

export const sampleGoals = [
  {
    id: 'goal-1',
    title: 'Read 24 books',
    yearlyTarget: 24,
    actualProgress: 8,
    unit: 'books',
    year: currentYear,
    startDate: new Date(`${currentYear}-01-01`),
    endDate: new Date(`${currentYear}-12-31`),
    createdAt: new Date(`${currentYear}-01-01`)
  },
  {
    id: 'goal-2',
    title: 'Exercise 200 hours',
    yearlyTarget: 200,
    actualProgress: 45,
    unit: 'hours',
    year: currentYear,
    startDate: new Date(`${currentYear}-01-01`),
    endDate: new Date(`${currentYear}-12-31`),
    createdAt: new Date(`${currentYear}-01-01`)
  },
  {
    id: 'goal-3',
    title: 'Learn 500 new words',
    yearlyTarget: 500,
    actualProgress: 120,
    unit: 'words',
    year: currentYear,
    startDate: new Date(`${currentYear}-01-01`),
    endDate: new Date(`${currentYear}-12-31`),
    createdAt: new Date(`${currentYear}-01-01`)
  },
  {
    id: 'goal-4',
    title: 'Save $12,000',
    yearlyTarget: 12000,
    actualProgress: 3500,
    unit: 'dollars',
    year: currentYear,
    startDate: new Date(`${currentYear}-01-01`),
    endDate: new Date(`${currentYear}-12-31`),
    createdAt: new Date(`${currentYear}-01-01`)
  },
  {
    id: 'goal-past-1',
    title: 'Read 20 books',
    yearlyTarget: 20,
    actualProgress: 20,
    unit: 'books',
    year: currentYear - 1,
    startDate: new Date(`${currentYear - 1}-01-01`),
    endDate: new Date(`${currentYear - 1}-12-31`),
    createdAt: new Date(`${currentYear - 1}-01-01`)
  },
  {
    id: 'goal-future-1',
    title: 'Read 30 books',
    yearlyTarget: 30,
    actualProgress: 0,
    unit: 'books',
    year: currentYear + 1,
    startDate: new Date(`${currentYear + 1}-01-01`),
    endDate: new Date(`${currentYear + 1}-12-31`),
    createdAt: new Date()
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
    startYear: currentYear,
    createdAt: new Date('2024-01-01')
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
    startYear: currentYear,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'habit-3',
    name: 'Study vocabulary',
    goalIds: ['goal-3'],
    trigger: 'During lunch break',
    time: '12:30',
    location: 'Office desk',
    frequency: 'daily',
    isActive: true,
    startYear: currentYear,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'habit-4',
    name: 'Track expenses',
    goalIds: ['goal-4'],
    trigger: 'Before bed',
    time: '21:00',
    location: 'Bedroom',
    frequency: 'daily',
    isActive: true,
    startYear: currentYear,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'habit-5',
    name: 'Evening walk',
    goalIds: ['goal-2'],
    trigger: 'After dinner',
    time: '19:00',
    location: 'Park',
    frequency: 'daily',
    isActive: true,
    startYear: currentYear,
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'habit-future-1',
    name: 'Read for 45 minutes',
    goalIds: ['goal-future-1'],
    trigger: 'After morning tea',
    time: '07:00',
    location: 'Living room',
    frequency: 'daily',
    isActive: true,
    startYear: currentYear + 1,
    createdAt: new Date()
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
        loggedAt: logDate
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
