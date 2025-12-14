# 🚀 Deployment Checklist

## Pre-Deployment

### ✅ Firebase Setup
- [x] Firebase project created (`goal-planner-d7d2b`)
- [x] Realtime Database enabled
- [x] Authentication enabled (Google + Email/Password)
- [x] Security rules configured
- [ ] **Deploy security rules**: `firebase deploy --only database`

### ✅ Environment Variables
- [x] `.env` file configured with Firebase credentials
- [x] `.env` added to `.gitignore`
- [ ] **For production**: Set environment variables in hosting platform

### ✅ Code Quality
- [x] All Firebase hooks fixed (no infinite loops)
- [x] Sample data initialization for new users
- [x] Real-time sync implemented
- [x] Offline support enabled
- [x] User authentication required

## Deployment Steps

### Option 1: Firebase Hosting (Recommended)

```bash
# 1. Build the app
npm run build

# 2. Deploy to Firebase
firebase deploy

# 3. Your app will be live at:
# https://goal-planner-d7d2b-dac3e.web.app
```

### Option 2: Netlify

```bash
# 1. Build the app
npm run build

# 2. Install Netlify CLI
npm install -g netlify-cli

# 3. Deploy
netlify deploy --prod --dir=dist

# 4. Set environment variables in Netlify dashboard:
# - VITE_FIREBASE_API_KEY
# - VITE_FIREBASE_AUTH_DOMAIN
# - VITE_FIREBASE_PROJECT_ID
# - VITE_FIREBASE_STORAGE_BUCKET
# - VITE_FIREBASE_MESSAGING_SENDER_ID
# - VITE_FIREBASE_APP_ID
# - VITE_FIREBASE_DATABASE_URL
```

### Option 3: Vercel

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel --prod

# 3. Set environment variables in Vercel dashboard
```

## Post-Deployment

### ✅ Testing
- [ ] Sign up with new account
- [ ] Verify sample data loads
- [ ] Add a new goal → Refresh → Verify persistence
- [ ] Mark habit done → Refresh → Verify persistence
- [ ] Sign out and sign back in → Verify data intact
- [ ] Test on mobile device
- [ ] Test on different browser

### ✅ Security
- [ ] Verify security rules are active (try accessing another user's data)
- [ ] Test authentication (sign up, login, logout)
- [ ] Check HTTPS is enforced
- [ ] Restrict Firebase API key to your domain (optional)

### ✅ Monitoring
- [ ] Check Firebase Console → Realtime Database → Data tab
- [ ] Monitor Firebase Console → Authentication → Users tab
- [ ] Set up Firebase alerts (optional)

## Quick Commands

```bash
# Development
npm run dev              # Start dev server

# Build
npm run build           # Build for production
npm run preview         # Preview production build

# Firebase
firebase login          # Login to Firebase
firebase deploy         # Deploy everything
firebase deploy --only hosting    # Deploy hosting only
firebase deploy --only database   # Deploy database rules only

# Check deployment
firebase hosting:channel:list     # List hosting channels
```

## Environment Variables for Production

When deploying to Netlify/Vercel, add these environment variables:

```
VITE_FIREBASE_API_KEY=AIzaSyDrHlox8NNmaYcPqcbQlbx4JuBlEJSZels
VITE_FIREBASE_AUTH_DOMAIN=goal-planner-d7d2b.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=goal-planner-d7d2b
VITE_FIREBASE_STORAGE_BUCKET=goal-planner-d7d2b.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=261078674300
VITE_FIREBASE_APP_ID=1:261078674300:web:321e93ea94147d885c92f9
VITE_FIREBASE_DATABASE_URL=https://goal-planner-d7d2b-default-rtdb.firebaseio.com
```

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Firebase Deploy Fails
```bash
# Re-login to Firebase
firebase logout
firebase login
firebase deploy
```

### Environment Variables Not Working
- Ensure variables start with `VITE_`
- Restart dev server after changing `.env`
- For production, set variables in hosting platform dashboard

## Success Criteria

Your deployment is successful when:
- ✅ App loads without errors
- ✅ Users can sign up/login
- ✅ Sample data appears for new users
- ✅ Data persists after refresh
- ✅ Changes sync in real-time
- ✅ Works on mobile devices
- ✅ HTTPS is enforced

## 🎉 You're Live!

Once deployed, share your app:
- Firebase: `https://goal-planner-d7d2b-dac3e.web.app`
- Custom domain: Configure in Firebase Console → Hosting → Add custom domain

**Your Goal Planner is now production-ready and live!** 🚀
