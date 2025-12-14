// Example logs for different frequency types
export const frequencyLogExamples = {
  // Weekly habit (3x per week) - logs only on completed days
  weekly: [
    { id: 'log-w1', habitId: 'habit-weekly-1', date: '2024-01-08', status: 'done' }, // Mon
    { id: 'log-w2', habitId: 'habit-weekly-1', date: '2024-01-10', status: 'done' }, // Wed
    { id: 'log-w3', habitId: 'habit-weekly-1', date: '2024-01-12', status: 'done' }  // Fri
  ],
  
  // Specific days (Mon/Wed/Fri) - logs only on those days
  specificDays: [
    { id: 'log-s1', habitId: 'habit-specific-1', date: '2024-01-08', status: 'done' },  // Mon
    { id: 'log-s2', habitId: 'habit-specific-1', date: '2024-01-10', status: 'skipped' }, // Wed
    { id: 'log-s3', habitId: 'habit-specific-1', date: '2024-01-12', status: 'done' }   // Fri
    // No logs for Tue/Thu/Sat/Sun - not scheduled
  ]
};
