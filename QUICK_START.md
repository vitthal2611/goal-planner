# Quick Start Guide - Goal Planner SPA

## 🚀 Get Started in 30 Seconds

```bash
npm install
npm start
```

Open http://localhost:3000

---

## 📱 App Sections Overview

### 1. **Today** (Execution Mode)
- ✅ Mark habits done/skipped with one tap
- 🔥 See your daily completion rate
- ⏰ Habits grouped by time (Morning, Afternoon, Evening, Night)

### 2. **Dashboard** (Overview)
- 📊 Yearly progress across all goals
- 🎯 Monthly targets vs actual
- 🔥 Habit streaks and consistency
- 📈 Visual progress rings and bars

### 3. **Goals** (Planning)
- ➕ Create yearly goals
- 📝 Update progress inline (click edit icon)
- 🎯 Auto-calculated quarterly/monthly/weekly targets
- ✅ On-track indicators

### 4. **Habits** (Routines)
- ➕ Create habits linked to goals
- 🔗 Trigger + Time + Location context
- 📊 30-day consistency tracking
- 🔥 Current and best streaks

### 5. **Review** (Insights)
- 💡 Auto-generated insights
- 📊 Planned vs actual comparison
- 📈 Habit adherence summary
- ⚠️ Warnings for goals behind schedule

---

## 🎯 Example Workflow

### Step 1: Create a Goal
1. Go to **Goals** tab
2. Fill in form:
   - Title: "Read 24 books"
   - Yearly Target: 24
   - Unit: "books"
3. Click **Add Goal**
4. See auto-calculated targets:
   - Quarterly: 6 books
   - Monthly: 2 books
   - Weekly: 0.46 books

### Step 2: Create a Habit
1. Go to **Habits** tab
2. Fill in form:
   - Habit Name: "Read for 30 minutes"
   - Linked Goal: "Read 24 books"
   - Trigger: "After morning tea"
   - Time: 07:15
   - Location: "Living room"
3. Click **Add Habit**

### Step 3: Execute Daily
1. Go to **Today** tab
2. See "Read for 30 minutes" in Morning section
3. Tap checkbox to mark done
4. Watch completion rate update

### Step 4: Update Progress
1. Go to **Goals** tab
2. Click edit icon on "Read 24 books"
3. Change progress: 0 → 1
4. Click save icon
5. See progress bar update

### Step 5: Review Progress
1. Go to **Dashboard** tab
2. See circular progress ring
3. Check if "On Track" or "Behind"
4. View habit streak (should be 1 day)

### Step 6: Monthly Review
1. Go to **Review** tab
2. Read auto-generated insights
3. Compare planned vs actual
4. See habit adherence percentages

---

## 🎨 UI Features

### Dark Mode
- Click sun/moon icon in top-right
- Automatically saves preference
- All colors adapt instantly

### Animations
- ✨ Checkbox zoom on completion
- 📈 Progress bar smooth fill
- 🎯 Card scale on habit completion
- 🌊 Smooth transitions everywhere

### Color Coding
- 🟢 Green: Excellent (≥90% goals, ≥80% habits)
- 🔵 Blue: Good (≥70% goals, ≥60% habits)
- 🟠 Orange: Behind (≥50% goals, ≥40% habits)
- 🔴 Red: Critical (<50% goals, <40% habits)

---

## 💾 Data Persistence

- All data saved to **localStorage**
- Survives browser refresh
- No backend needed
- Works offline

### Clear Data
```javascript
// Open browser console (F12)
localStorage.clear();
location.reload();
```

---

## 🔧 Common Tasks

### Add Multiple Goals
```javascript
// Goals tab → Fill form → Add Goal (repeat)
```

### Link Multiple Habits to One Goal
```javascript
// Habits tab → Select same goal for each habit
```

### Update Goal Progress
```javascript
// Goals tab → Click edit icon → Enter new value → Save
```

### Mark Habit as Done
```javascript
// Today tab → Click checkbox (or tap card)
```

### Toggle Habit Status
```javascript
// Click once: Done
// Click twice: Skipped
// Click thrice: Done (cycles)
```

### Delete Goal/Habit
```javascript
// Click trash icon on goal/habit card
```

---

## 📊 Understanding Metrics

### Goal Progress
- **Yearly Progress**: (Actual / Target) × 100
- **On Track**: Actual ≥ Expected based on days passed
- **Behind**: Actual < Expected
- **Remaining**: Target - Actual

### Habit Consistency
- **Consistency**: (Completed / Expected) × 100
- **Current Streak**: Consecutive days completed
- **Longest Streak**: Best streak ever achieved
- **Completion Rate**: (Completed / Total Logged) × 100

### Dashboard Calculations
- **Average Goal Progress**: Sum of all goal percentages ÷ Goal count
- **Average Habit Consistency**: Sum of all habit percentages ÷ Habit count
- **Monthly Target**: Sum of all monthly targets across goals

---

## 🎯 Pro Tips

### 1. Start Small
- Create 1-2 goals first
- Add 1 habit per goal
- Build consistency before adding more

### 2. Use Triggers
- Link habits to existing routines
- "After coffee" is better than "8:00 AM"
- Specific triggers = higher success rate

### 3. Review Weekly
- Check Dashboard every Monday
- Adjust habits if consistency < 70%
- Celebrate streaks ≥7 days

### 4. Update Progress Regularly
- Update goals weekly (not daily)
- Be honest with actual progress
- Use "Behind" status as motivation

### 5. Mobile Usage
- Add to home screen (PWA)
- Use Today tab in morning
- Quick tap to mark done

---

## 🐛 Troubleshooting

### Habit Not Showing in Today
- Check habit has valid time set
- Verify habit is active (not deleted)
- Refresh page

### Progress Not Updating
- Click save icon after editing
- Check browser console for errors
- Verify localStorage is enabled

### Dark Mode Not Saving
- Check localStorage quota
- Try clearing cache
- Disable browser extensions

### Calculations Seem Wrong
- Verify goal dates are current year
- Check actual progress is correct
- Review expected progress formula

---

## 📱 Mobile Tips

### Add to Home Screen (iOS)
1. Open in Safari
2. Tap Share button
3. Tap "Add to Home Screen"
4. Tap "Add"

### Add to Home Screen (Android)
1. Open in Chrome
2. Tap menu (⋮)
3. Tap "Add to Home screen"
4. Tap "Add"

### Best Practices
- Use Today tab for daily execution
- Large touch targets (easy tapping)
- Swipe between tabs
- Portrait mode recommended

---

## 🎓 Learning Resources

### Understanding the Code
- `src/App.js` - Main SPA shell
- `src/context/AppContext.js` - Global state
- `src/utils/goalUtils.js` - Goal calculations
- `src/utils/habitUtils.js` - Habit calculations

### Key Concepts
- **React Context**: Global state without Redux
- **useLocalStorage**: Custom hook for persistence
- **Material UI**: Component library
- **date-fns**: Date calculations

### Extending the App
- Add new sections: Create component + add tab
- Add new metrics: Update utility functions
- Add new fields: Update models + forms
- Add routing: Install react-router-dom

---

## 📞 Support

### Check These First
1. IMPLEMENTATION_SUMMARY.md - Full documentation
2. README.md - Project overview
3. DATAFLOW.md - Data architecture
4. Browser console - Error messages

### Common Questions

**Q: Can I use this without internet?**
A: Yes! All data is stored locally.

**Q: Can multiple people use this?**
A: Not yet. Add backend + auth for multi-user.

**Q: Can I export my data?**
A: Open console: `JSON.stringify(localStorage)`

**Q: Can I import data?**
A: Yes, but requires manual localStorage editing.

**Q: Is my data secure?**
A: Data stays on your device. No server uploads.

---

## 🎉 You're Ready!

Start with the **Today** tab and mark your first habit as done! 🚀

**Remember**: Consistency beats perfection. Small daily actions lead to big yearly results.

---

**Happy Planning! 📊✨**
