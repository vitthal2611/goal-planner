# Budget Planner - Deployment & Verification Checklist

## Pre-Deployment Checklist

### Google Cloud Console Setup
- [ ] Create Google Cloud project
- [ ] Enable Google Sheets API
- [ ] Enable Google Drive API (for spreadsheet discovery)
- [ ] Create OAuth2 credentials (Web application)
- [ ] Add authorized origins:
  - [ ] `http://localhost:5173` (development)
  - [ ] `https://your-firebase-domain.web.app` (production)
- [ ] Copy Client ID
- [ ] Verify credentials are active

### Local Development Setup
- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Create `.env` file from `.env.example`
- [ ] Add Google OAuth Client ID to `.env`
- [ ] Run `npm run dev`
- [ ] Verify app loads at `http://localhost:5173`

### Firebase Setup
- [ ] Create Firebase project
- [ ] Install Firebase CLI: `npm install -g firebase-tools`
- [ ] Login: `firebase login`
- [ ] Initialize Firebase: `firebase init hosting`
- [ ] Configure public directory: `dist`
- [ ] Configure single-page app: `yes`

## Functionality Testing

### Authentication
- [ ] Login button appears on initial load
- [ ] Click "Authorize Google Sheets" button
- [ ] Google login popup appears
- [ ] User can grant permissions
- [ ] After authorization, dashboard loads
- [ ] "Budget Tracker" spreadsheet created in Google Drive
- [ ] All 4 sheets created (Transactions, Budgets, Envelopes, PaymentMethods)
- [ ] Logout button works
- [ ] After logout, login screen appears again

### Profile Settings (⚙️ tab)
- [ ] Can add new envelope
- [ ] Envelope appears in list
- [ ] Cannot add duplicate envelope
- [ ] Can add payment method
- [ ] Payment method appears in list
- [ ] Cannot add duplicate payment method
- [ ] Payment method type selector works
- [ ] Success messages appear

### Income Form (💰 tab)
- [ ] Form has Description, Amount, Payment Method fields
- [ ] Payment method dropdown populated
- [ ] Can submit form
- [ ] Transaction appears in Google Sheets
- [ ] Success message appears
- [ ] Form clears after submission
- [ ] Transaction appears in Overview tab

### Expense Form (💸 tab)
- [ ] Form has Description, Envelope, Amount, Payment Method fields
- [ ] Envelope dropdown populated with created envelopes
- [ ] Payment method dropdown populated
- [ ] Can submit form
- [ ] Transaction appears in Google Sheets
- [ ] Success message appears
- [ ] Form clears after submission
- [ ] Transaction appears in Overview tab

### Transfer Form (🔄 tab)
- [ ] Form has From Method, To Method, Amount, Description fields
- [ ] Both dropdowns populated
- [ ] Cannot transfer to same method
- [ ] Can submit form
- [ ] Two transactions created (Transfer-Out, Transfer-In)
- [ ] Success message appears
- [ ] Form clears after submission
- [ ] Transactions appear in Overview tab

### Budget Form (📋 tab)
- [ ] Form has Envelope and Budget Amount fields
- [ ] Envelope dropdown populated
- [ ] Can submit form
- [ ] Budget appears in list
- [ ] Budget appears in Google Sheets
- [ ] Success message appears
- [ ] Form clears after submission

### Budget Summary (📊 tab)
- [ ] Shows 4 summary cards (Income, Expense, Budget, Balance)
- [ ] Amounts calculated correctly
- [ ] Shows envelope status with progress bars
- [ ] Progress bars show correct percentage
- [ ] Over-budget envelopes highlighted in red
- [ ] Remaining amount calculated correctly

### Transactions List
- [ ] Shows all transactions for current month
- [ ] Transactions sorted by date
- [ ] Transaction type icons display correctly
- [ ] Envelope badges show for expenses
- [ ] Payment method shows correctly
- [ ] Amounts formatted with currency symbol
- [ ] Empty state shows when no transactions

### Month Navigation
- [ ] Month dropdown shows multiple months
- [ ] Can select different month
- [ ] Data updates when month changes
- [ ] Transactions filtered by month
- [ ] Budgets filtered by month

### Mobile Responsiveness
- [ ] Test on mobile device (or DevTools)
- [ ] Tabs show as icons only on mobile
- [ ] Forms stack vertically
- [ ] Buttons are touch-friendly (min 44px)
- [ ] Text is readable without zooming
- [ ] No horizontal scrolling
- [ ] Summary cards stack on mobile
- [ ] Envelope list responsive

### Data Persistence
- [ ] Refresh page - data persists
- [ ] Close and reopen browser - data persists
- [ ] Check Google Sheets - data matches app
- [ ] Add transaction, refresh - transaction still there
- [ ] Set budget, refresh - budget still there

### Error Handling
- [ ] Try to add transaction without filling fields - error shows
- [ ] Try to add duplicate envelope - error shows
- [ ] Disconnect internet - error shows
- [ ] Reconnect internet - can retry
- [ ] Invalid input - error shows

## Performance Testing

### Load Time
- [ ] Initial load: < 5 seconds
- [ ] After authorization: < 3 seconds
- [ ] Tab switching: < 1 second
- [ ] Data refresh: < 2 seconds

### API Calls
- [ ] Monitor network tab in DevTools
- [ ] Initial load: ~5-10 API calls
- [ ] Add transaction: 1 API call
- [ ] Set budget: 1 API call
- [ ] Refresh: 4 API calls (parallel)

### Caching
- [ ] First read from sheet: API call made
- [ ] Second read within 30s: No API call (cached)
- [ ] After 30s: API call made
- [ ] After write: Cache cleared

## Browser Compatibility

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] Chrome Mobile
- [ ] Safari iOS
- [ ] Firefox Mobile

### Devices
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Large mobile (414x896)

## Google Sheets Verification

### Transactions Sheet
- [ ] Header row: Month, Type, Description, Envelope, Amount, Payment Method, Date, ID
- [ ] Data rows populated correctly
- [ ] No duplicate transactions
- [ ] Dates in ISO format
- [ ] IDs are unique

### Budgets Sheet
- [ ] Header row: Month, Envelope, Budgeted, Spent
- [ ] Data rows populated correctly
- [ ] Budgeted amounts correct
- [ ] Spent amounts calculated from transactions

### Envelopes Sheet
- [ ] Header row: Name, Active
- [ ] All created envelopes listed
- [ ] Active flag set correctly

### PaymentMethods Sheet
- [ ] Header row: Name, Type, Active
- [ ] All created methods listed
- [ ] Type set correctly
- [ ] Active flag set correctly

## Security Verification

- [ ] No credentials in .env file (only Client ID)
- [ ] No localStorage usage
- [ ] No Firebase Database
- [ ] OAuth2 token in memory only
- [ ] Token cleared on logout
- [ ] HTTPS in production
- [ ] No sensitive data in console logs

## Production Deployment

### Build
- [ ] Run `npm run build`
- [ ] Check `dist/` directory created
- [ ] Verify bundle size reasonable (~50KB gzipped)
- [ ] No build errors

### Firebase Deployment
- [ ] Run `firebase deploy`
- [ ] Deployment successful
- [ ] App accessible at Firebase URL
- [ ] Update authorized origins in Google Cloud Console
- [ ] Test login on production URL

### Post-Deployment
- [ ] Test all features on production
- [ ] Verify data syncs correctly
- [ ] Check performance metrics
- [ ] Monitor error logs
- [ ] Test on multiple devices

## Documentation

- [ ] README.md updated
- [ ] QUICK_START.md created
- [ ] REDESIGN_GUIDE.md created
- [ ] TECHNICAL_ARCHITECTURE.md created
- [ ] API_REFERENCE.md created
- [ ] .env.example has correct format
- [ ] Comments in code where needed

## Cleanup

- [ ] Remove old/unused files
- [ ] Remove console.log statements
- [ ] Remove commented code
- [ ] Update package.json scripts
- [ ] Verify no dead code
- [ ] Check for unused imports

## Final Verification

### Feature Completeness
- [ ] All 6 tabs functional
- [ ] All forms working
- [ ] All data persisting
- [ ] All calculations correct
- [ ] All error handling working

### User Experience
- [ ] Intuitive navigation
- [ ] Clear feedback messages
- [ ] Responsive design
- [ ] Fast performance
- [ ] No confusing elements

### Code Quality
- [ ] Minimal dependencies
- [ ] Clean code structure
- [ ] Proper error handling
- [ ] Consistent styling
- [ ] Well documented

### Data Integrity
- [ ] No data loss
- [ ] No data duplication
- [ ] Correct calculations
- [ ] Proper normalization
- [ ] Single source of truth

## Sign-Off

- [ ] All tests passed
- [ ] All features working
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Documentation complete
- [ ] Ready for production

---

## Rollback Plan

If issues occur in production:

1. **Immediate Actions**
   - [ ] Disable Firebase hosting
   - [ ] Revert to previous version
   - [ ] Notify users

2. **Investigation**
   - [ ] Check error logs
   - [ ] Review recent changes
   - [ ] Test locally

3. **Fix and Redeploy**
   - [ ] Fix issue
   - [ ] Test thoroughly
   - [ ] Deploy again

---

## Monitoring

### Post-Launch Monitoring
- [ ] Monitor error logs daily
- [ ] Check performance metrics
- [ ] Monitor API usage
- [ ] Check user feedback
- [ ] Monitor Google Sheets quota

### Alerts to Set Up
- [ ] High error rate (>5%)
- [ ] Slow response time (>5s)
- [ ] API quota exceeded
- [ ] Deployment failures

---

## Support Resources

- [ ] Google Cloud Console: https://console.cloud.google.com/
- [ ] Firebase Console: https://console.firebase.google.com/
- [ ] Google Sheets API Docs: https://developers.google.com/sheets/api
- [ ] React Docs: https://react.dev/
- [ ] Vite Docs: https://vitejs.dev/

---

**Deployment Date:** _______________

**Deployed By:** _______________

**Notes:** _______________________________________________
