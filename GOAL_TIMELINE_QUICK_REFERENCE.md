# Goal Timeline - Quick Reference

## 🎯 How It Works

### Goal Timeline Basics
Every goal now has:
- **Start Date** - When the goal begins
- **End Date** - When the goal ends
- **Status** - Active, Completed, Upcoming, or Ended

### Default Behavior
When you create a goal:
- Start Date = **Today**
- End Date = **December 31** of selected year
- Status = **Active**

---

## 📅 Goal Statuses

| Status | Meaning | Badge Color |
|--------|---------|-------------|
| **Active** | Current date is between start and end | 🟢 Green |
| **Completed** | Target reached | 🔵 Blue |
| **Upcoming** | Start date is in the future | 🟠 Orange |
| **Ended** | End date has passed | ⚪ Gray |

---

## 💡 Common Scenarios

### 1. Full Year Goal
```
Start: Jan 1, 2024
End: Dec 31, 2024
Duration: 365 days
```
Perfect for annual goals like "Read 24 books"

### 2. Mid-Year Goal
```
Start: June 15, 2024
End: Dec 31, 2024
Duration: ~200 days
```
Great for goals you start partway through the year

### 3. Short-Term Goal
```
Start: Jan 1, 2024
End: Mar 31, 2024
Duration: 90 days
```
Ideal for quarterly goals like "Q1 Savings"

### 4. Future Goal
```
Start: Dec 1, 2024
End: Dec 31, 2024
Duration: 31 days
```
Plan ahead for goals starting later

---

## 🎨 What You'll See

### Dashboard
- Timeline: "Jan 10 – Dec 31, 2024"
- Status badge: Active / Completed / Upcoming / Ended
- Progress bar (only for active goals)
- Days remaining

### Today View
- **Active goals**: Habits shown ✅
- **Upcoming goals**: Habits hidden (not started yet)
- **Ended goals**: Habits hidden (already finished)

### Goal Cards
- Calendar icon with date range
- Color-coded status badge
- Progress calculated within timeline

---

## 🔧 How to Use

### Creating a Goal with Custom Dates

1. Fill in goal details (title, unit, year)
2. Click **"Set Custom Dates (Optional)"**
3. Choose start and end dates
4. Dates are pre-filled with smart defaults
5. Click **"Add Goal"**

### Default Dates (No Action Needed)
If you don't set custom dates:
- Start = Today
- End = Dec 31 of selected year

---

## 📊 Progress Calculation

Progress is calculated **only within the timeline**:

**Example:**
- Goal: Read 24 books (June 15 - Dec 31)
- Today: Aug 15
- Days passed: 62 days
- Total days: 200 days
- Expected: (24 × 62) / 200 = 7.4 books
- Actual: 8 books
- Status: ✅ On track!

---

## 🔄 Rollover to Next Year

When rolling over goals:
1. Select incomplete goals
2. Click "Roll Over to 2025"
3. New goals created with:
   - Start: Jan 1, 2025
   - End: Dec 31, 2025
   - Progress: Reset to 0
4. Original goals preserved

---

## ⚠️ Validation & Warnings

### Errors (Blocking)
- ❌ End date before start date

### Warnings (Non-blocking)
- ⚠️ Goal spans multiple years
- ⚠️ Goal duration < 7 days
- ⚠️ Editing dates mid-progress

### Info
- ℹ️ Start date in the past (allowed)

---

## 🎯 Best Practices

### ✅ Do
- Use default dates for simplicity
- Set custom dates for mid-year goals
- Create short-term goals for quarterly targets
- Plan future goals in advance

### ❌ Don't
- Set end date before start date
- Create extremely short goals (< 7 days)
- Edit dates after significant progress

---

## 🐛 Troubleshooting

**Q: My habit isn't showing in Today view?**
- Check if the goal is active (not upcoming or ended)
- Verify today's date is between start and end dates

**Q: Progress seems wrong?**
- Progress is calculated only within the timeline
- Check start and end dates
- Verify current date is within range

**Q: Can I change dates after creating a goal?**
- Yes, but you'll see a warning
- Progress calculations will be affected
- Best to set correct dates initially

**Q: What happens to habits when a goal ends?**
- Habits are hidden from Today view
- Goal shows "Ended" status
- Historical data is preserved

---

## 📖 Examples

### Example 1: New Year's Resolution
```
Title: Exercise 100 times
Start: Jan 1, 2024
End: Dec 31, 2024
Status: Active
```

### Example 2: Summer Reading Challenge
```
Title: Read 10 books
Start: June 1, 2024
End: Aug 31, 2024
Status: Active (if in summer)
```

### Example 3: Q1 Financial Goal
```
Title: Save $3000
Start: Jan 1, 2024
End: Mar 31, 2024
Status: Ended (if after March)
```

### Example 4: December Challenge
```
Title: Learn 100 words
Start: Dec 1, 2024
End: Dec 31, 2024
Status: Upcoming (if before December)
```

---

## 🚀 Quick Tips

1. **Leave dates as default** for most goals
2. **Use custom dates** for mid-year or short-term goals
3. **Check status badges** to see goal state at a glance
4. **Today view automatically filters** based on goal timeline
5. **Rollover preserves** original goal history

---

## 📞 Need Help?

- Check `GOAL_TIMELINE_IMPLEMENTATION.md` for technical details
- Run verification: `runGoalTimelineVerification()` in console
- Review examples in `src/data/goalTimelineExamples.js`
