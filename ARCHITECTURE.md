# Architecture Documentation

## System Overview

Life Tracker is a modern React application built with performance and maintainability in mind. It uses a component-based architecture with centralized state management.

## Technology Stack

### Frontend
- **React 18.2** - UI library with concurrent features
- **Vite 5.0** - Fast build tool and dev server
- **Zustand 4.4** - Lightweight state management
- **React Hot Toast 2.4** - Toast notifications

### Backend
- **Firebase Auth** - User authentication
- **Firestore** - NoSQL database
- **Firebase Hosting** - Static hosting

### Build & Deploy
- **Vite** - Module bundler with HMR
- **Firebase CLI** - Deployment tools

## Architecture Patterns

### Component Architecture

```
App (Root)
├── AuthScreen (Unauthenticated)
│   └── Login/Signup Form
└── MainApp (Authenticated)
    ├── Header
    │   └── Profile Button
    ├── Tabs
    │   ├── FinanceTab
    │   │   ├── DateSelectors
    │   │   ├── BalanceSummary
    │   │   ├── PaymentBalances
    │   │   ├── QuickActions
    │   │   └── TransactionList
    │   └── HabitsTab
    │       ├── HabitsList
    │       └── AddHabitForm
    └── Modals
        ├── ProfileModal
        └── SettingsModal
```

### State Management

**Zustand Stores:**

1. **authStore** - Authentication state
   - User object
   - Loading state
   - Auth methods (login, signup, logout)

2. **financeStore** - Finance data and logic
   - Payment methods
   - Envelopes (categories)
   - Transactions
   - Budgets
   - Filtering logic
   - Balance calculations

3. **habitStore** - Habit tracking
   - Habits list
   - Check-ins
   - Streak calculations
   - Milestones

### Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
Zustand Store Action
    ↓
State Update (Optimistic)
    ↓
Firebase Sync (Background)
    ↓
UI Re-render (Automatic)
```

### Performance Optimizations

1. **Code Splitting**
   - Vendor chunks separated
   - React and Firebase in separate bundles
   - Lazy loading ready

2. **State Optimization**
   - Zustand selectors prevent unnecessary re-renders
   - Computed values cached
   - Minimal state updates

3. **Bundle Optimization**
   - Tree-shaking enabled
   - Minification with Terser
   - CSS extraction
   - Asset optimization

4. **Runtime Optimization**
   - React 18 concurrent features
   - Automatic batching
   - Transition API ready
   - Memoization where needed

## Security Architecture

### Authentication Flow
```
User → Firebase Auth → JWT Token → Firestore Rules
```

### Data Security
- User data isolated by UID
- Firestore security rules enforce access control
- No sensitive data in client code
- HTTPS only

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }
  }
}
```

## File Structure

```
life-tracker-react/
├── public/                 # Old vanilla JS app (backup)
├── src/
│   ├── components/
│   │   ├── Auth/          # Authentication components
│   │   │   ├── AuthScreen.jsx
│   │   │   └── AuthScreen.css
│   │   ├── Finance/       # Finance tracking
│   │   │   ├── FinanceTab.jsx
│   │   │   ├── FinanceTab.css
│   │   │   ├── BalanceSummary.jsx
│   │   │   ├── PaymentBalances.jsx
│   │   │   ├── QuickActions.jsx
│   │   │   ├── TransactionList.jsx
│   │   │   └── SettingsModal.jsx
│   │   ├── Habits/        # Habit tracking
│   │   │   ├── HabitsTab.jsx
│   │   │   └── HabitsTab.css
│   │   ├── Profile/       # User profile
│   │   │   └── ProfileModal.jsx
│   │   ├── MainApp.jsx    # Main container
│   │   └── MainApp.css
│   ├── store/             # State management
│   │   ├── authStore.js
│   │   ├── financeStore.js
│   │   └── habitStore.js
│   ├── config/            # Configuration
│   │   └── firebase.js
│   ├── styles/            # Global styles
│   │   └── global.css
│   ├── App.jsx            # Root component
│   └── main.jsx           # Entry point
├── index.html             # HTML template
├── vite.config.js         # Vite configuration
├── package.json           # Dependencies
├── firebase.json          # Firebase config
└── README.md              # Documentation
```

## Design Patterns

### Container/Presentational Pattern
- Smart components (containers) handle logic
- Dumb components (presentational) handle UI
- Clear separation of concerns

### Custom Hooks Pattern
- Reusable logic in hooks
- Store hooks for state access
- Effect hooks for side effects

### Composition Pattern
- Small, focused components
- Compose complex UIs from simple parts
- Props for configuration

## API Integration

### Firebase SDK Usage

**Authentication:**
```javascript
import { auth } from './config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

await signInWithEmailAndPassword(auth, email, password);
```

**Firestore:**
```javascript
import { db } from './config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const docRef = doc(db, 'users', userId);
await setDoc(docRef, data, { merge: true });
```

## Error Handling

### Levels
1. **Component Level** - Try/catch in event handlers
2. **Store Level** - Error state in stores
3. **Global Level** - Toast notifications

### Strategy
- User-friendly error messages
- Console logging for debugging
- Graceful degradation
- Retry mechanisms where appropriate

## Testing Strategy (Future)

### Unit Tests
- Store logic
- Utility functions
- Component logic

### Integration Tests
- User flows
- Store interactions
- Firebase mocks

### E2E Tests
- Critical user journeys
- Authentication flow
- Data persistence

## Deployment Pipeline

### Development
```bash
npm run dev → Vite Dev Server → Hot Reload
```

### Production
```bash
npm run build → Vite Build → dist/ → Firebase Hosting
```

### CI/CD (Recommended)
```
Git Push → GitHub Actions → Build → Test → Deploy
```

## Monitoring & Analytics

### Recommended Tools
- Firebase Analytics
- Firebase Performance Monitoring
- Sentry for error tracking
- Lighthouse for performance audits

## Scalability Considerations

### Current Limits
- Firestore: 1 write/second per document
- Auth: 10 requests/second per IP
- Hosting: 10GB storage, 360MB/day transfer (free tier)

### Scaling Strategy
1. Implement pagination for large lists
2. Use Firestore indexes for complex queries
3. Cache frequently accessed data
4. Implement offline support with service workers
5. Consider Firebase Functions for heavy operations

## Future Enhancements

### Planned Features
- [ ] Offline support with PWA
- [ ] Data export/import
- [ ] Charts and analytics
- [ ] Recurring transactions
- [ ] Budget alerts
- [ ] Multi-currency support
- [ ] Dark mode
- [ ] Collaborative features

### Technical Debt
- Add comprehensive testing
- Implement error boundaries
- Add loading skeletons
- Optimize images
- Add service worker
- Implement code splitting for routes

## Contributing Guidelines

### Code Style
- Use functional components
- Prefer hooks over classes
- Keep components small (<200 lines)
- Use meaningful variable names
- Comment complex logic

### Git Workflow
- Feature branches from main
- Descriptive commit messages
- PR reviews required
- Squash merge to main

### Performance Budget
- Initial bundle: <200KB gzipped
- Time to Interactive: <3s on 3G
- Lighthouse score: >90

## Resources

- [React Documentation](https://react.dev)
- [Zustand Documentation](https://zustand-demo.pmnd.rs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Documentation](https://vitejs.dev)
