# 🧪 Firebase Persistence Testing Guide

## Quick Test (In-App)

1. **Start the app**:
   ```bash
   npm run dev
   ```

2. **Click "Run Tests" button** in the top-right corner of the app

3. **View results** - All 6 tests should pass:
   - ✅ Goal CRUD operations
   - ✅ Habit CRUD operations
   - ✅ Daily Log CRUD operations
   - ✅ Review CRUD operations
   - ✅ Bulk operations
   - ✅ Data integrity & relationships

## Manual Testing Checklist

### Test 1: Goal Persistence
- [ ] Create a new goal
- [ ] Refresh the page → Goal still exists
- [ ] Update goal progress
- [ ] Refresh the page → Progress updated
- [ ] Delete goal
- [ ] Refresh the page → Goal deleted

### Test 2: Habit Persistence
- [ ] Create a new habit
- [ ] Refresh the page → Habit still exists
- [ ] Link habit to a goal
- [ ] Refresh the page → Link maintained
- [ ] Mark habit as inactive
- [ ] Refresh the page → Status updated

### Test 3: Daily Log Persistence
- [ ] Mark a habit as "done" today
- [ ] Refresh the page → Status still "done"
- [ ] Change to "skipped"
- [ ] Refresh the page → Status changed
- [ ] Check streak calculation
- [ ] Refresh the page → Streak correct

### Test 4: Cross-Device Sync
- [ ] Open app on Device 1
- [ ] Create a goal
- [ ] Open app on Device 2 (same account)
- [ ] Goal appears automatically
- [ ] Update goal on Device 2
- [ ] Device 1 updates in real-time

### Test 5: Offline Support
- [ ] Disconnect internet
- [ ] Create a goal
- [ ] Mark habits done
- [ ] Reconnect internet
- [ ] Data syncs automatically

## Console Test (Advanced)

Run tests programmatically:

```javascript
// In browser console
import { runAllPersistenceTests } from './tests/firebasePersistence.test';
const results = await runAllPersistenceTests();
console.log(results);
```

## Expected Test Output

```
🚀 Starting Firebase Persistence Tests...

🧪 Testing Goal Persistence...
✅ Goal created: -abc123xyz
✅ Goal read successfully
✅ Goal updated successfully
✅ Goal deleted successfully

🧪 Testing Habit Persistence...
✅ Habit created: -def456uvw
✅ Habit read successfully
✅ Habit updated successfully
✅ Habit deleted successfully

🧪 Testing Daily Log Persistence...
✅ Log created: -ghi789rst
✅ Log read successfully
✅ Log updated successfully
✅ Log deleted successfully

🧪 Testing Review Persistence...
✅ Review created: -jkl012opq
✅ Review read successfully
✅ Review updated successfully
✅ Review deleted successfully

🧪 Testing Bulk Operations...
✅ Bulk goals created
✅ Bulk goals read successfully
✅ Bulk goals deleted

🧪 Testing Data Integrity...
✅ Data relationships verified
✅ Test data cleaned up

📊 Test Summary:
✅ Passed: 6
❌ Failed: 0
📈 Success Rate: 100.0%
```

## Troubleshooting

### Tests Fail with "Permission Denied"
- Deploy security rules: `firebase deploy --only database`
- Check Firebase Console → Realtime Database → Rules

### Tests Fail with "Network Error"
- Check internet connection
- Verify Firebase config in `.env`
- Check Firebase Console → Project Settings

### Data Not Persisting
- Check browser console for errors
- Verify user is authenticated
- Check Firebase Console → Realtime Database → Data tab

## Verify in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Realtime Database**
4. Check **Data** tab
5. You should see structure:
   ```
   users/
     └── {userId}/
         ├── goals/
         ├── habits/
         ├── logs/
         └── reviews/
   ```

## Success Criteria

✅ All 6 automated tests pass
✅ Data persists after page refresh
✅ Data syncs across devices
✅ Offline changes sync when online
✅ User can only access their own data
✅ No console errors

## Next Steps

Once all tests pass:
1. Deploy security rules (if not done)
2. Test with real user accounts
3. Monitor Firebase usage
4. Deploy to production
