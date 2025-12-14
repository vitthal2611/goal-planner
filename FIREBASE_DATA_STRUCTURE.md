# 🔥 Firebase Data Structure

## Database Schema

```
goal-planner-d7d2b (Realtime Database)
│
└── users/
    └── {userId}/                    # Unique user ID from Firebase Auth
        ├── goals/                   # Array of goal objects
        │   ├── 0: Goal
        │   ├── 1: Goal
        │   └── ...
        │
        ├── habits/                  # Array of habit objects
        │   ├── 0: Habit
        │   ├── 1: Habit
        │   └── ...
        │
        └── habitLogs/               # Array of daily log objects
            ├── 0: DailyLog
            ├── 1: DailyLog
            └── ...
```

## Data Models

### Goal Object
```javascript
{
  id: "goal-1",                      // Unique identifier
  title: "Read 24 books",            // Goal description
  yearlyTarget: 24,                  // Target for the year
  actualProgress: 8,                 // Current progress
  unit: "books",                     // Unit of measurement
  startDate: "2024-01-01T00:00:00.000Z",  // Start date (ISO string)
  endDate: "2024-12-31T00:00:00.000Z",    // End date (ISO string)
  createdAt: "2024-01-01T00:00:00.000Z",  // Creation timestamp
  monthlyData: {                     // Optional: monthly breakdown
    "2024-01": 2,
    "2024-02": 3,
    "2024-03": 3
  }
}
```

### Habit Object
```javascript
{
  id: "habit-1",                     // Unique identifier
  name: "Read for 30 minutes",       // Habit name
  goalIds: ["goal-1"],               // Array of linked goal IDs
  trigger: "After morning tea",      // Habit trigger/cue
  time: "07:15",                     // Scheduled time (HH:mm)
  location: "Living room",           // Where to do it
  frequency: "daily",                // daily | weekly | monthly
  isActive: true,                    // Active status
  createdAt: "2024-01-01T00:00:00.000Z"  // Creation timestamp
}
```

### DailyLog Object
```javascript
{
  id: "log-abc123",                  // Unique identifier
  habitId: "habit-1",                // Reference to habit
  date: "2024-03-15",                // Date (YYYY-MM-DD)
  status: "done",                    // done | skipped
  notes: "",                         // Optional notes
  loggedAt: "2024-03-15T07:30:00.000Z"  // Timestamp when logged
}
```

## Sample Data Structure

When a new user signs in, they automatically get:

```javascript
users/
  └── {newUserId}/
      ├── goals/
      │   ├── 0: { id: "goal-1", title: "Read 24 books", yearlyTarget: 24, ... }
      │   ├── 1: { id: "goal-2", title: "Exercise 200 hours", yearlyTarget: 200, ... }
      │   ├── 2: { id: "goal-3", title: "Learn 500 new words", yearlyTarget: 500, ... }
      │   └── 3: { id: "goal-4", title: "Save $12,000", yearlyTarget: 12000, ... }
      │
      ├── habits/
      │   ├── 0: { id: "habit-1", name: "Read for 30 minutes", goalIds: ["goal-1"], ... }
      │   ├── 1: { id: "habit-2", name: "Morning workout", goalIds: ["goal-2"], ... }
      │   ├── 2: { id: "habit-3", name: "Study vocabulary", goalIds: ["goal-3"], ... }
      │   ├── 3: { id: "habit-4", name: "Track expenses", goalIds: ["goal-4"], ... }
      │   └── 4: { id: "habit-5", name: "Evening walk", goalIds: ["goal-2"], ... }
      │
      └── habitLogs/
          ├── 0: { id: "log-1", habitId: "habit-1", date: "2024-03-15", status: "done", ... }
          ├── 1: { id: "log-2", habitId: "habit-1", date: "2024-03-14", status: "done", ... }
          └── ... (30 days of logs for each habit)
```

## Data Operations

### Read Operations

```javascript
// Listen to goals in real-time
const goalsRef = ref(db, `users/${userId}/goals`);
onValue(goalsRef, (snapshot) => {
  const goals = snapshot.exists() ? Object.values(snapshot.val()) : [];
  // Use goals...
});

// One-time read
const snapshot = await get(goalsRef);
const goals = snapshot.exists() ? Object.values(snapshot.val()) : [];
```

### Write Operations

```javascript
// Add new goal
const newGoal = { id: "goal-5", title: "New Goal", ... };
const updatedGoals = [...existingGoals, newGoal];
await set(ref(db, `users/${userId}/goals`), updatedGoals);

// Update existing goal
const updatedGoals = goals.map(g => 
  g.id === goalId ? { ...g, actualProgress: newProgress } : g
);
await set(ref(db, `users/${userId}/goals`), updatedGoals);

// Delete goal
const updatedGoals = goals.filter(g => g.id !== goalId);
await set(ref(db, `users/${userId}/goals`), updatedGoals.length ? updatedGoals : null);
```

### Log Habit

```javascript
// Mark habit as done today
const today = "2024-03-15";
const newLog = {
  id: generateId(),
  habitId: "habit-1",
  date: today,
  status: "done",
  loggedAt: new Date().toISOString()
};
const updatedLogs = [...existingLogs, newLog];
await set(ref(db, `users/${userId}/habitLogs`), updatedLogs);
```

## Security Rules

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

**What this means:**
- Users can only read their own data (`users/{theirUserId}/`)
- Users can only write to their own data
- Authentication is required (no anonymous access)
- Other users' data is completely inaccessible

## Data Size Estimates

### Per User
- **Goals**: ~4 goals × 200 bytes = 800 bytes
- **Habits**: ~5 habits × 250 bytes = 1.25 KB
- **Logs**: ~150 logs/month × 150 bytes = 22.5 KB/month
- **Total**: ~24 KB/month per active user

### Scaling
- **100 users**: ~2.4 MB/month
- **1,000 users**: ~24 MB/month
- **10,000 users**: ~240 MB/month

**Firebase Free Tier**: 1 GB storage, 10 GB/month downloads
→ Supports **~40,000 active users** on free tier!

## Backup & Export

### Manual Backup (Firebase Console)
1. Go to Realtime Database
2. Click on root node
3. Click ⋮ menu → Export JSON
4. Save backup file

### Programmatic Backup
```javascript
import { ref, get } from 'firebase/database';

const backupUserData = async (userId) => {
  const userRef = ref(db, `users/${userId}`);
  const snapshot = await get(userRef);
  
  if (snapshot.exists()) {
    const data = snapshot.val();
    const json = JSON.stringify(data, null, 2);
    
    // Download as file
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `goal-planner-backup-${new Date().toISOString()}.json`;
    a.click();
  }
};
```

## Monitoring

### Firebase Console
- **Realtime Database** → **Data** tab: Browse all data
- **Realtime Database** → **Usage** tab: Monitor bandwidth and storage
- **Authentication** → **Users** tab: See all registered users

### Key Metrics to Monitor
- Total users
- Active users (users with recent logs)
- Database size
- Bandwidth usage
- Read/write operations

## Best Practices

### ✅ Do
- Store dates as ISO strings for consistency
- Use arrays for collections (goals, habits, logs)
- Keep data normalized (don't duplicate)
- Use meaningful IDs (e.g., `goal-1`, not random strings)
- Clean up old logs periodically (optional)

### ❌ Don't
- Store large files (use Firebase Storage instead)
- Store sensitive data unencrypted
- Create deeply nested structures (keep it flat)
- Store computed values (calculate on read)
- Exceed 32 MB per node

## Troubleshooting

### "Permission Denied" Error
- **Cause**: Security rules not deployed or user not authenticated
- **Fix**: Run `firebase deploy --only database`

### Data Not Syncing
- **Cause**: Offline or network issues
- **Fix**: Firebase handles offline automatically; data syncs when online

### Duplicate Logs
- **Cause**: Multiple rapid clicks
- **Fix**: Already handled in code (checks for existing log by date)

### Old Data Showing
- **Cause**: Browser cache
- **Fix**: Hard refresh (Ctrl+Shift+R) or clear cache

---

## 📚 Resources

- [Firebase Realtime Database Docs](https://firebase.google.com/docs/database)
- [Security Rules Guide](https://firebase.google.com/docs/database/security)
- [Best Practices](https://firebase.google.com/docs/database/usage/best-practices)

---

**Your data is safe, secure, and synced in real-time!** 🔥
