// Example consistency calculations for different frequencies

export const consistencyExamples = {
  // Daily habit: 25/30 days = 83%
  daily: {
    habit: { frequency: 'daily', frequencyConfig: {} },
    expected: 30,
    completed: 25,
    consistency: 83
  },
  
  // Weekly (3x/week): 10/12 expected = 83%
  weekly: {
    habit: { frequency: 'weekly', frequencyConfig: { daysPerWeek: 3 } },
    expected: 12, // 4 weeks × 3 days
    completed: 10,
    consistency: 83
  },
  
  // Monthly (5x/month): 4/5 expected = 80%
  monthly: {
    habit: { frequency: 'monthly', frequencyConfig: { timesPerMonth: 5 } },
    expected: 5,
    completed: 4,
    consistency: 80
  }
};
