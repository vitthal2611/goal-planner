# Budget Planner - Implementation Guide

## Overview

This is a complete rewrite of the Budget Planner app using Google Sheets as the single source of truth. The app is built with React and Vite, with zero Firebase or localStorage dependencies.

## Key Architecture Decisions

### 1. Google Sheets as Database
- **Single Spreadsheet**: "Budget Tracker" (auto-created)
- **Three Sheets**: Transactions, Budgets, PaymentMethods
- **No Duplication**: Normalized data structure
- **Real-time Sync**: Changes immediately reflected

### 2. OAuth2 Authentication
- **Single Authorization**: One-time setup per user
- **Secure**: No credentials stored locally
- **Automatic**: Token refresh handled internally
- **Scope**: Only Sheets API access

### 3. Data Structure

#### Transactions Sheet
```
Month | Type | Description | Envelope | Amount | Payment Method | Date | ID
2026-01 | Expense | Dmart | DMART | 1500 | HDFC | 2026-01-15T10:30:00Z | id123
```

#### Budgets Sheet
```
Month | Envelope | Budgeted | Spent
2026-01 | DMART | 5000 | 3500
2026-01 | EMI | 85000 | 85000
```

#### PaymentMethods Sheet
```
Name | Type | Active
HDFC | Bank | TRUE
SBI Credit Card | Credit Card | TRUE
```

## Service Layer

### sheetsAPI.js
- Google Sheets API wrapper
- OAuth2 token management
- Spreadsheet discovery/creation
- CRUD operations

### dataService.js
- Business logic layer
- Transaction management
- Budget calculations
- Payment method management
- Dashboard data aggregation

## React Architecture

### BudgetContext.js
- Global state management
- Action handlers
- Notification system
- Month navigation

### Components
- **Dashboard.jsx**: Main layout, tab navigation
- **IncomeForm.jsx**: Add income
- **ExpenseForm.jsx**: Add expense
- **TransferForm.jsx**: Transfer funds
- **BudgetForm.jsx**: Allocate budget
- **TransactionsList.jsx**: Display transactions
- **BudgetSummary.jsx**: Budget overview
- **PaymentMethodsModal.jsx**: Manage payment methods

## Mobile Responsiveness

### Desktop View (>768px)
- 4-column summary grid
- Full-width forms
- Side-by-side layouts

### Mobile View (<768px)
- 2-column summary grid
- Stacked forms
- Touch-optimized buttons
- Scrollable tabs

## Performance Optimizations

1. **Minimal Dependencies**: Only React + React-DOM
2. **Lazy Loading**: Components load on demand
3. **Efficient API Calls**: Batch operations where possible
4. **Caching**: Reduce redundant API calls
5. **Code Splitting**: Vite handles automatic splitting
6. **Production Build**: Minified, no console logs

## Data Flow

```
User Action
    ↓
Component (Form)
    ↓
BudgetContext (Action)
    ↓
dataService (Business Logic)
    ↓
sheetsAPI (API Call)
    ↓
Google Sheets
    ↓
Response → Cache → UI Update
```

## Security Considerations

1. **OAuth2**: Secure authentication
2. **No Credentials**: Token stored in memory only
3. **HTTPS Only**: All API calls encrypted
4. **No Server**: Client-side only
5. **User Data**: Stored in user's Google Drive

## Deployment

### Firebase Hosting
```bash
npm run build
firebase deploy
```

### Environment Setup
1. Create Firebase project
2. Enable Hosting
3. Configure authorized origins in Google Cloud Console
4. Deploy with Firebase CLI

## Testing Workflow

1. **Local Development**
   ```bash
   npm run dev
   ```

2. **Build Test**
   ```bash
   npm run build
   npm run preview
   ```

3. **Production Deployment**
   ```bash
   firebase deploy
   ```

## Common Workflows

### Adding Income
1. User clicks "💰 Income" tab
2. Fills form (amount, description, payment method)
3. Clicks "Add Income"
4. Data saved to Transactions sheet
5. Dashboard refreshes automatically

### Adding Expense
1. User clicks "💸 Expense" tab
2. Fills form (amount, description, envelope, payment method)
3. Clicks "Add Expense"
4. Data saved to Transactions sheet
5. Budget spent amount updated
6. Dashboard refreshes

### Allocating Budget
1. User clicks "📋 Budget" tab
2. Enters envelope name and budget amount
3. Clicks "Allocate Budget"
4. Data saved to Budgets sheet
5. Budget summary displays with progress

### Managing Payment Methods
1. User clicks "💳 Payment Methods"
2. Modal opens
3. Can add new method or remove existing
4. Changes saved to PaymentMethods sheet
5. Available in all forms

## Error Handling

- **Network Errors**: User-friendly messages
- **Auth Errors**: Prompt to re-authorize
- **API Errors**: Logged to console, notification shown
- **Validation**: Client-side form validation

## Future Enhancements

1. **Recurring Transactions**: Auto-add monthly expenses
2. **Reports**: Monthly/yearly summaries
3. **Charts**: Visual spending analysis
4. **Notifications**: Budget alerts
5. **Multi-user**: Shared budgets
6. **Mobile App**: Native iOS/Android

## Troubleshooting

### Issue: "Spreadsheet not found"
**Solution**: Check internet connection, refresh page, verify API enabled

### Issue: "Authorization failed"
**Solution**: Clear cache, try incognito, verify Client ID

### Issue: "Data not syncing"
**Solution**: Check network, refresh page, verify permissions

## Code Quality

- **No Dead Code**: All files actively used
- **Minimal Comments**: Self-documenting code
- **Consistent Style**: Unified formatting
- **Error Handling**: Try-catch blocks
- **Performance**: Optimized renders

## File Structure

```
goal-planner/
├── src/
│   ├── services/
│   │   ├── sheetsAPI.js
│   │   └── dataService.js
│   ├── contexts/
│   │   └── BudgetContext.js
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── IncomeForm.jsx
│   │   ├── ExpenseForm.jsx
│   │   ├── TransferForm.jsx
│   │   ├── BudgetForm.jsx
│   │   ├── TransactionsList.jsx
│   │   ├── BudgetSummary.jsx
│   │   └── PaymentMethodsModal.jsx
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── index.html
├── vite.config.js
├── package.json
├── firebase.json
├── .env.example
├── .gitignore
└── README.md
```

## Next Steps

1. Update `.env` with Google OAuth Client ID
2. Run `npm install`
3. Run `npm run dev`
4. Test locally
5. Build with `npm run build`
6. Deploy to Firebase Hosting

---

**Version**: 2.0.0  
**Last Updated**: 2026-01  
**Status**: Production Ready
