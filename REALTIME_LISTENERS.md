# Firestore Real-Time Listeners - Architecture & Performance

## Why Real-Time Listeners?

### ✅ Used With Listeners (onSnapshot)

**1. Goals Collection**
```javascript
useFirestoreGoals() // Real-time listener
```
**Why:** Dashboard needs instant progress updates when goals are modified from any device/tab. Users expect to see progress bars update immediately after logging progress.

**2. Habits Collection**
```javascript
useFirestoreHabits() // Real-time listener
```
**Why:** Habit list changes (add/edit/delete) should reflect instantly across all views (Today, Habits, Dashboard). Critical for multi-device sync.

**3. Daily Logs Collection**
```javascript
useFirestoreLogs() // Real-time listener
```
**Why:** Habit completion status must update in real-time. When user marks habit as "done" in Today view, Dashboard streaks/consistency should update instantly without refresh.

### ❌ NOT Using Listeners (One-time reads)

**1. Historical Reviews**
- Reviews are static snapshots, don't change after creation
- Use `getDocs()` for one-time read when viewing past reviews

**2. Analytics/Reports**
- Generated on-demand from existing data
- No need for real-time updates

**3. User Profile**
- Changes infrequently
- Use `getDoc()` with manual refresh

## Performance Optimizations

### 1. Automatic Cleanup
```javascript
useEffect(() => {
  const unsubscribe = onSnapshot(query, callback);
  return () => unsubscribe(); // Prevents memory leaks
}, [user]);
```

### 2. Indexed Queries
All queries use `orderBy()` which requires Firestore indexes:
- `goals` ordered by `createdAt`
- `habits` ordered by `createdAt`
- `logs` ordered by `date`

Firebase will auto-create these indexes on first use.

### 3. Batch Writes
```javascript
import { batchOperations } from './services/optimizedFirestore';

// Update multiple goals in one network call
await batchOperations.batchUpdateGoals(userId, [
  { goalId: 'goal1', data: { actualProgress: 10 } },
  { goalId: 'goal2', data: { actualProgress: 5 } }
]);
```
**Benefit:** 1 write operation instead of N writes = lower costs

### 4. Local Cache
Firestore automatically caches data locally:
- First load: reads from server
- Subsequent loads: reads from cache (instant)
- Updates: listener receives changes immediately

### 5. Optimistic Updates
UI updates immediately, then syncs to server:
```javascript
// UI updates instantly via listener
await firestoreService.updateGoal(userId, goalId, updates);
// Listener receives confirmation and re-renders
```

## Read/Write Costs

### With Listeners (Current Implementation)
- **Initial Load:** 1 read per document
- **Updates:** 1 read per changed document (only changed docs)
- **Writes:** 1 write per operation
- **Cache:** Free reads from local cache

### Without Listeners (Manual Refresh)
- **Each Refresh:** N reads for all documents
- **After Write:** N reads to refresh entire collection
- **Result:** 2-3x more reads

## Example: Habit Completion Flow

```javascript
// User marks habit as done
await logService.markHabitDone(userId, habitId);
// ↓
// 1 write to logs collection
// ↓
// Listener detects change
// ↓
// React re-renders with new data (instant)
// ↓
// Dashboard shows updated streak (no manual refresh)
```

## Network Efficiency

### Listener Behavior
- Maintains single WebSocket connection
- Receives only changed documents
- Automatic reconnection on network issues
- Works offline with local cache

### Data Transfer
- Initial: Full collection
- Updates: Only deltas (changed fields)
- Deleted: Only document IDs

## Best Practices Implemented

✅ Cleanup listeners on unmount
✅ Single listener per collection (not per component)
✅ Indexed queries for performance
✅ Batch operations for bulk updates
✅ Optimistic UI updates
✅ Error boundaries for listener failures

## Monitoring

Track listener performance in Firebase Console:
- Firestore > Usage tab
- Monitor read/write counts
- Check for excessive reads (indicates missing indexes)

## Cost Estimation

For typical user (10 goals, 20 habits, 30 days logs):
- **Initial load:** ~60 reads
- **Daily usage:** ~5-10 reads (only changes)
- **Monthly cost:** ~$0.01 (well within free tier)

Free tier: 50K reads/day, 20K writes/day
