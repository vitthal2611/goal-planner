# Migration Guide: public/index.html → React + Vite

This guide provides a step-by-step plan to migrate the full-featured Life Tracker app from `public/index.html` to your React + Vite application.

## Current State

- **Root `index.html`**: Vite entry point with Firebase config (✅ Already set up)
- **`src/App.jsx`**: Currently only shows BulkUpload component
- **`public/index.html`**: Full Life Tracker app with multiple tabs and features (6000+ lines)

## Migration Strategy

Migrate incrementally by feature/tab, testing each step before moving to the next.

---

## Phase 1: Setup & Infrastructure (Week 1)

### Step 1.1: Create Core Services
Move Firebase and data management to React services.

**Files to create:**
- `src/services/firebase.js` - Port from `public/firebase-service.js`
- `src/services/dataManager.js` - Port from `public/data-manager.js`
- `src/contexts/AppContext.jsx` - Global state management

**Actions:**
```bash
# Create services directory structure
mkdir -p src/services src/contexts
```

### Step 1.2: Port Design System
Move CSS design tokens and utilities to React.

**Files to create:**
- `src/styles/design-tokens.css` - Extract from `public/design-system.css`
- `src/styles/global.css` - Port global styles from `public/index.html` <style> block

**Actions:**
- Copy design tokens (CSS variables) from public/index.html
- Import in `src/main.jsx`

### Step 1.3: Create Layout Components
Build the main app shell.

**Components to create:**
- `src/components/AppLayout.jsx` - Main container
- `src/components/AppHeader.jsx` - Header with tabs
- `src/components/DateNavigation.jsx` - Port from `public/date-navigation.js`
- `src/components/ProfileModal.jsx` - Settings modal

---

## Phase 2: Core Features (Week 2-3)

### Step 2.1: Quick Track Tab (Priority 1)
The main transaction entry interface.

**Components to create:**
- `src/components/QuickTrack/QuickTrackTab.jsx` - Main container
- `src/components/QuickTrack/TypeSelector.jsx` - Income/Expense/Transfer buttons
- `src/components/QuickTrack/QuickForm.jsx` - Transaction form
- `src/components/QuickTrack/PaymentBalances.jsx` - Port from payment balances section

**Hooks to create:**
- `src/hooks/usePaymentMethods.js` - Manage payment methods
- `src/hooks/useEnvelopes.js` - Manage envelopes

**Files to reference:**
- `public/index.html` (lines 1-2000 approx)
- `public/data-manager.js`

### Step 2.2: Balance Summary
Display income/expense overview.

**Components to create:**
- `src/components/BalanceSummary/BalanceSummaryTab.jsx`
- `src/components/BalanceSummary/BalanceCard.jsx`
- `src/components/BalanceSummary/EnvelopeList.jsx`

**Files to reference:**
- `public/balance-summary.js`
- `public/balance-summary.css`

### Step 2.3: Today's Transactions
Show transactions for current date.

**Components to create:**
- `src/components/TodayTransactions/TodayTransactionsTab.jsx`
- `src/components/TodayTransactions/TransactionList.jsx`
- `src/components/TodayTransactions/TransactionItem.jsx`

**Files to reference:**
- `public/today-transactions.js`
- `public/today-transactions.css`

---

## Phase 3: Advanced Features (Week 4)

### Step 3.1: Transaction Review
Review and edit past transactions.

**Components to create:**
- `src/components/TransactionReview/TransactionReviewTab.jsx`
- `src/components/TransactionReview/TransactionFilters.jsx`
- `src/components/TransactionReview/EditTransactionModal.jsx`

**Files to reference:**
- `public/transaction-review.js`
- `public/transaction-review.css`

### Step 3.2: Insights & Analytics
Charts and spending analysis.

**Components to create:**
- `src/components/Insights/InsightsTab.jsx`
- `src/components/Insights/SpendingChart.jsx`
- `src/components/Insights/CategoryBreakdown.jsx`

**Files to reference:**
- `public/insights.js`
- `public/insights.css`

### Step 3.3: Drill Down
Detailed envelope analysis.

**Components to create:**
- `src/components/DrillDown/DrillDownTab.jsx`
- `src/components/DrillDown/EnvelopeDetails.jsx`
- `src/components/DrillDown/TransactionHistory.jsx`

**Files to reference:**
- `public/drill-down.js`
- `public/drill-down.css`

---

## Phase 4: Additional Features (Week 5)

### Step 4.1: Habits Dashboard
Track daily habits.

**Components to create:**
- `src/components/Habits/HabitDashboardTab.jsx`
- `src/components/Habits/HabitCard.jsx`
- `src/components/Habits/HabitForm.jsx`
- `src/components/Habits/HabitFAB.jsx`

**Files to reference:**
- `public/habit-dashboard.js`
- `public/habit-form.js`
- `public/habit-fab.css`

### Step 4.2: NWS (Net Worth Statement)
Financial overview.

**Components to create:**
- `src/components/NWS/NWSTab.jsx`
- `src/components/NWS/AssetsList.jsx`
- `src/components/NWS/LiabilitiesList.jsx`

**Files to reference:**
- `public/nws.js`
- `public/nws.css`

---

## Phase 5: Shared Components (Ongoing)

### Step 5.1: Modals & Overlays
Reusable modal components.

**Components to create:**
- `src/components/shared/Modal.jsx` - Base modal
- `src/components/shared/BottomSheet.jsx` - Mobile bottom sheet
- `src/components/shared/Toast.jsx` - Notifications

### Step 5.2: Form Components
Reusable form inputs.

**Components to create:**
- `src/components/shared/AmountInput.jsx`
- `src/components/shared/DatePicker.jsx`
- `src/components/shared/Select.jsx`
- `src/components/shared/Button.jsx`

### Step 5.3: Envelope Components
Envelope-specific UI.

**Components to create:**
- `src/components/Envelopes/EnvelopeBottomSheet.jsx` - Port from `public/envelope-bottom-sheet.js`
- `src/components/Envelopes/EnvelopeActions.jsx` - Port from `public/envelope-actions.js`
- `src/components/Envelopes/EnvelopeBudget.jsx` - Port from `public/envelope-budget.js`

---

## Phase 6: Testing & Cleanup (Week 6)

### Step 6.1: Feature Parity Check
Ensure all features work in React version.

**Checklist:**
- [ ] All tabs functional
- [ ] Firebase CRUD operations working
- [ ] Date navigation working
- [ ] Payment methods management
- [ ] Envelope management
- [ ] Transaction editing/deletion
- [ ] Habits tracking
- [ ] Insights/charts rendering
- [ ] Mobile responsive
- [ ] Offline support (if applicable)

### Step 6.2: Performance Optimization
- [ ] Code splitting by route/tab
- [ ] Lazy load heavy components
- [ ] Optimize Firebase queries
- [ ] Add loading states
- [ ] Implement error boundaries

### Step 6.3: Remove Old Files
Once everything is migrated and tested:

```bash
# Backup first!
mkdir backup
cp public/index.html backup/

# Remove old HTML app
rm public/index.html

# Remove old JS modules (after porting)
rm public/firebase-service.js
rm public/data-manager.js
rm public/date-navigation.js
# ... etc
```

---

## Migration Checklist by Tab

### ✅ Tabs to Migrate

- [ ] **Quick Track** - Main transaction entry
- [ ] **Balance Summary** - Income/expense overview
- [ ] **Today** - Today's transactions
- [ ] **Review** - Transaction history & editing
- [ ] **Insights** - Analytics & charts
- [ ] **Drill Down** - Envelope details
- [ ] **Habits** - Habit tracking
- [ ] **NWS** - Net worth statement

### ✅ Shared Features

- [ ] Date navigation (prev/next day)
- [ ] Profile/Settings modal
- [ ] Payment methods CRUD
- [ ] Envelope CRUD
- [ ] Toast notifications
- [ ] Modal system
- [ ] Bottom sheets (mobile)

---

## Key Files Reference

### Current React App
- `index.html` - Vite entry (keep)
- `src/main.jsx` - React entry (keep)
- `src/App.jsx` - Main app component (modify)

### To Migrate From
- `public/index.html` - Full app (6000+ lines)
- `public/firebase-service.js` - Firebase wrapper
- `public/data-manager.js` - Data operations
- `public/date-navigation.js` - Date controls
- `public/*.js` - Feature modules
- `public/*.css` - Feature styles

### Design System
- `public/design-system.css` - Design tokens
- `public/mobile-clean.css` - Mobile styles

---

## Recommended Approach

### Option A: Big Bang (Faster, Riskier)
1. Create all components in 2-3 weeks
2. Switch over completely
3. Fix bugs as they appear

### Option B: Incremental (Slower, Safer) ⭐ RECOMMENDED
1. Keep both versions running
2. Migrate one tab per week
3. Test thoroughly before moving to next
4. Use feature flags to toggle between old/new
5. Remove old version only when 100% confident

### Option C: Hybrid
1. Create new React app at different route (e.g., `/app`)
2. Keep old version at `/public/index.html`
3. Gradually migrate users
4. Remove old version after validation period

---

## Technical Considerations

### State Management
- Use React Context for global state (date, user, settings)
- Consider Zustand or Redux if state gets complex
- Keep Firebase operations in custom hooks

### Routing
- Add React Router if you want URL-based navigation
- Or use tab state (simpler for single-page app)

### Styling
- Keep CSS modules or migrate to styled-components/Tailwind
- Maintain design tokens for consistency
- Ensure mobile-first approach

### Firebase
- Move Firebase config to `.env` file
- Use Firebase v9 modular SDK (not compat)
- Implement proper error handling

---

## Next Steps

1. **Review this guide** with your team
2. **Choose migration approach** (A, B, or C)
3. **Start with Phase 1** (infrastructure)
4. **Migrate one tab** completely before moving to next
5. **Test thoroughly** at each step
6. **Document changes** as you go

---

## Questions to Answer Before Starting

1. Do you want to keep both versions during migration?
2. Should we add routing or keep single-page tabs?
3. Any new features to add during migration?
4. Timeline/deadline for completion?
5. Who will test each migrated feature?

---

## Success Criteria

✅ All features from `public/index.html` work in React
✅ No data loss during migration
✅ Performance is equal or better
✅ Mobile experience maintained
✅ All Firebase operations functional
✅ Old HTML file can be safely deleted

---

**Estimated Total Time:** 4-6 weeks (depending on team size and approach)

**Priority Order:** Quick Track → Balance Summary → Today → Review → Others
