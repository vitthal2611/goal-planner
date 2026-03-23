# 🔧 Fix Balance Showing Zero

## Issue
Balance shows ₹0 for income and expense despite having transactions.

## Quick Fix

Open browser console (F12) and paste this:

```javascript
// Fix transaction data
(function() {
  try {
    let txs = JSON.parse(localStorage.getItem('transactions') || '[]');
    
    console.log('Before fix:', txs.length, 'transactions');
    
    // Fix each transaction
    txs = txs.map(t => {
      // Ensure type is valid
      if (!t.type || !['income', 'expense', 'transfer'].includes(t.type)) {
        const amt = parseFloat(t.amount);
        t.type = amt < 0 ? 'expense' : 'income';
      }
      
      // Ensure amount is positive number
      t.amount = Math.abs(parseFloat(t.amount) || 0);
      
      return t;
    });
    
    // Save back
    localStorage.setItem('transactions', JSON.stringify(txs));
    
    console.log('After fix:', txs.length, 'transactions');
    console.log('Sample:', txs[0]);
    
    // Reload to see changes
    alert('Fixed! Page will reload.');
    location.reload();
  } catch (e) {
    console.error('Fix failed:', e);
    alert('Fix failed. Check console for details.');
  }
})();
```

## What This Does

1. Loads transactions from localStorage
2. Fixes the `type` field (income/expense/transfer)
3. Ensures `amount` is a positive number
4. Saves back to localStorage
5. Reloads the page

## Verify It Worked

After reload, check:
- Income should show correct amount
- Expense should show correct amount
- Net balance should be calculated

## If Still Not Working

### Check Transaction Format

Run this in console:
```javascript
const txs = JSON.parse(localStorage.getItem('transactions'));
console.table(txs.map(t => ({
  id: t.id,
  type: t.type,
  amount: t.amount,
  amountType: typeof t.amount
})));
```

Expected output:
- `type`: "income" or "expense"
- `amount`: number (not string)
- `amountType`: "number"

### Manual Check

```javascript
const txs = JSON.parse(localStorage.getItem('transactions'));
const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount || 0), 0);
const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount || 0), 0);
console.log('Income:', income);
console.log('Expense:', expense);
console.log('Net:', income - expense);
```

If this shows correct values but UI doesn't, it's a display issue.

### Force UI Update

```javascript
// Trigger UI update
if (typeof updateBalanceSummary === 'function') {
  updateBalanceSummary();
}
if (typeof updateRecentTransactions === 'function') {
  updateRecentTransactions();
}
```

## Prevention

For future imports, the CSV import has been fixed to:
- Always set correct `type` field
- Always parse `amount` as number
- Use `Math.abs()` to ensure positive values

## Alternative: Re-import

If fix doesn't work:
1. Export your data (Profile → Export Data)
2. Clear localStorage
3. Re-import using the paste feature
4. Data will be in correct format

## Summary

The quick fix script above should resolve the balance showing zero issue. If not, check the transaction format manually using the verification commands.
