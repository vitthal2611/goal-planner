# Design System Quick Reference

## 🎨 Colors

```jsx
// Primary actions, navigation
color: 'primary.main'      // #5B7C99

// Success states, completed
color: 'success.main'      // #4CAF50

// Warnings, behind schedule
color: 'warning.main'      // #FF9800

// Errors, critical
color: 'error.main'        // #E57373

// Text
color: 'text.primary'      // #2C3E50 (light) / #E8EAED (dark)
color: 'text.secondary'    // #7F8C8D (light) / #9CA3AF (dark)

// Backgrounds
bgcolor: 'background.default'  // #F5F7FA (light) / #1A1F2E (dark)
bgcolor: 'background.paper'    // #FFFFFF (light) / #252B3B (dark)

// Borders
borderColor: 'divider'     // #E8EAED (light) / #3A4556 (dark)
```

---

## 📝 Typography

```jsx
<Typography variant="h3">Screen Title</Typography>        // 1.5rem, 600
<Typography variant="h5">Section Header</Typography>      // 1.125rem, 600
<Typography variant="body1">Primary Content</Typography>  // 1rem, 400
<Typography variant="body2">Secondary Content</Typography> // 0.875rem, 400
<Typography variant="caption">Metadata</Typography>       // 0.75rem, 400
<Typography variant="overline">Label</Typography>         // 0.75rem, 600, uppercase
```

---

## 📏 Spacing

```jsx
// Section margins
sx={{ mb: { xs: 3, sm: 5 } }}  // 24px mobile, 40px desktop

// Card padding
sx={{ p: { xs: 2.5, sm: 4 } }}  // 20px mobile, 32px desktop

// Element gaps
sx={{ gap: 2 }}  // 16px
```

---

## 🎴 Card Pattern

```jsx
<Card
  elevation={0}
  sx={{
    border: '1px solid',
    borderColor: 'divider',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      boxShadow: 4,
      transform: 'translateY(-2px)',
      borderColor: 'primary.main'
    },
    '&:active': {
      transform: 'scale(0.98)',
      transition: 'transform 0.1s'
    }
  }}
>
  <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
    {/* Content */}
  </CardContent>
</Card>
```

---

## ✅ Checkbox Pattern

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

---

## 🏷️ Chip Pattern

```jsx
<Chip
  label="Done"
  size="small"
  color="success"
  sx={{ fontWeight: 600 }}
/>
```

---

## 📊 Progress Bar

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

---

## 🔘 Icon Button

```jsx
<IconButton
  sx={{
    bgcolor: 'background.paper',
    border: '1px solid',
    borderColor: 'divider',
    '&:hover': {
      bgcolor: 'grey.100',
      borderColor: 'primary.main'
    }
  }}
>
  <ChevronLeft />
</IconButton>
```

---

## 📑 Section Header

```jsx
import { SectionHeader } from '../common/SectionHeader';

<SectionHeader
  title="Morning"
  icon={<WbSunny />}
  iconColor="warning.main"
  count="3/5"
  countColor="success"
/>
```

---

## 📅 Date Navigator

```jsx
import { DateNavigator } from '../common/DateNavigator';

<DateNavigator
  selectedDate={selectedDate}
  onDateChange={setSelectedDate}
  preventFuture={true}
/>
```

---

## 🎯 Summary Card

```jsx
import { SummaryCard } from '../common/SummaryCard';

<SummaryCard
  title="Yearly Progress"
  value="75%"
  subtitle="Average across all goals"
  color="success"
/>
```

---

## 🚫 Empty State

```jsx
<Card
  elevation={0}
  sx={{
    textAlign: 'center',
    border: '2px dashed',
    borderColor: 'divider',
    bgcolor: 'grey.50'
  }}
>
  <CardContent sx={{ py: { xs: 8, sm: 12 }, px: { xs: 3, sm: 4 } }}>
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

---

## 🎬 Animations

```jsx
// Grow (fade + scale)
<Grow in={true} timeout={300}>
  <div>{/* Content */}</div>
</Grow>

// Zoom (scale)
<Zoom in={true} timeout={300}>
  <div>{/* Content */}</div>
</Zoom>

// Fade
<Fade in={true} timeout={300}>
  <div>{/* Content */}</div>
</Fade>
```

---

## 📱 Responsive Patterns

```jsx
// Hide on mobile
sx={{ display: { xs: 'none', sm: 'block' } }}

// Show only on mobile
sx={{ display: { xs: 'block', sm: 'none' } }}

// Responsive padding
sx={{ p: { xs: 2, sm: 4 } }}

// Responsive font size
sx={{ fontSize: { xs: '2rem', sm: '3rem' } }}

// Responsive spacing
sx={{ mb: { xs: 3, sm: 5 } }}
```

---

## 🎨 Status Colors

```jsx
// On track
borderColor: 'success.main'
color: 'success.main'

// Behind schedule
borderColor: 'warning.main'
color: 'warning.main'

// Critical
borderColor: 'error.main'
color: 'error.main'

// Completed
borderColor: 'success.main'
bgcolor: 'success.50'
elevation: 2
```

---

## ⏱️ Transitions

```jsx
// Default (cards, hover)
transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'

// Quick (active states)
transition: 'transform 0.1s'

// Smooth (theme changes)
transition: 'all 0.3s ease'
```

---

## 🎯 Touch Targets (Mobile)

```jsx
// Minimum 48x48px
sx={{
  minWidth: 48,
  minHeight: 48,
  p: 1.5
}}
```

---

## 🔍 Common Patterns

### Screen Container
```jsx
<Container maxWidth="lg" sx={{ py: { xs: 0, sm: 5 }, px: { xs: 0, sm: 3 } }}>
```

### Screen Title
```jsx
<Box sx={{ mb: 6 }}>
  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1.5 }}>
    Screen Title
  </Typography>
  <Typography variant="body1" color="text.secondary">
    Description
  </Typography>
</Box>
```

### Grid Layout
```jsx
<Grid container spacing={3}>
  <Grid item xs={12} md={6}>
    {/* Content */}
  </Grid>
</Grid>
```

### Flex Layout
```jsx
<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
```

---

## ✅ Consistency Checklist

Before committing:
- [ ] Uses theme colors (no hardcoded hex)
- [ ] Uses typography variants (no custom font sizes)
- [ ] Uses spacing system (no arbitrary margins)
- [ ] Follows card pattern (border, radius, hover)
- [ ] Transitions are 0.25s
- [ ] Touch targets 48x48px on mobile
- [ ] Responsive (xs, sm, md breakpoints)
- [ ] Reuses existing components

---

## 🚀 Quick Start

1. **Import theme**: `import { useTheme } from '@mui/material'`
2. **Use theme tokens**: `color: 'primary.main'` not `color: '#5B7C99'`
3. **Use sx prop**: Consistent with MUI v5
4. **Mobile-first**: Define xs first, override for larger screens
5. **Reuse components**: Check `components/common/` first

---

## 📚 Related Docs

- `DESIGN_SYSTEM.md` - Complete design system
- `THEME_ENHANCEMENTS.md` - Theme improvements
- `TODAY_REDESIGN_IMPLEMENTATION.md` - Today screen guide
- `README.md` - Project overview
