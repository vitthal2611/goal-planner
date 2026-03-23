# Getting Started with the Migrated Life Tracker

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will open at `http://localhost:5173` (or another port if 5173 is busy).

---

## 🎯 What's Working Now

### ✅ Quick Track Tab (Fully Functional)
The main transaction entry interface is complete and ready to use:

#### Features:
- **Add Income:** Track money coming in
- **Add Expenses:** Record spending with categories
- **Transfer Money:** Move funds between accounts
- **Payment Balances:** See real-time balances for each payment method
- **Form Validation:** Prevents invalid entries
- **Toast Notifications:** Visual feedback on actions
- **Data Persistence:** All data saved to localStorage

#### How to Use:
1. Select transaction type (Income/Expense/Transfer)
2. Enter amount (₹)
3. Add description (optional but recommended)
4. Select category (for expenses)
5. Choose payment method
6. Click "Add" button
7. See toast notification confirming success
8. Watch payment balances update automatically

---

## ⚙️ Settings & Configuration

### Payment Methods
Click the ⚙️ icon in the header to manage payment methods:
- **Default methods:** Cash, Credit Card, Debit Card, UPI
- **Add new:** Type name and click "Add"
- **Delete:** Click "Delete" button next to any method

### Categories (Envelopes)
Default categories are pre-loaded:
- 🍔 Food (need)
- 🚗 Transport (need)
- 🛍️ Shopping (want)
- 🎬 Entertainment (want)
- 📄 Bills (need)
- 💰 Savings (save)

*Note: Category management UI coming in next phase*

---

## 📅 Date Navigation

### Navigate Months
- Click **←** to go to previous month
- Click **→** to go to next month
- Click the **month label** to toggle "All Months" view

### How It Works:
- Payment balances automatically filter by selected date
- "All Months" shows entire year's data
- Date selection persists across page refreshes

---

## 🗂️ Tab Navigation

### Available Tabs:
1. **⚡ Quick Track** - Add transactions (✅ Working)
2. **💰 Balance** - Summary view (Coming soon)
3. **📅 Today** - Today's transactions (Coming soon)
4. **📊 Review** - Transaction history (Coming soon)
5. **📈 Insights** - Analytics (Coming soon)
6. **🔍 Drill Down** - Detailed analysis (Coming soon)
7. **✅ Habits** - Habit tracking (Coming soon)
8. **💎 NWS** - Net worth (Coming soon)

---

## 💾 Data Storage

### LocalStorage
All data is stored in your browser's localStorage:
- `transactions` - All transaction records
- `paymentMethods` - Your payment methods
- `envelopes` - Your categories
- `budgets` - Budget allocations
- `habits` - Habit tracking data

### Data Persistence
- Data survives page refreshes
- Data is device-specific (not synced across devices)
- Clear browser data will delete all transactions

### Future: Firebase Sync
Firebase integration is ready but not yet connected. Future updates will enable:
- Cloud backup
- Multi-device sync
- Real-time collaboration

---

## 🧪 Testing Scenarios

### Test 1: Add Income
1. Select "Income" type
2. Enter amount: 5000
3. Description: "Salary"
4. Payment: "Credit Card"
5. Submit
6. Verify: Credit Card balance increases by ₹5,000

### Test 2: Add Expense
1. Select "Expense" type
2. Enter amount: 500
3. Description: "Groceries"
4. Category: "Food"
5. Payment: "Cash"
6. Expense Type: "Need"
7. Submit
8. Verify: Cash balance decreases by ₹500

### Test 3: Transfer Money
1. Select "Transfer" type
2. Enter amount: 1000
3. Description: "Moving funds"
4. From: "Cash"
5. To: "Credit Card"
6. Submit
7. Verify: Cash decreases by ₹1,000, Credit Card increases by ₹1,000

### Test 4: Date Navigation
1. Add transaction in current month
2. Click ← to go to previous month
3. Verify: Payment balances show 0 (no transactions in that month)
4. Click → to return
5. Verify: Balances restored

### Test 5: Settings
1. Click ⚙️ settings
2. Add payment method: "PayPal"
3. Close modal
4. Verify: PayPal appears in payment balances
5. Verify: PayPal available in form dropdown

---

## 🐛 Troubleshooting

### Issue: App won't start
**Solution:** 
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Issue: Data not persisting
**Solution:** 
- Check browser console for localStorage errors
- Ensure browser allows localStorage
- Try incognito/private mode

### Issue: Balances not updating
**Solution:**
- Refresh the page
- Check browser console for errors
- Verify transaction was added (check localStorage in DevTools)

### Issue: Styles not loading
**Solution:**
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear browser cache
- Check that all CSS files are imported

---

## 📱 Mobile Testing

### Responsive Design
The app is mobile-first and works great on:
- iPhone (Safari, Chrome)
- Android (Chrome, Firefox)
- Tablets (iPad, Android tablets)

### Test on Mobile:
1. Start dev server: `npm run dev`
2. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
3. Open `http://YOUR_IP:5173` on mobile device
4. Test touch interactions, scrolling, form inputs

---

## 🔍 Developer Tools

### React DevTools
Install React DevTools browser extension to:
- Inspect component tree
- View props and state
- Track re-renders
- Debug context values

### Useful Console Commands
```javascript
// View all transactions
JSON.parse(localStorage.getItem('transactions'))

// View payment methods
JSON.parse(localStorage.getItem('paymentMethods'))

// Clear all data
localStorage.clear()

// Add test transaction
localStorage.setItem('transactions', JSON.stringify([
  {
    id: 'TEST-001',
    type: 'expense',
    amount: 100,
    description: 'Test',
    envelope: 'Food',
    payment: 'Cash',
    date: new Date().toISOString()
  }
]))
```

---

## 📚 Project Structure

```
life-tracker/
├── public/
│   ├── index.html (OLD - reference only)
│   └── ... (old JS/CSS files - will be removed later)
├── src/
│   ├── components/
│   │   ├── QuickTrack/     ← Current working feature
│   │   ├── shared/         ← Reusable components
│   │   └── ...             ← Layout components
│   ├── contexts/           ← State management
│   ├── services/           ← Firebase, API calls
│   ├── styles/             ← Global styles, tokens
│   ├── App.jsx             ← Main app component
│   └── main.jsx            ← Entry point
├── MIGRATION_GUIDE.md      ← Full migration plan
├── MIGRATION_PROGRESS.md   ← Current progress
├── PHASE_1_2_SUMMARY.md    ← What's been built
└── GETTING_STARTED.md      ← This file
```

---

## 🎓 Learning Resources

### React Concepts Used
- Functional components
- Hooks (useState, useEffect, useMemo, useContext)
- Context API for state management
- Controlled forms
- Conditional rendering

### CSS Techniques
- CSS Custom Properties (variables)
- Flexbox and Grid layouts
- Responsive design
- Animations and transitions
- Mobile-first approach

---

## 🤝 Contributing

### Adding a New Feature
1. Create component folder in `src/components/`
2. Create `.jsx` and `.css` files
3. Import and use in `App.jsx`
4. Update `MIGRATION_PROGRESS.md`

### Code Style
- Use functional components
- Use hooks for state/effects
- Keep components small and focused
- Extract reusable logic to custom hooks
- Use CSS modules for styling
- Follow existing naming conventions

---

## 📞 Support

### Common Questions

**Q: Can I use this with real Firebase?**
A: Yes! Update `.env` file with your Firebase credentials.

**Q: How do I export my data?**
A: Data export feature coming in Phase 2. For now, copy from localStorage.

**Q: Can I customize categories?**
A: Category management UI coming in next phase. For now, edit `AppContext.jsx`.

**Q: Is this production-ready?**
A: Not yet. This is Phase 1-2 of migration. Full feature parity expected in 4-6 weeks.

---

## 🎉 What's Next?

### Coming in Phase 2.2 (Next Week)
- Balance Summary tab
- Income/Expense overview
- Envelope budget tracking
- Spending breakdown charts

### Coming in Phase 2.3
- Today's Transactions tab
- Transaction list view
- Quick edit/delete
- Search and filters

### Coming in Phase 3
- Transaction Review (full history)
- Insights & Analytics
- Drill Down (detailed analysis)

---

**Happy tracking! 🚀**

For questions or issues, check the migration documents or create an issue in the repository.
