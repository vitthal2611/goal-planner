# Migration Guide: Vanilla JS to React

## Overview

This guide helps you migrate from the old vanilla JavaScript application to the new React version without losing data.

## Data Migration

### Automatic Migration (Recommended)

The new React app will automatically load data from Firebase if you're already using it. Simply:

1. Install dependencies: `npm install`
2. Run the app: `npm run dev`
3. Login with your existing credentials
4. Your data will be automatically loaded from Firebase

### Manual Migration (If needed)

If you have data in localStorage that's not in Firebase:

1. Open the old app in your browser
2. Open DevTools Console (F12)
3. Run this script to export data:

```javascript
const data = {
  paymentMethods: JSON.parse(localStorage.getItem('paymentMethods') || '[]'),
  envelopes: JSON.parse(localStorage.getItem('envelopes') || '[]'),
  transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
  budgets: JSON.parse(localStorage.getItem('budgets') || '[]'),
  defaultBudgets: JSON.parse(localStorage.getItem('defaultBudgets') || '{}'),
  habits: JSON.parse(localStorage.getItem('habits') || '[]'),
  habitCheckins: JSON.parse(localStorage.getItem('habitCheckins') || '[]')
};
console.log(JSON.stringify(data, null, 2));
// Copy the output
```

4. In the new React app, open DevTools Console and run:

```javascript
// Paste your data here
const oldData = { /* your copied data */ };

// This will save to Firebase
const userId = firebase.auth().currentUser.uid;
firebase.firestore().collection('users').doc(userId).set(oldData, { merge: true });
```

## Key Differences

### File Structure
- **Old**: Single HTML file with inline scripts
- **New**: Modular React components in `src/` directory

### State Management
- **Old**: localStorage + global variables
- **New**: Zustand stores with Firebase sync

### Styling
- **Old**: Inline styles in HTML
- **New**: Separate CSS modules per component

### Data Persistence
- **Old**: localStorage only
- **New**: Firebase Firestore with real-time sync

## Feature Parity

All features from the original app are preserved:

✅ Finance tracking (income, expenses, transfers)
✅ Payment methods management
✅ Category/envelope budgeting
✅ Habit tracking with streaks
✅ Monthly/yearly filtering
✅ Transaction history
✅ User authentication
✅ Data export

## New Features

🎉 Real-time data sync across devices
🎉 Better performance with React optimization
🎉 Improved mobile experience
🎉 Toast notifications
🎉 Smoother animations
🎉 Better error handling

## Running Both Versions

You can run both versions simultaneously during migration:

- **Old app**: Open `public/index.html` in browser
- **New app**: Run `npm run dev` (runs on http://localhost:3000)

Both will use the same Firebase backend, so data stays in sync.

## Troubleshooting

### Data not showing up?
- Check that you're logged in with the same account
- Verify Firebase configuration in `src/config/firebase.js`
- Check browser console for errors

### Performance issues?
- Clear browser cache
- Run `npm run build` for production build
- Check network tab for slow Firebase requests

### Build errors?
- Delete `node_modules` and run `npm install` again
- Ensure Node.js version >= 16
- Check for any missing dependencies

## Rollback Plan

If you need to rollback to the old version:

1. Your data is safe in Firebase
2. Simply use the old `public/index.html` file
3. All data will still be accessible

## Support

For issues or questions:
1. Check the README.md
2. Review Firebase console for data
3. Check browser DevTools console for errors

## Timeline

Recommended migration timeline:

- **Week 1**: Test new app alongside old app
- **Week 2**: Use new app as primary, keep old as backup
- **Week 3**: Fully migrate to new app
- **Week 4**: Archive old app files

## Backup

Before migrating, backup your data:

```bash
# Export from Firebase Console
# Or use the manual migration script above
```

Keep the old `public/` folder as backup until you're comfortable with the new version.
