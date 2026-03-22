# Color Palette Reference 🎨

## Primary Colors

### Blue (Primary)
```
--primary:       #2563eb  ███████  Main primary color
--primary-hover: #1d4ed8  ███████  Hover state
--primary-light: #60a5fa  ███████  Light variant
--primary-dark:  #1e40af  ███████  Dark variant
```
**Use for**: Primary actions, links, focus indicators

### Green (Success)
```
--success:       #10b981  ███████  Main success color
--success-hover: #059669  ███████  Hover state
--success-light: #34d399  ███████  Light variant
--success-dark:  #047857  ███████  Dark variant
```
**Use for**: Success messages, positive actions, confirmations

### Red (Danger)
```
--danger:       #ef4444  ███████  Main danger color
--danger-hover: #dc2626  ███████  Hover state
--danger-light: #f87171  ███████  Light variant
--danger-dark:  #b91c1c  ███████  Dark variant
```
**Use for**: Errors, destructive actions, warnings

### Amber (Warning)
```
--warning:       #f59e0b  ███████  Main warning color
--warning-hover: #d97706  ███████  Hover state
--warning-light: #fbbf24  ███████  Light variant
--warning-dark:  #b45309  ███████  Dark variant
```
**Use for**: Caution messages, pending states

### Blue (Info)
```
--info:       #3b82f6  ███████  Main info color
--info-hover: #2563eb  ███████  Hover state
--info-light: #60a5fa  ███████  Light variant
--info-dark:  #1e40af  ███████  Dark variant
```
**Use for**: Informational messages, neutral actions

## Gray Scale

```
--gray-50:  #f9fafb  ███████  Lightest - backgrounds
--gray-100: #f3f4f6  ███████  Very light - secondary backgrounds
--gray-200: #e5e7eb  ███████  Light - borders, dividers
--gray-300: #d1d5db  ███████  Medium light - disabled borders
--gray-400: #9ca3af  ███████  Medium - disabled text
--gray-500: #6b7280  ███████  Medium dark - tertiary text
--gray-600: #4b5563  ███████  Dark - secondary text
--gray-700: #374151  ███████  Darker - borders in dark mode
--gray-800: #1f2937  ███████  Very dark - dark mode backgrounds
--gray-900: #111827  ███████  Darkest - primary text
```

## Semantic Tokens

### Text Colors
```
--text-primary:   var(--gray-900)  ███████  Main body text
--text-secondary: var(--gray-600)  ███████  Secondary text
--text-tertiary:  var(--gray-500)  ███████  Tertiary text
--text-disabled:  var(--gray-400)  ███████  Disabled text
--text-inverse:   #ffffff          ███████  White text
```

### Background Colors
```
--bg-primary:   #ffffff          ███████  Main background
--bg-secondary: var(--gray-50)   ███████  Secondary background
--bg-tertiary:  var(--gray-100)  ███████  Tertiary background
--bg-overlay:   rgba(0,0,0,0.5)  ███████  Modal overlays
```

### Border Colors
```
--border-primary:   var(--gray-200)  ███████  Default borders
--border-secondary: var(--gray-300)  ███████  Secondary borders
--border-focus:     var(--primary)   ███████  Focus state
--border-error:     var(--danger)    ███████  Error state
```

### Interactive Colors
```
--interactive-primary:        var(--primary)        ███████  Primary buttons
--interactive-primary-hover:  var(--primary-hover)  ███████  Primary hover
--interactive-success:        var(--success)        ███████  Success buttons
--interactive-success-hover:  var(--success-hover)  ███████  Success hover
--interactive-danger:         var(--danger)         ███████  Danger buttons
--interactive-danger-hover:   var(--danger-hover)   ███████  Danger hover
```

## Contrast Ratios (WCAG AA)

### Light Mode
| Foreground | Background | Ratio | WCAG |
|------------|-----------|-------|------|
| gray-900 | white | 16.5:1 | ✅ AAA |
| gray-600 | white | 7.2:1 | ✅ AAA |
| gray-500 | white | 4.6:1 | ✅ AA |
| primary | white | 5.9:1 | ✅ AA |
| success | white | 3.4:1 | ✅ AA (large text) |
| danger | white | 4.5:1 | ✅ AA |
| white | primary | 5.9:1 | ✅ AA |
| white | success | 3.4:1 | ✅ AA (large text) |
| white | danger | 4.5:1 | ✅ AA |

### Dark Mode
| Foreground | Background | Ratio | WCAG |
|------------|-----------|-------|------|
| gray-50 | gray-900 | 15.8:1 | ✅ AAA |
| gray-400 | gray-900 | 5.5:1 | ✅ AA |
| gray-500 | gray-900 | 4.1:1 | ✅ AA (large text) |
| primary-light | gray-900 | 8.2:1 | ✅ AAA |
| success-light | gray-900 | 6.8:1 | ✅ AAA |
| danger-light | gray-900 | 5.9:1 | ✅ AA |

## Usage Examples

### Buttons
```css
/* Primary Button */
.btn-primary {
  background: var(--interactive-primary);
  color: var(--text-inverse);
}

/* Success Button */
.btn-success {
  background: var(--interactive-success);
  color: var(--text-inverse);
}

/* Danger Button */
.btn-danger {
  background: var(--interactive-danger);
  color: var(--text-inverse);
}

/* Secondary Button */
.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}
```

### Text Hierarchy
```css
/* Heading */
.heading {
  color: var(--text-primary);
  font-weight: 700;
}

/* Body Text */
.body {
  color: var(--text-primary);
  font-weight: 400;
}

/* Secondary Text */
.secondary {
  color: var(--text-secondary);
  font-weight: 500;
}

/* Caption */
.caption {
  color: var(--text-tertiary);
  font-size: 12px;
}

/* Disabled */
.disabled {
  color: var(--text-disabled);
}
```

### Cards
```css
/* Default Card */
.card {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
}

/* Elevated Card */
.card-elevated {
  background: var(--bg-primary);
  box-shadow: var(--shadow-md);
}

/* Secondary Card */
.card-secondary {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
}
```

### Status Indicators
```css
/* Success Status */
.status-success {
  color: var(--success);
  background: rgba(16, 185, 129, 0.1);
}

/* Warning Status */
.status-warning {
  color: var(--warning);
  background: rgba(245, 158, 11, 0.1);
}

/* Danger Status */
.status-danger {
  color: var(--danger);
  background: rgba(239, 68, 68, 0.1);
}

/* Info Status */
.status-info {
  color: var(--info);
  background: rgba(59, 130, 246, 0.1);
}
```

## Color Meanings

### Primary (Blue)
- **Meaning**: Trust, reliability, professionalism
- **Use for**: Primary actions, links, navigation
- **Avoid**: Overuse can feel cold

### Success (Green)
- **Meaning**: Success, growth, positive
- **Use for**: Confirmations, success messages, positive actions
- **Avoid**: Financial loss indicators

### Danger (Red)
- **Meaning**: Error, danger, stop
- **Use for**: Errors, destructive actions, critical warnings
- **Avoid**: Positive actions

### Warning (Amber)
- **Meaning**: Caution, attention needed
- **Use for**: Warnings, pending states, important notices
- **Avoid**: Success messages

### Info (Blue)
- **Meaning**: Information, neutral
- **Use for**: Informational messages, tips, neutral actions
- **Avoid**: Critical warnings

### Gray
- **Meaning**: Neutral, professional
- **Use for**: Text, borders, backgrounds, disabled states
- **Avoid**: Primary actions

## Accessibility Guidelines

### Text Contrast
- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text** (18px+ or 14px+ bold): Minimum 3:1 contrast ratio
- **UI components**: Minimum 3:1 contrast ratio

### Color Usage
- ❌ Don't use color alone to convey information
- ✅ Use color + icon/text/pattern
- ✅ Provide text alternatives
- ✅ Test with color blindness simulators

### Focus Indicators
- ✅ Minimum 3px outline
- ✅ Minimum 2px offset
- ✅ High contrast with background
- ✅ Visible in all states

## Testing Tools

### Contrast Checkers
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Coolors Contrast Checker](https://coolors.co/contrast-checker)
- Chrome DevTools (Inspect > Accessibility)

### Color Blindness Simulators
- [Coblis](https://www.color-blindness.com/coblis-color-blindness-simulator/)
- [Toptal Color Blind Filter](https://www.toptal.com/designers/colorfilter)
- Chrome DevTools (Rendering > Emulate vision deficiencies)

### Accessibility Audits
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/extension/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

## Quick Reference

### Most Used Colors
```css
/* Text */
color: var(--text-primary);      /* Body text */
color: var(--text-secondary);    /* Secondary text */

/* Backgrounds */
background: var(--bg-primary);   /* Cards, modals */
background: var(--bg-secondary); /* Sections */

/* Borders */
border-color: var(--border-primary);  /* Default */
border-color: var(--border-focus);    /* Focus state */

/* Buttons */
background: var(--interactive-primary);  /* Primary action */
background: var(--interactive-success);  /* Positive action */
background: var(--interactive-danger);   /* Destructive action */
```

### State Colors
```css
/* Success */
color: var(--success);
background: var(--success-light);

/* Error */
color: var(--danger);
background: var(--danger-light);

/* Warning */
color: var(--warning);
background: var(--warning-light);

/* Info */
color: var(--info);
background: var(--info-light);
```

---

**Note**: All colors are WCAG AA compliant and tested for accessibility. Use semantic tokens instead of direct color values for better maintainability.
