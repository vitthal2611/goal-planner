# 🚀 Production Deployment Guide

## ✅ Production Ready Checklist

### 1. Firebase Configuration
- ✅ Firebase Realtime Database configured
- ✅ Security rules deployed
- ✅ Authentication enabled (Google + Email)
- ✅ Environment variables set

### 2. Build Optimizations
- ✅ Code splitting (vendor, mui chunks)
- ✅ Minification enabled
- ✅ Source maps disabled
- ✅ Error boundary added

### 3. Performance
- ✅ Lazy loading components
- ✅ Optimized bundle size
- ✅ Firebase offline persistence

---

## 🌐 Deploy to Netlify

### Quick Deploy
```bash
npm run build
netlify deploy --prod --dir=dist
```

### First Time Setup
1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login to Netlify:
```bash
netlify login
```

3. Initialize site:
```bash
netlify init
```

4. Deploy:
```bash
npm run deploy
```

### Environment Variables
Add these in Netlify dashboard (Site settings → Environment variables):
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_DATABASE_URL=your_database_url
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 🔥 Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Add environment variables in Vercel dashboard.

---

## 📦 Deploy to GitHub Pages

1. Update `package.json`:
```json
"homepage": "https://yourusername.github.io/planner"
```

2. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

3. Add deploy script:
```json
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"
```

4. Deploy:
```bash
npm run deploy
```

---

## 🔒 Security Checklist

- ✅ Firebase security rules deployed
- ✅ Environment variables not in code
- ✅ HTTPS enabled
- ✅ User data isolated
- ✅ Error handling in place

---

## 📊 Performance Metrics

Target metrics:
- Bundle size: < 200KB gzipped
- First paint: < 1s
- Time to interactive: < 2s
- Lighthouse score: 90+

Check with:
```bash
npm run build
npm run preview
```

---

## 🐛 Troubleshooting

### Build fails
```bash
rm -rf node_modules dist
npm install
npm run build
```

### Firebase not connecting
- Check environment variables
- Verify Firebase config in console
- Check browser console for errors

### Deployment issues
- Clear build cache
- Check Netlify/Vercel logs
- Verify all dependencies installed

---

## 🎯 Post-Deployment

1. Test all features:
   - ✅ User authentication
   - ✅ Goal creation
   - ✅ Habit tracking
   - ✅ Data persistence
   - ✅ Real-time sync

2. Monitor:
   - Firebase usage
   - Error logs
   - User feedback

3. Optimize:
   - Review bundle size
   - Check load times
   - Monitor Firebase costs

---

## 📱 PWA Features (Optional)

To enable PWA:
```bash
npm install vite-plugin-pwa
```

Update `vite.config.js` with PWA plugin.

---

## ✨ Your app is production-ready!

Deploy with confidence. All critical features are tested and optimized.