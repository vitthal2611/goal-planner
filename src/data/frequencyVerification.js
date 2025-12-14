import { FREQUENCY_TYPES } from '../utils/frequencyConstants';
import { isHabitScheduledForDate, getFrequencyLabel } from '../utils/frequencyRules';
import { calculateHabitConsistency } from '../utils/habitUtils';

/**
 * End-to-end verification examples
 */

// 1. Daily habit
const dailyHabit = {
  id: 'daily-1',
  name: 'Morning meditation',
  frequency: FREQUENCY_TYPES.DAILY,
  frequencyConfig: {},
  time: '07:00',
  isActive: true
};

// 2. 3× per week habit
const weeklyHabit = {
  id: 'weekly-1',
  name: 'Gym workout',
  frequency: FREQUENCY_TYPES.WEEKLY,
  frequencyConfig: { daysPerWeek: 3 },
  time: '18:00',
  isActive: true
};

// 3. Mon/Wed/Fri habit
const specificDaysHabit = {
  id: 'specific-1',
  name: 'Team standup',
  frequency: FREQUENCY_TYPES.SPECIFIC_DAYS,
  frequencyConfig: { days: [0, 2, 4] }, // Mon, Wed, Fri
  time: '09:00',
  isActive: true
};

// 4. 5× per month habit
const monthlyHabit = {
  id: 'monthly-1',
  name: 'Financial review',
  frequency: FREQUENCY_TYPES.MONTHLY,
  frequencyConfig: { timesPerMonth: 5 },
  time: '20:00',
  isActive: true
};

// Sample logs for verification
const sampleLogs = [
  // Daily habit - 25/30 days
  ...Array.from({ length: 25 }, (_, i) => ({
    id: `log-daily-${i}`,
    habitId: 'daily-1',
    date: `2024-01-${String(i + 1).padStart(2, '0')}`,
    status: 'done'
  })),
  
  // Weekly habit - 10/12 expected
  { id: 'log-w1', habitId: 'weekly-1', date: '2024-01-08', status: 'done' },
  { id: 'log-w2', habitId: 'weekly-1', date: '2024-01-10', status: 'done' },
  { id: 'log-w3', habitId: 'weekly-1', date: '2024-01-12', status: 'done' },
  { id: 'log-w4', habitId: 'weekly-1', date: '2024-01-15', status: 'done' },
  { id: 'log-w5', habitId: 'weekly-1', date: '2024-01-17', status: 'done' },
  { id: 'log-w6', habitId: 'weekly-1', date: '2024-01-19', status: 'done' },
  { id: 'log-w7', habitId: 'weekly-1', date: '2024-01-22', status: 'done' },
  { id: 'log-w8', habitId: 'weekly-1', date: '2024-01-24', status: 'done' },
  { id: 'log-w9', habitId: 'weekly-1', date: '2024-01-26', status: 'done' },
  { id: 'log-w10', habitId: 'weekly-1', date: '2024-01-29', status: 'done' },
  
  // Specific days - 8/12 Mon/Wed/Fri
  { id: 'log-s1', habitId: 'specific-1', date: '2024-01-08', status: 'done' },  // Mon
  { id: 'log-s2', habitId: 'specific-1', date: '2024-01-10', status: 'done' }, // Wed
  { id: 'log-s3', habitId: 'specific-1', date: '2024-01-12', status: 'done' }, // Fri
  { id: 'log-s4', habitId: 'specific-1', date: '2024-01-15', status: 'done' }, // Mon
  { id: 'log-s5', habitId: 'specific-1', date: '2024-01-17', status: 'done' }, // Wed
  { id: 'log-s6', habitId: 'specific-1', date: '2024-01-22', status: 'done' }, // Mon
  { id: 'log-s7', habitId: 'specific-1', date: '2024-01-24', status: 'done' }, // Wed
  { id: 'log-s8', habitId: 'specific-1', date: '2024-01-26', status: 'done' }, // Fri
  
  // Monthly habit - 4/5 times
  { id: 'log-m1', habitId: 'monthly-1', date: '2024-01-05', status: 'done' },
  { id: 'log-m2', habitId: 'monthly-1', date: '2024-01-12', status: 'done' },
  { id: 'log-m3', habitId: 'monthly-1', date: '2024-01-19', status: 'done' },
  { id: 'log-m4', habitId: 'monthly-1', date: '2024-01-26', status: 'done' }
];

/**
 * Expected Results
 */
export const verificationResults = {
  todayView: {
    // On Monday, Jan 8, 2024:
    monday: {
      visible: [dailyHabit, weeklyHabit, specificDaysHabit, monthlyHabit],
      labels: {
        daily: 'Daily',
        weekly: '3× per week',
        specific: 'Mon, Wed, Fri',
        monthly: '5× per month'
      }
    },
    // On Tuesday, Jan 9, 2024:
    tuesday: {
      visible: [dailyHabit, weeklyHabit, monthlyHabit],
      notVisible: [specificDaysHabit] // Not scheduled on Tuesday
    }
  },
  
  consistency: {
    daily: {
      expected: 30,
      completed: 25,
      consistency: 83 // 25/30 = 83%
    },
    weekly: {
      expected: 12, // 4 weeks × 3 days
      completed: 10,
      consistency: 83 // 10/12 = 83%
    },
    specificDays: {
      expected: 12, // 4 weeks × 3 days (Mon/Wed/Fri)
      completed: 8,
      consistency: 67 // 8/12 = 67%
    },
    monthly: {
      expected: 5,
      completed: 4,
      consistency: 80 // 4/5 = 80%
    }
  }
};

// Test function to verify implementation
export const runVerification = () => {
  console.log('=== Frequency Feature Verification ===\n');
  
  // Test 1: Frequency labels
  console.log('1. Frequency Labels:');
  console.log('Daily:', getFrequencyLabel(dailyHabit));
  console.log('Weekly:', getFrequencyLabel(weeklyHabit));
  console.log('Specific Days:', getFrequencyLabel(specificDaysHabit));
  console.log('Monthly:', getFrequencyLabel(monthlyHabit));
  console.log('');
  
  // Test 2: Today view filtering
  console.log('2. Today View (Monday):');
  const monday = new Date('2024-01-08');
  console.log('Daily scheduled?', isHabitScheduledForDate(dailyHabit, monday));
  console.log('Weekly scheduled?', isHabitScheduledForDate(weeklyHabit, monday));
  console.log('Specific Days scheduled?', isHabitScheduledForDate(specificDaysHabit, monday));
  console.log('Monthly scheduled?', isHabitScheduledForDate(monthlyHabit, monday));
  console.log('');
  
  console.log('3. Today View (Tuesday):');
  const tuesday = new Date('2024-01-09');
  console.log('Specific Days scheduled?', isHabitScheduledForDate(specificDaysHabit, tuesday)); // Should be false
  console.log('');
  
  // Test 3: Consistency calculations
  console.log('4. Consistency Calculations:');
  const dailyConsistency = calculateHabitConsistency(dailyHabit, sampleLogs, 30);
  console.log('Daily:', dailyConsistency.consistency + '%', `(${dailyConsistency.completed}/${dailyConsistency.expected})`);
  
  const weeklyConsistency = calculateHabitConsistency(weeklyHabit, sampleLogs, 30);
  console.log('Weekly:', weeklyConsistency.consistency + '%', `(${weeklyConsistency.completed}/${weeklyConsistency.expected})`);
  
  const specificConsistency = calculateHabitConsistency(specificDaysHabit, sampleLogs, 30);
  console.log('Specific Days:', specificConsistency.consistency + '%', `(${specificConsistency.completed}/${specificConsistency.expected})`);
  
  const monthlyConsistency = calculateHabitConsistency(monthlyHabit, sampleLogs, 30);
  console.log('Monthly:', monthlyConsistency.consistency + '%', `(${monthlyConsistency.completed}/${monthlyConsistency.expected})`);
  
  console.log('\n=== Verification Complete ===');
};

export { dailyHabit, weeklyHabit, specificDaysHabit, monthlyHabit, sampleLogs };
