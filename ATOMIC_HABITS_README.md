# Atomic Habits Tracker

A minimal, guilt-free habit tracker inspired by James Clear's "Atomic Habits" methodology.

## 🎯 Design Philosophy

- **Identity-based habits**: Focus on who you want to become
- **Small & achievable**: 2-minute rule for building consistency
- **Consistency over perfection**: Guilt-free metrics and messaging
- **Calm, minimal UI**: Clean design without overwhelming features
- **No gamification**: No points, badges, or competitive elements

## ✨ Core Features

### Habit Creation
- Identity-based naming: "I am a person who..."
- Trigger-based: Link to existing habits or events
- Time and location context
- Daily or weekly frequency
- Maximum 5 active habits (focus constraint)

### Today View
- Habits grouped by time (Morning/Afternoon/Evening)
- One-tap completion (no popups or friction)
- Current streak display per habit
- Clean, card-based interface

### Dashboard & Metrics
- **Daily Completion %**: Today's completion rate
- **Consistency Score**: 14-day rolling average (guilt-free labels)
- **Habit Streaks**: Individual habit momentum
- **Gentle motivation**: Non-pushy, supportive messages

## 📊 Calculation Logic

### Daily Completion Percentage
```
(Completed Habits Today ÷ Active Habits Scheduled Today) × 100
```

### Consistency Score (14-day rolling)
```
Average of Daily Completion % over last 14 days
```

### Consistency Labels (Non-punitive)
- 0–39% → "Getting started"
- 40–69% → "Building rhythm"  
- 70–89% → "Consistent"
- 90–100% → "Strong identity forming"

### Habit Streaks
- Consecutive scheduled days completed (per habit)
- Resets neutrally when missed
- No global streak (reduces pressure)

## 🏗️ Technical Architecture

### Core Models
- `AtomicHabit`: Habit definition with identity-based structure
- `HabitCompletion`: Daily completion tracking
- `AtomicMetrics`: Calculation engine for all metrics

### Components
- `AtomicHabitsTracker`: Main container with state management
- `HabitCreationDialog`: Guided habit creation with identity helpers
- `TodayView`: Time-grouped habit display with completion
- `Dashboard`: Metrics overview with motivational messaging

### Data Persistence
- Local storage for offline-first experience
- JSON serialization of habits and completions
- Automatic save on state changes

## 🚀 Usage

### Demo Mode
Visit `?demo=atomic` to see the standalone Atomic Habits tracker with sample data.

### Integration
The tracker can be integrated into existing apps by importing `AtomicHabitsTracker` component.

### Sample Data
Pre-loaded with realistic habit examples:
- "I am a person who walks for 10 minutes"
- "I am a person who reads one page"
- "I am a person who writes three sentences"
- "I am a person who drinks a glass of water"

## 🎨 UI/UX Principles

### Mobile-First Design
- Touch-friendly interactions
- Bottom navigation for easy thumb access
- Responsive layout for all screen sizes

### Calm Interface
- Soft, neutral colors
- Minimal visual clutter
- Smooth transitions and animations
- No red/warning colors for missed habits

### Accessibility
- High contrast ratios
- Large touch targets (44px minimum)
- Clear typography hierarchy
- Screen reader friendly

## 📱 Key Interactions

1. **Create Habit**: Floating action button → guided form with identity helpers
2. **Complete Habit**: Single tap checkbox (immediate feedback)
3. **View Progress**: Switch between Today and Dashboard views
4. **Track Consistency**: Visual progress bars and streak indicators

## 🔄 State Management

Simple, predictable state flow:
1. Load habits and completions from localStorage
2. Calculate metrics using AtomicMetrics utility
3. Render current view with computed data
4. Save changes automatically on user actions

## 🎯 Success Metrics

The app measures success through:
- **Presence over perfection**: Focus on showing up
- **Identity reinforcement**: Language that builds self-concept
- **Sustainable momentum**: Realistic expectations and gentle guidance
- **Long-term consistency**: 14-day rolling averages smooth out bad days

---

*"You do not rise to the level of your goals. You fall to the level of your systems."* - James Clear