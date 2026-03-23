# Deployment Guide - Life Tracker

Complete guide to deploy the Life Tracker application to production.

---

## 🚀 Pre-Deployment Checklist

### Code Quality
- [ ] All tests passed (see TESTING_CHECKLIST.md)
- [ ] No console errors
- [ ] No console warnings
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Git committed and pushed

### Performance
- [ ] Build size optimized
- [ ] Images compressed
- [ ] Unused code removed
- [ ] Bundle analyzed

### Security
- [ ] Environment variables secured
- [ ] API keys not exposed
- [ ] HTTPS enabled
- [ ] CORS configured

---

## 📦 Build for Production

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Production Build
```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

### 3. Test Production Build Locally
```bash
npm run preview
```

Open [http://localhost:4173](http://localhost:4173) and test all features.

### 4. Verify Build
- [ ] All pages load correctly
- [ ] All features work
- [ ] No console errors
- [ ] Assets load properly
- [ ] Routing works (if applicable)

---

## 🌐 Deployment Options

### Option 1: Firebase Hosting (Recommended)

#### Setup
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase
firebase init hosting
```

#### Configuration
Select these options:
- Public directory: `dist`
- Single-page app: `Yes`
- Automatic builds: `No` (or Yes for GitHub integration)

#### Deploy
```bash
# Build first
npm run build

# Deploy
firebase deploy --only hosting
```

#### Custom Domain (Optional)
1. Go to Firebase Console
2. Hosting → Add custom domain
3. Follow DNS configuration steps

---

### Option 2: Vercel

#### Via CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

#### Via GitHub Integration
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import GitHub repository
4. Configure:
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
5. Deploy

---

### Option 3: Netlify

#### Via CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

#### Via GitHub Integration
1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. New site from Git
4. Select repository
5. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Deploy

#### Netlify Configuration
Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Option 4: GitHub Pages

#### Setup
1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Update `package.json`:
```json
{
  "homepage": "https://yourusername.github.io/life-tracker",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. Update `vite.config.js`:
```javascript
export default defineConfig({
  base: '/life-tracker/',
  // ... other config
})
```

#### Deploy
```bash
npm run deploy
```

---

### Option 5: Custom Server (VPS/Cloud)

#### Requirements
- Node.js installed
- Nginx or Apache
- SSL certificate

#### Steps
1. Build the app:
```bash
npm run build
```

2. Copy `dist/` folder to server:
```bash
scp -r dist/* user@server:/var/www/life-tracker/
```

3. Configure Nginx:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/life-tracker;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

4. Enable HTTPS with Let's Encrypt:
```bash
sudo certbot --nginx -d yourdomain.com
```

---

## 🔧 Environment Variables

### Production Environment
Create `.env.production`:
```env
VITE_FIREBASE_API_KEY=your_production_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_production_auth_domain
VITE_FIREBASE_DATABASE_URL=your_production_database_url
VITE_FIREBASE_PROJECT_ID=your_production_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_production_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_production_sender_id
VITE_FIREBASE_APP_ID=your_production_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_production_measurement_id
```

### Security Notes
- Never commit `.env` files to Git
- Use different Firebase projects for dev/prod
- Rotate API keys regularly
- Enable Firebase security rules

---

## 📊 Post-Deployment

### 1. Verify Deployment
- [ ] Visit production URL
- [ ] Test all features
- [ ] Check console for errors
- [ ] Test on mobile devices
- [ ] Test on different browsers

### 2. Monitor Performance
- [ ] Set up Google Analytics (optional)
- [ ] Monitor Firebase usage
- [ ] Check error logs
- [ ] Monitor load times

### 3. Set Up Monitoring
```javascript
// Add to src/main.jsx
if (import.meta.env.PROD) {
  // Error tracking
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // Send to error tracking service
  });
}
```

---

## 🔄 Continuous Deployment

### GitHub Actions (Firebase)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: your-project-id
```

### Vercel/Netlify
- Automatic deployment on push to main branch
- Preview deployments for pull requests
- Rollback capability

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Assets Not Loading
- Check `base` in `vite.config.js`
- Verify asset paths are relative
- Check CORS settings

### Routing Issues
- Ensure server redirects all routes to index.html
- Check Firebase hosting configuration
- Verify Netlify redirects

### Performance Issues
```bash
# Analyze bundle
npm run build -- --mode analyze

# Check bundle size
ls -lh dist/assets/
```

---

## 📈 Optimization

### Before Deployment
1. **Code Splitting**
```javascript
// Lazy load components
const InsightsTab = lazy(() => import('./components/Insights/InsightsTab'));
```

2. **Image Optimization**
- Compress images
- Use WebP format
- Lazy load images

3. **Bundle Analysis**
```bash
npm install --save-dev rollup-plugin-visualizer
```

4. **Minification**
- Already handled by Vite
- Verify in build output

---

## 🔒 Security Checklist

### Before Going Live
- [ ] Environment variables secured
- [ ] Firebase security rules configured
- [ ] HTTPS enabled
- [ ] CORS configured properly
- [ ] API keys restricted
- [ ] Rate limiting enabled
- [ ] Input validation in place
- [ ] XSS protection enabled
- [ ] CSRF protection (if needed)

### Firebase Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /transactions/{transaction} {
      allow read, write: if request.auth != null;
    }
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

---

## 📱 PWA Setup (Optional)

### 1. Install Vite PWA Plugin
```bash
npm install -D vite-plugin-pwa
```

### 2. Configure
```javascript
// vite.config.js
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Life Tracker',
        short_name: 'LifeTracker',
        description: 'Personal finance tracker',
        theme_color: '#4f46e5',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
```

---

## 🎯 Launch Checklist

### Final Steps
- [ ] All tests passed
- [ ] Production build successful
- [ ] Environment variables configured
- [ ] Domain configured (if custom)
- [ ] SSL certificate active
- [ ] Analytics set up (optional)
- [ ] Error monitoring set up
- [ ] Backup plan ready
- [ ] Rollback plan ready
- [ ] Team notified
- [ ] Documentation updated
- [ ] Announcement prepared

### Go Live!
```bash
# Final build
npm run build

# Deploy
firebase deploy --only hosting
# or
vercel --prod
# or
netlify deploy --prod
```

---

## 📞 Support

### If Something Goes Wrong
1. Check deployment logs
2. Verify environment variables
3. Test locally with production build
4. Check browser console
5. Review Firebase/hosting logs
6. Rollback if necessary

### Rollback
```bash
# Firebase
firebase hosting:rollback

# Vercel
vercel rollback

# Netlify
# Use Netlify dashboard to rollback
```

---

## 🎉 Post-Launch

### Announce
- [ ] Share with users
- [ ] Post on social media
- [ ] Update documentation
- [ ] Celebrate! 🎊

### Monitor
- [ ] Check error logs daily
- [ ] Monitor performance
- [ ] Gather user feedback
- [ ] Plan improvements

---

**Ready to deploy? Follow this guide step by step!** 🚀

**Recommended:** Start with Firebase Hosting or Vercel for easiest deployment.
