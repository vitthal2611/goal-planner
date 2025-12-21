# Visual Consistency Map - All Screens

## Overview
This document shows how design patterns are consistently applied across Today, Dashboard, Goals, Habits, and Review screens.

---

## 1. Screen Headers

### Pattern
```jsx
<Box sx={{ mb: 6 }}>
  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1.5 }}>
    {screenTitle}
  </Typography>
  <Typography variant="body1" color="text.secondary">
    {description}
  </Typography>
</Box>
```

### Usage Across Screens
| Screen | Title | Description |
|--------|-------|-------------|
| Today | "Today" | "Track your daily habits and build consistency" |
| Dashboard | "Dashboard" | "Your progress overview" |
| Goals | "Goals" | "Manage your yearly objectives" |
| Habits | "Habits" | "Build daily routines" |
| Review | "Review" | "Reflect on your progress" |

**Consistency**: Same typography (H3), same spacing (mb: 6), same color scheme

---

## 2. Navigation Components

### Date Navigator (Today)
```jsx
<DateNavigator
  selectedDate={selectedDate}
  onDateChange={setSelectedDate}
  preventFuture={true}
/>
```

### Year Selector (Dashboard, Goals, Habits)
```jsx
<YearSelector
  selectedYear={selectedYear}
  onYearChange={setSelectedYear}
/>
```

**Consistency**: 
- Same icon buttons (ChevronLeft, ChevronRight)
- Same border style (1px solid divider)
- Same hover state (grey.100 bg, primary.main border)
- Same disabled state (grey.50 bg, opacity 0.5)
- Same center text styling (H6, fontWeight 600)

---

## 3. Summary Cards

### Dashboard
```jsx
<SummaryCard
  title="Yearly Progress"
  value="75%"
  subtitle="Average across all goals"
  color="success"
/>
```

### Today (Progress Card)
```jsx
<Card sx={{ border: '1px solid', borderColor: 'divider' }}>
  <CardContent>
    <Typography variant="h1">{completed}/{total}</Typography>
    <Typography variant="h2">{percentage}%</Typography>
    <LinearProgress value={percentage} />
  </CardContent>
</Card>
```

**Consistency**:
- Same card border (1px solid divider)
- Same padding (24px desktop, 20px mobile)
- Same hover effect (shadow, lift 2px)
- Same color usage (success for completed, primary for in-progress)
- Same typography scale (H1 for main value, H2 for secondary)

---

## 4. Section Headers

### Today (Time Groups)
```jsx
<SectionHeader
  title="Morning"
  icon={<WbSunny />}
  iconColor="warning.main"
  count="3/5"
  countColor="default"
/>
```

### Dashboard (Goal Progress)
```jsx
<SectionHeader
  title="Goal Progress"
  icon={<FlagOutlined />}
  iconColor="primary.main"
  count={goals.length}
/>
```

### Habits (Habit List)
```jsx
<SectionHeader
  title="Active Habits"
  icon={<RepeatOutlined />}
  iconColor="secondary.main"
  count={activeHabits.length}
/>
```

**Consistency**:
- Same layout (icon + title + count)
- Same icon size (28px desktop, 22px mobile)
- Same bottom border (2px solid grey.200)
- Same spacing (mb: 3, pb: 2)
- Same chip styling (fontWeight 600, minWidth 50)

---

## 5. Interactive Cards

### Today (Habit Card)
```jsx
<Card
  sx={{
    cursor: 'pointer',
    border: '1px solid',
    borderColor: isDone ? 'success.main' : 'divider',
    bgcolor: isDone ? 'success.50' : 'background.paper',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: 4,
      borderColor: isDone ? 'success.dark' : 'primary.main'
    },
    '&:active': {
      transform: 'scale(0.98)',
      transition: 'transform 0.1s'
    }
  }}
>
```

### Goals (Goal Card)
```jsx
<Card
  sx={{
    border: '1px solid',
    borderColor: isCompleted ? 'success.main' : 'divider',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: 4,
      borderColor: 'primary.main'
    }
  }}
>
```

### Habits (Habit Item)
```jsx
<Card
  sx={{
    border: '1px solid',
    borderColor: 'divider',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: 4,
      borderColor: 'primary.main'
    }
  }}
>
```

**Consistency**:
- Same border style (1px solid)
- Same transition timing (0.25s cubic-bezier)
- Same hover effect (lift 2px, shadow 4, border color change)
- Same active effect (scale 0.98, 0.1s transition)
- Same success state (green border, success.50 background)

---

## 6. Progress Indicators

### Dashboard (Circular)
```jsx
<ProgressRing
  value={75}
  size={120}
  color="success"
/>
```

### Today (Linear)
```jsx
<LinearProgress
  variant="determinate"
  value={75}
  sx={{
    height: 8,
    borderRadius: 10,
    bgcolor: 'grey.200',
    '& .MuiLinearProgress-bar': {
      bgcolor: 'success.main',
      borderRadius: 10
    }
  }}
/>
```

### Goals (Linear in Cards)
```jsx
<LinearProgress
  variant="determinate"
  value={progress}
  sx={{
    height: 8,
    borderRadius: 10,
    bgcolor: 'grey.200'
  }}
/>
```

**Consistency**:
- Same height (8px for linear)
- Same border radius (10px)
- Same background (grey.200)
- Same color logic (success for on-track, warning for behind, primary for neutral)

---

## 7. Checkboxes

### Today (Habit Completion)
```jsx
<Checkbox
  checked={isDone}
  icon={<RadioButtonUnchecked sx={{ fontSize: 28 }} />}
  checkedIcon={<CheckCircle sx={{ fontSize: 28 }} />}
  sx={{
    p: 1.5,
    minWidth: 48,
    minHeight: 48,
    '&:hover': { bgcolor: 'transparent' }
  }}
/>
```

### Habits (Habit Management)
```jsx
<Checkbox
  checked={isActive}
  icon={<RadioButtonUnchecked sx={{ fontSize: 28 }} />}
  checkedIcon={<CheckCircle sx={{ fontSize: 28 }} />}
  sx={{
    p: 1.5,
    minWidth: 48,
    minHeight: 48,
    '&:hover': { bgcolor: 'transparent' }
  }}
/>
```

**Consistency**:
- Same icons (RadioButtonUnchecked, CheckCircle)
- Same size (28px)
- Same touch target (48x48px)
- Same padding (12px)
- Same hover behavior (transparent background)

---

## 8. Chips

### Today (Status)
```jsx
<Chip label="Done" size="small" color="success" sx={{ fontWeight: 600 }} />
<Chip label="Skipped" size="small" sx={{ fontWeight: 600 }} />
```

### Dashboard (On Track)
```jsx
<Chip label="On Track" size="small" color="success" sx={{ fontWeight: 600 }} />
<Chip label="Behind" size="small" color="warning" sx={{ fontWeight: 600 }} />
```

### Goals (Status)
```jsx
<Chip label="Completed" size="small" color="success" sx={{ fontWeight: 600 }} />
<Chip label="Critical" size="small" color="error" sx={{ fontWeight: 600 }} />
```

**Consistency**:
- Same size (small)
- Same font weight (600)
- Same border radius (10px from theme)
- Same color mapping (success, warning, error)

---

## 9. Empty States

### Today
```jsx
<Card elevation={0} sx={{ 
  textAlign: 'center', 
  border: '2px dashed', 
  borderColor: 'divider', 
  bgcolor: 'grey.50' 
}}>
  <CardContent sx={{ py: 12, px: 4 }}>
    <Box sx={{ fontSize: '3rem', mb: 3, opacity: 0.6 }}>✨</Box>
    <Typography variant="h5" sx={{ mb: 2.5, fontWeight: 600 }}>
      Ready to start?
    </Typography>
    <Typography variant="body1" color="text.secondary">
      Create your first habit to begin tracking.
    </Typography>
  </CardContent>
</Card>
```

### Dashboard
```jsx
<Card elevation={0} sx={{ 
  textAlign: 'center', 
  border: '2px dashed', 
  borderColor: 'divider', 
  bgcolor: 'grey.50' 
}}>
  <CardContent sx={{ py: 12, px: 4 }}>
    <Box sx={{ fontSize: '3rem', mb: 3, opacity: 0.6 }}>🎯</Box>
    <Typography variant="h5" sx={{ mb: 2.5, fontWeight: 600 }}>
      No goals yet
    </Typography>
    <Typography variant="body1" color="text.secondary">
      Create your first goal to get started.
    </Typography>
  </CardContent>
</Card>
```

**Consistency**:
- Same border style (2px dashed)
- Same background (grey.50)
- Same padding (py: 12, px: 4)
- Same emoji size (3rem)
- Same typography (H5 title, body1 description)
- Same spacing (mb: 3 for emoji, mb: 2.5 for title)

---

## 10. Buttons

### Primary Actions
```jsx
<Button
  variant="contained"
  color="primary"
  sx={{
    borderRadius: 12,
    px: 3,
    py: 1.25,
    fontWeight: 500,
    textTransform: 'none'
  }}
>
  Create Goal
</Button>
```

### Secondary Actions
```jsx
<Button
  variant="outlined"
  color="primary"
  sx={{
    borderRadius: 12,
    px: 3,
    py: 1.25,
    fontWeight: 500,
    textTransform: 'none'
  }}
>
  Cancel
</Button>
```

**Consistency**:
- Same border radius (12px)
- Same padding (24px horizontal, 10px vertical)
- Same font weight (500)
- Same text transform (none)
- Same hover effect (shadow from theme)

---

## 11. Responsive Behavior

### Container Padding
```jsx
// All screens
<Container maxWidth="lg" sx={{ py: { xs: 0, sm: 5 }, px: { xs: 0, sm: 3 } }}>
```

### Card Padding
```jsx
// All screens
<CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
```

### Section Spacing
```jsx
// All screens
<Box sx={{ mb: { xs: 3, sm: 5 } }}>
```

### Typography Scaling
```jsx
// All screens
<Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', sm: '4rem' } }}>
```

**Consistency**:
- Same breakpoints (xs: 0-599px, sm: 600px+)
- Same padding reduction (24px → 16-20px)
- Same spacing reduction (40-56px → 24-32px)
- Same font size scaling

---

## 12. Color Usage Map

| Element | Color | Usage |
|---------|-------|-------|
| Primary actions | `primary.main` (#5B7C99) | Buttons, links, active states |
| Success states | `success.main` (#4CAF50) | Completed, on-track, positive |
| Warning states | `warning.main` (#FF9800) | Behind schedule, attention needed |
| Error states | `error.main` (#E57373) | Critical, destructive actions |
| Text primary | `text.primary` | Main content |
| Text secondary | `text.secondary` | Metadata, descriptions |
| Borders | `divider` | Card borders, dividers |
| Background | `background.paper` | Cards, surfaces |

**Consistency**: Same color for same purpose across all screens

---

## 13. Animation Timing

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| Card hover | 250ms | cubic-bezier(0.4, 0, 0.2, 1) | All interactive cards |
| Active state | 100ms | linear | Button/card press |
| Grow/Zoom | 300ms | ease-in-out | Component entrance |
| Fade | 300ms | ease-in-out | Screen transitions |

**Consistency**: Same timing for same interaction across all screens

---

## 14. Touch Targets (Mobile)

| Element | Size | Usage |
|---------|------|-------|
| Checkbox | 48x48px | Today, Habits |
| Icon button | 48x48px | Navigation, actions |
| Button | 44px min height | All buttons |
| Chip | 32px height | Status indicators |

**Consistency**: Meets accessibility standards (44-48px minimum)

---

## Summary

Every design decision is consistent across all screens:

✅ **Colors** - Same palette, same usage
✅ **Typography** - Same scale, same hierarchy
✅ **Spacing** - Same grid, same rhythm
✅ **Components** - Same patterns, same behavior
✅ **Interactions** - Same timing, same feedback
✅ **Responsive** - Same breakpoints, same adaptations
✅ **Accessibility** - Same standards, same targets

The app feels like a **unified, premium product** with a clear design language.
