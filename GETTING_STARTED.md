# Getting Started Checklist

## ✅ Complete Setup Guide

Follow this checklist to get your Budget Planner up and running.

---

## 📋 Phase 1: Google Cloud Setup

### Step 1: Create Project
- [ ] Go to https://console.cloud.google.com/
- [ ] Click "Select a project" → "New Project"
- [ ] Name: "Budget Planner"
- [ ] Click "Create"
- [ ] Wait for project creation
- [ ] Select the new project

### Step 2: Enable APIs
- [ ] Click "Enable APIs and Services"
- [ ] Search "Google Sheets API"
- [ ] Click on it → Click "Enable"
- [ ] Go back → Search "Google Drive API"
- [ ] Click on it → Click "Enable"

### Step 3: Configure OAuth Consent Screen
- [ ] Go to "OAuth consent screen" (left sidebar)
- [ ] Select "External" → Click "Create"
- [ ] Fill in:
  - [ ] App name: "Budget Planner"
  - [ ] User support email: Your email
  - [ ] Developer contact: Your email
- [ ] Click "Save and Continue"
- [ ] Skip "Scopes" → Click "Save and Continue"
- [ ] Skip "Test users" → Click "Save and Continue"
- [ ] Click "Back to Dashboard"

### Step 4: Create OAuth Credentials
- [ ] Go to "Credentials" (left sidebar)
- [ ] Click "Create Credentials" → "OAuth client ID"
- [ ] Application type: "Web application"
- [ ] Name: "Budget Planner Web Client"
- [ ] Authorized JavaScript origins:
  - [ ] Click "Add URI"
  - [ ] Enter: `http://localhost:5173`
  - [ ] Click "Add URI" again
  - [ ] Enter: `https://your-app.web.app` (if deploying)
- [ ] Click "Create"
- [ ] **IMPORTANT**: Copy the Client ID
- [ ] Click "OK"

---

## 📋 Phase 2: Local Development Setup

### Step 1: Install Dependencies
```bash
cd c:\Users\Admin\goal-planner
npm install
```
- [ ] Run the command
- [ ] Wait for installation to complete
- [ ] Verify no errors

### Step 2: Configure Environment
- [ ] Open `.env.example`
- [ ] Copy the Client ID from Google Cloud Console
- [ ] Create new file `.env` in project root
- [ ] Add: `VITE_GOOGLE_OAUTH_CLIENT_ID=YOUR_CLIENT_ID_HERE`
- [ ] Replace `YOUR_CLIENT_ID_HERE` with actual Client ID
- [ ] Save the file

### Step 3: Start Development Server
```bash
npm run dev
```
- [ ] Run the command
- [ ] Wait for server to start
- [ ] Browser should open automatically
- [ ] If not, open http://localhost:5173

---

## 📋 Phase 3: First Time App Setup

### Step 1: Sign In
- [ ] Click "Sign in with Google" button
- [ ] Select your Google account
- [ ] Review permissions
- [ ] Click "Allow"
- [ ] Wait for redirect back to app

### Step 2: Verify Spreadsheet Creation
- [ ] Go to https://drive.google.com
- [ ] Look for "Budget Tracker" spreadsheet
- [ ] Open it
- [ ] Verify 3 sheets exist:
  - [ ] Transactions
  - [ ] Envelopes
  - [ ] PaymentMethods
- [ ] Verify headers are present

### Step 3: Configure Payment Methods
- [ ] In the app, click Settings (⚙️) button
- [ ] Click "💳 Payment Methods" tab
- [ ] Add your payment methods:
  - [ ] Name: "HDFC Bank", Type: "Bank" → Click "Add"
  - [ ] Name: "SBI Bank", Type: "Bank" → Click "Add"
  - [ ] Name: "Cash", Type: "Cash" → Click "Add"
  - [ ] Add more as needed
- [ ] Verify they appear in the list
- [ ] Close settings modal

### Step 4: Allocate Monthly Budget
- [ ] Select current month from dropdown
- [ ] Click "📋 Budget" tab
- [ ] Add budgets:
  - [ ] Envelope: "EMI", Amount: 85000 → Click "Allocate Budget"
  - [ ] Envelope: "Food", Amount: 15000 → Click "Allocate Budget"
  - [ ] Envelope: "Transport", Amount: 5000 → Click "Allocate Budget"
  - [ ] Add more as needed
- [ ] Verify budget cards appear at top

### Step 5: Add Test Income
- [ ] Click "💰 Income" tab
- [ ] Fill form:
  - [ ] Amount: 50000
  - [ ] Description: "Salary"
  - [ ] Payment Method: Select "HDFC Bank"
- [ ] Click "💰 Add Income"
- [ ] Verify transaction appears below

### Step 6: Add Test Expense
- [ ] Click "💸 Expense" tab
- [ ] Fill form:
  - [ ] Amount: 5000
  - [ ] Description: "Groceries"
  - [ ] Envelope: Select "Food"
  - [ ] Payment Method: Select "Cash"
- [ ] Click "💸 Add Expense"
- [ ] Verify transaction appears below
- [ ] Verify budget summary updates

### Step 7: Add Test Transfer
- [ ] Click "🔄 Transfer" tab
- [ ] Fill form:
  - [ ] Amount: 10000
  - [ ] From: Select "HDFC Bank"
  - [ ] To: Select "SBI Bank"
  - [ ] Description: "Savings" (optional)
- [ ] Click "🔄 Transfer"
- [ ] Verify transaction appears below

---

## 📋 Phase 4: Verification

### Data Verification
- [ ] Go to Google Sheets "Budget Tracker"
- [ ] Check Transactions sheet:
  - [ ] Income row exists
  - [ ] Expense row exists
  - [ ] Transfer row exists
- [ ] Check Envelopes sheet:
  - [ ] Budget allocations exist
- [ ] Check PaymentMethods sheet:
  - [ ] Payment methods exist

### Functionality Verification
- [ ] Budget summary shows correct amounts
- [ ] Progress bars display correctly
- [ ] Color coding works (green/orange/red)
- [ ] Delete transaction works
- [ ] Month selector works
- [ ] Settings modal works

### Mobile Verification
- [ ] Open on mobile browser
- [ ] Test responsive layout
- [ ] Test all forms
- [ ] Test all buttons
- [ ] Verify touch-friendly

---

## 📋 Phase 5: Production Deployment (Optional)

### Step 1: Firebase Setup
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
```
- [ ] Install Firebase CLI
- [ ] Login to Firebase
- [ ] Initialize hosting
- [ ] Select/create Firebase project
- [ ] Set public directory to: `dist`
- [ ] Configure as single-page app: Yes
- [ ] Don't overwrite index.html

### Step 2: Build and Deploy
```bash
npm run build
firebase deploy
```
- [ ] Build completes successfully
- [ ] Deploy completes successfully
- [ ] Note the hosting URL

### Step 3: Update Google Cloud Console
- [ ] Go to Google Cloud Console
- [ ] Go to Credentials
- [ ] Edit OAuth client ID
- [ ] Add production URL to authorized origins
- [ ] Save

### Step 4: Test Production
- [ ] Open production URL
- [ ] Test sign in
- [ ] Test all features
- [ ] Test on mobile

---

## 📋 Phase 6: Daily Usage

### Morning Routine
- [ ] Open app
- [ ] Check budget summary
- [ ] Review yesterday's expenses

### After Each Purchase
- [ ] Open app
- [ ] Go to Expense tab
- [ ] Add expense immediately

### Weekly Review
- [ ] Check budget summary
- [ ] Review all transactions
- [ ] Adjust spending if needed

### Monthly Planning
- [ ] Review previous month
- [ ] Allocate next month's budget
- [ ] Adjust envelope amounts

---

## 🎯 Success Criteria

You're all set when:
- [ ] ✅ App loads without errors
- [ ] ✅ Sign in works
- [ ] ✅ Spreadsheet auto-created
- [ ] ✅ Payment methods configured
- [ ] ✅ Budgets allocated
- [ ] ✅ Transactions added
- [ ] ✅ Budget summary displays
- [ ] ✅ Data persists in Google Sheets
- [ ] ✅ Mobile works perfectly
- [ ] ✅ No console errors

---

## 🆘 Troubleshooting

### Can't sign in?
- [ ] Verify Client ID in .env
- [ ] Check authorized origins in Google Cloud Console
- [ ] Clear browser cache
- [ ] Try incognito mode

### Spreadsheet not created?
- [ ] Check Google Sheets API is enabled
- [ ] Check Google Drive API is enabled
- [ ] Verify permissions granted
- [ ] Check browser console for errors

### Data not showing?
- [ ] Refresh the page
- [ ] Check internet connection
- [ ] Open Google Sheets directly
- [ ] Verify data exists in sheets

### Mobile issues?
- [ ] Test on actual device
- [ ] Check responsive CSS
- [ ] Verify touch events work
- [ ] Test different browsers

---

## 📚 Next Steps

After completing this checklist:
1. Read QUICKSTART.md for usage tips
2. Read SHEETS_GUIDE.md to understand data structure
3. Read IMPLEMENTATION.md for technical details
4. Start tracking your budget!

---

## ✨ Congratulations!

You now have a fully functional Budget Planner app! 🎉

**Happy Budgeting!** 💰
