# UX Code Examples

## Complete Component Examples

### 1. Empty State Variations

#### No Goals Created
```jsx
<EmptyState
  icon="🎯"
  title="Ready to set your goals?"
  message="Create your first goal to start tracking your yearly progress."
/>
```

#### No Habits Today
```jsx
<EmptyState
  icon="☀️"
  title="All clear for today"
  message="You don't have any habits scheduled for this time."
/>
```

#### All Habits Completed
```jsx
<EmptyState
  icon="🎉"
  title="Amazing work!"
  message="You've completed all your habits for today. Keep up the great momentum!"
/>
```

### 2. Progress Card with Celebration

```jsx
const completedToday = 5;
const totalHabits = 5;
const allCompleted = completedToday === totalHabits && totalHabits > 0;

<Card 
  sx={{ 
    mb: 5, 
    bgcolor: allCompleted ? 'success.50' : 'primary.50',
    borderRadius: 3,
    transition: 'all 0.3s ease'
  }}
>
  <CardContent sx={{ p: 4 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box>
        <Typography 
          variant="h1" 
          sx={{ 
            fontWeight: 700, 
            color: allCompleted ? 'success.main' : 'primary.main',
            mb: 1
          }}
        >
          {completedToday}/{totalHabits}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {allCompleted ? '🎉 All habits completed!' : 'Habits completed today'}
        </Typography>
      </Box>
    </Box>
  </CardContent>
</Card>
```

### 3. Interactive Habit Card

```jsx
<Card 
  sx={{ 
    cursor: 'pointer',
    bgcolor: isDone ? 'success.50' : 'background.paper',
    border: '2px solid',
    borderColor: isDone ? 'success.main' : 'grey.200',
    borderRadius: 2.5,
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': { 
      borderColor: isDone ? 'success.dark' : 'primary.light',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    },
    '&:active': {
      transform: 'scale(0.98)'
    }
  }}
  onClick={handleToggle}
>
  <CardContent sx={{ p: 2.5 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 48 }}>
      <Checkbox
        checked={isDone}
        icon={<RadioButtonUnchecked sx={{ fontSize: 28 }} />}
        checkedIcon={<CheckCircle sx={{ fontSize: 28 }} />}
        sx={{ mr: 2, p: 1.5 }}
      />
      <Box sx={{ flex: 1 }}>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
          Morning Meditation
        </Typography>
        <Typography variant="caption" color="text.secondary">
          After waking up • 7:00 AM • Bedroom
        </Typography>
      </Box>
      {isDone && <Chip label="Done" size="small" color="success" />}
    </Box>
  </CardContent>
</Card>
```

### 4. Section Header with Visual Anchor

```jsx
<Box 
  sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    mb: 3,
    pb: 2,
    borderBottom: '2px solid',
    borderColor: 'grey.200'
  }}
>
  <Box sx={{ color: 'warning.main', mr: 1.5, fontSize: 28 }}>
    <WbSunny />
  </Box>
  <Typography variant="h3" sx={{ fontWeight: 600, flex: 1 }}>
    Morning
  </Typography>
  <Chip 
    label="2/3"
    size="medium"
    color={allCompleted ? 'success' : 'default'}
    sx={{ fontWeight: 600, height: 32 }}
  />
</Box>
```

### 5. Animated Section Transition

```jsx
const [currentTab, setCurrentTab] = useState(0);

<Fade in={true} timeout={300} key={currentTab}>
  <Box>
    {currentTab === 0 && <Today />}
    {currentTab === 1 && <Dashboard />}
    {currentTab === 2 && <Goals />}
  </Box>
</Fade>
```

### 6. Progress Bar with Status Colors

```jsx
const monthlyPercentage = 75;

<LinearProgress
  variant="determinate"
  value={Math.min(monthlyPercentage, 100)}
  sx={{ 
    height: 10, 
    borderRadius: 5,
    backgroundColor: 'grey.100',
    '& .MuiLinearProgress-bar': {
      backgroundColor: monthlyPercentage >= 80 ? 'success.main' : 'primary.main',
      borderRadius: 5,
      transition: 'all 0.3s ease'
    }
  }}
/>
```

### 7. Summary Card with Uppercase Label

```jsx
<Card sx={{ height: '100%', borderRadius: 3 }}>
  <CardContent sx={{ p: 3 }}>
    <Typography 
      variant="body2" 
      color="text.secondary" 
      sx={{ 
        mb: 2,
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        fontSize: '0.75rem'
      }}
    >
      Yearly Progress
    </Typography>
    <Typography variant="h2" color="success.main" sx={{ mb: 1.5, fontWeight: 700 }}>
      68%
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Average across all goals
    </Typography>
  </CardContent>
</Card>
```

### 8. Responsive Grid Layout

```jsx
<Grid container spacing={3}>
  <Grid item xs={12} sm={6} md={4}>
    <SummaryCard title="Progress" value="68%" color="success" />
  </Grid>
  <Grid item xs={12} sm={6} md={4}>
    <SummaryCard title="Target" value="12/20" color="primary" />
  </Grid>
  <Grid item xs={12} sm={6} md={4}>
    <SummaryCard title="Consistency" value="85%" color="success" />
  </Grid>
</Grid>
```

### 9. Habit Streak Display

```jsx
<Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
  <LocalFireDepartment 
    sx={{ 
      fontSize: 18, 
      mr: 0.5, 
      color: currentStreak > 0 ? 'warning.main' : 'grey.400' 
    }} 
  />
  <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700 }}>
    {currentStreak}
  </Typography>
</Box>
<Typography variant="caption" color="text.secondary">
  {consistency}% consistent
</Typography>
```

### 10. Theme Toggle with Animation

```jsx
<IconButton 
  color="inherit" 
  onClick={() => setDarkMode(!darkMode)}
  sx={{ 
    transition: 'transform 0.3s ease',
    '&:hover': { transform: 'rotate(180deg)' }
  }}
>
  {darkMode ? <Brightness7 /> : <Brightness4 />}
</IconButton>
```

## Common Patterns

### Pattern: Card with Hover Effect
```jsx
<Card 
  sx={{ 
    borderRadius: 3,
    transition: 'all 0.25s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }
  }}
>
```

### Pattern: Status-Based Border
```jsx
<Card 
  sx={{ 
    border: '2px solid',
    borderColor: isDone ? 'success.main' : isSkipped ? 'grey.300' : 'grey.200'
  }}
>
```

### Pattern: Responsive Padding
```jsx
<Container sx={{ py: { xs: 3, sm: 4 }, px: { xs: 2, sm: 3 } }}>
```

### Pattern: Flex Layout with Gap
```jsx
<Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
```

### Pattern: Conditional Color
```jsx
<Typography 
  variant="h2" 
  sx={{ 
    color: value >= 80 ? 'success.main' : value >= 50 ? 'primary.main' : 'warning.main'
  }}
>
```

## Animation Patterns

### Fade In on Mount
```jsx
<Fade in={true} timeout={300}>
  <Box>{content}</Box>
</Fade>
```

### Grow In List Items
```jsx
{items.map((item, index) => (
  <Grow in={true} timeout={300} style={{ transitionDelay: `${index * 50}ms` }}>
    <div key={item.id}>
      <ItemCard item={item} />
    </div>
  </Grow>
))}
```

### Scale on Click
```jsx
const [isAnimating, setIsAnimating] = useState(false);

const handleClick = () => {
  setIsAnimating(true);
  setTimeout(() => setIsAnimating(false), 300);
  // ... rest of logic
};

<Box sx={{ 
  transform: isAnimating ? 'scale(1.02)' : 'scale(1)',
  transition: 'transform 0.3s ease'
}}>
```

### Slide In from Bottom
```jsx
<Slide direction="up" in={true} timeout={300}>
  <Box>{content}</Box>
</Slide>
```

## Accessibility Examples

### Proper Heading Hierarchy
```jsx
<Box>
  <Typography variant="h1">Dashboard</Typography>
  <Box sx={{ mt: 4 }}>
    <Typography variant="h2">Goal Progress</Typography>
    <Typography variant="h3">Monthly Targets</Typography>
  </Box>
</Box>
```

### Keyboard Navigation
```jsx
<Card 
  tabIndex={0}
  role="button"
  onKeyPress={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
  onClick={handleClick}
>
```

### ARIA Labels
```jsx
<IconButton 
  aria-label="Toggle dark mode"
  onClick={toggleDarkMode}
>
  <Brightness4 />
</IconButton>
```

### Focus Indicators
```jsx
<Button 
  sx={{ 
    '&:focus-visible': {
      outline: '2px solid',
      outlineColor: 'primary.main',
      outlineOffset: 2
    }
  }}
>
```

## Mobile-First Examples

### Responsive Typography
```jsx
<Typography 
  variant="h1" 
  sx={{ 
    fontSize: { xs: '2rem', sm: '2.5rem' },
    mb: { xs: 2, sm: 3 }
  }}
>
```

### Touch-Friendly Buttons
```jsx
<Button 
  sx={{ 
    minHeight: 48,
    minWidth: 48,
    px: 3,
    py: 1.5
  }}
>
```

### Responsive Grid
```jsx
<Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
  <Grid item xs={12} sm={6} md={4} lg={3}>
```

### Stack on Mobile
```jsx
<Box sx={{ 
  display: 'flex', 
  flexDirection: { xs: 'column', sm: 'row' },
  gap: 2 
}}>
```

## Error States

### Form Error
```jsx
<TextField
  error={hasError}
  helperText={hasError ? "Please enter a valid value" : ""}
  sx={{
    '& .MuiFormHelperText-root': {
      color: 'error.main'
    }
  }}
/>
```

### Failed Load State
```jsx
<EmptyState
  icon="⚠️"
  title="Unable to load data"
  message="Please check your connection and try again."
  action={
    <Button variant="contained" onClick={retry}>
      Retry
    </Button>
  }
/>
```

## Loading States

### Skeleton Card
```jsx
<Card sx={{ borderRadius: 3 }}>
  <CardContent sx={{ p: 3 }}>
    <Skeleton variant="text" width="60%" height={32} />
    <Skeleton variant="text" width="40%" height={24} sx={{ mt: 1 }} />
    <Skeleton variant="rectangular" height={100} sx={{ mt: 2, borderRadius: 2 }} />
  </CardContent>
</Card>
```

### Loading Button
```jsx
<Button 
  variant="contained" 
  disabled={isLoading}
  startIcon={isLoading ? <CircularProgress size={20} /> : null}
>
  {isLoading ? 'Saving...' : 'Save'}
</Button>
```
