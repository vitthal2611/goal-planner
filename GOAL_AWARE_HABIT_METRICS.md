# Goal-Aware Habit Metrics Implementation

## Overview

This implementation enforces strict linkage between habits and goals, ensuring all habit metrics (consistency, streaks, completion counts) are calculated within the goal's timeline.

---

## ✅ Implementation Steps

### Step 2: Habit ↔ Goal Linkage

**Function:** `getHabitDateRange(habit, goals)`

```javascript
// Returns the date range from the linked goal
const dateRange = getHabitDateRange(habit, goals);
// { startDate: Date, endDate: Date }
```

**Rules:**
- Every habit must resolve its parent goal
- Habit effective date range = `goal.startDate` → `goal.endDate`
- Logs outside this range are ignored

**Example:**
```javascript
const habit = { id: 'h1', goalIds: ['g1'] };
const goal = { id: 'g1', startDate: '2024-02-01', endDate: '2024-06-30' };

const range = getHabitDateRange(habit, [goal]);
// { startDate: 2024-02-01, endDate: 2024-06-30 }
```

---

### Step 3: Expected Occurrences Calculation

**Function:** `getExpectedHabitOccurrences(habit, startDate, endDate)`

```javascript
const expected = getExpectedHabitOccurrences(habit, startDate, endDate);
// Returns number of scheduled days within range
```

**Rules:**
- Respects habit frequency (Daily / Weekly / Specific days / Monthly)
- Counts only scheduled days inside the goal timeline
- Uses `frequencyRules.js` for scheduling logic

**Examples:**

**Daily habit for 30 days:**
```javascript
const habit = { frequency: 'daily' };
const expected = getExpectedHabitOccurrences(habit, '2024-01-01', '2024-01-30');
// Returns: 30
```

**Mon/Wed/Fri habit for 1 month:**
```javascript
const habit = { 
  frequency: 'specific_days',
  frequencyConfig: { days: [0, 2, 4] } // Mon, Wed, Fri
};
const expected = getExpectedHabitOccurrences(habit, '2024-01-01', '2024-01-31');
// Returns: 13 (13 Mon/Wed/Fri in January 2024)
```

---

### Step 4: Completed Count Calculation

**Function:** `getCompletedHabitCount(habitId, logs, startDate, endDate)`

```javascript
const completed = getCompletedHabitCount(habitId, logs, startDate, endDate);
// Returns count of logs with status === 'done'
```

**Rules:**
- Count only `status === 'done'`
- Ignore logs outside goal date range
- Ignore skipped logs

**Example:**
```javascript
const logs = [
  { habitId: 'h1', date: '2024-02-01', status: 'done' },
  { habitId: 'h1', date: '2024-02-02', status: 'done' },
  { habitId: 'h1', date: '2024-02-03', status: 'skipped' }, // Ignored
  { habitId: 'h1', date: '2024-01-31', status: 'done' }     // Outside range, ignored
];

const completed = getCompletedHabitCount('h1', logs, '2024-02-01', '2024-02-28');
// Returns: 2
```

---

### Step 5: Consistency Calculation

**Functions:**
- `calculateGoalAwareConsistency(habit, logs, goals, days = 30)` - Rolling window
- `calculateOverallConsistency(habit, logs, goals)` - Full goal duration

**Formula:**
```
consistency % = (completedOccurrences / expectedOccurrences) × 100
```

**Labels:**
- **"30-Day Consistency"** → Rolling 30-day window inside goal range
- **"Overall Consistency"** → Full goal duration (startDate → endDate)

**Example:**
```javascript
const habit = { id: 'h1', goalIds: ['g1'], frequency: 'daily' };
const goal = { id: 'g1', startDate: '2024-02-01', endDate: '2024-06-30' };
const logs = [...]; // 110 completed logs

// 30-day consistency (last 30 days)
const thirtyDay = calculateGoalAwareConsistency(habit, logs, [goal], 30);
// { consistency: 85, completed: 25, expected: 30 }

// Overall consistency (Feb 1 - Jun 30)
const overall = calculateOverallConsistency(habit, logs, [goal]);
// { consistency: 85, completed: 110, expected: 130 }
```

---

### Step 6: Streak Calculation

**Functions:**
- `getCurrentStreak(habit, logs, goals)` - Current consecutive streak
- `getBestStreak(habit, logs, goals)` - Longest streak ever

**Rules:**
- Streaks apply only to **scheduled days**
- Break streak only when a **scheduled day is skipped**
- Non-scheduled days (e.g., Tue/Thu for Mon/Wed/Fri habit) do NOT break streaks
- Date range: Only between `goal.startDate` and `goal.endDate`

**Example:**
```javascript
const habit = {
  frequency: 'specific_days',
  frequencyConfig: { days: [0, 2, 4] } // Mon, Wed, Fri
};

const logs = [
  { date: '2024-01-01', status: 'done' }, // Mon ✓
  { date: '2024-01-03', status: 'done' }, // Wed ✓
  { date: '2024-01-05', status: 'done' }, // Fri ✓
  { date: '2024-01-08', status: 'done' }, // Mon ✓
  // Jan 10 (Wed) - MISSED - streak breaks
  { date: '2024-01-12', status: 'done' }  // Fri - new streak starts
];

const currentStreak = getCurrentStreak(habit, logs, goals);
// Returns: 1 (only Jan 12)

const bestStreak = getBestStreak(habit, logs, goals);
// Returns: 4 (Jan 1, 3, 5, 8)
```

---

### Step 7: Habit Card Metrics Mapping

**Function:** `getHabitCardMetrics(habit, logs, goals)`

Returns all metrics needed for UI display:

```javascript
const metrics = getHabitCardMetrics(habit, logs, goals);
// {
//   thirtyDayConsistency: 85,
//   completed: 110,
//   expected: 130,
//   currentStreak: 7,
//   bestStreak: 21
// }
```

**UI Mapping:**

| Metric | Display | Example |
|--------|---------|---------|
| `thirtyDayConsistency` | Progress bar + percentage | "30-Day Consistency: 85%" |
| `currentStreak` | Chip with fire icon | "7 day streak 🔥" |
| `completed / expected` | Footer text | "110 / 130 completed" |
| `bestStreak` | Footer text | "Best streak: 21 days" |

**UX Rules:**
- Metrics must be readable at a glance
- Use color coding: Green (≥80%), Blue (≥60%), Orange (≥40%), Red (<40%)
- Fire icon color: Orange if streak > 0, Gray if streak = 0

---

### Step 8: HabitItem Component Update

**Changes:**
```javascript
// OLD
import { calculateHabitConsistency } from '../../utils/calculations';
const consistency = calculateHabitConsistency(habit, habitLogs, goal);

// NEW
import { getHabitCardMetrics } from '../../utils/goalAwareHabitUtils';
const metrics = getHabitCardMetrics(habit, habitLogs, goals);
```

**Display:**
```jsx
<Chip label={`${metrics.currentStreak} day streak`} />
<Chip label={`${metrics.thirtyDayConsistency}%`} />

<Typography>30-Day Consistency</Typography>
<LinearProgress value={metrics.thirtyDayConsistency} />

<Typography>{metrics.completed}/{metrics.expected} completed</Typography>
<Typography>Best streak: {metrics.bestStreak} days</Typography>
```

---

### Step 9: Today & Dashboard Alignment

**Today View:**
```javascript
// Filter habits scheduled for today AND linked to active goals
const todaysHabits = habits.filter(habit => {
  if (!isHabitScheduledForDate(habit, today)) return false;
  
  const linkedGoals = goals.filter(g => habit.goalIds.includes(g.id));
  return linkedGoals.some(goal => isGoalActive(goal, today));
});
```

**Dashboard:**
```javascript
// Use same utilities as Habit Card
const calculateOverallHabitConsistency = () => {
  const consistencies = habits.map(habit => {
    const { consistency } = calculateGoalAwareConsistency(habit, logs, goals, 30);
    return consistency;
  });
  return consistencies.reduce((sum, c) => sum + c, 0) / consistencies.length;
};
```

**Rules:**
- Today view shows habit only if `today ∈ goal timeline`
- Dashboard uses same metric calculations as Habit Card
- All components use `goalAwareHabitUtils.js`

---

### Step 10: End-to-End Verification

**Scenario:**
```javascript
Goal:
  Start: Feb 1, 2024
  End: Jun 30, 2024
  Duration: 150 days

Habit:
  Frequency: Daily
  Linked to goal above

Logs:
  110 completed out of 130 expected
  (20 days skipped/missed)
```

**Expected Output:**

**Habit Card Display:**
```
┌─────────────────────────────────────┐
│ 🔥 Read for 30 minutes              │
│ Goal: Read 24 Books                 │
│                                     │
│ [7 day streak 🔥] [85%]            │
│                                     │
│ 30-Day Consistency          85%     │
│ ████████████████████░░░░░░          │
│                                     │
│ 110/130 completed  Best streak: 21  │
└─────────────────────────────────────┘
```

**Metrics Breakdown:**
- **30-Day Consistency:** 85% (last 30 days within goal range)
- **Current Streak:** 7 days (consecutive completed days)
- **Best Streak:** 21 days (longest streak in goal timeline)
- **Completed/Expected:** 110/130 (overall progress)

---

## Key Benefits

✅ **Accurate Metrics** - All calculations respect goal timeline  
✅ **No Orphaned Data** - Logs outside goal range are ignored  
✅ **Consistent UI** - Same logic across all components  
✅ **Frequency-Aware** - Respects daily/weekly/specific days  
✅ **Streak Integrity** - Only scheduled days count  

---

## File Structure

```
src/
├── utils/
│   ├── goalAwareHabitUtils.js      # Core implementation (NEW)
│   ├── frequencyRules.js           # Scheduling logic (existing)
│   └── habitUtils.js               # Legacy (deprecated)
├── components/
│   ├── habits/
│   │   ├── HabitItem.js            # Updated to use new utils
│   │   └── HabitStreakSection.js  # Updated to use new utils
│   ├── dashboard/
│   │   └── Dashboard.js            # Updated to use new utils
│   └── today/
│       └── Today.js                # Already filters by goal timeline
└── data/
    └── goalAwareHabitExamples.js   # Verification examples (NEW)
```

---

## Migration Notes

**Old Approach:**
```javascript
// Calculated consistency without goal context
const consistency = calculateHabitConsistency(habit, logs, goal);
```

**New Approach:**
```javascript
// Goal-aware metrics with strict timeline enforcement
const metrics = getHabitCardMetrics(habit, logs, goals);
```

**Breaking Changes:**
- `calculateHabitConsistency` now requires `goals` array (not single `goal`)
- All metrics respect goal timeline boundaries
- Logs outside goal range are automatically filtered

---

## Testing

See `src/data/goalAwareHabitExamples.js` for:
- ✅ Daily habit examples
- ✅ Specific days (Mon/Wed/Fri) examples
- ✅ Mid-year goal examples
- ✅ Streak calculation examples
- ✅ UI display examples

---

## Quick Reference

| Function | Purpose | Returns |
|----------|---------|---------|
| `getHabitDateRange` | Get goal timeline | `{ startDate, endDate }` |
| `getExpectedHabitOccurrences` | Count scheduled days | `number` |
| `getCompletedHabitCount` | Count completed logs | `number` |
| `calculateGoalAwareConsistency` | 30-day rolling window | `{ consistency, completed, expected }` |
| `calculateOverallConsistency` | Full goal duration | `{ consistency, completed, expected }` |
| `getCurrentStreak` | Current consecutive days | `number` |
| `getBestStreak` | Longest streak ever | `number` |
| `getHabitCardMetrics` | All metrics for UI | `{ thirtyDayConsistency, completed, expected, currentStreak, bestStreak }` |

---

**Status:** ✅ Fully Implemented  
**Components Updated:** HabitItem, HabitStreakSection, Dashboard, Today  
**Files Created:** goalAwareHabitUtils.js, goalAwareHabitExamples.js
