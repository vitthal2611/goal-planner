# Minimal Android-like Envelope Expense Tracker

## 🎯 Core Features

**Envelope-Centric Design**: Tap any envelope → Add expense instantly
**Android Material UI**: Modern cards with elevation and animations  
**Mobile-First**: Touch-optimized with haptic feedback
**Real-time Updates**: Balance changes immediately

## 🚀 Usage

```jsx
import ExpenseApp from './components/ExpenseApp';

function App() {
  return <ExpenseApp />;
}
```

## 📱 User Flow

1. **Tap envelope card** → Quick form appears
2. **Enter amount** → Auto-focus input field  
3. **Tap "Add"** → Expense added, balance updated
4. **Haptic feedback** → Confirms action on mobile

## 🎨 Key Components

### EnvelopeCard
- **Visual Status**: Red (over budget), Yellow (80%+), Green (healthy)
- **Progress Bar**: Animated spending visualization
- **One-Tap Entry**: Click anywhere to add expense
- **Touch Feedback**: Scale animation on press

### ExpenseApp  
- **Today's Summary**: Current day spending total
- **Responsive Grid**: Auto-fit envelope cards
- **Recent Transactions**: Last 5 transactions shown
- **Gradient Header**: Modern Android-style header

## 📊 Sample Data
- 6 envelope categories with realistic budgets
- Color-coded status indicators
- Real-time balance calculations
- Transaction history tracking

## 🔧 Minimal Implementation
- **2 Components**: EnvelopeCard + ExpenseApp
- **1 CSS File**: Material Design styles
- **Zero Dependencies**: Pure React hooks
- **Mobile Optimized**: 16px fonts prevent iOS zoom

Perfect for quick expense tracking with maximum usability!