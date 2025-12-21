# Component Architecture & Reusability Map

## Component Hierarchy

```
App.js
├── AuthProvider
├── YearProvider
└── AppProvider
    ├── Navigation (Top/Bottom)
    │   ├── Logo
    │   ├── Tab Navigation
    │   └── User Actions (Theme Toggle, Logout)
    │
    ├── Today Screen ⭐ REDESIGNED
    │   ├── DateNavigator 🆕
    │   │   ├── IconButton (Previous)
    │   │   ├── Date Display
    │   │   └── IconButton (Next)
    │   │
    │   ├── Progress Summary Card
    │   │   ├── Completion Numbers (H1)
    │   │   ├── Percentage (H2)
    │   │   ├── LinearProgress
    │   │   └── Motivational Message
    │   │
    │   └── Time Groups (4x)
    │       ├── SectionHeader 🆕
    │       │   ├── Icon
    │       │   ├── Title
    │       │   └── Count Chip
    │       │
    │       └── HabitCard[] (multiple)
    │           ├── Checkbox
    │           ├── Habit Info
    │           └── Status Chip
    │
    ├── Dashboard Screen
    │   ├── YearSelector
    │   ├── SummaryCard[] (3x) ♻️ REUSED
    │   ├── GoalProgressSection
    │   │   ├── SectionHeader 🆕 ♻️ REUSED
    │   │   └── GoalCard[]
    │   │       ├── ProgressRing
    │   │       └── LinearProgress
    │   │
    │   └── HabitStreakSection
    │       ├── SectionHeader 🆕 ♻️ REUSED
    │       └── HabitCard[] ♻️ REUSED
    │
    ├── Goals Screen
    │   ├── YearSelector
    │   ├── SectionHeader 🆕 ♻️ REUSED
    │   └── GoalCard[]
    │       ├── LinearProgress
    │       └── Status Chip
    │
    ├── Habits Screen
    │   ├── YearSelector
    │   ├── SectionHeader 🆕 ♻️ REUSED
    │   └── HabitCard[] ♻️ REUSED
    │       ├── Checkbox
    │       └── Goal Links
    │
    └── Review Screen
        ├── YearSelector
        ├── SectionHeader 🆕 ♻️ REUSED
        └── ReviewCard[]
            ├── SummaryCard[] ♻️ REUSED
            └── HabitCard[] ♻️ REUSED
```

---

## Component Reusability Matrix

| Component | Today | Dashboard | Goals | Habits | Review | Status |
|-----------|-------|-----------|-------|--------|--------|--------|
| **DateNavigator** | ✅ | ❌ | ❌ | ❌ | ❌ | 🆕 NEW |
| **YearSelector** | ❌ | ✅ | ✅ | ✅ | ✅ | ♻️ EXISTING |
| **SectionHeader** | ✅ | ✅ | ✅ | ✅ | ✅ | 🆕 NEW |
| **SummaryCard** | ✅ | ✅ | ❌ | ❌ | ✅ | ♻️ EXISTING |
| **HabitCard** | ✅ | ✅ | ❌ | ✅ | ✅ | ♻️ EXISTING |
| **ProgressRing** | ❌ | ✅ | ❌ | ❌ | ✅ | ♻️ EXISTING |
| **LinearProgress** | ✅ | ✅ | ✅ | ❌ | ✅ | ♻️ MUI |
| **Checkbox** | ✅ | ❌ | ❌ | ✅ | ❌ | ♻️ MUI |
| **Chip** | ✅ | ✅ | ✅ | ✅ | ✅ | ♻️ MUI |
| **Card** | ✅ | ✅ | ✅ | ✅ | ✅ | ♻️ MUI |

**Legend**:
- 🆕 NEW - Newly created component
- ♻️ EXISTING - Already exists, reused
- ✅ Used in this screen
- ❌ Not used in this screen

---

## Data Flow

```
Firebase Realtime Database
         ↓
    AuthContext
         ↓
    AppContext
    ├── goals[]
    ├── habits[]
    ├── logs[]
    └── methods:
        ├── logHabit()
        ├── updateGoal()
        └── updateHabit()
         ↓
    ┌────┴────┬────────┬────────┬────────┐
    ↓         ↓        ↓        ↓        ↓
  Today  Dashboard  Goals   Habits   Review
    ↓
DateNavigator → selectedDate
    ↓
Filter habits by:
  - isHabitScheduledForDate()
  - isGoalActive()
    ↓
Group by time of day
    ↓
Render HabitTimeGroup[]
    ↓
Render HabitCard[]
    ↓
User clicks checkbox
    ↓
logHabit(habitId, status, habit, dateStr)
    ↓
Update Firebase
    ↓
Real-time sync to all devices
```

---

## Component Dependencies

### DateNavigator
**Dependencies**:
- `@mui/material` (Box, IconButton, Typography, Chip)
- `@mui/icons-material` (ChevronLeft, ChevronRight)
- `date-fns` (format, addDays, subDays, isToday, isFuture)

**Props**:
- `selectedDate`: Date
- `onDateChange`: (date: Date) => void
- `preventFuture`: boolean (default: true)

**Used By**:
- Today screen

---

### SectionHeader
**Dependencies**:
- `@mui/material` (Box, Typography, Chip)

**Props**:
- `title`: string
- `icon`: ReactNode
- `iconColor`: string
- `count`: string | number
- `countColor`: 'default' | 'success' | 'warning' | 'error'
- `action`: ReactNode (optional)
- `sx`: object (optional)

**Used By**:
- Today screen (time groups)
- Dashboard screen (sections)
- Goals screen (goal list)
- Habits screen (habit list)
- Review screen (review sections)

---

### TodayEnhanced
**Dependencies**:
- `@mui/material` (Box, Container, Typography, Card, CardContent, Grid, LinearProgress)
- `@mui/icons-material` (WbSunny, LightMode, Brightness3, NightsStay, TrendingUp)
- `date-fns` (format, startOfDay)
- `DateNavigator` (custom)
- `SectionHeader` (custom)
- `HabitTimeGroup` (custom)
- `useAppContext` (context)
- `isHabitScheduledForDate` (util)
- `isGoalActive` (util)

**State**:
- `selectedDate`: Date
- `animatingHabit`: string | null

**Context**:
- `habits`: Habit[]
- `logs`: DailyLog[]
- `logHabit`: (habitId, status, habit, dateStr) => void
- `goals`: Goal[]

---

### HabitTimeGroup (Updated)
**Dependencies**:
- `@mui/material` (Box, Grid, Grow)
- `HabitCard` (custom)
- `SectionHeader` (custom) 🆕

**Props**:
- `label`: string
- `icon`: ReactNode
- `color`: string
- `habits`: Habit[]
- `logs`: DailyLog[]
- `dateStr`: string 🆕 (changed from formatDate)
- `onLogHabit`: (habitId, status) => void
- `animatingHabit`: string | null

---

### HabitCard (No Changes)
**Dependencies**:
- `@mui/material` (Card, CardContent, Checkbox, Chip, Box, Typography, Zoom)
- `@mui/icons-material` (CheckCircle, RadioButtonUnchecked)
- `getFrequencyLabel` (util)

**Props**:
- `habit`: Habit
- `log`: DailyLog | undefined
- `onToggle`: (habitId, currentStatus) => void
- `isAnimating`: boolean

---

## Shared Patterns

### 1. Navigation Pattern
```
DateNavigator (Today)
    ↕️ Same pattern
YearSelector (Dashboard, Goals, Habits, Review)
```

**Shared**:
- Icon buttons (ChevronLeft, ChevronRight)
- Center display
- Border style (1px solid divider)
- Hover state (grey.100 bg, primary.main border)
- Disabled state (grey.50 bg, opacity 0.5)

---

### 2. Section Header Pattern
```
SectionHeader
    ↓
Used in all screens for grouping
```

**Shared**:
- Icon + Title + Count layout
- Bottom border (2px solid grey.200)
- Icon size (28px desktop, 22px mobile)
- Chip styling (fontWeight 600, minWidth 50)

---

### 3. Card Pattern
```
Card (MUI)
    ↓
Used in all screens
```

**Shared**:
- Border (1px solid divider)
- Border radius (16px)
- Padding (24px desktop, 16-20px mobile)
- Hover (translateY(-2px), shadow 4, border color change)
- Active (scale(0.98), 0.1s transition)
- Transition (0.25s cubic-bezier)

---

### 4. Progress Pattern
```
LinearProgress (MUI)
    ↓
Used in Today, Dashboard, Goals, Review
```

**Shared**:
- Height (8px)
- Border radius (10px)
- Background (grey.200)
- Color logic (success/warning/primary)

---

### 5. Status Pattern
```
Chip (MUI)
    ↓
Used in all screens
```

**Shared**:
- Size (small)
- Font weight (600)
- Border radius (10px)
- Color mapping (success, warning, error, default)

---

## Theme Integration

```
theme.js (lightTheme, darkTheme)
    ↓
Defines:
    ├── palette (colors)
    ├── typography (scale)
    ├── shape (borderRadius)
    ├── spacing (8px grid)
    └── components (overrides)
        ├── MuiCard
        ├── MuiButton
        ├── MuiChip
        ├── MuiLinearProgress
        └── MuiCheckbox
    ↓
Used by all components via:
    - sx prop
    - theme tokens
    - useTheme() hook
```

---

## Consistency Enforcement

### 1. Color Usage
```
All components use theme tokens:
✅ color: 'primary.main'
❌ color: '#5B7C99'
```

### 2. Typography Usage
```
All components use variants:
✅ <Typography variant="h3">
❌ <Typography sx={{ fontSize: '1.5rem' }}>
```

### 3. Spacing Usage
```
All components use theme spacing:
✅ sx={{ mb: 3 }}
❌ sx={{ marginBottom: '24px' }}
```

### 4. Transition Usage
```
All components use consistent timing:
✅ transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
❌ transition: 'all 0.3s ease'
```

---

## Component Communication

```
User Action (Today Screen)
    ↓
Click checkbox on HabitCard
    ↓
HabitCard.onToggle(habitId, currentStatus)
    ↓
HabitTimeGroup.handleToggle(habitId, currentStatus)
    ↓
Today.handleLogHabit(habitId, status)
    ↓
AppContext.logHabit(habitId, status, habit, dateStr)
    ↓
Firebase Realtime Database
    ↓
Real-time listener updates
    ↓
AppContext state updates
    ↓
All components re-render with new data
    ↓
Progress card updates
HabitCard updates
SectionHeader count updates
```

---

## File Size Impact

| File | Size | Type |
|------|------|------|
| DateNavigator.js | ~1KB | New component |
| SectionHeader.js | ~0.5KB | New component |
| TodayEnhanced.js | ~3KB | New component |
| HabitTimeGroup.js | +0.2KB | Updated (added SectionHeader) |
| HabitCard.js | 0KB | No changes |
| **Total Impact** | **~4.7KB** | Minimal |

---

## Performance Considerations

### Optimizations
- `useMemo` for habit filtering (Today)
- Conditional rendering (empty states)
- Debounced animations (600ms)
- Efficient date calculations (date-fns)

### Re-render Triggers
- `selectedDate` change → Filter habits, re-render groups
- `logs` change → Update progress, re-render cards
- `habits` change → Re-filter, re-group, re-render
- `animatingHabit` change → Re-render single card

---

## Testing Strategy

### Unit Tests
- DateNavigator: Date navigation, disabled states
- SectionHeader: Rendering, props
- TodayEnhanced: Filtering, grouping, progress calculation
- HabitTimeGroup: Rendering, toggle logic
- HabitCard: Rendering, states, interactions

### Integration Tests
- Date navigation flow
- Habit completion flow
- Progress calculation
- Empty states
- Cross-screen consistency

### E2E Tests
- Complete user journey
- Multi-device sync
- Responsive behavior
- Accessibility

---

## Summary

This architecture ensures:
1. **Reusability** - Components used across multiple screens
2. **Consistency** - Same patterns everywhere
3. **Maintainability** - Centralized design decisions
4. **Scalability** - Easy to add new features
5. **Performance** - Optimized rendering
6. **Quality** - Clear structure, easy to test

The Today screen is now the heart of the app, built on a solid foundation of reusable, consistent components.
