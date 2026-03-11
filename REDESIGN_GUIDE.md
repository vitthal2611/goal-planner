# Budget Planner - Complete Redesign Implementation Guide

## Overview
This is a complete rewrite of the Budget Planner app using Google Sheets as the single source of truth with OAuth2 authentication. The app is mobile-first responsive and requires no local storage or Firebase.

## Architecture

### Core Services
1. **googleAuth.js** - OAuth2 authentication with Google
2. **sheetsAPI.js** - Google Sheets API wrapper with CRUD operations
3. **BudgetContext.jsx** - React context for state management

### Components
- **Dashboard.jsx** - Main container with tab navigation
- **IncomeForm.jsx** - Add income transactions
- **ExpenseForm.jsx** - Add expense transactions with envelope selection
- **TransferForm.jsx** - Transfer funds between payment methods
- **BudgetForm.jsx** - Allocate budgets to envelopes
- **BudgetSummary.jsx** - Overview with progress bars
- **TransactionsList.jsx** - Display all transactions
- **ProfileSettings.jsx** - Manage envelopes and payment methods

### Google Sheets Structure

**Transactions Sheet**
```
Month | Type | Description | Envelope | Amount | Payment Method | Date | ID
2026-01 | Expense | Tea | EMI | 50 | HDFC | 2026-01-15T10:30:00Z | abc123
```

**Budgets Sheet**
```
Month | Envelope | Budgeted | Spent
2026-01 | EMI | 85000 | 0
```

**Envelopes Sheet**
```
Name | Active
EMI | true
DMART | true
```

**PaymentMethods Sheet**
```
Name | Type | Active
HDFC | Bank | true
SBI Credit Card | Credit Card | true
```

## Setup Instructions

### 1. Google Cloud Console Setup
1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable Google Sheets API
4. Create OAuth2 credentials (Web application)
5. Add authorized origins:
   - `http://localhost:5173` (development)
   - `https://your-firebase-domain.web.app` (production)
6. Copy the Client ID

### 2. Local Setup
```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your Google OAuth Client ID
VITE_GOOGLE_OAUTH_CLIENT_ID=your_client_id_here

# Start development server
npm run dev
```

### 3. Firebase Deployment
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase
firebase init hosting

# Build and deploy
npm run build
firebase deploy
```

## Key Features

### 1. Single Authorization
- User logs in once with Google OAuth2
- App automatically finds or creates "Budget Tracker" spreadsheet
- All sheets are created automatically on first use

### 2. Transaction Management
- Add Income, Expense, Transfer-In, Transfer-Out transactions
- Each transaction includes: Month, Type, Description, Envelope, Amount, Payment Method, Date, ID
- All transactions stored in single "Transactions" sheet

### 3. Budget Allocation
- Set monthly budgets for each envelope/category
- View spent vs budgeted with progress bars
- Real-time calculation of remaining budget

### 4. Envelope Management
- Create custom envelopes/categories (EMI, DMART, etc.)
- Global envelope list used across all months
- Envelopes configured in Profile section

### 5. Payment Methods
- Configure payment methods (HDFC, SBI, etc.)
- Support for Bank, Credit Card, Debit Card, Wallet, Cash
- Used for all transactions and transfers

### 6. Mobile Responsive
- Desktop view: Full tabs with labels
- Mobile view: Icon-only tabs
- Touch-friendly interface
- Optimized for all screen sizes

## Data Flow

```
User Login
    ↓
OAuth2 Authentication
    ↓
Find/Create "Budget Tracker" Spreadsheet
    ↓
Initialize Sheets (Transactions, Budgets, Envelopes, PaymentMethods)
    ↓
Load Data for Current Month
    ↓
Display Dashboard
```

## Performance Optimizations

1. **Caching** - 30-second cache for sheet reads
2. **Batch Operations** - Load all data in parallel
3. **Minimal Dependencies** - Only React + React-DOM
4. **Lazy Loading** - Components load on demand
5. **Optimized Bundle** - Terser minification

## Data Integrity

- No data duplication - each transaction has unique ID
- Normalized data structure - no redundant information
- Automatic calculation of spent amounts from transactions
- Budget updates don't affect transaction history

## Mobile-First Design

### Desktop (>768px)
- Full tab labels visible
- Multi-column layouts
- Expanded forms

### Tablet (481-768px)
- Compact tab labels
- 2-column grids
- Optimized spacing

### Mobile (<480px)
- Icon-only tabs
- Single column layouts
- Touch-optimized buttons
- Larger input fields (16px for auto-zoom prevention)

## Security

- OAuth2 authentication - no credentials stored
- All data in user's Google Drive
- No server-side processing
- No local storage
- HTTPS only in production

## Troubleshooting

### Authorization Failed
- Verify Client ID in .env
- Check authorized origins in Google Cloud Console
- Clear browser cache
- Try incognito mode

### Spreadsheet Not Found
- Check internet connection
- Refresh the page
- Verify Google Sheets API is enabled
- Check Google account permissions

### Data Not Syncing
- Check internet connection
- Refresh the page
- Verify Google Sheets API permissions
- Check browser console for errors

## File Structure

```
src/
├── services/
│   ├── googleAuth.js          # OAuth2 authentication
│   └── sheetsAPI.js           # Google Sheets API wrapper
├── contexts/
│   └── BudgetContext.jsx      # React context
├── components/
│   ├── Dashboard.jsx          # Main dashboard
│   ├── IncomeForm.jsx         # Income form
│   ├── ExpenseForm.jsx        # Expense form
│   ├── TransferForm.jsx       # Transfer form
│   ├── BudgetForm.jsx         # Budget form
│   ├── BudgetSummary.jsx      # Budget overview
│   ├── TransactionsList.jsx   # Transactions list
│   ├── ProfileSettings.jsx    # Profile settings
│   ├── Dashboard.css
│   ├── Forms.css
│   ├── BudgetSummary.css
│   ├── TransactionsList.css
│   └── ProfileSettings.css
├── App.jsx                    # Main app
├── App.css                    # App styles
└── main.jsx                   # Entry point
```

## Next Steps

1. Set up Google Cloud Console credentials
2. Update .env with Client ID
3. Run `npm install`
4. Run `npm run dev`
5. Test locally
6. Deploy to Firebase Hosting

## Notes

- All data is stored in Google Sheets - no Firebase Database
- Single authorization per user
- No CSV import/export functionality
- No bulk operations
- No local storage
- Optimized for performance and simplicity
