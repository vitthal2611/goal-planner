// Step 10: End-to-end verification examples

export const verificationScenario = {
  goal: {
    id: 'goal-1',
    title: 'Read 24 Books',
    yearlyTarget: 24,
    actualProgress: 8,
    unit: 'books',
    startDate: '2024-02-01',
    endDate: '2024-06-30',
    year: 2024
  },
  
  habit: {
    id: 'habit-1',
    name: 'Read for 30 minutes',
    goalIds: ['goal-1'],
    trigger: 'After morning tea',
    time: '07:15',
    location: 'Living room',
    frequency: 'daily',
    isActive: true
  },
  
  // 110 completed out of 130 expected (Feb 1 - Jun 30 = 150 days, but only 130 scheduled)
  logs: generateLogsForScenario(),
  
  expectedOutput: {
    thirtyDayConsistency: 85, // Last 30 days
    completed: 110,
    expected: 130,
    currentStreak: 7,
    bestStreak: 21,
    displayText: {
      consistency: '30-Day Consistency: 85%',
      progress: '110 / 130 completed',
      streak: 'Best streak: 21 days'
    }
  }
};

function generateLogsForScenario() {
  const logs = [];
  const startDate = new Date('2024-02-01');
  const endDate = new Date('2024-06-30');
  
  let completedCount = 0;
  const targetCompleted = 110;
  const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  
  for (let i = 0; i < totalDays && completedCount < targetCompleted; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Create realistic pattern: 85% completion rate with some streaks
    const shouldComplete = Math.random() < 0.85;
    
    if (shouldComplete) {
      logs.push({
        id: `log-${i}`,
        habitId: 'habit-1',
        date: date.toISOString().split('T')[0],
        status: 'done',
        loggedAt: date
      });
      completedCount++;
    }
  }
  
  return logs;
}

// Example 1: Daily habit for 30 days
export const dailyHabitExample = {
  habit: {
    id: 'habit-daily',
    name: 'Morning meditation',
    goalIds: ['goal-wellness'],
    frequency: 'daily',
    isActive: true
  },
  
  goal: {
    id: 'goal-wellness',
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  },
  
  dateRange: {
    start: '2024-01-01',
    end: '2024-01-30'
  },
  
  expectedOccurrences: 30, // Every day
  
  logs: [
    // 25 completed out of 30
    ...Array.from({ length: 25 }, (_, i) => ({
      habitId: 'habit-daily',
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      status: 'done'
    }))
  ],
  
  expectedMetrics: {
    consistency: 83, // 25/30 = 83%
    completed: 25,
    expected: 30
  }
};

// Example 2: Mon/Wed/Fri habit for 1 month
export const specificDaysExample = {
  habit: {
    id: 'habit-mwf',
    name: 'Gym workout',
    goalIds: ['goal-fitness'],
    frequency: 'specific_days',
    frequencyConfig: {
      days: [0, 2, 4] // Mon, Wed, Fri
    },
    isActive: true
  },
  
  goal: {
    id: 'goal-fitness',
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  },
  
  dateRange: {
    start: '2024-01-01', // Monday
    end: '2024-01-31'
  },
  
  expectedOccurrences: 13, // 13 Mon/Wed/Fri in January 2024
  
  logs: [
    // 10 completed out of 13
    { habitId: 'habit-mwf', date: '2024-01-01', status: 'done' }, // Mon
    { habitId: 'habit-mwf', date: '2024-01-03', status: 'done' }, // Wed
    { habitId: 'habit-mwf', date: '2024-01-05', status: 'done' }, // Fri
    { habitId: 'habit-mwf', date: '2024-01-08', status: 'done' }, // Mon
    { habitId: 'habit-mwf', date: '2024-01-10', status: 'done' }, // Wed
    // Skipped Jan 12
    { habitId: 'habit-mwf', date: '2024-01-15', status: 'done' }, // Mon
    { habitId: 'habit-mwf', date: '2024-01-17', status: 'done' }, // Wed
    { habitId: 'habit-mwf', date: '2024-01-19', status: 'done' }, // Fri
    { habitId: 'habit-mwf', date: '2024-01-22', status: 'done' }, // Mon
    // Skipped Jan 24
    { habitId: 'habit-mwf', date: '2024-01-26', status: 'done' }  // Fri
    // Skipped Jan 29, 31
  ],
  
  expectedMetrics: {
    consistency: 77, // 10/13 = 77%
    completed: 10,
    expected: 13
  }
};

// Example 3: Mid-year goal (Feb 1 - Jun 30)
export const midYearGoalExample = {
  habit: {
    id: 'habit-midyear',
    name: 'Practice Spanish',
    goalIds: ['goal-language'],
    frequency: 'daily',
    isActive: true
  },
  
  goal: {
    id: 'goal-language',
    title: 'Learn 500 Spanish words',
    startDate: '2024-02-01',
    endDate: '2024-06-30',
    year: 2024
  },
  
  dateRange: {
    start: '2024-02-01',
    end: '2024-06-30'
  },
  
  totalDays: 151, // Feb 1 to Jun 30 (2024 is leap year)
  expectedOccurrences: 151,
  
  // Habit effective date range matches goal timeline
  habitDateRange: {
    startDate: '2024-02-01',
    endDate: '2024-06-30'
  },
  
  note: 'Habit only counts logs within goal timeline. Logs before Feb 1 or after Jun 30 are ignored.'
};

// Example 4: Streak calculation with scheduled days
export const streakExample = {
  habit: {
    id: 'habit-streak',
    name: 'Write journal',
    goalIds: ['goal-writing'],
    frequency: 'specific_days',
    frequencyConfig: {
      days: [0, 2, 4] // Mon, Wed, Fri
    },
    isActive: true
  },
  
  goal: {
    id: 'goal-writing',
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  },
  
  logs: [
    { date: '2024-01-01', status: 'done' }, // Mon - streak starts
    { date: '2024-01-03', status: 'done' }, // Wed - streak continues
    { date: '2024-01-05', status: 'done' }, // Fri - streak continues
    { date: '2024-01-08', status: 'done' }, // Mon - streak continues
    { date: '2024-01-10', status: 'done' }, // Wed - streak continues
    // Jan 12 (Fri) - MISSED - streak breaks
    { date: '2024-01-15', status: 'done' }, // Mon - new streak starts
    { date: '2024-01-17', status: 'done' }, // Wed - streak continues
    { date: '2024-01-19', status: 'done' }  // Fri - streak continues (current)
  ],
  
  expectedStreaks: {
    currentStreak: 3, // Jan 15, 17, 19
    bestStreak: 5     // Jan 1, 3, 5, 8, 10
  },
  
  note: 'Streaks only count scheduled days. Tue/Thu/Sat/Sun do not break streaks.'
};

// UI Display Examples
export const uiDisplayExamples = {
  habitCard1: {
    input: {
      habit: verificationScenario.habit,
      logs: verificationScenario.logs,
      goals: [verificationScenario.goal]
    },
    output: {
      chips: [
        '7 day streak 🔥',
        '85%'
      ],
      progressBar: {
        label: '30-Day Consistency',
        value: 85,
        color: 'success'
      },
      footer: [
        '110/130 completed',
        'Best streak: 21 days'
      ]
    }
  },
  
  habitCard2: {
    input: {
      habit: specificDaysExample.habit,
      logs: specificDaysExample.logs,
      goals: [specificDaysExample.goal]
    },
    output: {
      chips: [
        '3 day streak 🔥',
        '77%',
        'Mon, Wed, Fri'
      ],
      progressBar: {
        label: '30-Day Consistency',
        value: 77,
        color: 'primary'
      },
      footer: [
        '10/13 completed',
        'Best streak: 5 days'
      ]
    }
  }
};
