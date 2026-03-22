# Phase 4 Quick Reference 🚀

## Import Statements

```jsx
// Mobile Table
import MobileTable from './components/MobileTable';

// Skeleton Loaders
import { CardSkeleton, TableSkeleton, ListSkeleton } from './components/SkeletonLoader';

// Empty States
import EmptyState, { NoTransactions, NoEnvelopes, NoResults, ErrorState } from './components/EmptyState';

// Enhanced Cards
import EnhancedCard, { StatCard, CompactCard } from './components/EnhancedCard';
```

---

## Component Cheat Sheet

### MobileTable
```jsx
<MobileTable transactions={data} onDelete={fn} />
```

### Skeletons
```jsx
<CardSkeleton />
<TableSkeleton rows={5} />
<ListSkeleton items={3} />
```

### Empty States
```jsx
<NoTransactions onAdd={fn} />
<NoEnvelopes onAdd={fn} />
<NoResults />
<ErrorState onRetry={fn} />
```

### Cards
```jsx
<EnhancedCard title="..." value="..." icon="..." trend={12} color="success" />
<StatCard label="..." value="..." icon="..." color="primary" />
<CompactCard>content</CompactCard>
```

---

## Color Variants
- `primary` - Blue
- `success` - Green
- `danger` - Red
- `warning` - Yellow

---

## Responsive Breakpoints
- Mobile: `< 768px`
- Tablet: `768px - 1024px`
- Desktop: `> 1024px`

---

## Common Patterns

### Loading → Data → Empty
```jsx
{loading && <TableSkeleton />}
{!loading && data.length === 0 && <NoResults />}
{!loading && data.length > 0 && <MobileTable transactions={data} />}
```

### Card Grid
```jsx
<div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
  <StatCard label="Balance" value="₹25K" icon="💰" />
  <StatCard label="Spent" value="₹15K" icon="💸" />
</div>
```

---

## CSS Classes

### Utility Classes
- `.mobile-table` - Mobile card view
- `.desktop-table` - Desktop table view
- `.empty-state-container` - Empty state wrapper
- `.skeleton-*` - Loading skeletons

### Responsive Helpers
```css
@media (max-width: 768px) {
  .desktop-only { display: none; }
}
```

---

## Tips

1. **Always provide loading states** - Better UX
2. **Use empty states with actions** - Guide users
3. **Test on real devices** - Emulators aren't enough
4. **Check touch targets** - Minimum 44x44px
5. **Respect reduced motion** - Accessibility first

---

## Quick Fixes

### Table not responsive?
```css
.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
```

### Cards not stacking on mobile?
```css
@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}
```

### Skeleton not animating?
Check for `prefers-reduced-motion` setting.

---

**Need more details? See PHASE_4_IMPROVEMENTS.md**
