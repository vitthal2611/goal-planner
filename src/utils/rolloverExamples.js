// Rollover examples

export const rolloverExamples = {
  // Original goal (2024)
  original: {
    id: 'goal-1',
    title: 'Read 24 books',
    yearlyTarget: 24,
    actualProgress: 18,
    unit: 'books',
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 11, 31),
    year: 2024,
    status: 'active'
  },
  
  // Rolled over goal (2025)
  rolledOver: {
    id: 'goal-1_rollover_2025',
    title: 'Read 24 books',
    yearlyTarget: 24,
    actualProgress: 0, // Reset to 0
    unit: 'books',
    startDate: new Date(2025, 0, 1), // Jan 1, 2025
    endDate: new Date(2025, 11, 31, 23, 59, 59), // Dec 31, 2025
    year: 2025,
    status: 'active',
    isRollover: true,
    originalGoalId: 'goal-1'
  }
};

// Key points:
// 1. New startDate = Jan 1 of new year
// 2. New endDate = Dec 31 of new year
// 3. actualProgress reset to 0
// 4. Original goal remains unchanged
// 5. New goal gets unique ID with _rollover suffix
