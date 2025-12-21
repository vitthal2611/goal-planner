# Theme Enhancements for Consistency

## Overview
Recommendations to enhance the existing theme for better consistency across all screens.

---

## Current Theme Strengths

✅ Consistent color palette
✅ Typography scale defined
✅ Component overrides (Card, Button, Chip)
✅ Light and dark mode support
✅ Border radius system
✅ Spacing via MUI defaults

---

## Recommended Enhancements

### 1. Add Custom Palette Colors

```javascript
// In theme.js, add to palette:
palette: {
  // ... existing colors
  grey: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    // ... etc
  },
  // Add semantic colors
  status: {
    onTrack: '#4CAF50',
    behind: '#FF9800',
    critical: '#E57373',
    completed: '#4CAF50'
  }
}
```

### 2. Add Custom Spacing Scale

```javascript
// Add to theme root:
spacing: 8, // Base unit (already default)
customSpacing: {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
  xxl: 64
}
```

### 3. Add Transition Tokens

```javascript
// Add to theme root:
transitions: {
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195,
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
  // Custom
  custom: {
    card: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    quick: 'transform 0.1s',
    smooth: 'all 0.3s ease'
  }
}
```

### 4. Enhanced Card Component

```javascript
MuiCard: {
  styleOverrides: {
    root: {
      border: '1px solid',
      borderColor: 'divider', // Add default border
      boxShadow: '0 2px 8px rgba(91, 124, 153, 0.08)',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        boxShadow: '0 4px 16px rgba(91, 124, 153, 0.12)',
        transform: 'translateY(-2px)',
        borderColor: 'primary.main' // Add hover border
      },
      '&:active': {
        transform: 'scale(0.98)',
        transition: 'transform 0.1s'
      }
    }
  },
  variants: [
    {
      props: { variant: 'completed' },
      style: {
        borderColor: 'success.main',
        backgroundColor: 'success.50',
        elevation: 2
      }
    },
    {
      props: { variant: 'empty' },
      style: {
        border: '2px dashed',
        borderColor: 'divider',
        backgroundColor: 'grey.50',
        '&:hover': {
          transform: 'none',
          boxShadow: 'none'
        }
      }
    }
  ]
}
```

### 5. Enhanced IconButton

```javascript
MuiIconButton: {
  styleOverrides: {
    root: {
      border: '1px solid',
      borderColor: 'divider',
      backgroundColor: 'background.paper',
      transition: 'all 0.2s',
      '&:hover': {
        backgroundColor: 'grey.100',
        borderColor: 'primary.main'
      },
      '&.Mui-disabled': {
        backgroundColor: 'grey.50',
        borderColor: 'divider',
        opacity: 0.5
      }
    }
  }
}
```

### 6. Enhanced Checkbox

```javascript
MuiCheckbox: {
  styleOverrides: {
    root: {
      padding: 12,
      minWidth: 48,
      minHeight: 48,
      '&:hover': {
        backgroundColor: 'transparent'
      }
    }
  },
  defaultProps: {
    icon: <RadioButtonUnchecked />,
    checkedIcon: <CheckCircle />
  }
}
```

### 7. Add Breakpoint Helpers

```javascript
// Add custom breakpoints if needed
breakpoints: {
  values: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,
  },
  // Custom helpers
  mobile: '@media (max-width: 599px)',
  tablet: '@media (min-width: 600px) and (max-width: 899px)',
  desktop: '@media (min-width: 900px)'
}
```

---

## Usage Examples

### Using Custom Transitions

```jsx
<Card sx={{ 
  transition: theme => theme.transitions.custom.card 
}}>
```

### Using Status Colors

```jsx
<Chip 
  sx={{ 
    bgcolor: theme => theme.palette.status.onTrack 
  }} 
/>
```

### Using Card Variants

```jsx
<Card variant="completed">
  {/* Completed habit */}
</Card>

<Card variant="empty">
  {/* Empty state */}
</Card>
```

### Using Custom Spacing

```jsx
<Box sx={{ 
  mb: theme => theme.customSpacing.lg 
}}>
```

---

## Component Patterns to Standardize

### 1. Section Container

```jsx
const SectionContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(5),
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(3),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  }
}));
```

### 2. Screen Header

```jsx
const ScreenHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(6),
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(4)
  }
}));
```

### 3. Interactive Card

```jsx
const InteractiveCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  border: `1px solid ${theme.palette.divider}`,
  transition: theme.transitions.custom.card,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
    borderColor: theme.palette.primary.main
  },
  '&:active': {
    transform: 'scale(0.98)',
    transition: theme.transitions.custom.quick
  }
}));
```

---

## Accessibility Enhancements

### 1. Focus Indicators

```javascript
// Add to theme components
MuiButton: {
  styleOverrides: {
    root: {
      '&:focus-visible': {
        outline: '2px solid',
        outlineColor: 'primary.main',
        outlineOffset: 2
      }
    }
  }
}
```

### 2. Touch Targets

```javascript
// Ensure minimum 48x48px
MuiIconButton: {
  styleOverrides: {
    root: {
      minWidth: 48,
      minHeight: 48
    }
  }
}

MuiCheckbox: {
  styleOverrides: {
    root: {
      minWidth: 48,
      minHeight: 48
    }
  }
}
```

---

## Dark Mode Considerations

### Ensure Sufficient Contrast

```javascript
// In darkTheme
palette: {
  background: {
    default: '#1A1F2E', // Darker for better contrast
    paper: '#252B3B'
  },
  text: {
    primary: '#E8EAED', // High contrast
    secondary: '#9CA3AF' // Medium contrast
  }
}
```

### Adjust Shadows

```javascript
// Darker shadows for dark mode
components: {
  MuiCard: {
    styleOverrides: {
      root: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
      }
    }
  }
}
```

---

## Implementation Priority

### High Priority (Immediate)
1. ✅ Add border to default Card
2. ✅ Standardize hover states
3. ✅ Add transition tokens
4. ✅ Ensure touch targets 48x48px

### Medium Priority (Next Sprint)
1. Add Card variants (completed, empty)
2. Add status colors to palette
3. Create styled component patterns
4. Add focus indicators

### Low Priority (Future)
1. Custom spacing scale
2. Breakpoint helpers
3. Additional component variants
4. Animation library

---

## Testing Consistency

### Visual Regression Testing
- Compare screenshots across screens
- Ensure colors match exactly
- Verify spacing consistency
- Check hover/active states

### Manual Testing
- Navigate between screens
- Verify transitions feel the same
- Check dark mode consistency
- Test on mobile devices

### Automated Testing
```javascript
describe('Theme Consistency', () => {
  it('should use theme colors', () => {
    // Check no hardcoded colors
  });
  
  it('should use theme spacing', () => {
    // Check no arbitrary margins
  });
  
  it('should use theme transitions', () => {
    // Check consistent timing
  });
});
```

---

## Summary

These enhancements will:
1. **Reduce code duplication** - Shared patterns
2. **Improve consistency** - Standardized components
3. **Enhance maintainability** - Centralized styling
4. **Better accessibility** - Focus indicators, touch targets
5. **Smoother experience** - Consistent transitions

All changes are backward compatible and can be implemented gradually.
