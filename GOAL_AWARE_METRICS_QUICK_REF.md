# Goal-Aware Habit Metrics - Quick Reference

## 🎯 Core Concept

**Every habit metric is calculated within its linked goal's timeline.**

```
Habit logs outside goal.startDate → goal.endDate are IGNORED
```

---

## 📦 Import

```javascript
import {
  getHabitDateRange,
  getExpectedHabitOccurrences,
  getCompletedHabitCount,
  calculateGoalAwareConsistency,
  calculateOverallConsistency,
  getCurrentStreak,
  getBestStreak,
  getHabitCardMetrics
} from '../utils/goalAwareHabitUtils';
```

---

## 🔧 Functions

### 1. Get Habit Date Range

```javascript
const dateRange = getHabitDateRange(habit, goals);
// { startDate: Date, endDate: Date } or null
```

**Use:** Resolve goal timeline for a habit

---

### 2. Expected Occurrences

```javascript
const expected = getExpectedHabitOccurrences(habit, startDate, endDate);
// number
```

**Use:** Count scheduled days in range (respects frequency)

**Examples:**
- Daily habit, 30 days → 30
- Mon/Wed/Fri, 30 days → ~13
- Weekly (3×/week), 30 days → ~13

---

### 3. Completed Count

```javascript
const completed = getCompletedHabitCount(habitId, logs, startDate, endDate);
// number
```

**Use:** Count logs with `status === 'done'` in range

---

### 4. 30-Day Consistency

```javascript
const { consistency, completed, expected } = 
  calculateGoalAwareConsistency(habit, logs, goals, 30);
```

**Use:** Rolling 30-day window within goal timeline

**Display:** "30-Day Consistency: 85%"

---

### 5. Overall Consistency

```javascript
const { consistency, completed, expected } = 
  calculateOverallConsistency(habit, logs, goals);
```

**Use:** Full goal duration (startDate → endDate)

**Display:** "110 / 130 completed"

---

### 6. Current Streak

```javascript
const streak = getCurrentStreak(habit, logs, goals);
// number
```

**Use:** Consecutive scheduled days completed

**Display:** "7 day streak 🔥"

---

### 7. Best Streak

```javascript
const bestStreak = getBestStreak(habit, logs, goals);
// number
```

**Use:** Longest streak in goal timeline

**Display:** "Best streak: 21 days"

---

### 8. All Metrics (Recommended)

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

**Use:** Get all metrics in one call for UI display

---

## 🎨 UI Display Pattern

```jsx
import { getHabitCardMetrics } from '../../utils/goalAwareHabitUtils';

const HabitCard = ({ habit, logs, goals }) => {
  const metrics = getHabitCardMetrics(habit, logs, goals);
  
  return (
    <Card>
      {/* Chips */}
      <Chip label={`${metrics.currentStreak} day streak`} />
      <Chip label={`${metrics.thirtyDayConsistency}%`} />
      
      {/* Progress Bar */}
      <Typography>30-Day Consistency</Typography>
      <LinearProgress value={metrics.thirtyDayConsistency} />
      
      {/* Footer */}
      <Typography>
        {metrics.completed}/{metrics.expected} completed
      </Typography>
      <Typography>
        Best streak: {metrics.bestStreak} days
      </Typography>
    </Card>
  );
};
```

---

## 🎯 Common Patterns

### Pattern 1: Habit Card Display

```javascript
const metrics = getHabitCardMetrics(habit, logs, goals);

// Display:
// - 30-day consistency percentage
// - Current streak with fire icon
// - Completed/Expected ratio
// - Best streak
```

### Pattern 2: Dashboard Summary

```javascript
const avgConsistency = habits.map(habit => {
  const { consistency } = calculateGoalAwareConsistency(habit, logs, goals, 30);
  return consistency;
}).reduce((sum, c) => sum + c, 0) / habits.length;
```

### Pattern 3: Today View Filtering

```javascript
const todaysHabits = habits.filter(habit => {
  const linkedGoals = goals.filter(g => habit.goalIds.includes(g.id));
  return linkedGoals.some(goal => isGoalActive(goal, today));
});
```

---

## ⚠️ Important Rules

1. **Always pass `goals` array** (not single goal)
2. **Logs outside goal timeline are ignored**
3. **Streaks only count scheduled days**
4. **Non-scheduled days don't break streaks**
5. **Use `getHabitCardMetrics` for UI** (single call)

---

## 🧪 Test Scenarios

### Scenario 1: Daily Habit

```javascript
Habit: Daily
Goal: Feb 1 - Jun 30 (150 days)
Logs: 110 completed

Expected:
- 30-day consistency: ~85%
- Completed/Expected: 110/150
- Streaks: Varies based on pattern
```

### Scenario 2: Mon/Wed/Fri Habit

```javascript
Habit: Mon/Wed/Fri
Goal: Jan 1 - Jan 31 (31 days)
Logs: 10 completed

Expected:
- Expected occurrences: 13 (13 MWF in Jan)
- Consistency: 77% (10/13)
- Streaks: Only count MWF days
```

### Scenario 3: Mid-Year Goal

```javascript
Habit: Daily
Goal: Feb 1 - Jun 30
Logs: 
  - Jan 31: done (IGNORED - before goal)
  - Feb 1: done (COUNTED)
  - Jul 1: done (IGNORED - after goal)

Expected:
- Only Feb 1 log counts
```

---

## 🔄 Migration from Old Utils

### Before

```javascript
import { calculateHabitConsistency } from '../../utils/habitUtils';

const consistency = calculateHabitConsistency(habit, logs, goal);
// Returns: { consistency, completed, expected, currentStreak, longestStreak }
```

### After

```javascript
import { getHabitCardMetrics } from '../../utils/goalAwareHabitUtils';

const metrics = getHabitCardMetrics(habit, logs, goals);
// Returns: { thirtyDayConsistency, completed, expected, currentStreak, bestStreak }
```

**Key Differences:**
- Pass `goals` array instead of single `goal`
- Returns `thirtyDayConsistency` (30-day window)
- Returns `bestStreak` instead of `longestStreak`
- All calculations respect goal timeline

---

## 📊 Color Coding

```javascript
const getConsistencyColor = (value) => {
  if (value >= 80) return 'success.main';  // Green
  if (value >= 60) return 'primary.main';  // Blue
  if (value >= 40) return 'warning.main';  // Orange
  return 'error.main';                     // Red
};
```

---

## 🔥 Streak Icon Logic

```javascript
const streakColor = metrics.currentStreak > 0 ? 'warning.main' : 'grey.300';
const streakIcon = <LocalFireDepartment sx={{ color: streakColor }} />;
```

---

## ✅ Checklist

When implementing goal-aware metrics:

- [ ] Import from `goalAwareHabitUtils.js`
- [ ] Pass `goals` array (not single goal)
- [ ] Use `getHabitCardMetrics` for UI
- [ ] Display "30-Day Consistency" label
- [ ] Show completed/expected ratio
- [ ] Show best streak
- [ ] Apply color coding
- [ ] Test with mid-year goals
- [ ] Test with specific days frequency

---

## 📁 Files

- **Implementation:** `src/utils/goalAwareHabitUtils.js`
- **Examples:** `src/data/goalAwareHabitExamples.js`
- **Documentation:** `GOAL_AWARE_HABIT_METRICS.md`
- **This Guide:** `GOAL_AWARE_METRICS_QUICK_REF.md`

---

**Status:** ✅ Production Ready  
**Last Updated:** 2024
