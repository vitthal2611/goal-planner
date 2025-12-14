# 📅 Multi-Year Tracking Feature

## Overview

The Goal Planner now supports tracking goals and habits across multiple years. Users can view past performance, track current year progress, and plan for future years.

## Key Features

### 1. Year Selector
- **Location**: Top of every screen (below navigation)
- **UI**: Chip-based selector with visual indicators
- **Years Available**: 2 years back, current year, 2 years forward
- **Visual Cues**:
  - Current year: Primary color with "(Active)" label
  - Past years: Default color with "📖 Viewing past year (read-only)" message
  - Future years: Secondary color with "📅 Planning future year" message

### 2. Year-Aware Data Models

#### Goal Model
```javascript
{
  id: string,
  title: string,
  yearlyTarget: number,
  actualProgress: number,
  unit: string,
  year: number,              // NEW: Year this goal belongs to
  startDate: Date,
  endDate: Date,
  createdAt: Date,
  monthlyData: {},
  monthlyTargets: {}
}
```

#### Habit Model
```javascript
{
  id: string,
  name: string,
  goalIds: string[],
  trigger: string,
  time: string,
  location: string,
  frequency: string,
  isActive: boolean,
  startYear: number,         // NEW: Year this habit started
  createdAt: Date
}
```

#### DailyLog Model
```javascript
{
  id: string,
  habitId: string,
  date: string,              // Date automatically determines year
  status: 'done' | 'skipped',
  notes: string,
  loggedAt: Date
}
```

### 3. Year Context

The `YearContext` provides:
- `selectedYear`: Currently selected year
- `setSelectedYear`: Function to change year
- `currentYear`: The actual current year
- `isCurrentYear`: Boolean - is selected year the current year?
- `isPastYear`: Boolean - is selected year in the past?
- `isFutureYear`: Boolean - is selected year in the future?
- `isReadOnly`: Boolean - should forms be disabled? (true for past years)

### 4. Data Filtering

All data is automatically filtered by selected year:
- **Goals**: Only goals where `goal.year === selectedYear`
- **Habits**: Only habits where `habit.startYear <= selectedYear`
- **Logs**: Only logs where `log.date` year matches `selectedYear`

### 5. Plan Next Year Feature

**Location**: Goals screen (top right, only visible for current year)

**Functionality**:
1. Click "Plan Next Year" button
2. Dialog shows all current goals and habits with checkboxes
3. Select which goals/habits to copy to next year
4. Click "Create Plan for [Next Year]"
5. New goals and habits are created with:
   - New IDs
   - Year set to next year
   - Progress reset to 0
   - Streaks reset
   - Goal links preserved

**Example**:
```javascript
// Current year goal
{
  id: 'goal-1',
  title: 'Read 24 books',
  year: 2025,
  actualProgress: 8
}

// After planning next year
{
  id: 'goal-new-1',
  title: 'Read 24 books',
  year: 2026,
  actualProgress: 0  // Reset
}
```

## User Workflows

### Viewing Past Year Performance
1. Click on a past year chip (e.g., 2023)
2. Dashboard shows completed metrics
3. Goals screen shows final progress (read-only)
4. Habits screen shows habits from that year
5. Forms are hidden (no editing allowed)

### Tracking Current Year
1. Default view on app load
2. All features enabled
3. Can add/edit/delete goals and habits
4. Can log daily habits
5. "Plan Next Year" button visible

### Planning Future Year
1. Click on future year chip (e.g., 2026)
2. Can create new goals for that year
3. Can create new habits for that year
4. Dashboard shows planning mode
5. No daily logs (year hasn't started)

### Planning Next Year from Current
1. On current year, click "Plan Next Year"
2. Select goals/habits to continue
3. System creates copies for next year
4. Switch to next year to view/edit plan

## Implementation Details

### File Structure
```
src/
├── context/
│   ├── YearContext.js          # Year state management
│   └── AppContext.js           # Updated with year filtering
├── components/
│   └── common/
│       ├── YearSelector.js     # Year switcher UI
│       └── PlanNextYear.js     # Copy to next year dialog
├── models/
│   ├── Goal.js                 # Updated with year field
│   └── Habit.js                # Updated with startYear field
└── data/
    └── sampleData.js           # Multi-year sample data
```

### Key Code Patterns

#### Using Year Context
```javascript
import { useYear } from '../../context/YearContext';

const MyComponent = () => {
  const { selectedYear, isReadOnly, isCurrentYear } = useYear();
  
  return (
    <>
      {!isReadOnly && <CreateForm />}
      {isCurrentYear && <PlanNextYearButton />}
    </>
  );
};
```

#### Creating Year-Aware Goals
```javascript
const newGoal = {
  id: generateId(),
  title: 'Read 24 books',
  year: selectedYear,  // Use selected year
  startDate: new Date(selectedYear, 0, 1),
  endDate: new Date(selectedYear, 11, 31),
  // ... other fields
};
```

#### Filtering by Year
```javascript
// In AppContext
const yearFilteredGoals = useMemo(() => 
  goals.filter(g => g.year === selectedYear),
  [goals, selectedYear]
);
```

## Sample Data

The app includes multi-year sample data:

### Current Year (2025)
- 4 goals (books, exercise, vocabulary, savings)
- 5 habits linked to goals
- 30 days of logs

### Past Year (2024)
- 1 completed goal (Read 20 books - 100% complete)

### Future Year (2026)
- 1 planned goal (Read 30 books - 0% progress)
- 1 planned habit (Read for 45 minutes)

## UX Principles

1. **Instant Switching**: Year changes feel immediate (no page reload)
2. **Clear Visual Cues**: Always know which year you're viewing
3. **Read-Only Past**: Can't modify historical data
4. **Easy Planning**: One-click copy to next year
5. **Preserved Context**: Habits can span multiple years

## Future Enhancements

- Year comparison view (side-by-side)
- Multi-year trends and analytics
- Bulk year operations
- Year templates
- Archive old years

## Testing Checklist

- [ ] Switch between years - data updates correctly
- [ ] Create goal in future year - appears only in that year
- [ ] Create habit in current year - appears in current and future years
- [ ] Past year shows read-only forms
- [ ] Plan next year copies selected items correctly
- [ ] Goal links preserved when copying to next year
- [ ] Dashboard metrics calculate correctly per year
- [ ] Today screen shows only current year habits

## Migration Notes

Existing data without `year` or `startYear` fields will automatically:
- Goals: Use year from `startDate`
- Habits: Use year from `createdAt`

This ensures backward compatibility with existing data.
