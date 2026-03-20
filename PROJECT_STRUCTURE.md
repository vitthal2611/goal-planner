# Project Structure

Visual guide to the Life Tracker React project organization.

## 📁 Complete Directory Structure

```
life-tracker-react/
│
├── 📄 Documentation Files
│   ├── README.md                    # Main documentation
│   ├── GETTING_STARTED.md          # ⭐ Start here!
│   ├── QUICKSTART.md               # 5-minute setup
│   ├── SETUP.md                    # Detailed setup
│   ├── ARCHITECTURE.md             # Technical details
│   ├── MIGRATION_GUIDE.md          # Migration from old version
│   ├── PROJECT_SUMMARY.md          # What was accomplished
│   ├── CHECKLIST.md                # Pre-launch checklist
│   ├── DOCS_INDEX.md               # Documentation index
│   └── PROJECT_STRUCTURE.md        # This file
│
├── 📦 Configuration Files
│   ├── package.json                # Dependencies & scripts
│   ├── package-lock.json           # Locked dependencies
│   ├── vite.config.js              # Vite build config
│   ├── firebase.json               # Firebase hosting config
│   ├── firestore.rules             # Firestore security rules
│   ├── firestore.indexes.json      # Firestore indexes
│   ├── .gitignore                  # Git ignore rules
│   ├── .env.example                # Environment variables template
│   └── deploy.sh                   # Deployment script
│
├── 🌐 Entry Points
│   ├── index.html                  # HTML template
│   └── src/
│       └── main.jsx                # JavaScript entry point
│
├── ⚛️ React Application (src/)
│   │
│   ├── 📱 App.jsx                  # Root component
│   │
│   ├── 🎨 styles/
│   │   └── global.css              # Global styles & CSS variables
│   │
│   ├── ⚙️ config/
│   │   └── firebase.js             # Firebase initialization
│   │
│   ├── 🗄️ store/                   # State Management (Zustand)
│   │   ├── authStore.js            # Authentication state
│   │   ├── financeStore.js         # Finance data & logic
│   │   └── habitStore.js           # Habit data & logic
│   │
│   └── 🧩 components/              # React Components
│       │
│       ├── MainApp.jsx             # Main app container
│       ├── MainApp.css             # Main app styles
│       │
│       ├── 🔐 Auth/                # Authentication
│       │   ├── AuthScreen.jsx      # Login/Signup screen
│       │   └── AuthScreen.css      # Auth styles
│       │
│       ├── 💰 Finance/             # Finance Tracking
│       │   ├── FinanceTab.jsx      # Main finance tab
│       │   ├── FinanceTab.css      # Finance styles
│       │   ├── BalanceSummary.jsx  # Income/Expense summary
│       │   ├── PaymentBalances.jsx # Payment method balances
│       │   ├── QuickActions.jsx    # Quick add income/expense
│       │   ├── TransactionList.jsx # Transaction history
│       │   └── SettingsModal.jsx   # Settings (payment methods, categories)
│       │
│       ├── ✅ Habits/              # Habit Tracking
│       │   ├── HabitsTab.jsx       # Main habits tab
│       │   └── HabitsTab.css       # Habits styles
│       │
│       └── 👤 Profile/             # User Profile
│           └── ProfileModal.jsx    # Profile & logout
│
├── 📦 Old Application (Backup)
│   └── public/
│       ├── index.html              # Old vanilla JS app
│       ├── finance.js              # Old finance logic
│       ├── habits.js               # Old habits logic
│       ├── notifications.js        # Old notifications
│       └── habit-fab.css           # Old styles
│
├── 🔥 Firebase
│   └── .firebase/                  # Firebase cache
│
└── 🏗️ Build Output
    ├── dist/                       # Production build (generated)
    └── node_modules/               # Dependencies (generated)
```

## 🎯 Key Directories Explained

### `/src` - React Application Source
The heart of your application. All React components, stores, and configuration.

**What's inside:**
- Components organized by feature
- Zustand stores for state management
- Firebase configuration
- Global styles

### `/src/components` - UI Components
Modular, reusable React components organized by feature.

**Organization:**
- `Auth/` - Login and signup
- `Finance/` - All finance-related components
- `Habits/` - Habit tracking components
- `Profile/` - User profile and settings

### `/src/store` - State Management
Zustand stores containing business logic and state.

**Stores:**
- `authStore.js` - User authentication
- `financeStore.js` - Financial data and calculations
- `habitStore.js` - Habit tracking and streaks

### `/public` - Old Application
Your original vanilla JavaScript app, kept as backup.

**Purpose:**
- Backup in case of issues
- Reference for features
- Can run alongside new app

## 📊 Component Hierarchy

```
App
└── user ? MainApp : AuthScreen

AuthScreen
├── Login Form
└── Signup Form

MainApp
├── Header
│   └── Profile Button → ProfileModal
├── Tabs
│   ├── Finance Tab (active)
│   └── Habits Tab
└── Tab Content
    ├── FinanceTab
    │   ├── Date Selectors
    │   ├── Settings Button → SettingsModal
    │   ├── BalanceSummary
    │   ├── PaymentBalances
    │   ├── QuickActions
    │   └── TransactionList
    └── HabitsTab
        ├── Add Habit Form
        └── Habits List
```

## 🔄 Data Flow

```
User Interaction
      ↓
Component Event Handler
      ↓
Zustand Store Action
      ↓
State Update (Optimistic UI)
      ↓
Firebase Sync (Background)
      ↓
Component Re-render (Automatic)
```

## 📦 Build Process

```
Source Code (src/)
      ↓
Vite Build Process
      ↓
Optimization
  ├── Code Splitting
  ├── Minification
  ├── Tree Shaking
  └── Asset Optimization
      ↓
Production Bundle (dist/)
      ↓
Firebase Hosting
```

## 🎨 Styling Architecture

```
global.css (CSS Variables)
      ↓
Component-Specific CSS
  ├── MainApp.css
  ├── AuthScreen.css
  ├── FinanceTab.css
  └── HabitsTab.css
```

## 🗄️ State Management

```
Zustand Stores
├── authStore
│   ├── user
│   ├── loading
│   └── methods (signIn, signUp, logout)
│
├── financeStore
│   ├── paymentMethods
│   ├── envelopes
│   ├── transactions
│   ├── budgets
│   └── methods (add, delete, filter)
│
└── habitStore
    ├── habits
    ├── habitCheckins
    └── methods (add, delete, toggle)
```

## 🔥 Firebase Structure

```
Firebase Project
├── Authentication
│   └── Email/Password Users
│
├── Firestore Database
│   └── users/
│       └── {userId}/
│           ├── paymentMethods: []
│           ├── envelopes: []
│           ├── transactions: []
│           ├── budgets: []
│           ├── habits: []
│           └── habitCheckins: []
│
└── Hosting
    └── dist/ (deployed files)
```

## 📝 File Naming Conventions

### Components
- **PascalCase**: `FinanceTab.jsx`, `AuthScreen.jsx`
- **Descriptive**: Name reflects purpose
- **Paired CSS**: `FinanceTab.css` for `FinanceTab.jsx`

### Stores
- **camelCase**: `authStore.js`, `financeStore.js`
- **Suffix**: Always ends with `Store`

### Utilities
- **camelCase**: `firebase.js`, `helpers.js`
- **Descriptive**: Clear purpose

## 🎯 Import Patterns

```javascript
// External dependencies
import { useState } from 'react';
import toast from 'react-hot-toast';

// Internal stores
import { useAuthStore } from '../../store/authStore';

// Internal components
import BalanceSummary from './BalanceSummary';

// Styles
import './FinanceTab.css';
```

## 📊 Size Breakdown (Approximate)

```
Total Project Size: ~15MB
├── node_modules/: ~14MB (dependencies)
├── src/: ~100KB (your code)
├── public/: ~200KB (old app backup)
├── docs/: ~50KB (documentation)
└── config/: ~10KB (configuration)

Production Build: ~250KB gzipped
├── React vendor: ~40KB
├── Firebase vendor: ~60KB
├── App code: ~100KB
└── Styles: ~50KB
```

## 🚀 Deployment Structure

```
Local Development
      ↓
npm run build
      ↓
dist/ folder created
      ↓
firebase deploy
      ↓
Firebase Hosting
      ↓
Live URL
```

## 🔍 Finding Files

### "Where is the login screen?"
`src/components/Auth/AuthScreen.jsx`

### "Where is the finance logic?"
`src/store/financeStore.js`

### "Where are the styles?"
- Global: `src/styles/global.css`
- Component: Next to component file (e.g., `FinanceTab.css`)

### "Where is Firebase configured?"
`src/config/firebase.js`

### "Where are the transactions displayed?"
`src/components/Finance/TransactionList.jsx`

### "Where is the habit tracking?"
`src/components/Habits/HabitsTab.jsx`

## 📚 Related Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Detailed technical architecture
- **[README.md](README.md)** - Project overview
- **[GETTING_STARTED.md](GETTING_STARTED.md)** - Getting started guide

---

**Tip**: Use your IDE's file search (Ctrl+P / Cmd+P) to quickly find files!
