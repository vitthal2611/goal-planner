# Data Flow Example

## Initial State

```javascript
// User creates goal
const goal = {
  id: 'goal-1',
  title: 'Read 24 books',
  yearlyTarget: 24,
  actualProgress: 0,  // User manually updates this
  unit: 'books',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
  createdAt: new Date()
};

// User creates habit linked to goal
const habit = {
  id: 'habit-1',
  name: 'Read for 30 minutes',
  goalIds: ['goal-1'],  // Links to goal
  trigger: 'After morning tea',
  time: '07:15',
  location: 'Living room',
  frequency: 'daily',
  isActive: true,
  createdAt: new Date()
};

// No logs yet
const habitLogs = [];
```

## Day 1: User completes habit

```javascript
// User clicks "Done" in Today screen
onLogHabit('habit-1', 'done');

// Creates new log
const newLog = {
  id: 'log-1',
  habitId: 'habit-1',
  date: '2024-01-01',
  status: 'done',
  loggedAt: new Date()
};

habitLogs = [newLog];
```

**Dashboard updates automatically:**
- Habit consistency: 100% (1/1 days)
- Current streak: 1 day
- Today screen shows green checkmark

## Day 2-7: User continues habit

```javascript
habitLogs = [
  { id: 'log-1', habitId: 'habit-1', date: '2024-01-01', status: 'done' },
  { id: 'log-2', habitId: 'habit-1', date: '2024-01-02', status: 'done' },
  { id: 'log-3', habitId: 'habit-1', date: '2024-01-03', status: 'done' },
  { id: 'log-4', habitId: 'habit-1', date: '2024-01-04', status: 'skipped' },
  { id: 'log-5', habitId: 'habit-1', date: '2024-01-05', status: 'done' },
  { id: 'log-6', habitId: 'habit-1', date: '2024-01-06', status: 'done' },
  { id: 'log-7', habitId: 'habit-1', date: '2024-01-07', status: 'done' }
];
```

**Dashboard calculations:**
```javascript
calculateHabitConsistency(habit, habitLogs, 7);
// Returns:
{
  consistency: 86,        // 6/7 days
  completed: 6,
  skipped: 1,
  expected: 7,
  currentStreak: 3,       // Days 5,6,7
  longestStreak: 3
}
```

## Week 1 Complete: User finishes first book

```javascript
// User updates goal progress in Goals screen
onUpdateGoal('goal-1', 1);

goal.actualProgress = 1;  // 1 book completed
```

**Dashboard calculations:**
```javascript
calculateGoalProgress(goal);
// Returns:
{
  yearlyProgress: 4.2,           // 1/24 = 4.2%
  quarterlyProgress: 16.7,       // 1/6 = 16.7%
  monthlyProgress: 50,           // 1/2 = 50%
  onTrack: false,                // Expected ~0.2 books by day 7
  targets: {
    yearly: 24,
    quarterly: 6,
    monthly: 2,
    weekly: 0.46,
    expected: 0.2
  },
  actual: 1,
  expected: 0,
  remaining: 23,
  daysRemaining: 358,
  projectedCompletion: 5214,     // Way ahead!
  progressRate: "0.14"
}
```

**Dashboard shows:**
- Goal: 4% complete, ON TRACK (ahead of schedule)
- Habit: 86% consistency, 3-day streak
- Monthly target: 1/2 books (50% complete)

## Month 1 Complete: 30 days of data

```javascript
// 30 days of habit logs
habitLogs.length = 30;
const completed = habitLogs.filter(l => l.status === 'done').length; // 25
const consistency = (25/30) * 100; // 83%

// User read 2 books
goal.actualProgress = 2;
```

**Review screen generates insights:**
```javascript
generateInsights(goals, habits, habitLogs);
// Returns:
[
  {
    type: 'positive',
    message: 'All 1 goals are on track! Excellent progress this month.'
  },
  {
    type: 'positive',
    message: '1 habit with 90%+ consistency: Read for 30 minutes'
  },
  {
    type: 'positive',
    message: 'Longest current streak: 7 days! Keep the momentum going.'
  }
]
```

## Data Flow Summary

```
User Action → State Update → Calculations → UI Update

1. CREATE GOAL
   Goals screen → onAddGoal() → goals state
   ↓
   Dashboard reads goals → calculateGoalProgress()
   ↓
   Shows progress rings, bars, targets

2. CREATE HABIT
   Habits screen → onAddHabit() → habits state
   ↓
   Today screen reads habits → groups by time
   ↓
   Shows checkboxes for today

3. LOG HABIT
   Today screen → onLogHabit() → habitLogs state
   ↓
   calculateHabitConsistency(habit, habitLogs)
   ↓
   Dashboard updates: consistency %, streaks
   ↓
   Review generates insights

4. UPDATE GOAL
   Goals screen → onUpdateGoal() → goal.actualProgress
   ↓
   calculateGoalProgress(goal)
   ↓
   Dashboard updates: progress %, on-track status
   ↓
   Review compares expected vs actual

5. VIEW REVIEW
   Review screen reads: goals, habits, habitLogs
   ↓
   Runs all calculations
   ↓
   generateInsights() analyzes patterns
   ↓
   Shows: progress comparison, adherence charts, insights
```

## State Structure

```javascript
// App.js state (persisted in localStorage)
{
  goals: [
    {
      id: 'goal-1',
      title: 'Read 24 books',
      yearlyTarget: 24,
      actualProgress: 2,
      unit: 'books',
      startDate: Date,
      endDate: Date,
      createdAt: Date
    }
  ],
  
  habits: [
    {
      id: 'habit-1',
      name: 'Read for 30 minutes',
      goalIds: ['goal-1'],
      trigger: 'After morning tea',
      time: '07:15',
      location: 'Living room',
      frequency: 'daily',
      isActive: true,
      createdAt: Date
    }
  ],
  
  habitLogs: [
    {
      id: 'log-1',
      habitId: 'habit-1',
      date: '2024-01-01',
      status: 'done',
      loggedAt: Date
    },
    // ... 29 more logs
  ]
}
```

## Automatic Updates

All screens react to state changes:

- **Today**: Shows habits for today, reads habitLogs to show status
- **Dashboard**: Calculates metrics from goals + habitLogs in real-time
- **Goals**: Shows progress, auto-calculates targets from yearlyTarget
- **Habits**: Shows consistency from habitLogs
- **Review**: Aggregates all data, generates insights

No manual refresh needed - React state updates trigger re-renders.
