# 🔧 Troubleshooting Current Errors

## Error 1: onboarding.js:218 - Cannot set properties of null

### Issue
```
Uncaught (in promise) TypeError: Cannot set properties of null (setting 'onclick')
at addDevModeBanner (onboarding.js:218:61)
```

### Cause
The error references `onboarding.js` which doesn't exist in the current codebase. This could be:
1. A leftover script reference from a previous version
2. A browser extension injecting code
3. A cached file that needs to be cleared

### Solution
This error can be safely ignored as it doesn't affect the main app functionality. To fix:

1. **Clear browser cache:**
   - Press Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
   - Clear cached files
   - Reload the page

2. **Hard refresh:**
   - Press Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)

3. **Check for script references:**
   - The file doesn't exist in the project
   - No action needed unless you have custom onboarding code

## Error 2: Balance Showing 0 Despite Having Transactions

### Issue
```
BalanceSummary - Calculated: {totalTransactions: 4, income: '0', expense: '0', net: '0'}
```

### Possible Causes

1. **Transaction type field is missing or incorrect**
   - Transactions need `type: 'income'` or `type: 'expense'`
   - Check if imported transactions have the correct type

2. **Amount field is not a number**
   - Should be: `amount: 850` (number)
   - Not: `amount: "850"` (string)

3. **Transactions not in correct format**

### How to Check

Open browser console (F12) and run:
```javascript
// Check transactions
console.log(JSON.parse(localStorage.getItem('transactions')));

// Check first transaction
const txs = JSON.parse(localStorage.getItem('transactions'));
console.log('First transaction:', txs[0]);
console.log('Type:', txs[0]?.type);
console.log('Amount:', txs[0]?.amount, typeof txs[0]?.amount);
```

### Expected Format
```javascript
{
  id: "EXP-0001",
  date: "2025-12-24T00:00:00.000Z",
  type: "expense",              // ← Must be 'income' or 'expense'
  description: "UPI Payment",
  envelope: "",
  payment: "HDFC",
  from: "",
  to: "",
  expenseType: "",
  amount: 850                   // ← Must be a number, not string
}
```

### Solution

If transactions have wrong format, you can fix them:

**Option 1: Re-import with correct data**
1. Clear current transactions
2. Re-import with proper format

**Option 2: Fix in console**
```javascript
// Get transactions
let txs = JSON.parse(localStorage.getItem('transactions'));

// Fix each transaction
txs = txs.map(t => ({
  ...t,
  type: t.type || (t.amount < 0 ? 'expense' : 'income'),
  amount: parseFloat(t.amount)
}));

// Save back
localStorage.setItem('transactions', JSON.stringify(txs));

// Reload page
location.reload();
```

## Verification Steps

### 1. Check Transaction Data
```javascript
// In browser console (F12)
const txs = JSON.parse(localStorage.getItem('transactions'));
console.table(txs.map(t => ({
  id: t.id,
  type: t.type,
  amount: t.amount,
  date: t.date
})));
```

### 2. Check Balance Calculation
```javascript
// In browser console
const txs = JSON.parse(localStorage.getItem('transactions'));
const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount || 0), 0);
const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount || 0), 0);
console.log('Income:', income, 'Expense:', expense, 'Net:', income - expense);
```

### 3. Verify Import Function
The CSV import should create transactions like this:
```javascript
{
  id: transactionId,
  date: new Date(r.date).toISOString(),
  type,                          // 'income' or 'expense'
  description: r.description,
  envelope: r.envelope || '',
  payment: r.payment || '',
  from, to,
  expenseType: r.expenseType,
  amount: r.amount               // Should be number
}
```

## Quick Fix Commands

### Clear All Data and Start Fresh
```javascript
// WARNING: This deletes all transactions!
localStorage.clear();
location.reload();
```

### Fix Transaction Types
```javascript
let txs = JSON.parse(localStorage.getItem('transactions'));
txs = txs.map(t => {
  // Ensure type is set
  if (!t.type || !['income', 'expense', 'transfer'].includes(t.type)) {
    t.type = parseFloat(t.amount) < 0 ? 'expense' : 'income';
  }
  // Ensure amount is positive number
  t.amount = Math.abs(parseFloat(t.amount));
  return t;
});
localStorage.setItem('transactions', JSON.stringify(txs));
location.reload();
```

## Testing the Import

### Test Data
```
Date, Amount, Description, Type
24/12/25, 1000, Test Income, income
24/12/25, -500, Test Expense, expense
```

### Expected Result
- Income: ₹1,000
- Expense: ₹500
- Net: ₹500

### If Still Showing 0
1. Check browser console for errors
2. Verify transaction format in localStorage
3. Check if balance-summary.js is loaded
4. Try hard refresh (Ctrl+F5)

## Summary

1. **onboarding.js error** - Can be ignored, clear cache if annoying
2. **Balance showing 0** - Check transaction `type` and `amount` fields
3. **Use console commands** above to diagnose and fix

Most likely issue: Imported transactions don't have correct `type` field or `amount` is a string instead of number.
