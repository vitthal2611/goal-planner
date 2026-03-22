# Theme System Quick Reference 🎨

## Color Tokens

### Text Colors
```css
var(--text-primary)      /* Main text - highest contrast */
var(--text-secondary)    /* Secondary text - medium contrast */
var(--text-tertiary)     /* Tertiary text - lower contrast */
var(--text-disabled)     /* Disabled state */
var(--text-inverse)      /* White text on dark backgrounds */
```

### Background Colors
```css
var(--bg-primary)        /* Main background (white/dark) */
var(--bg-secondary)      /* Secondary background */
var(--bg-tertiary)       /* Tertiary background */
var(--bg-overlay)        /* Modal overlays */
```

### Interactive Colors
```css
var(--interactive-primary)        /* Primary buttons/links */
var(--interactive-primary-hover)  /* Primary hover state */
var(--interactive-success)        /* Success actions */
var(--interactive-success-hover)  /* Success hover */
var(--interactive-danger)         /* Destructive actions */
var(--interactive-danger-hover)   /* Danger hover */
```

### Border Colors
```css
var(--border-primary)    /* Default borders */
var(--border-secondary)  /* Secondary borders */
var(--border-focus)      /* Focus state */
var(--border-error)      /* Error state */
```

## Design System

### Spacing
```css
var(--space-xs)   /* 4px */
var(--space-sm)   /* 8px */
var(--space-md)   /* 16px */
var(--space-lg)   /* 24px */
var(--space-xl)   /* 32px */
```

### Border Radius
```css
var(--radius-sm)   /* 6px - small elements */
var(--radius-md)   /* 8px - buttons, inputs */
var(--radius-lg)   /* 12px - cards */
var(--radius-xl)   /* 16px - large cards */
var(--radius-full) /* 9999px - pills, circles */
```

### Shadows
```css
var(--shadow-sm)   /* Subtle shadow */
var(--shadow-md)   /* Card shadow */
var(--shadow-lg)   /* Elevated shadow */
var(--shadow-xl)   /* Modal shadow */
```

### Transitions
```css
var(--transition-fast)  /* 150ms - quick feedback */
var(--transition-base)  /* 200ms - standard */
var(--transition-slow)  /* 300ms - smooth animations */
```

### Focus Rings
```css
var(--focus-ring)         /* Primary focus */
var(--focus-ring-success) /* Success focus */
var(--focus-ring-danger)  /* Danger focus */
```

## Common Patterns

### Button Styles
```css
.button {
  background: var(--interactive-primary);
  color: var(--text-inverse);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.button:hover {
  background: var(--interactive-primary-hover);
}

.button:focus-visible {
  box-shadow: var(--focus-ring);
}
```

### Card Styles
```css
.card {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  box-shadow: var(--shadow-md);
}
```

### Input Styles
```css
.input {
  background: var(--bg-primary);
  border: 2px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  color: var(--text-primary);
  transition: border-color var(--transition-base);
}

.input:focus-visible {
  border-color: var(--border-focus);
  box-shadow: var(--focus-ring);
  outline: none;
}
```

### Text Hierarchy
```css
.heading {
  color: var(--text-primary);
  font-weight: 700;
}

.subheading {
  color: var(--text-secondary);
  font-weight: 600;
}

.caption {
  color: var(--text-tertiary);
  font-size: 12px;
}
```

## Accessibility Classes

```css
.sr-only              /* Screen reader only */
.skip-to-main         /* Skip navigation link */
.text-contrast-high   /* High contrast text */
.text-contrast-medium /* Medium contrast text */
```

## State Colors

### Success
```css
var(--success)       /* #10b981 */
var(--success-hover) /* #059669 */
var(--success-light) /* #34d399 */
var(--success-dark)  /* #047857 */
```

### Danger
```css
var(--danger)       /* #ef4444 */
var(--danger-hover) /* #dc2626 */
var(--danger-light) /* #f87171 */
var(--danger-dark)  /* #b91c1c */
```

### Warning
```css
var(--warning)       /* #f59e0b */
var(--warning-hover) /* #d97706 */
var(--warning-light) /* #fbbf24 */
var(--warning-dark)  /* #b45309 */
```

### Info
```css
var(--info)       /* #3b82f6 */
var(--info-hover) /* #2563eb */
var(--info-light) /* #60a5fa */
var(--info-dark)  /* #1e40af */
```

## Gray Scale
```css
var(--gray-50)   /* Lightest */
var(--gray-100)
var(--gray-200)
var(--gray-300)
var(--gray-400)
var(--gray-500)
var(--gray-600)
var(--gray-700)
var(--gray-800)
var(--gray-900)  /* Darkest */
```

## Best Practices

### ✅ Do
- Use semantic tokens (`--text-primary`, `--interactive-success`)
- Use design system variables (`--space-md`, `--radius-lg`)
- Add focus-visible styles to all interactive elements
- Test with keyboard navigation
- Check color contrast ratios

### ❌ Don't
- Use hardcoded colors (`#3b82f6`)
- Use hardcoded spacing (`16px`)
- Remove focus indicators
- Use color alone to convey information
- Ignore accessibility guidelines

## Media Queries

### Dark Mode
```css
@media (prefers-color-scheme: dark) {
  /* Automatically applied */
}
```

### High Contrast
```css
@media (prefers-contrast: high) {
  /* Enhanced contrast */
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  /* Minimal animations */
}
```

### Touch Devices
```css
@media (pointer: coarse) {
  /* Larger touch targets */
}
```

## Migration Guide

### Before
```css
.button {
  background: #3b82f6;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
}
```

### After
```css
.button {
  background: var(--interactive-primary);
  color: var(--text-inverse);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
}
```

## Testing Checklist

- [ ] Keyboard navigation works
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG AA
- [ ] Works in dark mode
- [ ] Works in high contrast mode
- [ ] Respects reduced motion
- [ ] Touch targets are 44x44px minimum
- [ ] Screen reader announces correctly
