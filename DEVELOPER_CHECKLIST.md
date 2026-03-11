# Developer Checklist - Budget Planner v2.0

## Pre-Setup

- [ ] Node.js v16+ installed
- [ ] npm v7+ installed
- [ ] Git installed
- [ ] Google account available
- [ ] Firebase account available

## Google Cloud Setup

### Create Project
- [ ] Go to Google Cloud Console
- [ ] Create new project "Budget Planner"
- [ ] Wait for project creation

### Enable APIs
- [ ] Search for "Google Sheets API"
- [ ] Click "Enable"
- [ ] Wait for API to be enabled

### Create OAuth2 Credentials
- [ ] Go to "Credentials"
- [ ] Click "Create Credentials" → "OAuth 2.0 Client ID"
- [ ] Choose "Web application"
- [ ] Add authorized origins:
  - [ ] `http://localhost:5173`
  - [ ] `https://your-project.web.app`
- [ ] Copy Client ID
- [ ] Save securely

## Firebase Setup

### Create Project
- [ ] Go to Firebase Console
- [ ] Click "Add project"
- [ ] Enter "Budget Planner"
- [ ] Disable Google Analytics
- [ ] Create project

### Setup Hosting
- [ ] Click "Hosting" in sidebar
- [ ] Click "Get Started"
- [ ] Follow setup wizard
- [ ] Note Firebase domain

### Update OAuth Origins
- [ ] Go back to Google Cloud Console
- [ ] Update authorized origins with Firebase domain
- [ ] Save changes

## Local Development Setup

### Clone Repository
- [ ] Clone repository
- [ ] Navigate to project directory

### Install Dependencies
- [ ] Run `npm install`
- [ ] Wait for installation

### Configure Environment
- [ ] Copy `.env.example` to `.env`
- [ ] Add Google OAuth Client ID
- [ ] Save `.env` file

### Test Locally
- [ ] Run `npm run dev`
- [ ] Open `http://localhost:5173`
- [ ] Click "Authorize Google Sheets"
- [ ] Grant permissions
- [ ] Verify "Budget Tracker" spreadsheet created
- [ ] Test add income
- [ ] Test add expense
- [ ] Test add transfer
- [ ] Test allocate budget
- [ ] Test add payment method
- [ ] Check Google Sheets for data

## Code Review

### Services
- [ ] Review `sheetsAPI.js`
  - [ ] OAuth2 implementation
  - [ ] Spreadsheet discovery/creation
  - [ ] CRUD operations
- [ ] Review `dataService.js`
  - [ ] Business logic
  - [ ] Data transformations
  - [ ] Error handling

### Context
- [ ] Review `BudgetContext.js`
  - [ ] State management
  - [ ] Action handlers
  - [ ] Notification system

### Components
- [ ] Review `Dashboard.jsx`
  - [ ] Layout structure
  - [ ] Tab navigation
  - [ ] Responsive design
- [ ] Review `IncomeForm.jsx`
  - [ ] Form validation
  - [ ] Submit handler
- [ ] Review `ExpenseForm.jsx`
  - [ ] Form validation
  - [ ] Envelope handling
- [ ] Review `TransferForm.jsx`
  - [ ] Account selection
  - [ ] Validation
- [ ] Review `BudgetForm.jsx`
  - [ ] Budget allocation
  - [ ] Progress display
- [ ] Review `PaymentMethodsModal.jsx`
  - [ ] Add/remove methods
  - [ ] Modal functionality

### App
- [ ] Review `App.jsx`
  - [ ] Authentication flow
  - [ ] Error handling
  - [ ] Loading states

## Testing

### Feature Testing
- [ ] Add income transaction
  - [ ] Verify data saved
  - [ ] Check Google Sheets
  - [ ] Verify summary updated
- [ ] Add expense transaction
  - [ ] Verify data saved
  - [ ] Check envelope
  - [ ] Verify budget updated
- [ ] Add transfer
  - [ ] Verify both entries created
  - [ ] Check payment methods
- [ ] Allocate budget
  - [ ] Verify budget saved
  - [ ] Check progress bar
- [ ] Add payment method
  - [ ] Verify in dropdown
  - [ ] Check Google Sheets
- [ ] Remove payment method
  - [ ] Verify removed from list
  - [ ] Check Google Sheets
- [ ] Month navigation
  - [ ] Previous month works
  - [ ] Next month works
  - [ ] Data loads correctly

### Mobile Testing
- [ ] Test on mobile device
  - [ ] Layout responsive
  - [ ] Buttons touch-friendly
  - [ ] Forms work properly
  - [ ] Tabs scroll
  - [ ] No layout issues

### Performance Testing
- [ ] Check page load time
- [ ] Monitor API calls
- [ ] Check memory usage
- [ ] Verify no console errors
- [ ] Test on slow network

### Data Testing
- [ ] Verify data in Google Sheets
- [ ] Check data normalization
- [ ] Verify no duplicates
- [ ] Check calculations
- [ ] Verify budget updates

### Error Testing
- [ ] Test without internet
- [ ] Test with invalid data
- [ ] Test authorization failure
- [ ] Test API errors
- [ ] Verify error messages

## Build & Deployment

### Build
- [ ] Run `npm run build`
- [ ] Verify `dist/` created
- [ ] Check build size
- [ ] Verify no errors

### Preview
- [ ] Run `npm run preview`
- [ ] Test all features
- [ ] Check mobile responsiveness
- [ ] Verify no console errors

### Firebase Setup
- [ ] Install Firebase CLI: `npm install -g firebase-tools`
- [ ] Login: `firebase login`
- [ ] Initialize: `firebase init hosting`
- [ ] Select project
- [ ] Set public directory to `dist`
- [ ] Configure as SPA

### Deploy
- [ ] Run `firebase deploy`
- [ ] Wait for deployment
- [ ] Note Firebase URL
- [ ] Test production URL
- [ ] Verify all features work
- [ ] Test on mobile

### Post-Deployment
- [ ] Test authorization
- [ ] Add test transactions
- [ ] Verify Google Sheets sync
- [ ] Check performance
- [ ] Monitor for errors

## Documentation Review

- [ ] README.md complete
- [ ] QUICK_START.md accurate
- [ ] IMPLEMENTATION_GUIDE.md detailed
- [ ] ARCHITECTURE.md clear
- [ ] DEPLOYMENT_GUIDE.md complete
- [ ] All links working
- [ ] Examples accurate

## Security Checklist

- [ ] OAuth2 configured correctly
- [ ] No credentials in code
- [ ] Environment variables used
- [ ] HTTPS enabled
- [ ] Authorized origins set
- [ ] API keys restricted
- [ ] No sensitive data logged
- [ ] Error messages safe

## Performance Checklist

- [ ] Bundle size optimized
- [ ] No unused dependencies
- [ ] API calls efficient
- [ ] Caching implemented
- [ ] Images optimized
- [ ] Code splitting working
- [ ] Minification enabled
- [ ] No console logs in production

## Accessibility Checklist

- [ ] Semantic HTML used
- [ ] ARIA labels present
- [ ] Keyboard navigation works
- [ ] Color contrast sufficient
- [ ] Focus indicators visible
- [ ] Form labels present
- [ ] Error messages clear

## Browser Compatibility

- [ ] Chrome/Edge latest
- [ ] Firefox latest
- [ ] Safari latest
- [ ] Mobile Chrome
- [ ] Mobile Safari

## Final Verification

### Functionality
- [ ] All features working
- [ ] No broken links
- [ ] No console errors
- [ ] Data persists
- [ ] Calculations correct

### Performance
- [ ] Page loads quickly
- [ ] Smooth interactions
- [ ] No lag
- [ ] Efficient API calls

### Mobile
- [ ] Responsive layout
- [ ] Touch-friendly
- [ ] No horizontal scroll
- [ ] Forms work

### Data
- [ ] Saves to Google Sheets
- [ ] No data loss
- [ ] No duplicates
- [ ] Calculations accurate

### Security
- [ ] OAuth2 working
- [ ] No credentials exposed
- [ ] HTTPS enabled
- [ ] Safe error messages

## Deployment Verification

- [ ] Firebase URL accessible
- [ ] Authorization works
- [ ] Can add transactions
- [ ] Data syncs to Google Sheets
- [ ] Mobile works
- [ ] No errors in console
- [ ] Performance acceptable

## Post-Launch

- [ ] Monitor Firebase analytics
- [ ] Check error logs
- [ ] Gather user feedback
- [ ] Plan enhancements
- [ ] Schedule maintenance

## Documentation Handoff

- [ ] README.md provided
- [ ] QUICK_START.md provided
- [ ] IMPLEMENTATION_GUIDE.md provided
- [ ] ARCHITECTURE.md provided
- [ ] DEPLOYMENT_GUIDE.md provided
- [ ] All guides reviewed
- [ ] Links verified

## Maintenance Plan

- [ ] Update dependencies monthly
- [ ] Monitor Google API changes
- [ ] Regular backups
- [ ] Performance monitoring
- [ ] Security updates
- [ ] User support plan

## Sign-Off

- [ ] All tests passed
- [ ] Documentation complete
- [ ] Code reviewed
- [ ] Performance verified
- [ ] Security checked
- [ ] Ready for production

---

## Quick Commands Reference

```bash
# Development
npm run dev

# Build
npm run build

# Preview
npm run preview

# Deploy
firebase deploy

# Firebase login
firebase login

# Firebase init
firebase init hosting

# View logs
firebase hosting:log

# List projects
firebase projects:list
```

## Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| Authorization fails | Check Client ID in .env |
| Spreadsheet not found | Refresh page, check internet |
| Data not syncing | Verify Google Sheets API enabled |
| Build fails | Run `npm install` again |
| Deploy fails | Run `firebase login` again |

## Support Contacts

- Google Cloud Support: https://cloud.google.com/support
- Firebase Support: https://firebase.google.com/support
- React Documentation: https://react.dev
- Vite Documentation: https://vitejs.dev

---

**Checklist Version**: 2.0.0  
**Last Updated**: 2026-01  
**Status**: Ready for Use

**All items completed? You're ready to launch!** 🚀
