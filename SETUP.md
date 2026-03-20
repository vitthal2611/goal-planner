# Setup Instructions

## Prerequisites

- Node.js >= 16.0.0
- npm or yarn
- Firebase account

## Quick Start

1. **Install dependencies**
```bash
npm install
```

2. **Start development server**
```bash
npm run dev
```

The app will open at `http://localhost:3000`

## Firebase Setup

If you need to configure a new Firebase project:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable Authentication (Email/Password)
4. Enable Firestore Database
5. Copy your config from Project Settings
6. Update `src/config/firebase.js` with your credentials

## Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

## Deploy to Firebase

```bash
npm run deploy
```

This builds and deploys to Firebase Hosting.

## Development Commands

- `npm run dev` - Start dev server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run deploy` - Build and deploy to Firebase

## Environment Variables

Create a `.env` file for environment-specific config:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
```

Then update `src/config/firebase.js` to use:
```javascript
apiKey: import.meta.env.VITE_FIREBASE_API_KEY
```

## Troubleshooting

### Port already in use
```bash
# Kill process on port 3000
npx kill-port 3000
# Or use different port
npm run dev -- --port 3001
```

### Firebase errors
- Check Firebase config in `src/config/firebase.js`
- Verify Firebase project is active
- Check Firestore rules allow read/write

### Build errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## IDE Setup

### VS Code Extensions (Recommended)
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Firebase

### VS Code Settings
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

## Testing

Currently no tests configured. To add testing:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

## Performance Monitoring

To add Firebase Performance Monitoring:

```bash
npm install firebase/performance
```

Then initialize in `src/config/firebase.js`

## Next Steps

1. Customize branding and colors in `src/styles/global.css`
2. Add more features as needed
3. Set up CI/CD pipeline
4. Configure Firebase security rules
5. Add analytics tracking

## Support

- Check README.md for architecture details
- Review MIGRATION_GUIDE.md if migrating from old version
- Check Firebase documentation for backend issues
