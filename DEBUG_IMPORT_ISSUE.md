# 🔍 Debug Import Issue

## Quick Diagnostic

Open browser console (F12) and check for these messages:

### 1. Check if CSV Import initialized
Look for:
```
CSV Import: Initialized successfully
```

If you see warnings like:
```
CSV Import: csvConfirmImportBtn not found
```
Then the modal button is missing.

### 2. Test the Import Flow

Paste this in console to test:
```javascript
// Check if elements exist
console.log('csvImportBtn:', document.getElementById('csvImportBtn'));
console.log('csvImportFileInput:', document.getElementById('csvImportFileInput'));
console.log('csvConfirmImportBtn:', document.getElementById('csvConfirmImportBtn'));
console.log('csvPreviewModal:', document.getElementById('csvPreviewModal'));

// Check if functions exist
console.log('parseCSV:', typeof parseCSV);
console.log('mapCSVRow:', typeof mapCSVRow);
console.log('showCSVPreview:', typeof showCSVPreview);

// Check transactions array
console.log('transactions:', window.transactions);
console.log('transactions count:', window.transactions?.length);
```

### 3. Manual Import Test

Try importing manually:
```javascript
// Test data
const testData = `Date, Amount, Description
24/12/25, 1000, Test Income
24/12/25, -500, Test Expense`;

// Parse
const { rows, error } = parseCSV(testData);
console.log('Parsed rows:', rows);
console.log('Error:', error);

// Map
const mapped = rows.map(mapCSVRow);
console.log('Mapped:', mapped);

// Check for errors
mapped.forEach((r, i) => {
  console.log(`Row ${i}:`, r.errors, r.warnings);
});
```

## Common Issues

### Issue 1: Modal Not Showing
**Symptom:** Click "Analyze & Preview" but nothing happens

**Check:**
```javascript
const modal = document.getElementById('csvPreviewModal');
console.log('Modal element:', modal);
console.log('Modal display:', modal?.style.display);
```

**Fix:** Modal should exist and display should change to 'flex'

### Issue 2: Confirm Button Not Working
**Symptom:** Click "Import All" but nothing happens

**Check:**
```javascript
const btn = document.getElementById('csvConfirmImportBtn');
console.log('Confirm button:', btn);
console.log('Has click listener:', btn?._listeners);
```

**Fix:** Button should exist and have event listener

### Issue 3: Transactions Not Saving
**Symptom:** Import succeeds but transactions don't appear

**Check:**
```javascript
// Before import
const before = window.transactions.length;
console.log('Before:', before);

// After import (run after clicking Import All)
const after = window.transactions.length;
console.log('After:', after);
console.log('Added:', after - before);

// Check localStorage
const stored = JSON.parse(localStorage.getItem('transactions'));
console.log('In localStorage:', stored.length);
```

## Step-by-Step Test

### 1. Prepare Test Data
```
ID   Date   Amount   Description   Payment Method
1   24/12/25   1000   Test Income   HDFC
2   24/12/25   -500   Test Expense   HDFC
```

### 2. Open App
- Go to Profile (click profile button)
- Scroll to "Import from CSV / Excel"
- Click "Paste Data" tab

### 3. Paste Data
- Paste the test data above
- Click "Analyze & Preview"

### 4. Check Console
Look for:
```
CSV Import: Starting import of 2 rows
Current transactions count: X
CSV Import: After merge, total transactions: X+2
CSV Import: Sample transaction: {id: "...", ...}
```

### 5. Verify in UI
- Check if toast message appears: "✅ 2 transactions imported!"
- Go to Transactions tab
- Look for the new transactions

### 6. Verify in Storage
```javascript
const txs = JSON.parse(localStorage.getItem('transactions'));
console.log('Total transactions:', txs.length);
console.log('Last 2:', txs.slice(-2));
```

## If Nothing Works

### Nuclear Option: Clear and Retry

```javascript
// Backup first!
const backup = localStorage.getItem('transactions');
console.log('Backup saved to console');

// Clear
localStorage.clear();

// Reload
location.reload();

// Try import again
```

### Check for JavaScript Errors

Look in console for red error messages. Common ones:
- `transactions is not defined`
- `saveToLocalStorage is not a function`
- `Cannot read property 'length' of undefined`

### Verify Script Loading Order

Scripts should load in this order:
1. index.html (defines global variables)
2. data-manager.js (uses global variables)
3. Other scripts

## Expected Console Output

When import works correctly:
```
CSV Import: Initialized successfully
CSV Import: Starting import of 2 rows
Current transactions count: 0
CSV Import: After merge, total transactions: 2
CSV Import: Sample transaction: {id: "INC-0001", type: "income", amount: 1000, ...}
```

## Report Back

If still not working, share:
1. Console output (all messages)
2. Any red error messages
3. Result of element checks
4. Browser and version

This will help identify the exact issue!
