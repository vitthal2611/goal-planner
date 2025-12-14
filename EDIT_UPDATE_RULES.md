# Edit & Update Rules

## Core Principles

1. **Never break existing data** - All edits preserve data integrity
2. **Auto-recalculate dependencies** - Progress, consistency, and streaks update automatically
3. **Lightweight UX** - Inline editing, no full-screen modals
4. **Safe by default** - Confirm critical changes, easy cancel/undo

---

## Goal Edit Rules

### Editable Fields
- ✅ Title
- ✅ Yearly target
- ✅ Start date
- ✅ End date
- ❌ Year (derived from start date)
- ❌ Monthly data (edited separately)

### Critical Changes (require confirmation)
- **Changing dates** → Recalculates progress percentages, affects habit visibility
- **Reducing target below current progress** → Warns user

### Auto-Recalculations
- Progress percentages (yearly, quarterly, monthly)
- On-track status
- Days remaining
- Required daily rate

---

## Habit Edit Rules

### Editable Fields
- ✅ Name
- ✅ Trigger
- ✅ Time
- ✅ Location
- ✅ Frequency
- ✅ Linked goal
- ❌ Start year (set on creation)

### Critical Changes (require confirmation)
- **Changing frequency** → Affects future logs only, recalculates consistency
- **Re-linking to different goal** → Warns if goal has different timeline

### Auto-Recalculations
- 30-day consistency
- Current streak
- Longest streak
- Expected vs actual completion

---

## DailyLog Edit Rules

### Editable Fields
- ✅ Status (done ↔ skipped)
- ✅ Notes (future enhancement)
- ❌ Date (logs are date-specific)
- ❌ Habit ID (logs are habit-specific)

### Constraints
- Can only edit logs within goal timeline
- Cannot create logs for dates outside habit frequency
- Toggling status updates loggedAt timestamp

### Auto-Recalculations
- Habit consistency
- Current streak
- Longest streak

---

## Validation Rules

### Goal Validation
```javascript
- startDate < endDate
- yearlyTarget > 0
- actualProgress <= yearlyTarget
- year matches startDate year
```

### Habit Validation
```javascript
- name.length > 0
- goalIds.length > 0
- frequency in ['daily', 'weekly', 'monthly', 'custom']
- time format: HH:MM
```

### DailyLog Validation
```javascript
- status in ['done', 'skipped']
- date within goal timeline
- date matches habit frequency
```

---

## Update Flow

```
User Edit → Validate → Confirm (if critical) → Update State → Recalculate → Persist → UI Refresh
```

### Example: Edit Goal End Date
1. User changes end date from Dec 31 → Jun 30
2. Validate: new date > start date ✓
3. Confirm: "This will affect progress calculations"
4. Update goal object
5. Recalculate: progress %, days remaining, on-track status
6. Persist to Firebase
7. Dashboard/Today view auto-refresh

---

## State Management

### Draft State Pattern
```javascript
// Before edit
const [isEditing, setIsEditing] = useState(false);
const [draft, setDraft] = useState(null);

// Enter edit mode
setIsEditing(true);
setDraft({ ...originalData });

// User edits
setDraft({ ...draft, field: newValue });

// Save
updateGoal(draft);
setIsEditing(false);

// Cancel
setIsEditing(false);
setDraft(null);
```

---

## UI Patterns

### Inline Edit Mode
- View mode: Display data with edit icon
- Edit mode: Show input fields with save/cancel
- No modal unless confirmation needed

### Confirmation Dialog
- Used for critical changes only
- Clear explanation of impact
- "Cancel" and "Confirm" actions

### Instant Feedback
- Optimistic UI updates
- Loading states for async operations
- Success/error notifications
