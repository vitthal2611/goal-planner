import { calculateGoalProgress } from '../utils/goalUtils';
import { getGoalTimelineStatus, isGoalActive } from '../utils/goalTimelineRules';
import { isHabitScheduledForDate } from '../utils/frequencyRules';

/**
 * End-to-end verification for goal timeline feature
 */

// Test Case 1: Goal created mid-year (June 15)
const midYearGoal = {
  id: 'goal-mid',
  title: 'Read 12 books',
  yearlyTarget: 12,
  actualProgress: 4,
  unit: 'books',
  startDate: new Date(2024, 5, 15), // June 15, 2024
  endDate: new Date(2024, 11, 31), // Dec 31, 2024
  year: 2024,
  status: 'active'
};

const midYearHabit = {
  id: 'habit-mid',
  name: 'Read 30 minutes',
  goalIds: ['goal-mid'],
  frequency: 'daily',
  time: '19:00'
};

// Test Case 2: Goal starting in future (Dec 1)
const futureGoal = {
  id: 'goal-future',
  title: 'Exercise 20 times',
  yearlyTarget: 20,
  actualProgress: 0,
  unit: 'sessions',
  startDate: new Date(2024, 11, 1), // Dec 1, 2024
  endDate: new Date(2024, 11, 31), // Dec 31, 2024
  year: 2024,
  status: 'upcoming'
};

const futureHabit = {
  id: 'habit-future',
  name: 'Gym workout',
  goalIds: ['goal-future'],
  frequency: 'daily',
  time: '18:00'
};

// Test Case 3: Goal ending early (Jan 1 - Mar 31)
const earlyEndGoal = {
  id: 'goal-early',
  title: 'Q1 Savings',
  yearlyTarget: 3000,
  actualProgress: 2500,
  unit: 'dollars',
  startDate: new Date(2024, 0, 1), // Jan 1, 2024
  endDate: new Date(2024, 2, 31), // Mar 31, 2024
  year: 2024,
  status: 'ended'
};

const earlyEndHabit = {
  id: 'habit-early',
  name: 'Track expenses',
  goalIds: ['goal-early'],
  frequency: 'daily',
  time: '20:00'
};

/**
 * Expected Results
 */
export const verificationResults = {
  // Test 1: Mid-year goal (current date: Aug 15, 2024)
  midYear: {
    currentDate: new Date(2024, 7, 15),
    dashboard: {
      status: 'active',
      isActive: true,
      progress: {
        daysPassed: 62, // June 15 to Aug 15
        totalDays: 200, // June 15 to Dec 31
        expectedProgress: 3.7, // (12 * 62) / 200
        actual: 4,
        onTrack: true // 4 > 3.7
      }
    },
    todayView: {
      habitVisible: true, // Goal is active
      reason: 'Goal is active (Aug 15 is between June 15 and Dec 31)'
    }
  },
  
  // Test 2: Future goal (current date: Nov 15, 2024)
  future: {
    currentDate: new Date(2024, 10, 15),
    dashboard: {
      status: 'upcoming',
      isActive: false,
      progress: {
        message: 'Goal starts on Dec 1, 2024'
      }
    },
    todayView: {
      habitVisible: false, // Goal hasn't started
      reason: 'Goal is upcoming (Nov 15 is before Dec 1)'
    }
  },
  
  // Test 3: Early end goal (current date: June 15, 2024)
  earlyEnd: {
    currentDate: new Date(2024, 5, 15),
    dashboard: {
      status: 'ended',
      isActive: false,
      progress: {
        finalProgress: 83.3, // 2500 / 3000
        message: 'Goal ended on Mar 31, 2024'
      }
    },
    todayView: {
      habitVisible: false, // Goal has ended
      reason: 'Goal has ended (June 15 is after Mar 31)'
    }
  }
};

/**
 * Run verification tests
 */
export const runGoalTimelineVerification = () => {
  console.log('=== Goal Timeline Feature Verification ===\n');
  
  // Test 1: Mid-year goal
  console.log('1. Mid-Year Goal (June 15 - Dec 31):');
  const midYearDate = new Date(2024, 7, 15);
  const midYearStatus = getGoalTimelineStatus(midYearGoal, midYearDate);
  const midYearActive = isGoalActive(midYearGoal, midYearDate);
  const midYearProgress = calculateGoalProgress(midYearGoal, midYearDate);
  console.log('  Status:', midYearStatus);
  console.log('  Is Active:', midYearActive);
  console.log('  Progress:', midYearProgress.actual, '/', midYearProgress.expected);
  console.log('  On Track:', midYearProgress.onTrack);
  console.log('  Habit Visible:', midYearActive);
  console.log('');
  
  // Test 2: Future goal
  console.log('2. Future Goal (Dec 1 - Dec 31):');
  const futureDate = new Date(2024, 10, 15);
  const futureStatus = getGoalTimelineStatus(futureGoal, futureDate);
  const futureActive = isGoalActive(futureGoal, futureDate);
  console.log('  Status:', futureStatus);
  console.log('  Is Active:', futureActive);
  console.log('  Habit Visible:', futureActive);
  console.log('');
  
  // Test 3: Early end goal
  console.log('3. Early End Goal (Jan 1 - Mar 31):');
  const earlyDate = new Date(2024, 5, 15);
  const earlyStatus = getGoalTimelineStatus(earlyEndGoal, earlyDate);
  const earlyActive = isGoalActive(earlyEndGoal, earlyDate);
  const earlyProgress = calculateGoalProgress(earlyEndGoal, earlyDate);
  console.log('  Status:', earlyStatus);
  console.log('  Is Active:', earlyActive);
  console.log('  Final Progress:', Math.round(earlyProgress.yearlyProgress) + '%');
  console.log('  Habit Visible:', earlyActive);
  console.log('');
  
  console.log('=== Verification Complete ===');
};

export { midYearGoal, futureGoal, earlyEndGoal, midYearHabit, futureHabit, earlyEndHabit };
