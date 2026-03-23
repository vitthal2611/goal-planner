# Testing Checklist - Life Tracker

Complete testing guide to verify all features are working correctly.

---

## 🧪 Pre-Testing Setup

### 1. Start the Application
```bash
npm install
npm run dev
```

### 2. Clear Previous Data (Optional)
Open browser console and run:
```javascript
localStorage.clear()
location.reload()
```

---

## ✅ Phase 1: Infrastructure Tests

### Date Navigation
- [ ] App loads without errors
- [ ] Current month/year displayed correctly
- [ ] Click ← arrow - goes to previous month
- [ ] Click → arrow - goes to next month
- [ ] Click month label - toggles "All Months" view
- [ ] Date changes persist after page refresh

### Settings Modal
- [ ] Click ⚙️ icon - modal opens
- [ ] Modal has 3 tabs (Payment Methods, Envelopes, Data)
- [ ] Click × button - modal closes
- [ ] Click outside modal - modal closes
- [ ] Default payment methods loaded (Cash, Credit Card, Debit Card, UPI)
- [ ] Default envelopes loaded (Food, Transport, Shopping, etc.)

### Payment Methods Management
- [ ] Type new payment method name
- [ ] Click "Add" button
- [ ] New method appears in list
- [ ] Click "Delete" on a method
- [ ] Method removed from list
- [ ] Changes persist after refresh

---

## ✅ Phase 2.1: Quick Track Tab Tests

### Type Selection
- [ ] Three type buttons visible (Income, Expense, Transfer)
- [ ] Click "Income" - button becomes active (green)
- [ ] Click "Expense" - button becomes active (red)
- [ ] Click "Transfer" - button becomes active (blue)
- [ ] Form fields change based on selected type

### Add Income Transaction
- [ ] Select "Income" type
- [ ] Enter amount: 5000
- [ ] Enter description: "Salary"
- [ ] Select payment method: "Credit Card"
- [ ] Click "Add Income"
- [ ] Toast notification appears: "✅ Transaction added successfully!"
- [ ] Form resets to empty
- [ ] Payment balances update (Credit Card +₹5,000)

### Add Expense Transaction
- [ ] Select "Expense" type
- [ ] Enter amount: 500
- [ ] Enter description: "Groceries"
- [ ] Select category: "Food"
- [ ] Select payment method: "Cash"
- [ ] Select expense type: "Need"
- [ ] Click "Add Expense"
- [ ] Toast notification appears
- [ ] Form resets
- [ ] Payment balances update (Cash -₹500)

### Add Transfer Transaction
- [ ] Select "Transfer" type
- [ ] Enter amount: 1000
- [ ] Enter description: "Moving funds"
- [ ] Select "From Account": "Cash"
- [ ] Select "To Account": "Credit Card"
- [ ] Click "Add Transfer"
- [ ] Toast notification appears
- [ ] Form resets
- [ ] Payment balances update (Cash -₹1,000, Credit Card +₹1,000)

### Form Validation
- [ ] Try to submit with empty amount - error shown
- [ ] Try to submit with 0 amount - error shown
- [ ] Try to submit expense without category - error shown
- [ ] Try to submit without payment method - error shown
- [ ] Try to submit transfer with same From/To - error shown

### Payment Balances
- [ ] All payment methods displayed in grid
- [ ] Balances calculated correctly
- [ ] Positive balances shown in green
- [ ] Negative balances shown in red
- [ ] Zero balances shown in gray
- [ ] Total balance displayed correctly
- [ ] Balances update after each transaction

---

## ✅ Phase 2.2: Balance Summary Tab Tests

### Balance Cards
- [ ] Switch to "Balance" tab
- [ ] Three cards visible (Income, Expense, Net Balance)
- [ ] Income card shows correct total (green)
- [ ] Expense card shows correct total (red)
- [ ] Net balance card shows correct calculation
- [ ] Net balance is green if positive, red if negative
- [ ] Cards have hover effects

### Expense Type Breakdown
- [ ] Three expense type cards visible (Needs, Wants, Savings)
- [ ] Each card shows correct amount
- [ ] Percentages add up to 100%
- [ ] Cards color-coded (Needs=Amber, Wants=Blue, Savings=Green)
- [ ] Cards have hover effects

### Category Breakdown
- [ ] All categories with expenses listed
- [ ] Categories sorted by amount (highest first)
- [ ] Each category shows icon and name
- [ ] Amount displayed correctly
- [ ] Percentage calculated correctly
- [ ] Progress bar width matches percentage
- [ ] Progress bars have smooth animation

### Date Filtering
- [ ] Go to previous month (no transactions)
- [ ] All cards show ₹0
- [ ] Return to current month
- [ ] Cards show correct amounts again
- [ ] Toggle "All Months" view
- [ ] Cards show year-to-date totals

### Empty State
- [ ] Clear all transactions
- [ ] Empty state message shown
- [ ] Icon and helpful text displayed
- [ ] Add transaction in Quick Track
- [ ] Empty state disappears

---

## ✅ Phase 2.3: Today's Transactions Tab Tests

### Summary Cards
- [ ] Switch to "Today" tab
- [ ] Three summary cards visible
- [ ] Income card shows today's income
- [ ] Expense card shows today's expense
- [ ] Net card shows today's net balance
- [ ] Cards color-coded correctly

### Transaction List
- [ ] All today's transactions listed
- [ ] Transactions sorted by time (newest first)
- [ ] Each transaction shows icon, description, amount
- [ ] Transaction type color-coded
- [ ] Time displayed correctly
- [ ] Category/payment shown in metadata

### Expand/Collapse
- [ ] Click transaction to expand
- [ ] Details panel slides down smoothly
- [ ] All transaction details visible
- [ ] Click again to collapse
- [ ] Panel slides up smoothly
- [ ] Click expand button (▼) works same way

### Delete Transaction
- [ ] Expand a transaction
- [ ] Click "🗑️ Delete" button
- [ ] Confirmation dialog appears
- [ ] Click "Cancel" - nothing happens
- [ ] Click "OK" - transaction deleted
- [ ] Toast notification appears
- [ ] Transaction removed from list
- [ ] Summary cards update
- [ ] Payment balances update

### Empty State
- [ ] Delete all today's transactions
- [ ] Empty state message shown
- [ ] Icon and helpful text displayed

---

## ✅ Phase 3.1: Transaction Review Tab Tests

### Summary Statistics
- [ ] Switch to "Review" tab
- [ ] Four summary stats visible
- [ ] Transaction count correct
- [ ] Income total correct
- [ ] Expense total correct
- [ ] Net balance correct
- [ ] Stats color-coded appropriately

### Transaction Table
- [ ] All transactions displayed in table
- [ ] Table headers visible (Date, Type, Description, etc.)
- [ ] Each row shows complete transaction info
- [ ] Transaction types color-coded
- [ ] Amounts formatted correctly
- [ ] Date and time displayed
- [ ] Table has hover effects on rows

### Search Functionality
- [ ] Type "food" in search box
- [ ] Results filter in real-time
- [ ] Only matching transactions shown
- [ ] Summary stats update
- [ ] Clear search
- [ ] All transactions return

### Filter by Type
- [ ] Select "Income" from type dropdown
- [ ] Only income transactions shown
- [ ] Summary stats update
- [ ] Select "Expense"
- [ ] Only expense transactions shown
- [ ] Select "All Types"
- [ ] All transactions return

### Filter by Category
- [ ] Select "Food" from category dropdown
- [ ] Only food transactions shown
- [ ] Summary stats update
- [ ] Select "All Categories"
- [ ] All transactions return

### Filter by Payment
- [ ] Select "Cash" from payment dropdown
- [ ] Only cash transactions shown
- [ ] Summary stats update
- [ ] Select "All Payments"
- [ ] All transactions return

### Combined Filters
- [ ] Apply type filter: "Expense"
- [ ] Apply category filter: "Food"
- [ ] Apply payment filter: "Cash"
- [ ] Only transactions matching all criteria shown
- [ ] Summary stats correct for filtered data
- [ ] Click "✕ Reset" button
- [ ] All filters cleared
- [ ] All transactions return

### Sort Functionality
- [ ] Select "Date (Newest)" - newest at top
- [ ] Select "Date (Oldest)" - oldest at top
- [ ] Select "Amount (High to Low)" - highest at top
- [ ] Select "Amount (Low to High)" - lowest at top

### Edit Transaction
- [ ] Click "✏️" edit button on any transaction
- [ ] Modal opens with pre-filled form
- [ ] All fields populated correctly
- [ ] Change amount from 500 to 600
- [ ] Change description
- [ ] Click "Save Changes"
- [ ] Modal closes
- [ ] Table updates with new values
- [ ] Toast notification appears
- [ ] Summary stats update
- [ ] Refresh page - changes persisted

### Edit Modal Validation
- [ ] Open edit modal
- [ ] Clear amount field
- [ ] Try to save - validation error
- [ ] Enter valid amount
- [ ] Click "Cancel" - modal closes without saving
- [ ] Transaction unchanged

### Delete from Table
- [ ] Click "🗑️" delete button
- [ ] Confirmation dialog appears
- [ ] Click "Cancel" - nothing happens
- [ ] Click "OK" - transaction deleted
- [ ] Toast notification appears
- [ ] Transaction removed from table
- [ ] Summary stats update

### Export to CSV
- [ ] Apply some filters (e.g., type: Expense)
- [ ] Click "📥 Export CSV" button
- [ ] File downloads automatically
- [ ] Toast notification appears
- [ ] Open CSV file
- [ ] Headers correct (ID, Date, Type, etc.)
- [ ] Data matches filtered view
- [ ] Special characters escaped properly
- [ ] File opens in Excel/Google Sheets

### Responsive Table
- [ ] Resize browser to mobile width
- [ ] Table scrolls horizontally
- [ ] All columns accessible via scroll
- [ ] Touch scrolling works smoothly

### Empty State
- [ ] Apply filters that match no transactions
- [ ] Empty state message shown
- [ ] Icon and helpful text displayed
- [ ] Clear filters
- [ ] Transactions return

---

## ✅ Cross-Feature Tests

### Data Persistence
- [ ] Add transactions in Quick Track
- [ ] Refresh page
- [ ] All transactions still present
- [ ] Balances correct
- [ ] Navigate to different tabs
- [ ] All data consistent

### Date Navigation Impact
- [ ] Add transactions in current month
- [ ] Note balances in Balance Summary
- [ ] Go to previous month
- [ ] Balance Summary shows ₹0
- [ ] Transaction Review shows no transactions
- [ ] Return to current month
- [ ] All data returns

### Cross-Tab Consistency
- [ ] Add transaction in Quick Track
- [ ] Check Balance Summary - updated
- [ ] Check Today tab - transaction listed
- [ ] Check Review tab - transaction in table
- [ ] Edit transaction in Review tab
- [ ] Check Today tab - changes reflected
- [ ] Check Balance Summary - stats updated

### Payment Method Changes
- [ ] Add new payment method in Settings
- [ ] Check Quick Track form - new method in dropdown
- [ ] Check Review filters - new method in dropdown
- [ ] Add transaction with new method
- [ ] Check Payment Balances - new method shown
- [ ] Delete payment method in Settings
- [ ] Method removed from all dropdowns

---

## ✅ Responsive Design Tests

### Desktop (1920x1080)
- [ ] All tabs display correctly
- [ ] Tables use full width
- [ ] Cards in grid layouts
- [ ] No horizontal scrolling
- [ ] Hover effects work

### Tablet (768x1024)
- [ ] Layout adapts appropriately
- [ ] Cards stack or resize
- [ ] Tables remain usable
- [ ] Touch interactions work
- [ ] No layout breaks

### Mobile (375x667)
- [ ] Single column layouts
- [ ] Cards stack vertically
- [ ] Tables scroll horizontally
- [ ] Buttons are touch-friendly (min 44px)
- [ ] Text readable without zoom
- [ ] Forms easy to fill
- [ ] Modals fit screen

---

## ✅ Browser Compatibility Tests

### Chrome/Edge
- [ ] All features work
- [ ] No console errors
- [ ] Smooth animations
- [ ] LocalStorage works

### Firefox
- [ ] All features work
- [ ] No console errors
- [ ] Smooth animations
- [ ] LocalStorage works

### Safari (Desktop)
- [ ] All features work
- [ ] No console errors
- [ ] Smooth animations
- [ ] LocalStorage works

### Mobile Safari (iOS)
- [ ] All features work
- [ ] Touch interactions smooth
- [ ] No layout issues
- [ ] LocalStorage works

### Chrome Mobile (Android)
- [ ] All features work
- [ ] Touch interactions smooth
- [ ] No layout issues
- [ ] LocalStorage works

---

## ✅ Performance Tests

### Load Time
- [ ] Initial load < 2 seconds
- [ ] Tab switching < 100ms
- [ ] Search results < 100ms
- [ ] Filter application < 100ms

### Large Dataset
- [ ] Add 100+ transactions
- [ ] All tabs still responsive
- [ ] Search still fast
- [ ] Filters still fast
- [ ] Export still works
- [ ] No lag or stuttering

### Memory Usage
- [ ] Open browser DevTools
- [ ] Check memory usage
- [ ] Navigate between tabs
- [ ] No memory leaks
- [ ] Memory usage stable

---

## ✅ Error Handling Tests

### Invalid Data
- [ ] Try to add transaction with negative amount
- [ ] Try to add transaction with text in amount field
- [ ] Try to add transaction with very large amount
- [ ] All handled gracefully with error messages

### Network Issues
- [ ] Disable network
- [ ] App still works (LocalStorage)
- [ ] Re-enable network
- [ ] App continues working

### Browser Storage
- [ ] Fill LocalStorage to limit
- [ ] App handles gracefully
- [ ] Clear some data
- [ ] App recovers

---

## ✅ Accessibility Tests

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Focus indicators visible
- [ ] Enter key submits forms
- [ ] Escape key closes modals
- [ ] Arrow keys work in dropdowns

### Screen Reader
- [ ] All buttons have labels
- [ ] Form fields have labels
- [ ] Error messages announced
- [ ] Success messages announced

### Color Contrast
- [ ] Text readable on all backgrounds
- [ ] Meets WCAG AA standards
- [ ] Color not sole indicator

---

## 🐛 Bug Tracking

### Found Issues
| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| - | - | - | - |

### To Fix
- [ ] Issue 1
- [ ] Issue 2
- [ ] Issue 3

---

## ✅ Final Checklist

### Before Deployment
- [ ] All tests passed
- [ ] No console errors
- [ ] No console warnings
- [ ] Documentation updated
- [ ] README.md complete
- [ ] Screenshots added
- [ ] Demo video created
- [ ] Code reviewed
- [ ] Git committed
- [ ] Build tested (`npm run build`)
- [ ] Production build tested (`npm run preview`)

### Deployment Ready
- [ ] All features working
- [ ] All bugs fixed
- [ ] Performance optimized
- [ ] Security reviewed
- [ ] Backup plan ready
- [ ] Rollback plan ready

---

## 📊 Test Results Summary

**Date:** _____________
**Tester:** _____________
**Browser:** _____________
**Device:** _____________

**Total Tests:** _____
**Passed:** _____
**Failed:** _____
**Skipped:** _____

**Pass Rate:** _____%

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________

---

## 🎯 Sign-Off

- [ ] All critical tests passed
- [ ] All major features working
- [ ] No blocking bugs
- [ ] Ready for production

**Approved by:** _____________
**Date:** _____________

---

**Happy Testing!** 🧪
