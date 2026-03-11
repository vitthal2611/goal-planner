# Quick Start Guide

## 5-Minute Setup

### Step 1: Get Google OAuth Client ID (2 min)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project → "Budget Planner"
3. Search for "Google Sheets API" → Enable it
4. Go to "Credentials" → Create OAuth 2.0 Client ID
5. Choose "Web application"
6. Add authorized origins:
   - `http://localhost:5173`
   - `https://your-firebase-domain.web.app`
7. Copy the Client ID

### Step 2: Setup Project (2 min)

```bash
# Clone and setup
git clone <repo-url>
cd goal-planner
npm install

# Create .env file
echo "VITE_GOOGLE_OAUTH_CLIENT_ID=your_client_id_here" > .env

# Start development
npm run dev
```

### Step 3: Test Locally (1 min)

1. Open `http://localhost:5173`
2. Click "Authorize Google Sheets"
3. Grant permissions
4. App creates "Budget Tracker" spreadsheet
5. Start adding transactions!

## First Use

### 1. Add Payment Methods
- Click "💳 Payment Methods"
- Add: HDFC, SBI Credit Card, etc.

### 2. Allocate Budget
- Go to "📋 Budget" tab
- Add: DMART (5000), EMI (85000), etc.

### 3. Add Transactions
- **Income**: "💰 Income" tab
- **Expense**: "💸 Expense" tab
- **Transfer**: "🔄 Transfer" tab

### 4. Monitor Budget
- View "Budget Status" section
- See spending vs budget

## Deploy to Firebase

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting

# Deploy
npm run build
firebase deploy
```

## Data Structure

### Transactions Sheet
```
Month | Type | Description | Envelope | Amount | Payment Method
2026-01 | Expense | Dmart | DMART | 1500 | HDFC
2026-01 | Income | Salary | | 50000 | HDFC
```

### Budgets Sheet
```
Month | Envelope | Budgeted | Spent
2026-01 | DMART | 5000 | 1500
2026-01 | EMI | 85000 | 85000
```

### PaymentMethods Sheet
```
Name | Type | Active
HDFC | Bank | TRUE
SBI Credit Card | Credit Card | TRUE
```

## Features

✅ Add Income, Expense, Transfer  
✅ Allocate Monthly Budgets  
✅ Track Spending by Envelope  
✅ Manage Payment Methods  
✅ Mobile Responsive  
✅ Real-time Google Sheets Sync  
✅ Secure OAuth2  
✅ No Local Storage  

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Authorization fails | Check Client ID in .env |
| Spreadsheet not found | Refresh page, check internet |
| Data not syncing | Verify Google Sheets API enabled |
| Mobile layout broken | Check viewport meta tag |

## Environment Variables

```env
# Required
VITE_GOOGLE_OAUTH_CLIENT_ID=your_client_id_here
```

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run deploy   # Build and deploy to Firebase
```

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## File Structure

```
src/
├── services/
│   ├── sheetsAPI.js
│   └── dataService.js
├── contexts/
│   └── BudgetContext.js
├── components/
│   ├── Dashboard.jsx
│   ├── IncomeForm.jsx
│   ├── ExpenseForm.jsx
│   ├── TransferForm.jsx
│   ├── BudgetForm.jsx
│   ├── TransactionsList.jsx
│   ├── BudgetSummary.jsx
│   └── PaymentMethodsModal.jsx
├── App.jsx
└── main.jsx
```

## Key Features

### Single Authorization
- One-time OAuth2 setup
- Automatic token management
- Secure credential handling

### Google Sheets Integration
- Auto-creates "Budget Tracker" spreadsheet
- Three sheets: Transactions, Budgets, PaymentMethods
- Real-time data sync
- No data loss

### Mobile Friendly
- Responsive design
- Touch-optimized buttons
- Works on all devices

### Performance
- Minimal dependencies
- Fast loading
- Optimized API calls
- Efficient rendering

## Support

For issues:
1. Check browser console (F12)
2. Verify Google Sheets API enabled
3. Check .env configuration
4. Review README.md

---

**Ready to use!** 🚀
