# Quick Start Guide

Get your Life Tracker React app running in 5 minutes!

## Step 1: Install Dependencies (1 min)

```bash
npm install
```

## Step 2: Start Development Server (30 seconds)

```bash
npm run dev
```

Your app will open at `http://localhost:3000`

## Step 3: Create Account (1 min)

1. Click "Create Account"
2. Enter email and password
3. Click "Create Account" button

## Step 4: Add Your First Data (2 mins)

### Add Payment Method
1. Click ⚙️ Settings button
2. Under "Payment Methods", type "Cash"
3. Click "Add"

### Add Category
1. In Settings, under "Categories", type "Food"
2. Click "Add"

### Add Transaction
1. Close settings
2. Fill in the quick action form:
   - Amount: 100
   - Description: Lunch
   - Payment Method: Cash
   - Category: Food
   - Type: Need
3. Click "- Expense"

### Add Habit
1. Click "✅ Habits" tab
2. Click "+ Add Habit"
3. Type "Morning workout"
4. Click "Add"
5. Click the checkbox to mark it complete

## You're Done! 🎉

Your Life Tracker is now set up and ready to use.

## Next Steps

- Add more payment methods (Bank accounts, Credit cards)
- Create categories for your expenses
- Set up monthly budgets
- Track your daily habits
- Review your financial summary

## Tips

- Use the month/year selector to view historical data
- Click the profile button to logout
- All data syncs automatically to Firebase
- Access from any device with your login

## Need Help?

- Check README.md for detailed documentation
- Review SETUP.md for configuration options
- See ARCHITECTURE.md for technical details
- Read MIGRATION_GUIDE.md if migrating from old version

## Common Issues

**Port 3000 already in use?**
```bash
npm run dev -- --port 3001
```

**Firebase errors?**
- Check your internet connection
- Verify Firebase config in `src/config/firebase.js`

**Build errors?**
```bash
rm -rf node_modules package-lock.json
npm install
```

## Keyboard Shortcuts

- `Enter` in input fields submits forms
- `Esc` closes modals
- Tab navigation supported throughout

## Mobile Usage

The app is fully responsive and works great on mobile:
- Add to home screen for app-like experience
- Touch-friendly buttons and inputs
- Optimized for small screens

Enjoy tracking your life! 📊✅
