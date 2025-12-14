# Habit Metrics Aligned to Goal Date Boundaries

## Overview
All habit metrics now calculate within the parent goal's `startDate` and `endDate` boundaries. Habits no longer use arbitrary 30-day windows or calendar year defaults.

---

## Calculation Rules

### 1. **Consistency**
```
consistency = (completed_logs / expected_days) × 100

Where:
- completed_logs = count of logs with status='done' within [goal.startDate, goal.endDate]
- expected_days = days elapsed from goal.startDate to min(today, goal.endDate)
- Logs outside the goal's date range are IGNORED
```

**Example:**
- Goal: Jan 1 - Dec 31, 2024
- Today: March 15, 2024
- Habit logs: 60 'done' logs from Jan 1 - Mar 15
- Expected days: 75 days (Jan 1 to Mar 15)
- Consistency: (60 / 75) × 100 = 80%

### 2. **Current Streak**
```
Current Streak Rules:
1. Start from min(today, goal.endDate)
2. Count consecutive 'done' logs backwards
3. Stop at first missing day or 'skipped' status
4. Cannot go before goal.startDate
5. Only count logs within [goal.startDate, goal.endDate]
```

**Example:**
- Goal: Jan 1 - Dec 31, 2024
- Today: March 15, 2024
- Logs: 'done' for Mar 15, 14, 13, 12, 11, 10, 9
- Current Streak: 7 days

### 3. **Longest Streak**
```
Longest Streak Rules:
1. Find longest consecutive 'done' sequence
2. Only consider logs within [goal.startDate, goal.endDate]
3. Logs outside this range are IGNORED
4. Consecutive = difference of 1 day between logs
```

**Example:**
- Goal: Jan 1 - Dec 31, 2024
- Best streak in Feb: 14 consecutive days
- Best streak in Mar: 10 consecutive days
- Longest Streak: 14 days

### 4. **Completed vs Expected Counts**
```
completed = count of 'done' logs in [goal.startDate, min(today, goal.endDate)]
expected = days_elapsed from goal.startDate to min(today, goal.endDate)
skipped = count of 'skipped' logs in range
missed = expected - (completed + skipped)
```

**Example:**
- Goal: Jan 1 - Dec 31, 2024
- Today: March 15, 2024
- Completed: 60 days
- Skipped: 5 days
- Expected: 75 days
- Missed: 75 - (60 + 5) = 10 days

---

## Implementation Changes

### Files Modified

#### 1. **habitUtils.js**
- `calculateHabitConsistency(habit, logs, goal)` - Now requires `goal` parameter
- `calculateCurrentStreak(habit, logs, goal)` - Now requires `goal` parameter
- `calculateLongestStreak(habit, logs, goal)` - Now requires `goal` parameter
- `getHabitStatus(habit, logs, goal)` - Now requires `goal` parameter
- `calculateGoalHabitAlignment(goal, habits, logs)` - Now accepts `goal` object instead of `goalId`

#### 2. **calculations.js**
- `calculateHabitConsistency(habit, logs, goal)` - Updated to use goal boundaries
- `calculateCurrentStreak(logs, goal)` - Updated to use goal boundaries
- `calculateLongestStreak(logs, goal)` - Updated to use goal boundaries

#### 3. **Component Updates**
All components now pass the `goal` parameter when calling habit calculation functions:

- `HabitItem.js` - Passes `goal` to `calculateHabitConsistency`
- `Dashboard.js` - Finds goal for each habit before calculating
- `DashboardScreen.js` - Finds goal for each habit before calculating
- `EnhancedDashboard.jsx` - Finds goal for each habit before calculating
- `HabitStreakSection.js` - Uses `useAppContext` to access goals
- `Review.js` - Finds goal for each habit in both insight and stats calculations
- `reviewUtils.js` - Finds goal for each habit when generating reviews

---

## Key Benefits

### 1. **Accurate Progress Tracking**
- Habits are measured against the actual goal timeline
- No more misleading metrics from arbitrary 30-day windows

### 2. **Fair Comparisons**
- All habits linked to the same goal use the same date range
- Consistency percentages are comparable across habits

### 3. **Proper Streak Calculation**
- Streaks cannot extend before the goal started
- Streaks are bounded by the goal's end date
- Historical logs outside the goal period don't affect current metrics

### 4. **Clear Expectations**
- "Expected days" matches the goal's actual duration
- Users see progress relative to their goal timeline, not calendar year

---

## Migration Notes

### Breaking Changes
- All calls to `calculateHabitConsistency` now require a `goal` parameter
- If no goal is found, functions return zero/empty metrics gracefully

### Backward Compatibility
- Functions check for `goal` existence and return safe defaults if missing
- No database schema changes required
- Existing logs remain valid

---

## Example Usage

```javascript
// OLD (incorrect - uses arbitrary 30 days)
const consistency = calculateHabitConsistency(habit, logs, 30);

// NEW (correct - uses goal boundaries)
const goal = goals.find(g => habit.goalIds.includes(g.id));
const consistency = calculateHabitConsistency(habit, logs, goal);
```

---

## Testing Scenarios

### Scenario 1: Mid-Year Goal
- Goal: June 1 - Dec 31, 2024
- Habit created: June 1
- Logs before June 1: IGNORED
- Expected days on July 1: 30 days (June 1-30)

### Scenario 2: Past Goal
- Goal: Jan 1 - Dec 31, 2023
- Today: March 15, 2024
- Effective end date: Dec 31, 2023 (not today)
- All metrics calculated within 2023 only

### Scenario 3: Future Goal
- Goal: Jan 1 - Dec 31, 2025
- Today: March 15, 2024
- Expected days: 0 (goal hasn't started)
- Consistency: 0%

---

## Summary

✅ Habits inherit `startDate` and `endDate` from linked goals  
✅ All metrics ignore logs outside goal date range  
✅ Streaks bounded by goal timeline  
✅ Expected counts match goal duration  
✅ No more calendar year defaults  
✅ Accurate, fair, and meaningful metrics
