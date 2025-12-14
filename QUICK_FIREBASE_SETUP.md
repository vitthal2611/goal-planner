# ⚡ Quick Firebase Setup (5 Minutes)

## Step 1: Create Realtime Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **goal-planner-d7d2b**
3. Click **Realtime Database** in left menu
4. Click **Create Database**
5. Choose location: **United States (us-central1)**
6. Start in **Test mode** (we'll deploy secure rules next)
7. Click **Enable**

## Step 2: Enable Authentication

1. In Firebase Console, click **Authentication**
2. Click **Get started**
3. Click **Sign-in method** tab
4. Enable **Google**:
   - Click Google → Toggle Enable → Save
5. Enable **Email/Password**:
   - Click Email/Password → Toggle Enable → Save

## Step 3: Deploy Security Rules

```bash
npx firebase-tools deploy --only database
```

If prompted to login:
```bash
npx firebase-tools login
```

## Step 4: Test the App

```bash
npm run dev
```

1. Open http://localhost:3000
2. Click **Sign in with Google** or create account
3. You should see sample data (4 goals, 5 habits)
4. Mark a habit done → Refresh page → Status persists ✅

## ✅ Done!

Your app now has:
- ✅ Real-time database persistence
- ✅ User authentication
- ✅ Secure data isolation
- ✅ Automatic sample data for new users
- ✅ Offline support

## Verify It's Working

### Check Firebase Console
1. Go to **Realtime Database** → **Data** tab
2. You should see: `users/{yourUserId}/goals`, `habits`, `habitLogs`

### Test Persistence
1. Add a new goal in the app
2. Refresh the page
3. Goal should still be there ✅

### Test Real-Time Sync
1. Open app in two browser tabs
2. Mark habit done in tab 1
3. See it update in tab 2 instantly ✅

## Troubleshooting

### "Permission Denied" Error
- Deploy security rules: `npx firebase-tools deploy --only database`

### "Database not found"
- Create Realtime Database in Firebase Console (Step 1)

### "Authentication failed"
- Enable Google/Email auth in Firebase Console (Step 2)

### Firebase CLI not found
```bash
npm install -g firebase-tools
# Or use npx:
npx firebase-tools --version
```

## Next Steps

- Deploy to production: See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
- Understand data structure: See [FIREBASE_DATA_STRUCTURE.md](FIREBASE_DATA_STRUCTURE.md)
- Full setup guide: See [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)

**Your app is now production-ready!** 🚀
