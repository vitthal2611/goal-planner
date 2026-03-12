# 🚀 Quick Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Setup
```bash
# Verify .env file exists
VITE_GOOGLE_OAUTH_CLIENT_ID=your_client_id_here
```

### 2. Test Locally
```bash
npm install
npm run dev
```

### 3. Test Key Features
- [ ] Sign in with Google
- [ ] Add payment method
- [ ] Add income
- [ ] Allocate budget (must match income)
- [ ] Try adding expense (should work when balanced)
- [ ] Try adding expense without allocation (should block)
- [ ] Switch months (should be instant)
- [ ] Click year insights (should load instantly)
- [ ] Test on mobile viewport

### 4. Build for Production
```bash
npm run build
```

### 5. Deploy to Firebase
```bash
firebase deploy
```

### 6. Update Google OAuth
- Go to Google Cloud Console
- Add production URL to authorized origins
- Example: `https://your-app.web.app`

## Key Features to Verify

### Budget Validation
1. Add income: ₹50,000
2. Allocate budget: ₹30,000
3. Status should show "⚠️ Unbalanced"
4. Expense button should be disabled
5. Allocate remaining ₹20,000
6. Status should show "✅ Balanced"
7. Expense button should be enabled

### Performance
1. Switch months → Should be instant
2. Click year insights → Should load instantly
3. No loading spinners after initial load

### Mobile Experience
1. Test on mobile device or Chrome DevTools
2. Verify no horizontal scroll
3. Verify touch targets are large enough
4. Verify no zoom on input focus
5. Verify bottom sheet modals

## Common Issues

### Issue: Expense button disabled
**Solution**: Ensure Income = Allocated budget for the month

### Issue: Year insights not loading
**Solution**: Refresh page to reload all transactions

### Issue: Mobile zoom on input
**Solution**: Already fixed with font-size: 16px

### Issue: Authorization failed
**Solution**: Check Client ID in .env and authorized origins in Google Cloud Console

## Production URLs

- **App**: https://your-app.web.app
- **Google Cloud Console**: https://console.cloud.google.com
- **Firebase Console**: https://console.firebase.google.com

## Support

For issues, check:
1. Browser console for errors
2. Network tab for API failures
3. Google Sheets API quota
4. OAuth credentials configuration
