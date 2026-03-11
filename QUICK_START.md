# Budget Planner - Quick Start Guide

## 5-Minute Setup

### Step 1: Google Cloud Console (5 min)
1. Go to https://console.cloud.google.com/
2. Create new project → "Budget Planner"
3. Search for "Google Sheets API" → Enable
4. Go to Credentials → Create OAuth 2.0 Client ID
5. Choose "Web application"
6. Add authorized origins:
   - `http://localhost:5173`
   - `https://your-firebase-domain.web.app`
7. Copy the Client ID

### Step 2: Local Setup (2 min)
```bash
cd goal-planner
npm install
cp .env.example .env
```

### Step 3: Configure Environment
Edit `.env`:
```
VITE_GOOGLE_OAUTH_CLIENT_ID=your_client_id_here
```

### Step 4: Run Development Server
```bash
npm run dev
```

Visit `http://localhost:5173`

## First Time Usage

1. Click "🔐 Authorize Google Sheets"
2. Grant permissions
3. App creates "Budget Tracker" spreadsheet
4. Go to "⚙️ Profile" tab
5. Add payment methods (e.g., HDFC, SBI)
6. Add envelopes/categories (e.g., EMI, DMART)
7. Go to "📋 Budget" tab
8. Allocate budgets for each envelope
9. Start adding transactions!

## Tab Navigation

| Tab | Purpose |
|-----|---------|
| 📊 Overview | View summary and transactions |
| 💰 Income | Add income transactions |
| 💸 Expense | Add expense transactions |
| 🔄 Transfer | Transfer between payment methods |
| 📋 Budget | Allocate monthly budgets |
| ⚙️ Profile | Manage envelopes & payment methods |

## Data Structure

### Transactions
- Month: 2026-01, 2026-02, etc.
- Type: Income, Expense, Transfer-In, Transfer-Out
- Description: What the transaction is for
- Envelope: Category (only for expenses)
- Amount: Transaction amount
- Payment Method: Which account/card

### Budgets
- Month: 2026-01, 2026-02, etc.
- Envelope: Category name
- Budgeted: Allocated amount
- Spent: Auto-calculated from transactions

### Envelopes
- Name: Category name (EMI, DMART, etc.)
- Active: true/false

### Payment Methods
- Name: Account/card name
- Type: Bank, Credit Card, Debit Card, Wallet, Cash
- Active: true/false

## Example Workflow

1. **Setup Phase**
   - Add payment methods: HDFC, SBI Credit Card
   - Add envelopes: EMI, DMART, EATOUT

2. **Budget Phase**
   - Set EMI budget: ₹85,000
   - Set DMART budget: ₹10,000
   - Set EATOUT budget: ₹5,000

3. **Transaction Phase**
   - Add income: ₹100,000 (Salary)
   - Add expense: ₹5,000 (EMI) → HDFC
   - Add expense: ₹500 (Groceries) → DMART
   - Transfer: ₹20,000 from HDFC to SBI

4. **Review Phase**
   - View overview with budget status
   - Check remaining budget for each envelope
   - See all transactions with details

## Mobile Usage

- Tap tabs to switch between sections
- All forms are touch-optimized
- Input fields are large for easy typing
- Responsive layout adapts to screen size

## Deployment to Firebase

```bash
# Build for production
npm run build

# Deploy to Firebase
firebase deploy
```

## Troubleshooting

### "Authorization Failed"
- Check Client ID in .env
- Verify authorized origins in Google Cloud Console
- Clear browser cache
- Try incognito mode

### "Spreadsheet Not Found"
- Check internet connection
- Refresh page
- Verify Google Sheets API is enabled
- Check Google account permissions

### "Data Not Syncing"
- Check internet connection
- Refresh page
- Check browser console for errors
- Verify API permissions

## Key Features

✅ Single OAuth2 login
✅ Automatic spreadsheet creation
✅ Monthly budget tracking
✅ Envelope-based expense categorization
✅ Payment method management
✅ Real-time budget vs spent tracking
✅ Mobile-responsive design
✅ No local storage needed
✅ All data in Google Sheets

## Performance Tips

- App caches data for 30 seconds
- Refresh manually if needed
- Works offline (cached data only)
- Optimized for mobile networks

## Support

For issues:
1. Check troubleshooting section
2. Review Google Sheets data
3. Check browser console (F12)
4. Verify internet connection
5. Try incognito mode

---

**Ready to start?** Run `npm run dev` and authorize with Google!
