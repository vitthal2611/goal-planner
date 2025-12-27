# Atomic Habits Tracker - Wireframes & Architecture

## Screen Layout

### 1. Today View (Primary Screen)
```
┌─────────────────────────────────────┐
│ Atomic Habits                    ☰  │
├─────────────────────────────────────┤
│                                     │
│ Today's Habits                      │
│                                     │
│ Morning                             │
│ ┌─────────────────────────────────┐ │
│ │ ☐ I am a person who walks...   │ │
│ │   🔗 After morning coffee       │ │
│ │   🕐 08:30  📍 Around block     │ │
│ │   🔥 5 day streak               │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Afternoon                           │
│ ┌─────────────────────────────────┐ │
│ │ ☑ I am a person who writes...   │ │
│ │   🔗 After lunch                │ │
│ │   🕐 13:30  📍 Desk             │ │
│ │   🔥 3 day streak               │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Evening                             │
│ ┌─────────────────────────────────┐ │
│ │ ☐ I am a person who reads...    │ │
│ │   🔗 Before bed                 │ │
│ │   🕐 21:00  📍 Bedroom          │ │
│ │   🔥 2 day streak               │ │
│ └─────────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│  Today    Dashboard              ➕  │
└─────────────────────────────────────┘
```

### 2. Dashboard View
```
┌─────────────────────────────────────┐
│ Atomic Habits                    ☰  │
├─────────────────────────────────────┤
│                                     │
│ Dashboard                           │
│                                     │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│ │ Today   │ │Consist. │ │ Active  │ │
│ │  75%    │ │  82%    │ │   4     │ │
│ │ Daily   │ │Building │ │Habits   │ │
│ │Complete │ │ rhythm  │ │         │ │
│ └─────────┘ └─────────┘ └─────────┘ │
│                                     │
│ 14-Day Consistency                  │
│ ████████████████░░░░ 82%            │
│ Building rhythm                     │
│                                     │
│ Current Streaks                     │
│ walks: 5 days  reads: 2 days        │
│ writes: 3 days  water: 7 days       │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ "You're building something      │ │
│ │  meaningful."                   │ │
│ └─────────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│  Today    Dashboard              ➕  │
└─────────────────────────────────────┘
```

### 3. Create Habit Dialog
```
┌─────────────────────────────────────┐
│ Create New Habit                 ✕  │
├─────────────────────────────────────┤
│                                     │
│ Habit Name                          │
│ ┌─────────────────────────────────┐ │
│ │ I am a person who...            │ │
│ └─────────────────────────────────┘ │
│ Use identity-based language         │
│ Need help with identity wording?    │
│                                     │
│ Trigger                             │
│ ┌─────────────────────────────────┐ │
│ │ After morning coffee            │ │
│ └─────────────────────────────────┘ │
│ Link to existing habit or event     │
│                                     │
│ ┌─────────────┐ ┌─────────────────┐ │
│ │ Time        │ │ Location        │ │
│ │ 09:00       │ │ Kitchen         │ │
│ └─────────────┘ └─────────────────┘ │
│                                     │
│ Frequency                           │
│ ┌─────────────────────────────────┐ │
│ │ Daily ▼                         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ℹ Keep it small: Start with habits │
│   that take 2 minutes or less      │
│                                     │
│           Cancel    Create Habit    │
└─────────────────────────────────────┘
```

## Component Architecture

```
AtomicHabitsTracker (Main Container)
├── HabitCreationDialog
├── TodayView
│   └── TimeSection (Morning/Afternoon/Evening)
│       └── HabitCard (with checkbox, streak, details)
└── Dashboard
    ├── MetricCard (Today %, Consistency, Active count)
    ├── ConsistencyProgress (14-day bar)
    ├── StreakChips (Current streaks)
    └── MotivationalMessage
```

## State Management

```javascript
// Core State
habits: AtomicHabit[]           // All habits
completions: HabitCompletion[]  // All completion records
currentView: 'today' | 'dashboard'

// Computed State (via AtomicMetrics)
groupedHabits: {
  Morning: HabitWithCompletion[],
  Afternoon: HabitWithCompletion[],
  Evening: HabitWithCompletion[]
}
dashboardSummary: {
  dailyCompletion: number,
  consistencyScore: number,
  consistencyLabel: string,
  habitStreaks: Array<{name, streak}>,
  motivationalMessage: string
}
```

## Data Models

### AtomicHabit
- id, name, trigger, time, location
- frequency: 'daily' | 'weekly'
- weeklyDays: number[] (for weekly habits)
- startDate, isActive, createdAt

### HabitCompletion  
- id, habitId, date, completed, completedAt

## Calculation Logic

### Daily Completion %
`(Completed Today ÷ Scheduled Today) × 100`

### Consistency Score (14-day)
`Average of daily completion % over 14 days`

### Habit Streak
`Consecutive scheduled days completed (per habit)`

### Labels (Non-punitive)
- 0-39%: "Getting started"
- 40-69%: "Building rhythm" 
- 70-89%: "Consistent"
- 90-100%: "Strong identity forming"

## Design Principles Applied

✅ **Identity-based habits**: "I am a person who..." format
✅ **Small & beginner-friendly**: 2-minute rule emphasis
✅ **Consistency over perfection**: Guilt-free metrics
✅ **Calm, minimal UI**: Clean cards, soft colors
✅ **Max 5 habits**: Focus constraint
✅ **No gamification**: No points, badges, levels
✅ **Mobile-first**: Touch-friendly, bottom navigation