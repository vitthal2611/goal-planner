# Habit Frequency - Quick Reference

## 🎯 How to Use

### Creating Habits with Different Frequencies

1. **Daily Habit** (default)
   - Select "Daily" in frequency dropdown
   - No additional config needed
   - Appears every day

2. **Weekly Habit** (X times per week)
   - Select "Weekly" in frequency dropdown
   - Enter number of days (1-7)
   - Example: 3 = habit should be done 3 times per week
   - Appears every day, but consistency tracked per week

3. **Specific Days** (Mon-Sun)
   - Select "Specific Days" in frequency dropdown
   - Click day chips to select (Mon, Tue, Wed, etc.)
   - Example: Select Mon, Wed, Fri
   - Appears ONLY on selected days

4. **Monthly Habit** (X times per month)
   - Select "Monthly" in frequency dropdown
   - Enter number of times (1-31)
   - Example: 12 = habit should be done 12 times per month
   - Appears every day, but consistency tracked per month

---

## 📊 How It Works

### Today View
- Shows ONLY habits scheduled for today
- Specific Days habits appear only on selected days
- Daily, Weekly, Monthly habits appear every day
- Frequency badge shown on each habit

### Consistency Calculation
- **Daily**: completed / total days
- **Weekly**: completed / (weeks × daysPerWeek)
- **Specific Days**: completed / scheduled days only
- **Monthly**: completed / (months × timesPerMonth)

### Streaks
- Count ONLY scheduled days
- Specific Days: Mon→Wed→Fri = 3-day streak (Tue/Thu don't break it)
- Daily: Every day counts
- Weekly/Monthly: Every completion counts

---

## 💡 Examples

### Example 1: Gym 3× per week
```
Frequency: Weekly
Days per week: 3
Result: Appears daily, need 3 completions per week
Consistency: 10 completed / 12 expected (4 weeks) = 83%
```

### Example 2: Team Meeting (Mon/Wed/Fri)
```
Frequency: Specific Days
Days: Mon, Wed, Fri
Result: Appears ONLY on Mon/Wed/Fri
Consistency: 8 completed / 12 scheduled days = 67%
```

### Example 3: Financial Review (5× per month)
```
Frequency: Monthly
Times per month: 5
Result: Appears daily, need 5 completions per month
Consistency: 4 completed / 5 expected = 80%
```

---

## 🔑 Key Points

✅ **Unscheduled days don't count as missed**
- If habit is Mon/Wed/Fri, Tuesday is ignored completely

✅ **Backward compatible**
- Existing daily habits work unchanged
- No migration needed

✅ **Frequency can be changed**
- Edit habit to change frequency
- Only affects future tracking

✅ **Smart streak counting**
- Streaks ignore unscheduled days
- Mon→Wed→Fri = 3-day streak (not broken by Tue/Thu)

---

## 🎨 UI Elements

### Frequency Badges
- "Daily" - shown on daily habits
- "3× per week" - shown on weekly habits
- "Mon, Wed, Fri" - shown on specific days habits
- "5× per month" - shown on monthly habits

### Form Inputs
- **Daily**: No extra inputs
- **Weekly**: Number input (1-7)
- **Specific Days**: Day chips (clickable)
- **Monthly**: Number input (1-31)

---

## 🐛 Troubleshooting

**Q: Habit not showing in Today view?**
- Check if today is a scheduled day
- For Specific Days, verify day selection

**Q: Consistency seems wrong?**
- Check frequency config
- Verify expected completions match frequency type

**Q: Streak not counting?**
- Streaks count only scheduled days
- For Specific Days, only those days count

**Q: Can I change frequency mid-year?**
- Yes! Only affects future tracking
- Past logs remain unchanged
