# Deployment Checklist

## Pre-Deployment

### Google Cloud Console
- [ ] Project created
- [ ] Google Sheets API enabled
- [ ] Google Drive API enabled
- [ ] OAuth2 credentials created
- [ ] Authorized origins configured:
  - [ ] `http://localhost:5173` (development)
  - [ ] `https://your-app.web.app` (production)
- [ ] Client ID copied

### Local Environment
- [ ] `.env` file created with `VITE_GOOGLE_OAUTH_CLIENT_ID`
- [ ] Dependencies installed (`npm install`)
- [ ] App tested locally (`npm run dev`)
- [ ] All features working:
  - [ ] Sign in with Google
  - [ ] Add payment methods
  - [ ] Allocate budget
  - [ ] Add income
  - [ ] Add expense
  - [ ] Add transfer
  - [ ] View budget summary
  - [ ] Delete transactions
  - [ ] Month selector
- [ ] Mobile responsive tested
- [ ] Google Sheets data verified

### Firebase Setup
- [ ] Firebase project created
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Logged in (`firebase login`)
- [ ] Hosting initialized (`firebase init hosting`)
- [ ] Build directory set to `dist`
- [ ] Single-page app configured (Yes)

## Deployment

### Build
```bash
npm run build
```

- [ ] Build successful
- [ ] No errors in console
- [ ] `dist/` directory created
- [ ] Files in `dist/`:
  - [ ] `index.html`
  - [ ] `assets/` folder with JS and CSS

### Deploy
```bash
firebase deploy
```

- [ ] Deployment successful
- [ ] Hosting URL received
- [ ] App accessible at URL

### Post-Deployment
- [ ] Add production URL to Google Cloud Console authorized origins
- [ ] Test sign in on production
- [ ] Test all features on production
- [ ] Test on mobile device
- [ ] Test on different browsers:
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge
- [ ] Verify Google Sheets integration
- [ ] Check performance (Lighthouse)

## Production Verification

### Functionality
- [ ] Sign in works
- [ ] Spreadsheet auto-created
- [ ] Payment methods CRUD
- [ ] Budget allocation works
- [ ] Income tracking works
- [ ] Expense tracking works
- [ ] Transfer works
- [ ] Budget summary displays correctly
- [ ] Month selector works
- [ ] Delete transactions works
- [ ] Settings modal works

### Performance
- [ ] Page loads < 3 seconds
- [ ] No console errors
- [ ] No console warnings
- [ ] API calls optimized
- [ ] Mobile performance good

### Security
- [ ] OAuth2 working
- [ ] No credentials in code
- [ ] HTTPS enabled
- [ ] Authorized origins correct

### Mobile
- [ ] Responsive layout
- [ ] Touch-friendly buttons
- [ ] Forms work on mobile
- [ ] No horizontal scroll
- [ ] Readable text size

## Rollback Plan

If issues occur:

1. **Revert deployment**
```bash
firebase hosting:rollback
```

2. **Check logs**
```bash
firebase hosting:logs
```

3. **Fix issues locally**
```bash
npm run dev
# Test fixes
npm run build
firebase deploy
```

## Monitoring

### Daily
- [ ] Check for user reports
- [ ] Monitor error logs
- [ ] Verify API quotas

### Weekly
- [ ] Review Google Sheets API usage
- [ ] Check Firebase hosting usage
- [ ] Test critical features

### Monthly
- [ ] Update dependencies
- [ ] Review performance metrics
- [ ] Plan improvements

## Support

### Common Issues

**Sign in fails**
- Verify authorized origins
- Check Client ID
- Clear browser cache

**Data not saving**
- Check Google Sheets API quota
- Verify permissions
- Check internet connection

**Mobile issues**
- Test on actual device
- Check responsive CSS
- Verify touch events

### Contact

For issues:
1. Check browser console
2. Review Google Sheets data
3. Verify API settings
4. Test with different account

## Success Criteria

- [ ] App accessible from anywhere
- [ ] Sign in works for all users
- [ ] Data persists in Google Sheets
- [ ] Mobile experience excellent
- [ ] Performance metrics good
- [ ] No critical bugs
- [ ] User feedback positive

---

**Deployment Date**: _____________

**Deployed By**: _____________

**Production URL**: _____________

**Notes**: _____________
