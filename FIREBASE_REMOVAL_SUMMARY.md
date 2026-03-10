# Firebase Removal & Google Sheets Redesign

## Overview
Completely removed Firebase Storage as a data source. Google Sheets is now the single source of truth for all data persistence.

## Key Changes

### 1. New Google Sheets Repository
**File:** `src/core/repositories/googleSheetsRepository.js`
- Handles all Google Sheets API operations
- Implements caching with 30-second TTL
- Provides `readRange()`, `writeRange()`, `appendRange()`, `clearRange()`
- Serializes/deserializes data for Google Sheets format
- Methods: `saveData()`, `loadData()`, `clearCache()`

### 2. New Google Sheets Service
**File:** `src/services/googleSheetsService.js`
- Single source of truth for data persistence
- Manages three sheets: Transactions, Envelopes, Metadata
- Methods:
  - `save(data)` - Persists all budget data to Google Sheets
  - `load()` - Loads data from Google Sheets
  - `addTransaction()` - Adds transaction to sheet
  - `deleteTransaction()` - Removes transaction from sheet
- Reconstructs monthly data structure from sheet rows

### 3. Updated AppContext
**File:** `src/core/context/AppContext.jsx`
- Removed Firebase auth dependency
- Auto-save now uses `googleSheetsService` instead of Firebase
- Simplified to work with Google Sheets as primary storage

### 4. Redesigned TransactionTable
**File:** `src/components/TransactionTable.jsx`
- Extracted formatting logic into helper functions:
  - `formatAmount()` - Handles currency formatting
  - `getTransactionIcon()` - Returns emoji for transaction type
  - `getTransactionLabel()` - Returns readable transaction type
  - `formatEnvelopeName()` - Formats envelope display names
  - `isIncome()` - Checks if transaction is income/transfer-in
- Better support for Google Sheets data structure
- Displays period information in expanded rows

### 5. Updated Repositories
**Files:**
- `src/core/repositories/budgetRepository.js` - Now uses GoogleSheetsRepository
- `src/core/repositories/firebaseRepository.js` - Redirects to GoogleSheetsRepository for backward compatibility
- `src/services/database.js` - Simplified to use GoogleSheetsRepository

### 6. Updated Services
**Files:**
- `src/features/budget/services/budgetService.js` - Removed repository dependency
- `src/features/payments/services/paymentMethodService.js` - Removed repository dependency
- Both now work with data passed through AppContext

### 7. Updated App.jsx
- Removed Firebase imports and initialization
- Removed BackupManager and FirebaseDataViewer components
- Initialized GoogleSheetsService instead of Firebase repositories
- Simplified service initialization

## Data Structure in Google Sheets

### Transactions Sheet
Columns: id, date, description, envelope, amount, paymentMethod, type, fullData (JSON)

### Envelopes Sheet
Columns: id, period, category, name, budgeted, spent

### Metadata Sheet
Columns: id, value, timestamp

## Benefits

1. **Single Source of Truth** - All data lives in Google Sheets
2. **No Firebase Dependency** - Reduced complexity and dependencies
3. **Better Data Visibility** - Can view/edit data directly in Google Sheets
4. **Offline Support** - LocalStorage caching with Google Sheets sync
5. **Simplified Architecture** - Fewer layers of abstraction
6. **Improved Table Design** - Better formatted data display

## Migration Notes

- All existing Firebase data should be exported and imported to Google Sheets
- LocalStorage is used as a cache layer for offline support
- Auto-save to Google Sheets happens after 1 second of inactivity
- Cache is cleared on app reload to ensure fresh data

## Environment Variables Required

```
VITE_GOOGLE_SHEETS_API_KEY=<your-api-key>
VITE_GOOGLE_SHEETS_ID=<your-sheet-id>
```

## Next Steps

1. Set up Google Sheets with the three required sheets
2. Configure API key and Sheet ID in environment variables
3. Test data persistence and retrieval
4. Verify all CRUD operations work correctly
