# Budget Planner - API Reference

## GoogleAuth Service

### Methods

#### `initialize()`
Initializes OAuth2 authentication.

```javascript
await googleAuth.initialize()
```

**Returns:** `Promise<void>`

**Throws:** Error if Google Script fails to load

**Example:**
```javascript
try {
  await googleAuth.initialize()
  console.log('Auth initialized')
} catch (err) {
  console.error('Auth failed:', err.message)
}
```

---

#### `getAccessToken()`
Gets or requests a new access token.

```javascript
const token = await googleAuth.getAccessToken()
```

**Returns:** `Promise<string>` - OAuth2 access token

**Throws:** Error if user denies permission

**Example:**
```javascript
const token = await googleAuth.getAccessToken()
// Use token for API calls
```

---

#### `logout()`
Clears the access token.

```javascript
googleAuth.logout()
```

**Returns:** `void`

**Example:**
```javascript
googleAuth.logout()
// User is now logged out
```

---

## SheetsAPI Service

### Properties

```javascript
spreadsheetId: string          // ID of Budget Tracker spreadsheet
cache: Map                     // Internal cache
CACHE_TTL: 30000              // Cache time-to-live in ms
SHEETS: {
  TRANSACTIONS: 'Transactions',
  BUDGETS: 'Budgets',
  ENVELOPES: 'Envelopes',
  PAYMENT_METHODS: 'PaymentMethods'
}
```

---

### Methods

#### `initialize()`
Initializes sheets API and ensures all sheets exist.

```javascript
await sheetsAPI.initialize()
```

**Returns:** `Promise<void>`

**Throws:** Error if initialization fails

**Example:**
```javascript
await sheetsAPI.initialize()
// Spreadsheet created/found and sheets initialized
```

---

#### `addTransaction(month, type, description, envelope, amount, paymentMethod)`
Adds a new transaction.

```javascript
await sheetsAPI.addTransaction(
  '2026-01',
  'Expense',
  'Groceries',
  'DMART',
  500,
  'HDFC'
)
```

**Parameters:**
- `month` (string): Month in format "YYYY-MM"
- `type` (string): "Income" | "Expense" | "Transfer-In" | "Transfer-Out"
- `description` (string): Transaction description
- `envelope` (string): Category name (empty for income/transfer)
- `amount` (number): Transaction amount
- `paymentMethod` (string): Payment method name

**Returns:** `Promise<void>`

**Throws:** Error if append fails

**Example:**
```javascript
await sheetsAPI.addTransaction(
  '2026-01',
  'Income',
  'Salary',
  '',
  100000,
  'HDFC'
)
```

---

#### `getTransactions(month)`
Gets all transactions for a month.

```javascript
const transactions = await sheetsAPI.getTransactions('2026-01')
```

**Parameters:**
- `month` (string): Month in format "YYYY-MM"

**Returns:** `Promise<Transaction[]>`

```typescript
Transaction {
  month: string
  type: string
  description: string
  envelope: string
  amount: number
  paymentMethod: string
  date: string
  id: string
}
```

**Example:**
```javascript
const txns = await sheetsAPI.getTransactions('2026-01')
txns.forEach(txn => {
  console.log(`${txn.description}: ₹${txn.amount}`)
})
```

---

#### `setBudget(month, envelope, budgeted)`
Sets or updates budget for an envelope.

```javascript
await sheetsAPI.setBudget('2026-01', 'EMI', 85000)
```

**Parameters:**
- `month` (string): Month in format "YYYY-MM"
- `envelope` (string): Envelope/category name
- `budgeted` (number): Budget amount

**Returns:** `Promise<void>`

**Throws:** Error if operation fails

**Example:**
```javascript
await sheetsAPI.setBudget('2026-01', 'DMART', 10000)
```

---

#### `getBudgets(month)`
Gets all budgets for a month.

```javascript
const budgets = await sheetsAPI.getBudgets('2026-01')
```

**Parameters:**
- `month` (string): Month in format "YYYY-MM"

**Returns:** `Promise<Budget[]>`

```typescript
Budget {
  month: string
  envelope: string
  budgeted: number
  spent: number
}
```

**Example:**
```javascript
const budgets = await sheetsAPI.getBudgets('2026-01')
budgets.forEach(b => {
  console.log(`${b.envelope}: ₹${b.budgeted}`)
})
```

---

#### `addEnvelope(name)`
Adds a new envelope/category.

```javascript
await sheetsAPI.addEnvelope('EMI')
```

**Parameters:**
- `name` (string): Envelope name

**Returns:** `Promise<void>`

**Throws:** Error if operation fails

**Note:** Duplicate envelopes are ignored

**Example:**
```javascript
await sheetsAPI.addEnvelope('Groceries')
```

---

#### `getEnvelopes()`
Gets all active envelopes.

```javascript
const envelopes = await sheetsAPI.getEnvelopes()
```

**Returns:** `Promise<string[]>` - Array of envelope names

**Example:**
```javascript
const envs = await sheetsAPI.getEnvelopes()
// ['EMI', 'DMART', 'EATOUT']
```

---

#### `addPaymentMethod(name, type)`
Adds a new payment method.

```javascript
await sheetsAPI.addPaymentMethod('HDFC', 'Bank')
```

**Parameters:**
- `name` (string): Payment method name
- `type` (string): "Bank" | "Credit Card" | "Debit Card" | "Wallet" | "Cash"

**Returns:** `Promise<void>`

**Throws:** Error if operation fails

**Note:** Duplicate methods are ignored

**Example:**
```javascript
await sheetsAPI.addPaymentMethod('SBI Credit Card', 'Credit Card')
```

---

#### `getPaymentMethods()`
Gets all active payment methods.

```javascript
const methods = await sheetsAPI.getPaymentMethods()
```

**Returns:** `Promise<PaymentMethod[]>`

```typescript
PaymentMethod {
  name: string
  type: string
}
```

**Example:**
```javascript
const methods = await sheetsAPI.getPaymentMethods()
methods.forEach(m => {
  console.log(`${m.name} (${m.type})`)
})
```

---

#### `readSheet(sheetName, range)`
Reads raw data from a sheet.

```javascript
const data = await sheetsAPI.readSheet('Transactions', 'A:Z')
```

**Parameters:**
- `sheetName` (string): Sheet name
- `range` (string): Range in A1 notation (default: "A:Z")

**Returns:** `Promise<any[][]>` - 2D array of values

**Note:** Uses 30-second cache

**Example:**
```javascript
const rows = await sheetsAPI.readSheet('Transactions')
console.log(rows[0]) // Header row
```

---

#### `writeRange(sheetName, range, values)`
Writes data to a sheet range.

```javascript
await sheetsAPI.writeRange('Transactions', 'A1', [['Month', 'Type']])
```

**Parameters:**
- `sheetName` (string): Sheet name
- `range` (string): Range in A1 notation
- `values` (any[][]): 2D array of values

**Returns:** `Promise<void>`

**Throws:** Error if write fails

**Note:** Clears cache after write

**Example:**
```javascript
await sheetsAPI.writeRange('Budgets', 'A2:D2', [
  ['2026-01', 'EMI', 85000, 0]
])
```

---

#### `appendRow(sheetName, values)`
Appends a row to a sheet.

```javascript
await sheetsAPI.appendRow('Transactions', ['2026-01', 'Expense', 'Tea', 'EMI', 50, 'HDFC', '2026-01-15T10:30:00Z', 'abc123'])
```

**Parameters:**
- `sheetName` (string): Sheet name
- `values` (any[]): Array of values

**Returns:** `Promise<void>`

**Throws:** Error if append fails

**Note:** Clears cache after append

**Example:**
```javascript
await sheetsAPI.appendRow('PaymentMethods', ['HDFC', 'Bank', true])
```

---

#### `clearCache()`
Clears the internal cache.

```javascript
sheetsAPI.clearCache()
```

**Returns:** `void`

**Example:**
```javascript
sheetsAPI.clearCache()
// Next read will fetch fresh data
```

---

#### `logout()`
Clears auth and cache.

```javascript
sheetsAPI.logout()
```

**Returns:** `void`

**Example:**
```javascript
sheetsAPI.logout()
// User is logged out
```

---

## BudgetContext

### Context Value

```typescript
{
  currentMonth: string
  setCurrentMonth: (month: string) => void
  transactions: Transaction[]
  budgets: Budget[]
  envelopes: string[]
  paymentMethods: PaymentMethod[]
  loading: boolean
  error: string | null
  addTransaction: (type, description, envelope, amount, paymentMethod) => Promise<void>
  setBudgetAmount: (envelope, budgeted) => Promise<void>
  addNewEnvelope: (name) => Promise<void>
  addNewPaymentMethod: (name, type) => Promise<void>
  calculateSpent: (envelope) => number
  refresh: () => Promise<void>
}
```

---

### Usage

#### In Components

```javascript
import { useContext } from 'react'
import { BudgetContext } from '../contexts/BudgetContext'

function MyComponent() {
  const {
    currentMonth,
    transactions,
    budgets,
    envelopes,
    paymentMethods,
    loading,
    error,
    addTransaction,
    setBudgetAmount,
    addNewEnvelope,
    addNewPaymentMethod,
    calculateSpent,
    refresh
  } = useContext(BudgetContext)

  // Use context values
}
```

---

#### `addTransaction(type, description, envelope, amount, paymentMethod)`

```javascript
await addTransaction(
  'Expense',
  'Groceries',
  'DMART',
  500,
  'HDFC'
)
```

**Parameters:**
- `type` (string): Transaction type
- `description` (string): Description
- `envelope` (string): Envelope name
- `amount` (number): Amount
- `paymentMethod` (string): Payment method name

**Returns:** `Promise<void>`

---

#### `setBudgetAmount(envelope, budgeted)`

```javascript
await setBudgetAmount('EMI', 85000)
```

**Parameters:**
- `envelope` (string): Envelope name
- `budgeted` (number): Budget amount

**Returns:** `Promise<void>`

---

#### `addNewEnvelope(name)`

```javascript
await addNewEnvelope('Groceries')
```

**Parameters:**
- `name` (string): Envelope name

**Returns:** `Promise<void>`

---

#### `addNewPaymentMethod(name, type)`

```javascript
await addNewPaymentMethod('HDFC', 'Bank')
```

**Parameters:**
- `name` (string): Payment method name
- `type` (string): Payment method type

**Returns:** `Promise<void>`

---

#### `calculateSpent(envelope)`

```javascript
const spent = calculateSpent('DMART')
```

**Parameters:**
- `envelope` (string): Envelope name

**Returns:** `number` - Total spent in envelope

---

#### `refresh()`

```javascript
await refresh()
```

**Returns:** `Promise<void>`

**Note:** Manually refresh data from Google Sheets

---

## Error Handling

### Common Errors

```javascript
// Authentication error
try {
  await googleAuth.getAccessToken()
} catch (err) {
  console.error('Auth failed:', err.message)
  // "The user denied access"
}

// API error
try {
  await sheetsAPI.addTransaction(...)
} catch (err) {
  console.error('Add failed:', err.message)
  // "Failed to append to Transactions"
}

// Validation error
try {
  await sheetsAPI.addTransaction('2026-01', 'Invalid', '', '', -100, '')
} catch (err) {
  console.error('Validation failed:', err.message)
}
```

---

## Examples

### Complete Workflow

```javascript
import { useContext } from 'react'
import { BudgetContext } from '../contexts/BudgetContext'

function BudgetApp() {
  const {
    currentMonth,
    transactions,
    budgets,
    envelopes,
    paymentMethods,
    addTransaction,
    setBudgetAmount,
    addNewEnvelope,
    addNewPaymentMethod
  } = useContext(BudgetContext)

  // Add envelope
  const handleAddEnvelope = async () => {
    await addNewEnvelope('Groceries')
  }

  // Add payment method
  const handleAddPaymentMethod = async () => {
    await addNewPaymentMethod('HDFC', 'Bank')
  }

  // Set budget
  const handleSetBudget = async () => {
    await setBudgetAmount('Groceries', 10000)
  }

  // Add transaction
  const handleAddTransaction = async () => {
    await addTransaction(
      'Expense',
      'Weekly groceries',
      'Groceries',
      2500,
      'HDFC'
    )
  }

  return (
    <div>
      <h1>Budget for {currentMonth}</h1>
      <button onClick={handleAddEnvelope}>Add Envelope</button>
      <button onClick={handleAddPaymentMethod}>Add Payment Method</button>
      <button onClick={handleSetBudget}>Set Budget</button>
      <button onClick={handleAddTransaction}>Add Transaction</button>
      
      <div>
        <h2>Transactions ({transactions.length})</h2>
        {transactions.map(t => (
          <div key={t.id}>
            {t.description}: ₹{t.amount}
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## Rate Limiting

Google Sheets API has rate limits:
- 300 requests per minute per user
- 60 requests per minute per project

The app uses caching to minimize requests:
- 30-second cache for reads
- Batch operations where possible
- Typical usage: 5-10 requests per minute

---

## Troubleshooting

### "Failed to append to Transactions"
- Check internet connection
- Verify Google Sheets API is enabled
- Check spreadsheet permissions
- Verify sheet name is correct

### "Authorization Failed"
- Check Client ID in .env
- Verify authorized origins
- Clear browser cache
- Try incognito mode

### "Spreadsheet Not Found"
- Check internet connection
- Refresh page
- Verify Google account
- Check Drive permissions

---

## Best Practices

1. **Always use context** - Don't call sheetsAPI directly from components
2. **Handle errors** - Wrap async operations in try-catch
3. **Show loading states** - Use `loading` flag from context
4. **Validate input** - Check values before submission
5. **Use month selector** - Let users choose month
6. **Refresh on demand** - Call `refresh()` when needed
7. **Cache data** - Leverage 30-second cache
8. **Batch operations** - Use Promise.all for parallel requests
