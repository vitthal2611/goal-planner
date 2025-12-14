import { FREQUENCY_TYPES } from '../utils/frequencyConstants';

// Example habits for all frequency types
export const frequencyExamples = {
  daily: {
    id: 'habit-daily-1',
    name: 'Morning meditation',
    frequency: FREQUENCY_TYPES.DAILY,
    frequencyConfig: {}
  },
  
  weekly: {
    id: 'habit-weekly-1',
    name: 'Gym workout',
    frequency: FREQUENCY_TYPES.WEEKLY,
    frequencyConfig: { daysPerWeek: 3 }
  },
  
  specificDays: {
    id: 'habit-specific-1',
    name: 'Team meeting prep',
    frequency: FREQUENCY_TYPES.SPECIFIC_DAYS,
    frequencyConfig: { days: [0, 2, 4] } // Mon, Wed, Fri
  },
  
  monthly: {
    id: 'habit-monthly-1',
    name: 'Financial review',
    frequency: FREQUENCY_TYPES.MONTHLY,
    frequencyConfig: { timesPerMonth: 4 }
  }
};
