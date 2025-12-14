# Firebase Realtime Database Setup

This app now uses **Firebase Realtime Database** exclusively (no localStorage).

## Quick Setup (5 minutes)

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name → Continue
4. Disable Google Analytics (optional) → Create project

### 2. Enable Realtime Database
1. In Firebase Console, click "Realtime Database" in left menu
2. Click "Create Database"
3. Select location (e.g., `us-central1`)
4. Start in **test mode** → Enable

### 3. Enable Authentication
1. Click "Authentication" in left menu
2. Click "Get started"
3. Click "Google" provider
4. Enable toggle → Add your email → Save

### 4. Get Configuration
1. Click gear icon → Project settings
2. Scroll to "Your apps" → Click web icon `</>`
3. Register app name → Register app
4. Copy the config values

### 5. Configure App
Create `.env` file in project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
```

**Important:** Get `VITE_FIREBASE_DATABASE_URL` from Realtime Database page in Firebase Console.

### 6. Deploy Security Rules
```bash
firebase login
firebase init database
firebase deploy --only database
```

Or manually copy rules from `database.rules.json` to Firebase Console → Realtime Database → Rules tab.

### 7. Run App
```bash
npm install
npm run dev
```

## Security Rules

The app uses these rules (already in `database.rules.json`):

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

This ensures users can only read/write their own data.

## Data Structure

```
users/
  {userId}/
    goals/
      - Array of goal objects
    habits/
      - Array of habit objects
    habitLogs/
      - Array of log objects
```

## Features

✅ Real-time sync across devices
✅ Automatic data persistence
✅ Secure user-specific data
✅ No localStorage dependency
✅ Works offline (Firebase caching)

## Troubleshooting

**Error: "Permission denied"**
- Make sure you're signed in with Google
- Check security rules are deployed

**Error: "Database URL not found"**
- Add `VITE_FIREBASE_DATABASE_URL` to `.env`
- Get URL from Firebase Console → Realtime Database

**Data not syncing**
- Check browser console for errors
- Verify Firebase config in `.env`
- Ensure you're signed in

## Migration from localStorage

All data is now stored in Firebase Realtime Database. The app will:
1. Load sample data on first run
2. Save to Firebase when user signs in
3. Sync in real-time across all devices

No manual migration needed!
