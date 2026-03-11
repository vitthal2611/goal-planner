# Budget Planner - Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Browser                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              React Application                        │   │
│  │                                                        │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │         Dashboard Component                     │  │   │
│  │  │  - Summary Cards                               │  │   │
│  │  │  - Tab Navigation                              │  │   │
│  │  │  - Month Navigation                            │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                      ↓                                │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │         Form Components                        │  │   │
│  │  │  - IncomeForm                                  │  │   │
│  │  │  - ExpenseForm                                 │  │   │
│  │  │  - TransferForm                                │  │   │
│  │  │  - BudgetForm                                  │  │   │
│  │  │  - PaymentMethodsModal                         │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                      ↓                                │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │      BudgetContext (State Management)          │  │   │
│  │  │  - currentMonth                                │  │   │
│  │  │  - dashboardData                               │  │   │
│  │  │  - loading, notification                       │  │   │
│  │  │  - Actions: addIncome, addExpense, etc.        │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                      ↓                                │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │         dataService (Business Logic)           │  │   │
│  │  │  - addTransaction()                            │  │   │
│  │  │  - allocateBudget()                            │  │   │
│  │  │  - addPaymentMethod()                          │  │   │
│  │  │  - getDashboardData()                          │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                      ↓                                │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │         sheetsAPI (API Wrapper)                │  │   │
│  │  │  - OAuth2 Token Management                     │  │   │
│  │  │  - Spreadsheet Discovery/Creation              │  │   │
│  │  │  - CRUD Operations                             │  │   │
│  │  │  - Sheet Management                            │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                      ↓                                │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                           ↓
        ┌──────────────────────────────────────┐
        │   Google OAuth 2.0                   │
        │   (Authentication)                   │
        └──────────────────────────────────────┘
                           ↓
        ┌──────────────────────────────────────┐
        │   Google Sheets API                  │
        │   (Data Storage & Retrieval)         │
        └──────────────────────────────────────┘
                           ↓
        ┌──────────────────────────────────────┐
        │   Google Sheets                      │
        │   "Budget Tracker" Spreadsheet       │
        │                                      │
        │  - Transactions Sheet                │
        │  - Budgets Sheet                     │
        │  - PaymentMethods Sheet              │
        └──────────────────────────────────────┘
```

## Data Flow - Add Expense

```
User fills Expense Form
    ↓
    Amount: 1500
    Description: "Dmart"
    Envelope: "DMART"
    Payment Method: "HDFC"
    ↓
Form Submit → ExpenseForm Component
    ↓
addExpense() → BudgetContext
    ↓
dataService.addTransaction(
    type: "Expense",
    description: "Dmart",
    envelope: "DMART",
    amount: 1500,
    paymentMethod: "HDFC",
    month: "2026-01"
)
    ↓
sheetsAPI.appendRow('Transactions', [
    "2026-01",
    "Expense",
    "Dmart",
    "DMART",
    1500,
    "HDFC",
    "2026-01-15T10:30:00Z",
    "id123"
])
    ↓
Google Sheets API Call
    ↓
Transactions Sheet Updated
    ↓
dataService.updateBudgetSpent("DMART", "2026-01")
    ↓
Calculate total spent for DMART
    ↓
Update Budgets Sheet
    ↓
loadDashboard() → Refresh UI
    ↓
Display updated summary and transactions
```

## Data Flow - Add Budget

```
User fills Budget Form
    ↓
    Envelope: "DMART"
    Amount: 5000
    ↓
Form Submit → BudgetForm Component
    ↓
allocateBudget() → BudgetContext
    ↓
dataService.allocateBudget(
    envelope: "DMART",
    budgeted: 5000,
    month: "2026-01"
)
    ↓
Check if budget exists for DMART in 2026-01
    ↓
If exists: Update row with new budgeted amount
If not: Append new row to Budgets sheet
    ↓
Budgets Sheet Updated
    ↓
loadDashboard() → Refresh UI
    ↓
Display budget with progress bar
```

## Component Hierarchy

```
App
├── Header
│   ├── Logo
│   └── Logout Button
├── BudgetProvider
│   └── Dashboard
│       ├── Month Navigation
│       ├── Summary Cards
│       │   ├── Income Card
│       │   ├── Expenses Card
│       │   ├── Balance Card
│       │   └── Payment Methods Button
│       ├── Tab Navigation
│       ├── Tab Content
│       │   ├── Overview Tab
│       │   │   └── TransactionsList
│       │   ├── Income Tab
│       │   │   └── IncomeForm
│       │   ├── Expense Tab
│       │   │   └── ExpenseForm
│       │   ├── Transfer Tab
│       │   │   └── TransferForm
│       │   └── Budget Tab
│       │       └── BudgetForm
│       ├── Budget Summary Section
│       │   └── BudgetSummary
│       └── PaymentMethodsModal
│           └── Payment Methods List
```

## State Management Flow

```
BudgetContext
├── State
│   ├── currentMonth: "2026-01"
│   ├── dashboardData: {
│   │   month: "2026-01",
│   │   income: 50000,
│   │   expenses: 8500,
│   │   balance: 41500,
│   │   transactions: [...],
│   │   budgets: [...],
│   │   paymentMethods: [...]
│   │}
│   ├── loading: false
│   └── notification: { type: "", message: "" }
│
└── Actions
    ├── loadDashboard(month)
    ├── addIncome(amount, description, paymentMethod)
    ├── addExpense(amount, description, envelope, paymentMethod)
    ├── addTransfer(from, to, amount, description)
    ├── allocateBudget(envelope, amount)
    ├── addPaymentMethod(name, type)
    └── removePaymentMethod(name)
```

## Google Sheets Structure

```
Budget Tracker Spreadsheet
│
├── Transactions Sheet
│   ├── Headers: Month | Type | Description | Envelope | Amount | Payment Method | Date | ID
│   ├── Row 2: 2026-01 | Expense | Dmart | DMART | 1500 | HDFC | 2026-01-15T10:30:00Z | id123
│   ├── Row 3: 2026-01 | Expense | Pav | DMART | 108 | HDFC | 2026-01-16T09:15:00Z | id124
│   ├── Row 4: 2026-01 | Income | Salary | | 50000 | HDFC | 2026-01-01T00:00:00Z | id125
│   └── ...
│
├── Budgets Sheet
│   ├── Headers: Month | Envelope | Budgeted | Spent
│   ├── Row 2: 2026-01 | DMART | 5000 | 1608
│   ├── Row 3: 2026-01 | EMI | 85000 | 85000
│   └── ...
│
└── PaymentMethods Sheet
    ├── Headers: Name | Type | Active
    ├── Row 2: HDFC | Bank | TRUE
    ├── Row 3: SBI Credit Card | Credit Card | TRUE
    └── ...
```

## API Call Sequence

```
1. Initialize App
   └─ sheetsAPI.initialize()
      ├─ loadGapi()
      ├─ loadGis()
      ├─ initializeGapi()
      └─ initializeGis()

2. User Authorizes
   └─ sheetsAPI.getAccessToken()
      └─ tokenClient.requestAccessToken()

3. Find/Create Spreadsheet
   └─ sheetsAPI.findOrCreateSpreadsheet()
      ├─ Search for "Budget Tracker"
      ├─ If found: ensureSheets()
      └─ If not: create new spreadsheet

4. Initialize Headers
   └─ sheetsAPI.initializeHeaders()
      ├─ Check Transactions headers
      ├─ Check Budgets headers
      └─ Check PaymentMethods headers

5. Load Dashboard
   └─ dataService.getDashboardData(month)
      ├─ getTransactions(month)
      ├─ getBudgets(month)
      └─ getPaymentMethods()

6. Add Transaction
   └─ dataService.addTransaction(...)
      └─ sheetsAPI.appendRow('Transactions', [...])

7. Update Budget
   └─ dataService.updateBudgetSpent(envelope, month)
      └─ sheetsAPI.updateRow('Budgets', rowIndex, [...])
```

## Error Handling Flow

```
User Action
    ↓
Try Block
    ├─ Execute operation
    ├─ API call
    └─ Update state
    ↓
Catch Block (if error)
    ├─ Log error to console
    ├─ Show notification
    └─ Return false
    ↓
Finally Block
    └─ Set loading to false
    ↓
User sees error message
```

## Mobile Responsive Breakpoints

```
Desktop (>768px)
├─ Summary Grid: 4 columns
├─ Forms: Full width
└─ Tabs: Horizontal scroll

Mobile (<768px)
├─ Summary Grid: 2 columns
├─ Forms: Stacked
└─ Tabs: Horizontal scroll with smaller text
```

## Performance Optimization

```
Initial Load
├─ Load Google APIs (parallel)
├─ Initialize OAuth
├─ Find/Create Spreadsheet
├─ Initialize Headers
└─ Load Dashboard Data

Subsequent Loads
├─ Use cached token
├─ Direct API calls
└─ Faster response

User Actions
├─ Optimistic UI update
├─ API call in background
└─ Refresh on completion
```

## Security Flow

```
User Login
    ↓
OAuth2 Authorization
    ├─ User grants permission
    ├─ Google returns access token
    └─ Token stored in memory only
    ↓
API Calls
    ├─ Include access token in header
    ├─ HTTPS encryption
    └─ Google validates token
    ↓
Data Storage
    ├─ Stored in user's Google Drive
    ├─ No server-side storage
    └─ User has full control
    ↓
Logout
    ├─ Clear access token
    ├─ Clear state
    └─ Require re-authorization
```

---

**Architecture Version**: 2.0.0  
**Last Updated**: 2026-01
