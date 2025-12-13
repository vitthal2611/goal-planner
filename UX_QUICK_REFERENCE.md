# UX Quick Reference Guide

## 🎨 When to Use What

### Typography
```jsx
// Screen titles (Today, Dashboard, Goals)
<Typography variant="h1">Screen Title</Typography>

// Major sections (Goal Progress, Habit Streaks)
<Typography variant="h2">Section Header</Typography>

// Subsections (Monthly Progress, Weekly Review)
<Typography variant="h3">Subsection</Typography>

// Card titles, smaller headers
<Typography variant="h4">Card Title</Typography>

// Main content, habit names
<Typography variant="body1">Main Content</Typography>

// Metadata (time, location, trigger)
<Typography variant="caption">Metadata</Typography>
```

### Spacing
```jsx
// Between major sections
sx={{ mb: 5 }}

// Between cards in a section
sx={{ mb: 3 }}

// Between elements in a card
sx={{ mb: 2 }}

// Card padding
sx={{ p: 4 }}  // Large cards
sx={{ p: 3 }}  // Medium cards
sx={{ p: 2.5 }} // Small cards
```

### Colors for States
```jsx
// Success/Completed
bgcolor: 'success.50'
borderColor: 'success.main'
color: 'success.main'

// In Progress/Active
bgcolor: 'primary.50'
borderColor: 'primary.main'
color: 'primary.main'

// Warning/Behind Schedule
bgcolor: 'warning.50'
borderColor: 'warning.main'
color: 'warning.main'

// Skipped/Inactive
bgcolor: 'grey.100'
borderColor: 'grey.300'
color: 'text.secondary'
```

### Card Styles
```jsx
// Standard card
<Card sx={{ borderRadius: 3 }}>
  <CardContent sx={{ p: 4 }}>
    {/* content */}
  </CardContent>
</Card>

// Interactive card with hover
<Card sx={{ 
  borderRadius: 3,
  transition: 'all 0.25s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  }
}}>
```

### Buttons
```jsx
// Primary action
<Button variant="contained" size="large">
  Primary Action
</Button>

// Secondary action
<Button variant="outlined" size="medium">
  Secondary
</Button>

// Tertiary action
<Button variant="text" size="small">
  Tertiary
</Button>
```

### Empty States
```jsx
import { EmptyState } from '../common/EmptyState';

<EmptyState
  icon="✨"
  title="Ready to start?"
  message="Create your first goal to begin tracking."
/>
```

### Animations
```jsx
// Fade in sections
<Fade in={true} timeout={300}>
  <Box>{/* content */}</Box>
</Fade>

// Grow in items
<Grow in={true} timeout={300}>
  <div>{/* content */}</div>
</Grow>

// Zoom in elements
<Zoom in={true} timeout={300}>
  <IconButton>{/* icon */}</IconButton>
</Zoom>
```

### Responsive Design
```jsx
// Container padding
<Container sx={{ py: { xs: 3, sm: 4 }, px: { xs: 2, sm: 3 } }}>

// Grid breakpoints
<Grid container spacing={3}>
  <Grid item xs={12} sm={6} md={4}>
    {/* content */}
  </Grid>
</Grid>

// Responsive typography
<Typography variant="h1" sx={{ fontSize: { xs: '2rem', sm: '2.5rem' } }}>
```

## 🎯 Common Patterns

### Section Header
```jsx
<Box sx={{ mb: 5 }}>
  <Typography variant="h1" sx={{ mb: 1 }}>
    Section Title
  </Typography>
  <Typography variant="body1" color="text.secondary">
    Section description
  </Typography>
</Box>
```

### Summary Card
```jsx
<SummaryCard
  title="Card Title"
  value="42"
  subtitle="Description"
  color="success" // or 'primary', 'warning', 'error'
/>
```

### Time Group Header
```jsx
<Box sx={{ 
  display: 'flex', 
  alignItems: 'center', 
  mb: 3,
  pb: 2,
  borderBottom: '2px solid',
  borderColor: 'grey.200'
}}>
  <Box sx={{ color: 'primary.main', mr: 1.5, fontSize: 28 }}>
    <Icon />
  </Box>
  <Typography variant="h3" sx={{ flex: 1 }}>
    Time Period
  </Typography>
  <Chip label="2/5" color="default" />
</Box>
```

### Interactive Card
```jsx
<Card 
  sx={{ 
    cursor: 'pointer',
    borderRadius: 2.5,
    border: '2px solid',
    borderColor: 'grey.200',
    transition: 'all 0.25s ease',
    '&:hover': {
      borderColor: 'primary.light',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    },
    '&:active': {
      transform: 'scale(0.98)'
    }
  }}
  onClick={handleClick}
>
```

## ⚡ Performance Tips

1. **Use CSS transitions** instead of JS animations
2. **Batch state updates** to avoid multiple re-renders
3. **Memoize expensive calculations** with useMemo
4. **Use proper keys** in lists for efficient reconciliation
5. **Lazy load** heavy components with React.lazy()

## ♿ Accessibility Checklist

- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Minimum 48x48px tap targets
- [ ] Color contrast ratio ≥ 4.5:1 for text
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] ARIA labels on icons
- [ ] Alt text on images
- [ ] Semantic HTML elements

## 🎨 Color Palette Quick Reference

### Light Mode
- Primary: `#6B7FD7` (Soft blue)
- Success: `#5FB878` (Gentle green)
- Warning: `#F0AD4E` (Warm amber)
- Error: `#E8927C` (Soft coral)
- Background: `#FAFBFC`
- Paper: `#FFFFFF`
- Text Primary: `#1A2332`
- Text Secondary: `#6B7684`

### Dark Mode
- Primary: `#8B9FE8`
- Success: `#6FCC84`
- Warning: `#F5BD6E`
- Error: `#F0A28C`
- Background: `#0F1419`
- Paper: `#1A2332`
- Text Primary: `#E8EAED`
- Text Secondary: `#9CA3AF`

## 📏 Spacing Scale

| Name | Value | Usage |
|------|-------|-------|
| 0.5 | 4px | Tight spacing |
| 1 | 8px | Small gaps |
| 1.5 | 12px | Medium gaps |
| 2 | 16px | Standard spacing |
| 2.5 | 20px | Card padding |
| 3 | 24px | Section spacing |
| 4 | 32px | Large card padding |
| 5 | 40px | Major section spacing |

## 🔄 Transition Timing

| Duration | Usage |
|----------|-------|
| 150ms | Micro-interactions (hover) |
| 200ms | Button states |
| 250ms | Card animations |
| 300ms | Section transitions |
| 400ms | Major layout changes |

## 💡 Pro Tips

1. **Always use theme spacing**: `sx={{ p: 3 }}` not `sx={{ padding: '24px' }}`
2. **Prefer theme colors**: `color="primary.main"` not `color="#6B7FD7"`
3. **Use semantic variants**: `variant="h2"` not `fontSize="1.75rem"`
4. **Mobile-first**: Start with `xs` breakpoint, add larger as needed
5. **Consistent transitions**: Use `transition: 'all 0.25s ease'` pattern
6. **Hover states**: Always provide visual feedback on interactive elements
7. **Empty states**: Never show blank screens, always guide the user
8. **Encouraging tone**: Use positive, non-judgmental language
