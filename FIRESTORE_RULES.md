# 🔒 Firestore Security Rules

## Overview

These security rules ensure that users can only access their own data and that all documents have valid required fields.

## Core Principles

### 1. **User Isolation**
Every document must have a `userId` field. Users can only read/write documents where `userId` matches their authenticated user ID.

### 2. **Authentication Required**
All operations require authentication. Anonymous users have no access.

### 3. **Field Validation**
All creates/updates validate required fields, data types, and constraints.

---

## Rule Breakdown

### Helper Functions

**`isAuthenticated()`**
- Checks if user is logged in
- Returns `true` if `request.auth` exists

**`isOwner(userId)`**
- Checks if authenticated user owns the document
- Compares `request.auth.uid` with document's `userId`

**`isValidGoal()`**
- Validates goal document structure
- Required fields: `title`, `yearlyTarget`, `actualProgress`, `unit`, `startDate`, `endDate`, `userId`
- Constraints:
  - `title`: 1-200 characters
  - `yearlyTarget`: positive number
  - `actualProgress`: non-negative number
  - `unit`: 1-50 characters
  - `userId`: must match authenticated user

**`isValidHabit()`**
- Validates habit document structure
- Required fields: `name`, `goalIds`, `frequency`, `isActive`, `userId`
- Constraints:
  - `name`: 1-200 characters
  - `goalIds`: array (can be empty)
  - `frequency`: must be 'daily', 'weekly', or 'monthly'
  - `isActive`: boolean
  - `userId`: must match authenticated user

**`isValidLog()`**
- Validates daily log structure
- Required fields: `habitId`, `date`, `status`, `userId`
- Constraints:
  - `habitId`: string reference
  - `date`: string (ISO format)
  - `status`: must be 'done' or 'skipped'
  - `userId`: must match authenticated user

**`isValidReview()`**
- Validates review structure
- Required fields: `type`, `date`, `userId`
- Constraints:
  - `type`: must be 'daily', 'weekly', 'monthly', or 'quarterly'
  - `userId`: must match authenticated user

---

## Collection Rules

### Goals (`/goals/{goalId}`)

| Operation | Rule |
|-----------|------|
| **Read** | User must own the goal |
| **Create** | Must pass validation + userId matches auth |
| **Update** | User must own + must pass validation |
| **Delete** | User must own the goal |

**Example Valid Goal:**
```javascript
{
  title: "Read 24 books",
  yearlyTarget: 24,
  actualProgress: 8,
  unit: "books",
  startDate: "2024-01-01",
  endDate: "2024-12-31",
  userId: "abc123" // Must match authenticated user
}
```

### Habits (`/habits/{habitId}`)

| Operation | Rule |
|-----------|------|
| **Read** | User must own the habit |
| **Create** | Must pass validation + userId matches auth |
| **Update** | User must own + must pass validation |
| **Delete** | User must own the habit |

**Example Valid Habit:**
```javascript
{
  name: "Read for 30 minutes",
  goalIds: ["goal123"],
  frequency: "daily",
  isActive: true,
  trigger: "After morning tea",
  time: "07:15",
  location: "Living room",
  userId: "abc123" // Must match authenticated user
}
```

### Daily Logs (`/logs/{logId}`)

| Operation | Rule |
|-----------|------|
| **Read** | User must own the log |
| **Create** | Must pass validation + userId matches auth |
| **Update** | User must own + must pass validation |
| **Delete** | User must own the log |

**Example Valid Log:**
```javascript
{
  habitId: "habit123",
  date: "2024-01-15",
  status: "done",
  notes: "Finished chapter 3",
  userId: "abc123" // Must match authenticated user
}
```

### Reviews (`/reviews/{reviewId}`)

| Operation | Rule |
|-----------|------|
| **Read** | User must own the review |
| **Create** | Must pass validation + userId matches auth |
| **Update** | User must own + must pass validation |
| **Delete** | User must own the review |

**Example Valid Review:**
```javascript
{
  type: "weekly",
  date: "2024-01-15T00:00:00Z",
  goalProgress: {...},
  habitStreaks: {...},
  insights: [...],
  userId: "abc123" // Must match authenticated user
}
```

---

## Security Guarantees

✅ **User A cannot read User B's data**
- All reads check `userId` ownership

✅ **User A cannot write to User B's data**
- All writes validate `userId` matches authenticated user

✅ **Cannot create documents without required fields**
- Validation functions check all required fields exist

✅ **Cannot create documents with invalid data types**
- Type checking enforced (string, number, bool, list)

✅ **Cannot create documents with invalid values**
- Enum validation (frequency, status, type)
- Range validation (string lengths, positive numbers)

✅ **Anonymous users have no access**
- All operations require authentication

✅ **Default deny for unknown collections**
- Catch-all rule denies access to any other paths

---

## Testing Rules

### Test in Firebase Console

```javascript
// Test as authenticated user
auth = { uid: 'user123' }

// ✅ Should ALLOW - Reading own goal
get /databases/(default)/documents/goals/goal1
where resource.data.userId == 'user123'

// ❌ Should DENY - Reading another user's goal
get /databases/(default)/documents/goals/goal2
where resource.data.userId == 'user456'

// ✅ Should ALLOW - Creating valid goal
create /databases/(default)/documents/goals/newGoal
with { title: "Test", yearlyTarget: 10, actualProgress: 0, 
       unit: "items", userId: "user123", ... }

// ❌ Should DENY - Creating goal without title
create /databases/(default)/documents/goals/newGoal
with { yearlyTarget: 10, userId: "user123" }

// ❌ Should DENY - Creating goal for another user
create /databases/(default)/documents/goals/newGoal
with { title: "Test", userId: "user456", ... }
```

---

## Deployment

### Deploy Rules to Firebase

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project (if not done)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

### Verify Deployment

1. Go to Firebase Console
2. Navigate to Firestore Database
3. Click "Rules" tab
4. Verify rules are active
5. Check "Rules Playground" to test scenarios

---

## Common Errors

### ❌ "Missing or insufficient permissions"
**Cause:** User trying to access data they don't own
**Fix:** Ensure `userId` field matches authenticated user

### ❌ "Document does not match required fields"
**Cause:** Missing required field or wrong data type
**Fix:** Include all required fields with correct types

### ❌ "PERMISSION_DENIED"
**Cause:** User not authenticated or accessing wrong collection
**Fix:** Ensure user is logged in and accessing correct path

---

## Best Practices

1. **Always include userId** - Add to every document on creation
2. **Validate on client** - Check fields before sending to Firestore
3. **Use transactions** - For operations affecting multiple documents
4. **Test thoroughly** - Use Rules Playground before deploying
5. **Monitor usage** - Check Firebase Console for denied requests

---

## Migration from localStorage

When migrating existing localStorage data to Firestore:

```javascript
// Add userId to all documents
const userId = auth.currentUser.uid;

goals.forEach(goal => {
  db.collection('goals').add({
    ...goal,
    userId // Add this field
  });
});
```

---

## Future Enhancements

- **Rate limiting** - Prevent abuse with quota rules
- **Shared goals** - Allow multiple users to collaborate
- **Admin access** - Special rules for admin users
- **Backup collections** - Separate rules for backup data
