# Quick Start Guide

## 5-Minute Setup

### Step 1: Get Google OAuth Client ID (2 min)
1. Go to https://console.cloud.google.com/
2. Create new project
3. Enable "Google Sheets API" and "Google Drive API"
4. Create OAuth2 credentials (Web application)
5. Add `http://localhost:5173` to authorized origins
6. Copy Client ID

### Step 2: Setup Project (2 min)
```bash
cd goal-planner
npm install
cp .env.example .env
# Edit .env and paste your Client ID
```

### Step 3: Run (1 min)
```bash
npm run dev
```

## First Use

1. **Authorize**: Click "Authorize with Google"
2. **Setup Profile**: 
   - Add payment methods (HDFC, SBI, etc.)
   - Add envelopes (EMI, Groceries, etc.)
3. **Add Budget**: Select month → Budget tab → Allocate budget
4. **Track**: Add income/expense/transfer

## Key Features

| Feature | Tab | Steps |
|---------|-----|-------|
| Add Income | 💰 Income | Enter amount → Select payment method → Add |
| Add Expense | 💸 Expense | Enter amount → Select envelope → Select payment method → Add |
| Transfer | 🔄 Transfer | Enter amount → Select payment method → Transfer |
| Budget | 📋 Budget | Select envelope → Enter amount → Allocate |
| Overview | 📊 Overview | View income, expenses, balance, budget status |
| Settings | ⚙️ Profile | Add envelopes and payment methods |

## Data Location

All data is in Google Sheets:
- Spreadsheet name: "Budget Tracker"
- Sheets: Transactions, Budgets, Envelopes, PaymentMethods
- Access: https://sheets.google.com

## Mobile Usage

- Works on all mobile browsers
- Touch-friendly interface
- Icon-based tabs on small screens
- Same features as desktop

## Deployment

```bash
npm run build
firebase deploy
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Authorization fails | Check Client ID in .env |
| Sheet not found | Refresh page, check internet |
| Data not showing | Check Google Sheets permissions |
| Mobile layout broken | Clear cache, try incognito |

## Next Steps

1. Read REDESIGN_COMPLETE.md for full documentation
2. Check MIGRATION_GUIDE.md for architecture details
3. Review component code for customization

---

**That's it! Your budget planner is ready to use.**
