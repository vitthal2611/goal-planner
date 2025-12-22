export const FREQUENCY_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  SPECIFIC_DAYS: 'specific_days',
  MONTHLY: 'monthly',
  MONTHLY_DATES: 'monthly_dates'
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

export const MONTH_DATES = Array.from({ length: 31 }, (_, i) => i + 1);

export const DEFAULT_FREQUENCY_CONFIG = {
  [FREQUENCY_TYPES.DAILY]: {},
  [FREQUENCY_TYPES.WEEKLY]: { daysPerWeek: 3 },
  [FREQUENCY_TYPES.SPECIFIC_DAYS]: { days: [0, 2, 4] }, // Mon, Wed, Fri
  [FREQUENCY_TYPES.MONTHLY]: { timesPerMonth: 12 },
  [FREQUENCY_TYPES.MONTHLY_DATES]: { dates: [1, 15] } // 1st and 15th
};
