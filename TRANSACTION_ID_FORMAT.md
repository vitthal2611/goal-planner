# Transaction ID Format

## Overview

Each transaction now has a unique ID based on its type, making it easy to identify and track transactions. The ID is included in CSV/Excel exports and can be optionally included in imports.

---

## ID Format

### Income Transactions
**Format**: `INC-{timestamp}`

**Example**: `INC-1710845234567`

**Structure**:
- Prefix: `INC-` (Income)
- Timestamp: Unix timestamp in milliseconds

---

### Expense Transactions
**Format**: `EXP-{timestamp}-{index}`

**Example**: `EXP-1710845234567-0`

**Structure**:
- Prefix: `EXP-` (Expense)
- Timestamp: Unix timestamp in milliseconds
- Index: Sequential number for multiple expenses added at once (0, 1, 2, etc.)

**Note**: The index allows multiple expenses to be added in a single submission without ID conflicts.

---

### Transfer/Move Money Transactions
**Format**: `TRF-{timestamp}`

**Example**: `TRF-1710845234567`

**Structure**:
- Prefix: `TRF-` (Transfer)
- Timestamp: Unix timestamp in milliseconds

---

## CSV/Excel Export & Import

### Export Format

When you download a financial report, the CSV file includes the transaction ID as the first column:

**CSV Header**:
```
ID,Date,Type,Description,Category,Payment Method,Expense Type,Amount
```

**Example Rows**:
```
INC-1710845234567,21 Mar 2024 10:30,Income,Salary,Salary,HDFC,-,50000
EXP-1710845234568-0,21 Mar 2024 11:15,Expense,Groceries,Food,Cash,Need,2500
TRF-1710845234569,21 Mar 2024 14:20,Transfer,Transfer from HDFC to Cash,HDFC → Cash,Transfer,-,5000
```

### Import Format

When importing from CSV/Excel, the ID column is **optional**:

**With ID** (preserves original transaction IDs):
```csv
ID,Date,Type,Description,Category,Payment Method,Expense Type,Amount
INC-1710845234567,21/03/2024,income,Salary,Salary,HDFC,,50000
```

**Without ID** (auto-generates IDs based on type):
```csv
Date,Type,Description,Category,Payment Method,Expense Type,Amount
21/03/2024,income,Salary,Salary,HDFC,,50000
```

### Auto-Generation Rules

If the ID column is missing or empty during import:
- **Income**: Generates `INC-{timestamp}`
- **Expense**: Generates `EXP-{timestamp}-0`
- **Transfer**: Generates `TRF-{timestamp}`

This ensures all transactions have proper IDs even when importing from external sources.

---

## Benefits

### Easy Identification
- Instantly know transaction type from ID prefix
- `INC-` = Income
- `EXP-` = Expense
- `TRF-` = Transfer/Move Money

### Unique IDs
- Timestamp ensures uniqueness
- Index for expenses prevents conflicts when adding multiple at once

### Sorting & Filtering
- Easy to filter by type using ID prefix
- Chronological ordering by timestamp

### Debugging
- Clear transaction type in logs
- Easy to trace specific transactions

### Import/Export
- IDs preserved when exporting and re-importing
- Auto-generated if not provided
- No data loss during round-trip

---

## Usage Examples

### Filter by Type
```javascript
// Get all income transactions
const incomeTransactions = transactions.filter(t => t.id.startsWith('INC-'));

// Get all expense transactions
const expenseTransactions = transactions.filter(t => t.id.startsWith('EXP-'));

// Get all transfer transactions
const transferTransactions = transactions.filter(t => t.id.startsWith('TRF-'));
```

### Extract Timestamp
```javascript
// Extract timestamp from ID
function getTimestampFromId(id) {
  const parts = id.split('-');
  return parseInt(parts[1]);
}

// Usage
const timestamp = getTimestampFromId('INC-1710845234567');
const date = new Date(timestamp);
```

### Validate Transaction Type
```javascript
function getTransactionType(id) {
  if (id.startsWith('INC-')) return 'income';
  if (id.startsWith('EXP-')) return 'expense';
  if (id.startsWith('TRF-')) return 'transfer';
  return 'unknown';
}
```

---

## Implementation Details

### Code Location
File: `public/index.html`

### Income Transaction
```javascript
const transactionData = {
  id: `INC-${Date.now()}`,
  type: 'income',
  amount,
  description,
  payment,
  date: incomeDate
};
```

### Expense Transaction
```javascript
const transactionData = {
  id: `EXP-${Date.now()}-${successCount}`,
  type: 'expense',
  amount,
  description,
  envelope,
  payment,
  expenseType,
  date: entryDate
};
```

### Transfer Transaction
```javascript
const transactionData = {
  id: `TRF-${Date.now()}`,
  type: 'transfer',
  amount,
  description: finalDescription,
  from: fromPayment,
  to: toPayment,
  date: transferDate
};
```

### CSV Export
```javascript
// Header includes ID as first column
csvContent += `ID,Date,Type,Description,Category,Payment Method,Expense Type,Amount\n`;

// Each row includes the transaction ID
const id = t.id || 'N/A';
csvContent += `${id},${date},${type},${description},${category},${payment},${expenseType},${amount}\n`;
```

### CSV Import
```javascript
// Parse ID from CSV (optional)
const id = get('id', 'transaction id', 'transactionid');

// Generate ID if not provided
let transactionId = r.id;
if (!transactionId) {
  const timestamp = Date.now() + index;
  if (type === 'income') {
    transactionId = `INC-${timestamp}`;
  } else if (type === 'expense') {
    transactionId = `EXP-${timestamp}-0`;
  } else if (type === 'transfer') {
    transactionId = `TRF-${timestamp}`;
  }
}
```

---

## Migration Notes

### Existing Transactions
- Old transactions may have numeric IDs (e.g., `1710845234567`)
- New transactions will have prefixed IDs (e.g., `INC-1710845234567`)
- Both formats are supported for backward compatibility

### Database
- IDs are stored as strings in Firebase
- No migration needed for existing data
- New transactions automatically use new format

### CSV Files
- Old CSV exports without ID column still work
- New CSV exports include ID column
- Import works with or without ID column

---

## Future Enhancements

### Possible Improvements
1. Add user ID to prevent conflicts across users: `INC-{userId}-{timestamp}`
2. Add sequence number for guaranteed uniqueness: `INC-{timestamp}-{sequence}`
3. Add date prefix for easier date-based queries: `INC-20240321-{timestamp}`
4. Add checksum for validation: `INC-{timestamp}-{checksum}`

---

## Testing

### Manual Testing
- ✅ Create income transaction → ID starts with `INC-`
- ✅ Create expense transaction → ID starts with `EXP-`
- ✅ Create multiple expenses → IDs have different indexes
- ✅ Create transfer transaction → ID starts with `TRF-`
- ✅ All IDs are unique
- ✅ Transactions save to Firebase correctly
- ✅ CSV export includes ID column
- ✅ CSV import with ID preserves IDs
- ✅ CSV import without ID generates IDs

### Validation
```javascript
// Test ID format
console.assert(/^INC-\d+$/.test('INC-1710845234567'), 'Income ID format valid');
console.assert(/^EXP-\d+-\d+$/.test('EXP-1710845234567-0'), 'Expense ID format valid');
console.assert(/^TRF-\d+$/.test('TRF-1710845234567'), 'Transfer ID format valid');
```

---

## Summary

Transaction IDs now follow a clear, consistent format:
- **Income**: `INC-{timestamp}`
- **Expense**: `EXP-{timestamp}-{index}`
- **Transfer**: `TRF-{timestamp}`

**CSV/Excel Integration**:
- ID column included in all exports
- ID column optional in imports (auto-generated if missing)
- Full round-trip support (export → edit → import)

This makes transactions easy to identify, filter, track, and manage across the application and external tools.
