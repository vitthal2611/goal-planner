# Goal Planner - Firebase Deployment

A comprehensive Life Tracker app for managing finances and habits with Firebase backend that **never overrides your data**.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Firebase account
- Git (optional)

### 1. Initial Setup
```bash
# Run the setup script
setup.bat
```

This will:
- Install Firebase CLI
- Login to Firebase
- Configure your project
- Deploy security rules

### 2. Configure Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings → General
4. Copy your Firebase config
5. Replace the config in `public/index.html`:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 3. Enable Services
1. **Authentication**: Enable Email/Password provider
2. **Firestore**: Create database in production mode
3. **Hosting**: Will be enabled automatically

### 4. Deploy
```bash
# Deploy everything
deploy.bat

# Or use specific commands
firebase deploy --only hosting
firebase deploy --only firestore:rules
```

## 📁 Project Structure

```
goal-planner/
├── public/
│   └── index.html          # Main app file
├── firebase.json           # Firebase configuration
├── firestore.rules         # Database security rules
├── firestore.indexes.json  # Database indexes
├── storage.rules           # Storage security rules
├── package.json            # Project dependencies
├── setup.bat              # Initial setup script
├── deploy.bat             # Deployment script
└── README.md              # This file
```

## 🛡️ Data Safety Features

### Never Override Data
- Uses `add()` for new documents
- Uses `update()` for field modifications
- Uses `arrayUnion()`/`arrayRemove()` for arrays
- Uses `increment()` for numbers
- Atomic transactions for critical operations

### Security Rules
- User-specific data access only
- Prevents document overwrites
- Allows only specific field updates
- Never allows data deletion

### Backup Strategy
```bash
# Create backup
firebase firestore:export gs://your-project-backup/backup_$(date +%Y%m%d)
```

## 🔧 Development

### Local Development
```bash
# Start emulators
npm run emulators
# or
firebase emulators:start
```

Access:
- App: http://localhost:5000
- Firestore UI: http://localhost:4000
- Auth UI: http://localhost:4000/auth

### Available Scripts
```bash
npm run dev          # Start emulators
npm run deploy       # Deploy everything
npm run deploy:hosting    # Deploy hosting only
npm run deploy:firestore  # Deploy Firestore rules
npm run serve        # Serve locally
```

## 📊 Features

### Finance Management
- ✅ Income/Expense tracking
- ✅ Budget envelopes
- ✅ Payment method balances
- ✅ Transfer between accounts
- ✅ Monthly/yearly views
- ✅ Real-time sync

### Habit Tracking
- ✅ Atomic habit creation
- ✅ Streak tracking
- ✅ Identity-based habits
- ✅ Cue-routine-reward system
- ✅ Milestone tracking
- ✅ Progress visualization

### Data Safety
- ✅ Never overrides existing data
- ✅ Incremental updates only
- ✅ Atomic transactions
- ✅ Comprehensive error handling
- ✅ User-specific security rules

## 🔒 Security Rules Explained

### Transactions
- Only allow creating new transactions
- Allow updating specific fields only
- Never allow deletions
- User-specific access

### Habits
- Preserve completion history
- Allow streak increments only
- Never delete habit data
- Milestone tracking protection

### User Data
- Array operations use safe methods
- Budget updates use increments
- Payment methods protected from overwrites

## 🚨 Troubleshooting

### Common Issues

1. **Firebase CLI not found**
   ```bash
   npm install -g firebase-tools
   ```

2. **Permission denied**
   ```bash
   firebase login
   firebase use your-project-id
   ```

3. **Rules deployment failed**
   - Check Firestore is enabled
   - Verify project ID is correct

4. **App not loading**
   - Check Firebase config in HTML
   - Verify Authentication is enabled
   - Check browser console for errors

### Getting Help
1. Check Firebase Console for errors
2. Review browser developer tools
3. Check Firestore rules simulator
4. Verify all services are enabled

## 📈 Monitoring

### Firebase Console
- Authentication users
- Firestore usage
- Hosting traffic
- Performance monitoring

### Analytics (Optional)
Add Google Analytics to track:
- User engagement
- Feature usage
- Performance metrics

## 🔄 Updates

### Updating the App
1. Modify `quick-track-demo.html`
2. Copy to `public/index.html`
3. Run `deploy.bat`

### Updating Rules
1. Modify `firestore.rules`
2. Run `firebase deploy --only firestore:rules`

## 📝 License

MIT License - Feel free to use and modify!

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Test with emulators
4. Submit pull request

---

**Your data is safe! This app never overrides existing information.** 🛡️