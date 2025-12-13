# Firestore Usage Guide

## Architecture

```
Services Layer (Business Logic)
├── firestoreService.js    - Low-level CRUD operations
├── goalService.js         - Goal-specific operations
├── habitService.js        - Habit-specific operations
└── logService.js          - Log-specific operations

Hooks Layer (React Integration)
└── useFirestore.js        - React hooks for state management
```

## Data Structure

```
/users/{userId}/
  ├── goals/
  │   └── {goalId}
  │       ├── title: string
  │       ├── yearlyTarget: number
  │       ├── actualProgress: number
  │       ├── unit: string
  │       ├── targets: { yearly, quarterly, monthly, weekly, daily }
  │       ├── startDate: Timestamp
  │       ├── endDate: Timestamp
  │       └── createdAt: Timestamp
  │
  ├── habits/
  │   └── {habitId}
  │       ├── name: string
  │       ├── goalIds: string[]
  │       ├── trigger: string
  │       ├── time: string
  │       ├── location: string
  │       ├── frequency: 'daily' | 'weekly' | 'monthly'
  │       ├── isActive: boolean
  │       └── createdAt: Timestamp
  │
  └── logs/
      └── {logId}
          ├── habitId: string
          ├── date: string (YYYY-MM-DD)
          ├── status: 'done' | 'skipped'
          ├── notes: string
          └── loggedAt: Timestamp
```

## Usage Examples

### Goals

```javascript
import { goalService } from './services/goalService';
import { useAuth } from './context/AuthContext';

const { user } = useAuth();

// Create goal with auto-calculated targets
await goalService.createGoal(user.uid, {
  title: 'Read 24 books',
  yearlyTarget: 24,
  unit: 'books',
  startDate: new Date(2024, 0, 1),
  endDate: new Date(2024, 11, 31)
});

// Update progress
await goalService.updateGoalProgress(user.uid, goalId, 8);

// Increment progress
await goalService.incrementGoalProgress(user.uid, goalId, 1);
```

### Habits

```javascript
import { habitService } from './services/goalService';

// Create habit linked to goal
await habitService.createHabit(user.uid, {
  name: 'Read for 30 minutes',
  goalIds: [goalId],
  trigger: 'After morning tea',
  time: '07:15',
  location: 'Living room',
  frequency: 'daily'
});

// Link habit to another goal
await habitService.linkHabitToGoal(user.uid, habitId, anotherGoalId);
```

### Daily Logs

```javascript
import { logService } from './services/goalService';

// Mark habit as done
await logService.markHabitDone(user.uid, habitId);

// Mark habit as skipped
await logService.markHabitSkipped(user.uid, habitId);

// Toggle status
await logService.toggleHabitStatus(user.uid, habitId);
```

### React Hooks

```javascript
import { useFirestoreGoals, useFirestoreHabits, useFirestoreLogs } from './hooks/useFirestore';

function MyComponent() {
  const { goals, loading, addGoal, updateGoal, deleteGoal } = useFirestoreGoals();
  const { habits, addHabit, updateHabit } = useFirestoreHabits();
  const { logs, toggleHabitStatus } = useFirestoreLogs();

  // Use the data and methods
}
```

## Security Rules

Add to Firebase Console > Firestore Database > Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Features

✅ Auto-calculated quarterly/monthly/weekly/daily targets
✅ Timestamp conversion (Firestore ↔ JavaScript Date)
✅ Habit-goal linking (many-to-many)
✅ Daily habit tracking (done/skipped)
✅ Query optimization with indexes
✅ Clean service-based architecture
✅ React hooks for state management
