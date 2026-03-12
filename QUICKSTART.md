# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Google Cloud Setup (2 minutes)

1. Go to https://console.cloud.google.com/
2. Click "New Project" → Name it "Budget Planner" → Create
3. Click "Enable APIs and Services"
4. Search "Google Sheets API" → Enable
5. Search "Google Drive API" → Enable
6. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
7. Configure consent screen (External, add app name)
8. Create OAuth client ID:
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:5173`
9. Copy the Client ID

### Step 2: Local Setup (1 minute)

```bash
# Create .env file
echo VITE_GOOGLE_OAUTH_CLIENT_ID=YOUR_CLIENT_ID_HERE > .env

# Install and run
npm install
npm run dev
```

### Step 3: First Use (2 minutes)

1. Open http://localhost:5173
2. Click "Sign in with Google"
3. Grant permissions
4. Click Settings (⚙️)
5. Add payment methods:
   - HDFC Bank (Bank)
   - Cash (Cash)
6. Go to Budget tab
7. Add budget:
   - Envelope: EMI
   - Amount: 85000
8. Go to Income tab
9. Add income:
   - Amount: 50000
   - Description: Salary
   - Payment Method: HDFC Bank
10. Go to Expense tab
11. Add expense:
    - Amount: 5000
    - Description: Groceries
    - Envelope: EMI
    - Payment Method: Cash

Done! Check your Google Drive for "Budget Tracker" spreadsheet.

## 📱 Mobile Access

1. Deploy to Firebase:
```bash
npm run build
firebase deploy
```

2. Add production URL to Google Cloud Console authorized origins

3. Access from mobile browser

## 🎯 Daily Usage

### Morning Routine
1. Open app
2. Check budget summary
3. Add any pending expenses

### After Purchase
1. Open app
2. Go to Expense tab
3. Add expense immediately

### End of Month
1. Review budget summary
2. Check overspent envelopes
3. Plan next month's budget

## 💡 Tips

- **Envelopes**: Create envelopes by allocating budgets
- **Payment Methods**: Add all your accounts in settings
- **Transfers**: Use for moving money between accounts
- **Month Selector**: Switch months to view history
- **Google Sheets**: Direct access to raw data anytime

## 🔧 Troubleshooting

**Can't sign in?**
- Check Client ID in .env
- Verify authorized origins in Google Cloud Console

**No data showing?**
- Refresh the page
- Check internet connection
- Open Google Sheets directly to verify data

**Mobile not working?**
- Add production URL to authorized origins
- Clear browser cache
- Try incognito mode

## 📊 Understanding Budget Summary

- **Green bar**: Under 80% of budget ✅
- **Orange bar**: 80-100% of budget ⚠️
- **Red bar**: Over budget 🚨

## 🎨 Customization

Want to change currency symbol?
Edit `TransactionsList.jsx` and `BudgetSummary.jsx`:
```javascript
// Change ₹ to $ or any symbol
₹{amount} → ${amount}
```

## 📈 Next Steps

1. Add all your payment methods
2. Set up monthly budgets for all envelopes
3. Track expenses daily
4. Review weekly
5. Adjust budgets monthly

---

**Need help?** Check IMPLEMENTATION.md for detailed documentation.
