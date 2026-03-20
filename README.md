# Life Tracker - React Edition

A modern, optimized React application for tracking finances and habits with Firebase backend.

## 🚀 Features

- **Finance Management**
  - Track income, expenses, and transfers
  - Multiple payment methods
  - Category-based budgeting
  - Monthly/yearly reports
  - Real-time balance calculations

- **Habit Tracking**
  - Daily habit check-ins
  - Streak tracking
  - Simple and intuitive interface

- **Authentication**
  - Secure Firebase authentication
  - Email/password login
  - User data isolation

## 🏗️ Architecture

### Tech Stack
- **React 18** - UI framework
- **Vite** - Build tool for fast development
- **Zustand** - Lightweight state management
- **Firebase** - Authentication & Firestore database
- **React Hot Toast** - Toast notifications

### Project Structure
```
src/
├── components/
│   ├── Auth/           # Authentication screens
│   ├── Finance/        # Finance tracking components
│   ├── Habits/         # Habit tracking components
│   └── Profile/        # User profile
├── store/              # Zustand state management
│   ├── authStore.js    # Authentication state
│   ├── financeStore.js # Finance data & logic
│   └── habitStore.js   # Habit data & logic
├── config/             # Configuration files
│   └── firebase.js     # Firebase initialization
├── styles/             # Global styles
└── App.jsx             # Main app component
```

### State Management
- **Zustand stores** for clean, performant state management
- Separate stores for auth, finance, and habits
- Automatic Firebase sync on data changes
- Optimistic UI updates

### Performance Optimizations
- Code splitting with Vite
- Lazy loading of components
- Memoized selectors in stores
- Efficient re-render prevention
- Optimized bundle size with tree-shaking

## 📦 Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Deploy to Firebase:
```bash
npm run deploy
```

## 🔧 Configuration

Firebase configuration is in `src/config/firebase.js`. Update with your Firebase project credentials.

## 🎯 Key Improvements Over Original

1. **Modern React Architecture**
   - Functional components with hooks
   - Clean component composition
   - Proper separation of concerns

2. **Better State Management**
   - Zustand instead of localStorage
   - Centralized business logic
   - Predictable state updates

3. **Performance**
   - Virtual DOM optimization
   - Efficient re-renders
   - Code splitting
   - Smaller bundle size

4. **Developer Experience**
   - Hot module replacement
   - Better debugging
   - TypeScript-ready structure
   - Clean code organization

5. **User Experience**
   - Smooth animations
   - Better loading states
   - Improved error handling
   - Toast notifications

## 📱 Mobile Responsive

Fully responsive design optimized for mobile devices with touch-friendly interactions.

## 🔐 Security

- Firebase security rules enforced
- User data isolation
- Secure authentication flow
- No sensitive data in client code

## 🚢 Deployment

The app is configured for Firebase Hosting. Run `npm run deploy` to build and deploy.

## 📄 License

MIT
