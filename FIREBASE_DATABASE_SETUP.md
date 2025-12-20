# Firebase Realtime Database Setup

## ✅ Deployment Status

**Hosting:** ✅ Deployed successfully to https://goal-planner-b604e.web.app

**Database:** ⚠️ Needs manual setup (one-time only)

## 🔧 Setup Realtime Database (5 minutes)

### Step 1: Create Database Instance

1. Go to [Firebase Console](https://console.firebase.google.com/project/goal-planner-b604e/database)
2. Click **"Create Database"** in Realtime Database section
3. Select location: **United States (us-central1)** (recommended)
4. Start in **"Locked mode"** (we'll deploy rules next)

### Step 2: Deploy Security Rules

After creating the database, run:

```bash
npx firebase-tools deploy --only database
```

This deploys the rules from `database.rules.json`:
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

### Step 3: Enable Authentication

1. Go to [Authentication](https://console.firebase.google.com/project/goal-planner-b604e/authentication/providers)
2. Enable **Google** sign-in
3. Enable **Email/Password** sign-in

## 🚀 That's It!

Your app is now live at: **https://goal-planner-b604e.web.app**

Users can sign in and their data will persist automatically!

## 📝 Future Deployments

```bash
# Build and deploy in one command
npm run build && npx firebase-tools deploy --only hosting
```

## 🔒 Security

- ✅ Users can only read/write their own data
- ✅ Authentication required for all operations
- ✅ HTTPS enforced
- ✅ Sample data auto-generated for new users
