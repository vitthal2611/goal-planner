# Deployment Guide - Firebase Hosting

## Prerequisites

1. **Google Account** - For Firebase and Google Cloud
2. **Node.js** - v16 or higher
3. **npm** - v7 or higher
4. **Firebase CLI** - Install globally
5. **Git** - For version control

## Step 1: Setup Google Cloud Project

### 1.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a Project" → "New Project"
3. Enter project name: "Budget Planner"
4. Click "Create"
5. Wait for project creation

### 1.2 Enable Google Sheets API

1. In Google Cloud Console, search for "Google Sheets API"
2. Click on it
3. Click "Enable"
4. Wait for API to be enabled

### 1.3 Create OAuth2 Credentials

1. Go to "Credentials" in left sidebar
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Choose "Web application"
4. Fill in:
   - Name: "Budget Planner Web"
   - Authorized JavaScript origins:
     - `http://localhost:5173` (development)
     - `https://your-project.web.app` (production)
   - Authorized redirect URIs:
     - `http://localhost:5173` (development)
     - `https://your-project.web.app` (production)
5. Click "Create"
6. Copy the Client ID
7. Save it securely

## Step 2: Setup Firebase Project

### 2.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: "Budget Planner"
4. Disable Google Analytics (optional)
5. Click "Create project"
6. Wait for project creation

### 2.2 Setup Hosting

1. In Firebase Console, click "Hosting" in left sidebar
2. Click "Get Started"
3. Follow the setup wizard
4. Note your Firebase domain: `your-project.web.app`

### 2.3 Update Google OAuth Origins

1. Go back to Google Cloud Console
2. Go to "Credentials"
3. Click on your OAuth 2.0 Client ID
4. Update authorized origins with your Firebase domain:
   - `https://your-project.web.app`
5. Click "Save"

## Step 3: Local Setup

### 3.1 Clone Repository

```bash
git clone <repository-url>
cd goal-planner
```

### 3.2 Install Dependencies

```bash
npm install
```

### 3.3 Configure Environment

```bash
# Create .env file
cp .env.example .env

# Edit .env and add your Google OAuth Client ID
# VITE_GOOGLE_OAUTH_CLIENT_ID=your_client_id_here
```

### 3.4 Test Locally

```bash
npm run dev
```

1. Open `http://localhost:5173`
2. Click "Authorize Google Sheets"
3. Grant permissions
4. Verify app works
5. Check Google Sheets for "Budget Tracker" spreadsheet

## Step 4: Build for Production

### 4.1 Build Application

```bash
npm run build
```

This creates a `dist/` directory with optimized production build.

### 4.2 Preview Build

```bash
npm run preview
```

1. Open the provided URL
2. Test all features
3. Verify mobile responsiveness
4. Check console for errors

## Step 5: Deploy to Firebase

### 5.1 Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 5.2 Login to Firebase

```bash
firebase login
```

1. Browser opens
2. Sign in with Google account
3. Grant permissions
4. Return to terminal

### 5.3 Initialize Firebase

```bash
firebase init hosting
```

When prompted:
- Select your Firebase project
- Public directory: `dist`
- Single-page app: `Yes`
- Overwrite index.html: `No`

### 5.4 Deploy

```bash
firebase deploy
```

Wait for deployment to complete. You'll see:
```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/your-project
Hosting URL: https://your-project.web.app
```

## Step 6: Verify Deployment

1. Open your Firebase hosting URL
2. Click "Authorize Google Sheets"
3. Grant permissions
4. Test all features:
   - Add income
   - Add expense
   - Add transfer
   - Allocate budget
   - Manage payment methods
5. Verify data in Google Sheets
6. Test on mobile device

## Continuous Deployment

### Option 1: Manual Deployment

```bash
npm run build
firebase deploy
```

### Option 2: GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: your-project-id
```

Setup:
1. Generate Firebase service account key
2. Add to GitHub secrets as `FIREBASE_SERVICE_ACCOUNT`
3. Push to main branch
4. GitHub Actions automatically deploys

## Environment Variables

### Development (.env)
```env
VITE_GOOGLE_OAUTH_CLIENT_ID=your_dev_client_id
```

### Production
Same as development (Client ID works for both)

## Troubleshooting

### Issue: "Spreadsheet not found"
**Solution**: 
- Check internet connection
- Refresh page
- Verify Google Sheets API enabled
- Check Google account permissions

### Issue: "Authorization failed"
**Solution**:
- Verify Client ID in .env
- Check authorized origins in Google Cloud Console
- Clear browser cache
- Try incognito mode

### Issue: "Firebase deploy fails"
**Solution**:
- Run `firebase login` again
- Verify project ID: `firebase projects:list`
- Check `firebase.json` configuration
- Ensure `dist/` directory exists

### Issue: "CORS errors"
**Solution**:
- Verify authorized origins include your domain
- Check Google Cloud Console settings
- Redeploy after updating origins

### Issue: "Data not syncing"
**Solution**:
- Check network connection
- Verify Google Sheets API enabled
- Check browser console for errors
- Refresh page

## Performance Optimization

### Build Optimization
```bash
npm run build
```

Vite automatically:
- Minifies code
- Removes console logs
- Splits chunks
- Optimizes assets

### Firebase Caching

`firebase.json` includes cache headers:
- JS/CSS: 1 year cache
- HTML: No cache (always fresh)

### Monitoring

1. Go to Firebase Console
2. Click "Hosting"
3. View analytics and performance

## Rollback

If deployment has issues:

```bash
# View deployment history
firebase hosting:channel:list

# Rollback to previous version
firebase hosting:clone <source-channel> <target-channel>
```

## Custom Domain

1. Go to Firebase Console → Hosting
2. Click "Connect domain"
3. Follow setup wizard
4. Update Google OAuth authorized origins
5. Redeploy

## SSL/TLS

Firebase automatically provides:
- Free SSL certificate
- HTTPS for all traffic
- Auto-renewal

## Monitoring & Logs

### View Logs
```bash
firebase functions:log
```

### Monitor Performance
1. Firebase Console → Hosting
2. View analytics
3. Check error rates

## Backup & Recovery

### Backup Data
1. Go to Google Sheets
2. Download "Budget Tracker" spreadsheet
3. Save locally

### Recovery
1. Create new "Budget Tracker" spreadsheet
2. Manually restore data
3. Or use existing spreadsheet

## Security Checklist

- ✅ OAuth2 configured
- ✅ Authorized origins set
- ✅ HTTPS enabled
- ✅ No credentials in code
- ✅ Environment variables used
- ✅ Firebase rules configured
- ✅ API keys restricted

## Post-Deployment

1. **Test All Features**
   - Add transactions
   - Allocate budgets
   - Manage payment methods
   - Check data in Google Sheets

2. **Monitor Performance**
   - Check Firebase analytics
   - Monitor error rates
   - Review user feedback

3. **Maintain**
   - Keep dependencies updated
   - Monitor Google API changes
   - Regular backups

## Support

For deployment issues:
1. Check Firebase documentation
2. Review Google Cloud Console settings
3. Check browser console for errors
4. Review deployment logs

## Quick Reference

```bash
# Development
npm run dev

# Build
npm run build

# Preview
npm run preview

# Deploy
firebase deploy

# View logs
firebase hosting:log

# List projects
firebase projects:list

# Switch project
firebase use <project-id>
```

---

**Deployment Guide Version**: 2.0.0  
**Last Updated**: 2026-01  
**Status**: Production Ready
