export const FREQUENCY_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  SPECIFIC_DAYS: 'specific_days',
  MONTHLY: 'monthly'
};

export const DAYS_OF_WEEK = {
  MONDAY: 0,
  TUESDAY: 1,
  WEDNESDAY: 2,
  THURSDAY: 3,
  FRIDAY: 4,
  SATURDAY: 5,
  SUNDAY: 6
};

export const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const DEFAULT_FREQUENCY_CONFIG = {
  [FREQUENCY_TYPES.DAILY]: {},
  [FREQUENCY_TYPES.WEEKLY]: { daysPerWeek: 3 },
  [FREQUENCY_TYPES.SPECIFIC_DAYS]: { days: [0, 2, 4] }, // Mon, Wed, Fri
  [FREQUENCY_TYPES.MONTHLY]: { timesPerMonth: 12 }
};
