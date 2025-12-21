# Design System - Goal Planner App

## Overview
This design system ensures visual and behavioral consistency across all screens: Today, Dashboard, Goals, Habits, and Review.

---

## 1. Color Palette

### Primary Colors
- **Primary**: `#5B7C99` - Main brand color (navigation, CTAs)
- **Secondary**: `#7B68A6` - Accent color (highlights, secondary actions)
- **Success**: `#4CAF50` - Completed states, positive feedback
- **Warning**: `#FF9800` - Alerts, behind schedule
- **Error**: `#E57373` - Critical issues, destructive actions
- **Info**: `#64B5F6` - Informational messages

### Neutral Colors
- **Background Default**: `#F5F7FA` (light) / `#1A1F2E` (dark)
- **Background Paper**: `#FFFFFF` (light) / `#252B3B` (dark)
- **Text Primary**: `#2C3E50` (light) / `#E8EAED` (dark)
- **Text Secondary**: `#7F8C8D` (light) / `#9CA3AF` (dark)
- **Divider**: `#E8EAED` (light) / `#3A4556` (dark)

### Semantic Colors
- **On Track**: Success color
- **Behind**: Warning color
- **Critical**: Error color
- **Completed**: Success with elevation

---

## 2. Typography Scale

### Headings
- **H1**: 2.5rem, 700 weight - Page titles (rare)
- **H2**: 1.75rem, 600 weight - Section titles
- **H3**: 1.5rem, 600 weight - Screen titles
- **H4**: 1.25rem, 600 weight - Card titles
- **H5**: 1.125rem, 600 weight - Subsection headers
- **H6**: 1rem, 600 weight - Small headers

### Body Text
- **Body1**: 1rem, 400 weight - Primary content
- **Body2**: 0.875rem, 400 weight - Secondary content
- **Caption**: 0.75rem, 400 weight - Metadata, timestamps
- **Overline**: 0.75rem, 600 weight, uppercase - Labels

### Font Family
`"Inter", "Roboto", "Helvetica", "Arial", sans-serif`

---

## 3. Spacing System

Based on 8px grid:
- **xs**: 8px (1 unit)
- **sm**: 16px (2 units)
- **md**: 24px (3 units)
- **lg**: 32px (4 units)
- **xl**: 48px (6 units)

### Component Spacing
- **Card padding**: 24px (desktop), 16-20px (mobile)
- **Section margin**: 40-56px (desktop), 24-32px (mobile)
- **Element gap**: 8-16px

---

## 4. Border Radius

- **Default**: 16px (cards, containers)
- **Buttons**: 12px
- **Chips**: 10px
- **Progress bars**: 10px
- **Text fields**: 12px

---

## 5. Elevation & Shadows

### Light Theme
- **Level 0**: No shadow (default cards)
- **Level 1**: `0 2px 8px rgba(91, 124, 153, 0.08)` (hover)
- **Level 2**: `0 4px 12px rgba(91, 124, 153, 0.1)` (active/completed)
- **Level 3**: `0 4px 16px rgba(91, 124, 153, 0.12)` (elevated)

### Dark Theme
- **Level 0**: No shadow
- **Level 1**: `0 2px 8px rgba(0, 0, 0, 0.3)`
- **Level 2**: `0 4px 12px rgba(0, 0, 0, 0.35)`
- **Level 3**: `0 4px 16px rgba(0, 0, 0, 0.4)`

---

## 6. Shared Components

### Navigation Header
**Used in**: All screens
- Sticky position, top: 0, z-index: 1100
- Border bottom: 1px solid divider
- Padding: 24px (desktop), 16px (mobile)
- Contains: Logo, navigation, user actions

### Date/Year Selector
**Used in**: Today (date), Dashboard/Goals/Habits (year)
- Icon buttons for prev/next
- Center text with current selection
- Disabled state for invalid ranges
- Same size, spacing, and interaction

### Section Header
**Used in**: All screens for grouping
```jsx
<Box sx={{ mb: 3, pb: 2, borderBottom: '2px solid', borderColor: 'grey.200' }}>
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    <Icon sx={{ mr: 1.5, fontSize: 28, color }} />
    <Typography variant="h5" sx={{ fontWeight: 600, flex: 1 }}>
      {title}
    </Typography>
    <Chip label={count} size="small" />
  </Box>
</Box>
```

### Card Component
**Used in**: All screens
- Border: 1px solid divider
- Border radius: 16px
- Padding: 24px (desktop), 16-20px (mobile)
- Hover: translateY(-2px), shadow level 1
- Active: scale(0.98)
- Transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1)

### Progress Indicator
**Used in**: Dashboard, Today, Goals
- Circular: ProgressRing component
- Linear: MUI LinearProgress with 8px height, 10px radius
- Colors: success (on track), warning (behind), primary (neutral)

### Checkbox Pattern
**Used in**: Today, Habits
- Unchecked: RadioButtonUnchecked (28px)
- Checked: CheckCircle (28px)
- Touch target: 48x48px minimum
- Padding: 12px
- Color: primary (unchecked), success (checked)

### Chip Pattern
**Used in**: All screens
- Size: small (default)
- Border radius: 10px
- Font weight: 500-600
- Colors: success, warning, error, default

---

## 7. Interaction Patterns

### Hover States
- **Cards**: Lift 2px, add shadow, border color change
- **Buttons**: Add shadow, slight color darken
- **Checkboxes**: No background change (transparent)

### Active States
- **Cards**: Scale 0.98
- **Buttons**: Scale 0.95
- **Checkboxes**: Immediate state change

### Transitions
- **Default**: `all 0.25s cubic-bezier(0.4, 0, 0.2, 1)`
- **Quick**: `transform 0.1s` (active states)
- **Smooth**: `all 0.3s ease` (theme changes)

### Animations
- **Grow**: Fade + scale in (300ms)
- **Zoom**: Scale in (300ms)
- **Fade**: Opacity transition (300ms)

---

## 8. Responsive Breakpoints

- **xs**: 0-599px (mobile)
- **sm**: 600-899px (tablet)
- **md**: 900-1199px (small desktop)
- **lg**: 1200-1535px (desktop)
- **xl**: 1536px+ (large desktop)

### Mobile Adaptations
- Reduce padding: 24px → 16px
- Reduce font sizes: H3 2.5rem → 2rem
- Stack layouts: Grid → Column
- Bottom navigation instead of top tabs
- Larger touch targets: 48x48px minimum

---

## 9. Empty States

**Pattern used across all screens**:
```jsx
<Card elevation={0} sx={{ 
  textAlign: 'center', 
  border: '2px dashed', 
  borderColor: 'divider', 
  bgcolor: 'grey.50' 
}}>
  <CardContent sx={{ py: 12, px: 4 }}>
    <Box sx={{ fontSize: '3rem', mb: 3, opacity: 0.6 }}>
      {emoji}
    </Box>
    <Typography variant="h5" sx={{ mb: 2.5, fontWeight: 600 }}>
      {title}
    </Typography>
    <Typography variant="body1" color="text.secondary">
      {description}
    </Typography>
  </CardContent>
</Card>
```

---

## 10. Status Indicators

### Goal Status
- **Completed**: Green border, success chip, elevation 2
- **On Track**: Blue border, primary chip
- **Behind**: Orange border, warning chip
- **Critical**: Red border, error chip

### Habit Status
- **Done**: Green background, success border, "Done" chip
- **Skipped**: Grey background, strikethrough text
- **Pending**: White background, default border

---

## 11. Consistency Checklist

When adding new features, ensure:
- [ ] Uses theme colors (no hardcoded colors)
- [ ] Uses typography variants (no custom font sizes)
- [ ] Uses spacing system (no arbitrary margins)
- [ ] Follows card pattern (border, radius, hover)
- [ ] Matches interaction timing (0.25s transitions)
- [ ] Responsive on mobile (touch targets, padding)
- [ ] Consistent with existing components
- [ ] Reuses shared components where possible

---

## 12. Component Reusability Map

| Component | Used In | Purpose |
|-----------|---------|---------|
| SummaryCard | Dashboard, Review | Key metrics display |
| ProgressRing | Dashboard, Today | Circular progress |
| HabitCard | Today, Habits, Review | Habit display/interaction |
| DateNavigator | Today | Date selection |
| YearSelector | Dashboard, Goals, Habits | Year selection |
| SectionHeader | All screens | Content grouping |
| EmptyState | All screens | No data state |
| ConfirmDialog | All screens | Destructive actions |

---

## Implementation Notes

1. **Always use theme tokens**: `theme.palette.primary.main` not `#5B7C99`
2. **Use sx prop for styling**: Consistent with MUI v5
3. **Mobile-first responsive**: Define xs first, then override for larger screens
4. **Reuse components**: Don't duplicate, extend existing components
5. **Test both themes**: Light and dark mode consistency
