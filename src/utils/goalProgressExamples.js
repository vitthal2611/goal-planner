import { calculateGoalProgress } from './goalUtils';

// Example progress calculations with timeline

export const progressExamples = {
  // Full year goal (Jan 1 - Dec 31)
  fullYear: {
    goal: {
      yearlyTarget: 24,
      actualProgress: 8,
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2024, 11, 31)
    },
    currentDate: new Date(2024, 3, 15), // April 15
    expected: {
      daysPassed: 105,
      totalDays: 366,
      expectedProgress: 6.9, // (24 * 105) / 366
      onTrack: true // 8 > 6.9
    }
  },
  
  // Mid-year goal (June 1 - Dec 31)
  midYear: {
    goal: {
      yearlyTarget: 100,
      actualProgress: 30,
      startDate: new Date(2024, 5, 1),
      endDate: new Date(2024, 11, 31)
    },
    currentDate: new Date(2024, 7, 15), // Aug 15
    expected: {
      daysPassed: 76,
      totalDays: 214,
      expectedProgress: 35.5, // (100 * 76) / 214
      onTrack: false // 30 < 35.5
    }
  },
  
  // Short-term goal (3 months)
  shortTerm: {
    goal: {
      yearlyTarget: 30,
      actualProgress: 20,
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2024, 2, 31)
    },
    currentDate: new Date(2024, 1, 15), // Feb 15
    expected: {
      daysPassed: 46,
      totalDays: 91,
      expectedProgress: 15.2, // (30 * 46) / 91
      onTrack: true // 20 > 15.2
    }
  }
};

// Test function
export const testProgressCalculations = () => {
  console.log('=== Goal Progress Timeline Tests ===\n');
  
  Object.entries(progressExamples).forEach(([name, { goal, currentDate }]) => {
    const progress = calculateGoalProgress(goal, currentDate);
    console.log(`${name}:`, {
      actual: goal.actualProgress,
      expected: progress.expected,
      onTrack: progress.onTrack,
      daysRemaining: progress.daysRemaining
    });
  });
};
