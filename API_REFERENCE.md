# API Reference - Budget Planner

## Google Sheets API Service

### Initialization

```javascript
import { googleSheetsAPI } from './services/googleSheetsAPI.js';

// Initialize Google API client
await googleSheetsAPI.initialize();

// Authenticate user (OAuth2)
const token = await googleSheetsAPI.authenticate();

// Ensure spreadsheet exists (creates if needed)
const spreadsheetId = await googleSheetsAPI.ensureSpreadsheet();
```

## Transaction Operations

### Add Transaction
```javascript
await googleSheetsAPI.addTransaction(
  month,           // "2026-01"
  type,            // "Income" | "Expense" | "Transfer"
  description,     // "Grocery shopping"
  envelope,        // "DMART"
  amount,          // 5000
  paymentMethod    // "HDFC Bank"
);
```

### Get Transactions
```javascript
// Get all transactions
const allTransactions = await googleSheetsAPI.getTransactions();

// Get transactions for specific month
const monthTransactions = await googleSheetsAPI.getTransactions("2026-01");

// Returns array of:
// {
//   month: "2026-01",
//   type: "Expense",
//   description: "Grocery shopping",
//   envelope: "DMART",
//   amount: 5000,
//   paymentMethod: "HDFC Bank"
// }
```

## Budget Operations

### Add/Update Budget
```javascript
await googleSheetsAPI.addBudget(
  month,      // "2026-01"
  envelope,   // "EMI"
  amount      // 85000
);
// Automatically updates if budget already exists
```

### Get Budgets
```javascript
// Get all budgets
const allBudgets = await googleSheetsAPI.getBudgets();

// Get budgets for specific month
const monthBudgets = await googleSheetsAPI.getBudgets("2026-01");

// Returns array of:
// {
//   month: "2026-01",
//   envelope: "EMI",
//   amount: 85000
// }
```

## Envelope Operations

### Add Envelope
```javascript
await googleSheetsAPI.addEnvelope(
  name  // "EMI"
);
// Automatically skips if envelope already exists
```

### Get Envelopes
```javascript
const envelopes = await googleSheetsAPI.getEnvelopes();

// Returns array of:
// {
//   name: "EMI",
//   active: true
// }
```

## Payment Method Operations

### Add Payment Method
```javascript
await googleSheetsAPI.addPaymentMethod(
  name  // "HDFC Bank"
);
// Automatically skips if payment method already exists
```

### Get Payment Methods
```javascript
const paymentMethods = await googleSheetsAPI.getPaymentMethods();

// Returns array of:
// {
//   name: "HDFC Bank",
//   active: true
// }
```

## Context API

### Using BudgetContext

```javascript
import { useContext } from 'react';
import { BudgetContext } from './contexts/AppContext.jsx';

const MyComponent = () => {
  const {
    // State
    transactions,      // Array of transactions
    budgets,          // Array of budgets
    envelopes,        // Array of envelopes
    paymentMethods,   // Array of payment methods
    currentMonth,     // Current selected month "2026-01"
    loading,          // Boolean - loading state
    error,            // String - error message or null

    // Actions
    loadData,         // Function - reload all data
    addTransaction,   // Function - add transaction
    addBudget,        // Function - add budget
    addEnvelope,      // Function - add envelope
    addPaymentMethod, // Function - add payment method
    setCurrentMonth   // Function - set current month
  } = useContext(BudgetContext);

  return (
    // Component JSX
  );
};
```

### Load Data
```javascript
// Reload all data from Google Sheets
await loadData();
```

### Add Transaction
```javascript
await addTransaction(
  currentMonth,
  "Expense",
  "Grocery shopping",
  "DMART",
  5000,
  "HDFC Bank"
);
```

### Add Budget
```javascript
await addBudget(
  currentMonth,
  "EMI",
  85000
);
```

### Add Envelope
```javascript
await addEnvelope("EMI");
```

### Add Payment Method
```javascript
await addPaymentMethod("HDFC Bank");
```

### Set Current Month
```javascript
setCurrentMonth("2026-02");
```

## Error Handling

All API calls can throw errors. Handle them appropriately:

```javascript
try {
  await googleSheetsAPI.addTransaction(
    month, type, description, envelope, amount, paymentMethod
  );
} catch (error) {
  console.error('Failed to add transaction:', error.message);
  // Show error to user
}
```

## Data Validation

### Transaction
- `month`: Format "YYYY-MM" (e.g., "2026-01")
- `type`: One of "Income", "Expense", "Transfer"
- `description`: Non-empty string
- `envelope`: Non-empty string
- `amount`: Positive number
- `paymentMethod`: Non-empty string

### Budget
- `month`: Format "YYYY-MM"
- `envelope`: Non-empty string
- `amount`: Positive number

### Envelope
- `name`: Non-empty string, unique

### Payment Method
- `name`: Non-empty string, unique

## Component Examples

### Using TransactionForm
```javascript
import TransactionForm from './components/TransactionForm.jsx';

// In parent component
<TransactionForm type="Expense" />
// type can be "Income", "Expense", or "Transfer"
```

### Using BudgetForm
```javascript
import BudgetForm from './components/BudgetForm.jsx';

// In parent component
<BudgetForm />
```

### Using ProfileSettings
```javascript
import ProfileSettings from './components/ProfileSettings.jsx';

// In parent component
<ProfileSettings />
```

### Using BudgetSummary
```javascript
import BudgetSummary from './components/BudgetSummary.jsx';

// In parent component
<BudgetSummary />
```

### Using TransactionsList
```javascript
import TransactionsList from './components/TransactionsList.jsx';

// In parent component
<TransactionsList />
```

## Utility Functions

### Get Month List
```javascript
const getMonths = () => {
  const months = [];
  const now = new Date();
  for (let i = -12; i <= 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push(d.toISOString().slice(0, 7));
  }
  return months;
};
```

### Calculate Spending by Envelope
```javascript
const calculateSpending = (transactions, month) => {
  const spending = {};
  transactions
    .filter(t => t.month === month && t.type === 'Expense')
    .forEach(t => {
      spending[t.envelope] = (spending[t.envelope] || 0) + t.amount;
    });
  return spending;
};
```

### Calculate Budget Status
```javascript
const getBudgetStatus = (budget, spent) => {
  const percentage = (spent / budget) * 100;
  if (percentage > 100) return 'over';
  if (percentage > 80) return 'warning';
  return 'ok';
};
```

## Environment Variables

```
VITE_GOOGLE_OAUTH_CLIENT_ID=your_client_id_here
```

## Performance Tips

1. **Batch Operations**: Load all data once with `loadData()`
2. **Memoization**: Use `useMemo` for expensive calculations
3. **Lazy Loading**: Load data only when needed
4. **Avoid Unnecessary Renders**: Use `useCallback` for handlers

## Common Patterns

### Form Submission
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    setLoading(true);
    await addTransaction(...);
    // Reset form
    setFormData({ /* initial state */ });
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

### Data Filtering
```javascript
const monthTransactions = useMemo(() => {
  return transactions.filter(t => t.month === currentMonth);
}, [transactions, currentMonth]);
```

### Responsive Handling
```javascript
const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth < 768);
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

## Troubleshooting

### "Failed to load Google API"
- Check internet connection
- Verify Google API scripts are loaded
- Check browser console for errors

### "Authentication failed"
- Verify Client ID in .env
- Check authorized origins in Google Cloud Console
- Clear browser cache

### "Spreadsheet not found"
- Check internet connection
- Verify Google Sheets API is enabled
- Check Google account permissions

### "Data not syncing"
- Refresh the page
- Check internet connection
- Verify API permissions
- Check browser console

## Best Practices

1. **Always handle errors** - Use try/catch blocks
2. **Show loading states** - Provide user feedback
3. **Validate input** - Check data before sending
4. **Use context** - Avoid prop drilling
5. **Memoize expensive operations** - Use useMemo/useCallback
6. **Test on mobile** - Ensure responsive design
7. **Monitor performance** - Check bundle size
8. **Keep code clean** - Remove dead code

---

For more information, see REDESIGN_COMPLETE.md and QUICK_START.md
