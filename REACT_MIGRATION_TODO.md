# React Migration - Complete Feature Parity TODO

## ✅ COMPLETED Features

### Finance
- [x] Basic income/expense tracking
- [x] Payment methods management
- [x] Categories (envelopes) management
- [x] Transaction list
- [x] Balance summary
- [x] Payment balances
- [x] Month/year filtering
- [x] Settings modal
- [x] Transaction modal with multiple entries
- [x] Transfer support
- [x] Expense type classification (Need/Want/Save)
- [x] Budget tracking with progress bars
- [x] CSV report download (in store)

### Habits
- [x] Atomic Habits wizard (3 steps)
- [x] Identity-based habits
- [x] Trigger cues and habit stacking
- [x] Frequency selection
- [x] Milestones and progressions
- [x] Streak tracking
- [x] Daily check-ins
- [x] Habit cards with full details

### Core
- [x] Firebase authentication
- [x] Firestore data sync
- [x] Toast notifications
- [x] Responsive design basics

## 🚧 TODO - Missing Features

### Finance Features

#### 1. CSV/Excel Import
**Priority: HIGH**
- [ ] File upload component
- [ ] CSV parser
- [ ] Preview modal with validation
- [ ] Import confirmation
- [ ] Error handling for invalid data

**Files to create:**
- `src/components/Finance/CSVImport.jsx`
- `src/utils/csvParser.js`

#### 2. Data Export/Import (JSON)
**Priority: HIGH**
- [ ] Export all data to JSON
- [ ] Import JSON with merge
- [ ] Download functionality
- [ ] File validation

**Files to create:**
- `src/components/Finance/DataManager.jsx`

#### 3. Enhanced Transaction List
**Priority: MEDIUM**
- [ ] Load more / pagination
- [ ] Load all transactions
- [ ] Load fewer (collapse)
- [ ] Time ago display
- [ ] Transaction icons based on description

**Files to update:**
- `src/components/Finance/TransactionList.jsx`

#### 4. Budget Management UI
**Priority: MEDIUM**
- [ ] Set default budgets per envelope
- [ ] Monthly budget override
- [ ] Budget input modal
- [ ] Budget list view

**Files to create:**
- `src/components/Finance/BudgetManager.jsx`

#### 5. Profile Modal Tabs
**Priority: MEDIUM**
- [ ] Finance Setup tab (payment methods, envelopes)
- [ ] Data tab (export/import, CSV)
- [ ] Account tab (user info, stats, logout)
- [ ] Tab navigation

**Files to update:**
- `src/components/Profile/ProfileModal.jsx`

#### 6. Visual Enhancements
**Priority: LOW**
- [ ] Payment method icons (auto-detect)
- [ ] Envelope icons (auto-detect)
- [ ] Collapsible sections
- [ ] Balance toggle (show/hide)

### Habit Features

#### 7. Calendar View
**Priority: HIGH**
- [ ] Monthly calendar grid
- [ ] Habit completion dots
- [ ] Month navigation
- [ ] Click to toggle completion
- [ ] Color-coded by habit

**Files to create:**
- `src/components/Habits/HabitCalendar.jsx`

#### 8. Habit Detail Sheet
**Priority: HIGH**
- [ ] Bottom sheet modal
- [ ] Full habit details
- [ ] Streak display
- [ ] Next milestone
- [ ] Edit button
- [ ] Delete button
- [ ] Per-habit calendar

**Files to create:**
- `src/components/Habits/HabitSheet.jsx`

#### 9. Group by Identity
**Priority: MEDIUM**
- [ ] Toggle button
- [ ] Grouped view rendering
- [ ] Identity headers
- [ ] Collapsible groups

**Files to update:**
- `src/components/Habits/HabitsTab.jsx`

#### 10. Never Miss Twice Banner
**Priority: MEDIUM**
- [ ] Detect missed yesterday
- [ ] Warning banner
- [ ] Only show on today
- [ ] List missed habits

**Files to update:**
- `src/components/Habits/HabitsTab.jsx`

#### 11. Date Navigation
**Priority: MEDIUM**
- [ ] Previous/next day buttons
- [ ] Date picker
- [ ] Date label (Today, Yesterday, etc.)
- [ ] Navigate to specific date

**Files to update:**
- `src/components/Habits/HabitsTab.jsx`

#### 12. Habit Dashboard Metrics
**Priority: LOW**
- [ ] Today completion percentage
- [ ] 7-day consistency
- [ ] 30-day consistency
- [ ] Best streak
- [ ] Total votes cast
- [ ] Circular progress rings

**Files to create:**
- `src/components/Habits/HabitDashboard.jsx`

### UI/UX Features

#### 13. Bottom Navigation (Mobile)
**Priority: MEDIUM**
- [ ] Fixed bottom nav bar
- [ ] Finance/Habits tabs
- [ ] Active state
- [ ] Mobile-only display

**Files to create:**
- `src/components/BottomNav.jsx`

#### 14. Enhanced Modals
**Priority: LOW**
- [ ] Slide-up animation
- [ ] Backdrop blur
- [ ] Swipe to close (mobile)
- [ ] Smooth transitions

#### 15. Loading States
**Priority: LOW**
- [ ] Skeleton loaders
- [ ] Loading spinners
- [ ] Optimistic UI updates

### Data Features

#### 16. Advanced Filtering
**Priority: MEDIUM**
- [ ] Filter by envelope (chips)
- [ ] Filter by payment method
- [ ] Filter by expense type
- [ ] Date range picker

**Files to create:**
- `src/components/Finance/FilterBar.jsx`

#### 17. Statistics & Reports
**Priority: LOW**
- [ ] Expense by category breakdown
- [ ] Payment method breakdown
- [ ] Monthly trends
- [ ] Year-over-year comparison

**Files to create:**
- `src/components/Finance/Statistics.jsx`

## 📋 Implementation Priority

### Phase 1 (Critical - Week 1)
1. CSV Import
2. Habit Calendar View
3. Habit Detail Sheet
4. Profile Modal Tabs

### Phase 2 (Important - Week 2)
5. Enhanced Transaction List (pagination)
6. Budget Management UI
7. Group by Identity
8. Bottom Navigation

### Phase 3 (Nice to Have - Week 3)
9. Never Miss Twice Banner
10. Date Navigation for Habits
11. Advanced Filtering
12. Visual Enhancements

### Phase 4 (Polish - Week 4)
13. Habit Dashboard Metrics
14. Statistics & Reports
15. Loading States
16. Animation improvements

## 🔧 Technical Debt

- [ ] Add error boundaries
- [ ] Add loading skeletons
- [ ] Optimize re-renders
- [ ] Add unit tests
- [ ] Add E2E tests
- [ ] Improve accessibility
- [ ] Add keyboard shortcuts
- [ ] Add offline support (PWA)

## 📝 Notes

### CSV Import Format
```csv
Date,Type,Description,Category,Payment Method,Expense Type,Amount
2024-01-15,expense,Groceries,Food,Cash,need,500
2024-01-16,income,Salary,,,need,50000
2024-01-17,transfer,,,Cash to Bank,,,1000
```

### Habit Calendar Colors
Use the same color palette as original:
- Indigo: #6366f1
- Amber: #f59e0b
- Emerald: #10b981
- Red: #ef4444
- Violet: #8b5cf6
- Cyan: #06b6d4
- Orange: #f97316
- Pink: #ec4899

### State Management
All new features should use Zustand stores:
- Finance features → `financeStore.js`
- Habit features → `habitStore.js`
- UI state → Consider new `uiStore.js`

### Component Structure
```
src/components/
├── Finance/
│   ├── FinanceTab.jsx (main)
│   ├── TransactionModal.jsx ✅
│   ├── BudgetView.jsx ✅
│   ├── CSVImport.jsx ⏳
│   ├── DataManager.jsx ⏳
│   ├── BudgetManager.jsx ⏳
│   └── FilterBar.jsx ⏳
├── Habits/
│   ├── HabitsTab.jsx (main) ✅
│   ├── HabitCalendar.jsx ⏳
│   ├── HabitSheet.jsx ⏳
│   └── HabitDashboard.jsx ⏳
└── BottomNav.jsx ⏳
```

## 🎯 Success Criteria

The React app will have 100% feature parity when:
- [ ] All features from `public/index.html` are implemented
- [ ] All features work without bugs
- [ ] Data migrates seamlessly
- [ ] Performance is equal or better
- [ ] Mobile experience is smooth
- [ ] All tests pass

## 📚 Resources

- Original app: `public/index.html`
- Finance logic: `public/finance.js`
- Habits logic: `public/habits.js`
- Styles reference: `public/index.html` (inline styles)

## 🚀 Quick Start for Contributors

1. Pick a feature from Phase 1
2. Create the component file
3. Add to the appropriate store if needed
4. Import and use in parent component
5. Test thoroughly
6. Update this checklist

---

**Last Updated:** 2024
**Status:** In Progress (30% complete)
**Target:** 100% feature parity
