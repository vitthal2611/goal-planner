# Component Migration Checklist

## How to Update Existing Components

### Step 1: Replace Color Values

#### Text Colors
```css
/* Find and replace */
color: #1f2937;     → color: var(--text-primary);
color: #6b7280;     → color: var(--text-secondary);
color: #9ca3af;     → color: var(--text-tertiary);
color: white;       → color: var(--text-inverse);
```

#### Background Colors
```css
background: #ffffff;  → background: var(--bg-primary);
background: #f9fafb;  → background: var(--bg-secondary);
background: #f3f4f6;  → background: var(--bg-tertiary);
```

#### Border Colors
```css
border-color: #e5e7eb;  → border-color: var(--border-primary);
border-color: #d1d5db;  → border-color: var(--border-secondary);
```

#### Interactive Colors
```css
background: #3b82f6;  → background: var(--interactive-primary);
background: #10b981;  → background: var(--interactive-success);
background: #ef4444;  → background: var(--interactive-danger);
```

### Step 2: Replace Spacing Values

```css
/* Padding & Margin */
padding: 4px;   → padding: var(--space-xs);
padding: 8px;   → padding: var(--space-sm);
padding: 16px;  → padding: var(--space-md);
padding: 24px;  → padding: var(--space-lg);
padding: 32px;  → padding: var(--space-xl);

/* Gap */
gap: 8px;   → gap: var(--space-sm);
gap: 16px;  → gap: var(--space-md);
```

### Step 3: Replace Border Radius

```css
border-radius: 6px;     → border-radius: var(--radius-sm);
border-radius: 8px;     → border-radius: var(--radius-md);
border-radius: 12px;    → border-radius: var(--radius-lg);
border-radius: 16px;    → border-radius: var(--radius-xl);
border-radius: 50%;     → border-radius: var(--radius-full);
border-radius: 9999px;  → border-radius: var(--radius-full);
```

### Step 4: Replace Shadows

```css
box-shadow: 0 1px 2px rgba(0,0,0,0.05);   → box-shadow: var(--shadow-sm);
box-shadow: 0 4px 6px rgba(0,0,0,0.1);    → box-shadow: var(--shadow-md);
box-shadow: 0 10px 15px rgba(0,0,0,0.1);  → box-shadow: var(--shadow-lg);
box-shadow: 0 20px 25px rgba(0,0,0,0.15); → box-shadow: var(--shadow-xl);
```

### Step 5: Replace Transitions

```css
transition: all 0.15s ease;  → transition: all var(--transition-fast);
transition: all 0.2s ease;   → transition: all var(--transition-base);
transition: all 0.3s ease;   → transition: all var(--transition-slow);
```

### Step 6: Add Focus Indicators

Add to ALL interactive elements:

```css
/* Buttons */
.button:focus-visible {
  box-shadow: var(--focus-ring);
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

/* Success buttons */
.btn-success:focus-visible {
  box-shadow: var(--focus-ring-success);
  outline-color: var(--success);
}

/* Danger buttons */
.btn-danger:focus-visible {
  box-shadow: var(--focus-ring-danger);
  outline-color: var(--danger);
}

/* Inputs */
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  border-color: var(--border-focus);
  box-shadow: var(--focus-ring);
  outline: none;
}

/* Cards/Interactive containers */
.card:focus-within {
  box-shadow: 0 0 0 3px var(--primary-light);
}
```

## Component Priority List

### High Priority (Do First) 🔴
These components are used most frequently:

- [ ] Buttons (all variants)
- [ ] Form inputs (text, select, textarea)
- [ ] Links and navigation
- [ ] Modal dialogs
- [ ] Notification/toast messages

### Medium Priority 🟡
Important but less critical:

- [ ] Cards
- [ ] Tables
- [ ] Tabs
- [ ] Dropdowns
- [ ] Tooltips

### Low Priority 🟢
Can be done later:

- [ ] Decorative elements
- [ ] Illustrations
- [ ] Background patterns
- [ ] Dividers

## File-by-File Checklist

### Core Files
- [x] `src/styles/theme.css` - Created ✅
- [x] `src/styles/accessibility.css` - Created ✅
- [x] `src/App.css` - Updated ✅
- [x] `src/index.jsx` - Updated ✅
- [x] `index.html` - Updated ✅

### Component Files (To Update)
- [ ] `src/components/EnvelopeCard.css`
- [ ] `src/components/QuickAdd.css`
- [ ] `src/components/EnvelopeGrid.css`
- [ ] `src/components/TransactionsList.css`
- [ ] `src/components/EnvelopeStatusEnhanced.css`
- [ ] `src/components/SimpleEnvelopeCard.css`
- [ ] `src/components/PaymentMethodsManager.css`
- [ ] `src/components/QuickExpenseForm.css`
- [ ] `src/components/UserProfile.css`
- [ ] `src/components/EnhancedDashboard.css`
- [ ] `src/components/EnvelopeBudget.css`
- [ ] `src/components/EnvelopeDemo.css`
- [ ] `src/components/HeaderStyles.css`
- [ ] `src/components/MobileEnhancements.css`
- [ ] `src/components/MobileFixes.css`
- [ ] `src/components/BulkExpenseModal.css`
- [ ] `src/components/CSVImport.css`
- [ ] `src/components/SpendingBreakdown.css`

## Testing Checklist

After updating each component:

### Visual Testing
- [ ] Component looks correct in light mode
- [ ] Component looks correct in dark mode
- [ ] Component looks correct in high contrast mode
- [ ] Colors have proper contrast ratios

### Keyboard Testing
- [ ] Tab through all interactive elements
- [ ] Focus indicators are clearly visible
- [ ] Enter/Space activates buttons
- [ ] Escape closes modals/dropdowns

### Screen Reader Testing
- [ ] Component is announced correctly
- [ ] Interactive elements have proper labels
- [ ] State changes are announced
- [ ] Error messages are announced

### Responsive Testing
- [ ] Works on mobile (< 640px)
- [ ] Works on tablet (640px - 1024px)
- [ ] Works on desktop (> 1024px)
- [ ] Touch targets are 44x44px minimum

## Common Patterns

### Button Pattern
```css
.button {
  background: var(--interactive-primary);
  color: var(--text-inverse);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
}

.button:hover {
  background: var(--interactive-primary-hover);
}

.button:focus-visible {
  box-shadow: var(--focus-ring);
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  color: var(--text-disabled);
}
```

### Card Pattern
```css
.card {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
}

.card:hover {
  box-shadow: var(--shadow-lg);
  border-color: var(--border-secondary);
}

.card:focus-within {
  box-shadow: 0 0 0 3px var(--primary-light);
}
```

### Input Pattern
```css
.input {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 2px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 16px;
  transition: border-color var(--transition-base);
}

.input:focus-visible {
  border-color: var(--border-focus);
  box-shadow: var(--focus-ring);
  outline: none;
}

.input:disabled {
  background: var(--bg-tertiary);
  color: var(--text-disabled);
  cursor: not-allowed;
}

.input.error {
  border-color: var(--border-error);
}

.input.error:focus-visible {
  box-shadow: var(--focus-ring-danger);
}
```

## Quick Wins

Start with these easy changes for immediate impact:

1. **Replace all `color: white`** with `color: var(--text-inverse)`
2. **Replace all `background: white`** with `background: var(--bg-primary)`
3. **Add focus-visible to all buttons** with `box-shadow: var(--focus-ring)`
4. **Replace hardcoded padding** with spacing variables
5. **Replace hardcoded border-radius** with radius variables

## Validation

Use these tools to validate your changes:

### Browser DevTools
- Inspect element contrast ratios
- Test keyboard navigation
- Toggle dark mode
- Enable high contrast mode

### Extensions
- axe DevTools - Accessibility testing
- WAVE - Web accessibility evaluation
- Lighthouse - Performance & accessibility audit

### Manual Checks
- Tab through the entire page
- Test with screen reader (NVDA, JAWS, VoiceOver)
- Test on mobile device
- Test with reduced motion enabled

## Need Help?

### Documentation
- See [ACCESSIBILITY_THEME_GUIDE.md](./ACCESSIBILITY_THEME_GUIDE.md) for detailed guide
- See [THEME_QUICK_REFERENCE.md](./THEME_QUICK_REFERENCE.md) for quick reference
- See [PHASE_1_SUMMARY.md](./PHASE_1_SUMMARY.md) for implementation summary

### Examples
Look at `src/App.css` for examples of migrated styles.

### Questions?
- Check if the color/spacing/radius exists in `theme.css`
- Use semantic tokens when possible
- When in doubt, ask for review
