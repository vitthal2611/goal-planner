# Firebase Setup Guide - Cross-Device Sync

## ✅ What's Already Done

Firebase sync is now implemented! Your app will automatically sync goals, habits, and logs across all devices when you sign in.

## 🔧 Setup Steps (5 minutes)

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `goal-planner` (or your choice)
4. Disable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication

1. In Firebase Console, click "Authentication" in left sidebar
2. Click "Get started"
3. Click "Google" provider
4. Toggle "Enable"
5. Enter support email
6. Click "Save"

### 3. Enable Firestore Database

1. Click "Firestore Database" in left sidebar
2. Click "Create database"
3. Select "Start in production mode"
4. Choose location (closest to you)
5. Click "Enable"

### 4. Set Firestore Rules

1. In Firestore, click "Rules" tab
2. Replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click "Publish"

### 5. Get Firebase Config

1. Click gear icon ⚙️ > "Project settings"
2. Scroll to "Your apps" section
3. Click web icon `</>`
4. Register app name: `goal-planner-web`
5. Copy the `firebaseConfig` object

### 6. Add Config to Your App

1. Create `.env` file in project root (copy from `.env.example`)
2. Fill in values from Firebase config:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

3. Restart dev server: `npm start`

## 🎉 That's It!

Now when you:
- Sign in with Google on any device
- Add/edit goals, habits, or logs
- Changes sync automatically across all devices in real-time!

## 🔒 Security

- Each user's data is isolated (Firestore rules enforce this)
- Only authenticated users can access their own data
- No user can see another user's data

## 💰 Cost

Firebase free tier includes:
- ✅ 50,000 reads/day
- ✅ 20,000 writes/day
- ✅ 1GB storage
- ✅ Unlimited users

Perfect for personal use! You won't hit limits.

## 🧪 Test Sync

1. Sign in on Device 1
2. Add a goal
3. Sign in on Device 2 (same Google account)
4. See the goal appear automatically!

## 🐛 Troubleshooting

**"Firebase not configured"**
- Check `.env` file exists and has correct values
- Restart dev server after creating `.env`

**"Permission denied"**
- Check Firestore rules are published
- Make sure you're signed in

**"Data not syncing"**
- Check browser console for errors
- Verify internet connection
- Check Firebase Console > Firestore to see if data is saving
