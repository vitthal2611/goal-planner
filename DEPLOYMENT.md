# Deployment & Production Guide

## 🚀 Quick Deploy

### Option 1: Netlify (Recommended)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=build
```

### Option 2: Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (auto-detects React)
vercel --prod
```

### Option 3: GitHub Pages
```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json
"homepage": "https://yourusername.github.io/planner",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}

# Deploy
npm run deploy
```

---

## 📦 Build Process

### Development Build
```bash
npm start
# Runs on http://localhost:3000
# Hot reload enabled
# Source maps included
```

### Production Build
```bash
npm run build
# Creates optimized build in /build folder
# Minified and compressed
# Ready for deployment
```

### Build Output
```
build/
├── static/
│   ├── css/
│   │   └── main.[hash].css
│   ├── js/
│   │   ├── main.[hash].js
│   │   └── [chunk].[hash].js
│   └── media/
├── index.html
└── manifest.json
```

---

## 🔧 Environment Configuration

### Create .env files

**.env.development**
```bash
REACT_APP_ENV=development
REACT_APP_VERSION=1.0.0
```

**.env.production**
```bash
REACT_APP_ENV=production
REACT_APP_VERSION=1.0.0
REACT_APP_API_URL=https://api.yourapp.com
```

### Access in Code
```javascript
const apiUrl = process.env.REACT_APP_API_URL;
const version = process.env.REACT_APP_VERSION;
```

---

## 🌐 Hosting Platforms

### Netlify Configuration

**netlify.toml**
```toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

**Features:**
- ✅ Automatic HTTPS
- ✅ CDN distribution
- ✅ Continuous deployment
- ✅ Free tier available
- ✅ Custom domains

### Vercel Configuration

**vercel.json**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

**Features:**
- ✅ Edge network
- ✅ Automatic HTTPS
- ✅ GitHub integration
- ✅ Preview deployments
- ✅ Free tier available

### AWS S3 + CloudFront

**Deploy Script**
```bash
# Build
npm run build

# Upload to S3
aws s3 sync build/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

**Features:**
- ✅ Highly scalable
- ✅ Low cost
- ✅ Full AWS integration
- ✅ Custom configurations

---

## 🔒 Security Checklist

### Pre-Deployment
- [ ] Remove console.log statements
- [ ] Remove debug code
- [ ] Check for exposed secrets
- [ ] Validate environment variables
- [ ] Test in production mode locally
- [ ] Run security audit: `npm audit`
- [ ] Update dependencies: `npm update`

### Post-Deployment
- [ ] Enable HTTPS
- [ ] Set security headers
- [ ] Configure CSP (Content Security Policy)
- [ ] Enable HSTS
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Monitor error logs

### Security Headers (Netlify)

**_headers**
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com
```

---

## 📊 Performance Optimization

### Build Optimizations

**1. Code Splitting**
```javascript
// Lazy load sections
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./components/dashboard/DashboardScreen'));
const Review = lazy(() => import('./components/review/Review'));

// Use with Suspense
<Suspense fallback={<CircularProgress />}>
  <Dashboard />
</Suspense>
```

**2. Bundle Analysis**
```bash
# Install analyzer
npm install --save-dev webpack-bundle-analyzer

# Add to package.json
"analyze": "source-map-explorer 'build/static/js/*.js'"

# Run analysis
npm run build
npm run analyze
```

**3. Image Optimization**
- Use WebP format
- Compress images
- Lazy load images
- Use appropriate sizes

**4. Font Optimization**
```html
<!-- Preload fonts -->
<link rel="preload" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" as="style">
```

### Runtime Optimizations

**1. Memoization**
```javascript
import { useMemo, useCallback } from 'react';

// Memoize expensive calculations
const goalStats = useMemo(() => 
  goals.map(goal => calculateGoalProgress(goal)),
  [goals]
);

// Memoize callbacks
const handleUpdate = useCallback((id, value) => {
  updateGoal(id, value);
}, [updateGoal]);
```

**2. Component Memoization**
```javascript
import { memo } from 'react';

export const HabitCard = memo(({ habit, log, onToggle }) => {
  // Component code
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.habit.id === nextProps.habit.id &&
         prevProps.log?.status === nextProps.log?.status;
});
```

**3. Virtualization (for large lists)**
```bash
npm install react-window
```

```javascript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={habits.length}
  itemSize={100}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <HabitCard habit={habits[index]} />
    </div>
  )}
</FixedSizeList>
```

---

## 🧪 Testing Before Deployment

### Manual Testing Checklist

**Functionality:**
- [ ] Create goal
- [ ] Update goal progress
- [ ] Delete goal
- [ ] Create habit
- [ ] Delete habit
- [ ] Log habit (done/skipped)
- [ ] Toggle dark mode
- [ ] Switch between tabs
- [ ] View dashboard metrics
- [ ] View review insights

**Data Persistence:**
- [ ] Refresh page (data persists)
- [ ] Close and reopen browser
- [ ] Clear cache (data persists)
- [ ] Test localStorage quota

**Responsive Design:**
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Mobile landscape

**Browser Compatibility:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

**Performance:**
- [ ] Load time < 3s
- [ ] Smooth animations
- [ ] No lag on interactions
- [ ] No memory leaks

### Automated Testing

**Unit Tests (Jest)**
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

**Example Test:**
```javascript
// goalUtils.test.js
import { breakdownGoalTargets, calculateGoalProgress } from './goalUtils';

describe('Goal Utilities', () => {
  test('breakdownGoalTargets calculates correctly', () => {
    const goal = {
      yearlyTarget: 24,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31')
    };
    
    const result = breakdownGoalTargets(goal);
    
    expect(result.yearly).toBe(24);
    expect(result.quarterly).toBe(6);
    expect(result.monthly).toBe(2);
    expect(result.weekly).toBeCloseTo(0.46, 2);
  });

  test('calculateGoalProgress returns correct metrics', () => {
    const goal = {
      yearlyTarget: 24,
      actualProgress: 8,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31')
    };
    
    const result = calculateGoalProgress(goal, new Date('2024-04-01'));
    
    expect(result.yearlyProgress).toBeCloseTo(33.3, 1);
    expect(result.actual).toBe(8);
    expect(result.remaining).toBe(16);
  });
});
```

**Run Tests:**
```bash
npm test
```

### E2E Tests (Cypress)

**Install Cypress:**
```bash
npm install --save-dev cypress
```

**Example E2E Test:**
```javascript
// cypress/e2e/workflow.cy.js
describe('Complete User Workflow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    localStorage.clear();
  });

  it('creates goal, habit, and logs completion', () => {
    // Create goal
    cy.contains('Goals').click();
    cy.get('input[name="title"]').type('Read 24 books');
    cy.get('input[name="yearlyTarget"]').type('24');
    cy.get('input[name="unit"]').type('books');
    cy.contains('Add Goal').click();
    
    // Verify goal appears
    cy.contains('Read 24 books').should('be.visible');
    
    // Create habit
    cy.contains('Habits').click();
    cy.get('input[name="name"]').type('Read for 30 minutes');
    cy.get('select[name="goalId"]').select('Read 24 books');
    cy.get('input[name="trigger"]').type('After morning tea');
    cy.get('input[name="time"]').type('07:15');
    cy.get('input[name="location"]').type('Living room');
    cy.contains('Add Habit').click();
    
    // Log habit
    cy.contains('Today').click();
    cy.contains('Read for 30 minutes').click();
    cy.contains('Done').should('be.visible');
    
    // Verify dashboard updates
    cy.contains('Dashboard').click();
    cy.contains('1 day streak').should('be.visible');
  });
});
```

**Run E2E Tests:**
```bash
npx cypress open
```

---

## 📈 Monitoring & Analytics

### Google Analytics

**Install:**
```bash
npm install react-ga4
```

**Setup:**
```javascript
// src/analytics.js
import ReactGA from 'react-ga4';

export const initGA = () => {
  ReactGA.initialize('G-XXXXXXXXXX');
};

export const logPageView = (page) => {
  ReactGA.send({ hitType: 'pageview', page });
};

export const logEvent = (category, action, label) => {
  ReactGA.event({ category, action, label });
};
```

**Usage:**
```javascript
// App.js
import { initGA, logPageView } from './analytics';

useEffect(() => {
  initGA();
  logPageView(window.location.pathname);
}, []);

// Track tab changes
const handleTabChange = (tab) => {
  setCurrentTab(tab);
  logPageView(`/${tabNames[tab]}`);
};

// Track goal creation
const handleAddGoal = (goal) => {
  addGoal(goal);
  logEvent('Goal', 'Create', goal.title);
};
```

### Error Tracking (Sentry)

**Install:**
```bash
npm install @sentry/react
```

**Setup:**
```javascript
// src/index.js
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: process.env.REACT_APP_ENV,
  tracesSampleRate: 1.0,
});

// Wrap App
<Sentry.ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</Sentry.ErrorBoundary>
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

**.github/workflows/deploy.yml**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test -- --coverage
      
      - name: Build
        run: npm run build
        env:
          REACT_APP_ENV: production
      
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
        with:
          args: deploy --prod --dir=build
```

### GitLab CI

**.gitlab-ci.yml**
```yaml
image: node:18

stages:
  - test
  - build
  - deploy

cache:
  paths:
    - node_modules/

test:
  stage: test
  script:
    - npm ci
    - npm test

build:
  stage: build
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - build/

deploy:
  stage: deploy
  script:
    - npm install -g netlify-cli
    - netlify deploy --prod --dir=build
  only:
    - main
```

---

## 🌍 Custom Domain Setup

### Netlify
1. Go to Site Settings → Domain Management
2. Add custom domain
3. Update DNS records:
   ```
   Type: A
   Name: @
   Value: 75.2.60.5
   
   Type: CNAME
   Name: www
   Value: your-site.netlify.app
   ```

### Vercel
1. Go to Project Settings → Domains
2. Add domain
3. Update DNS:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

---

## 📱 PWA Configuration

### Enable PWA Features

**public/manifest.json**
```json
{
  "short_name": "Goal Planner",
  "name": "Goal Planner & Daily Action Tracker",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#5B7C99",
  "background_color": "#F5F7FA"
}
```

**Service Worker (Optional)**
```javascript
// src/serviceWorkerRegistration.js
export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js');
    });
  }
}
```

---

## 🔍 SEO Optimization

### Meta Tags

**public/index.html**
```html
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#5B7C99" />
  
  <!-- SEO -->
  <meta name="description" content="Track yearly goals and daily habits with auto-calculated targets and progress insights." />
  <meta name="keywords" content="goal tracker, habit tracker, productivity, daily planner" />
  <meta name="author" content="Your Name" />
  
  <!-- Open Graph -->
  <meta property="og:title" content="Goal Planner & Daily Action Tracker" />
  <meta property="og:description" content="Track yearly goals and daily habits with auto-calculated targets." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://yourapp.com" />
  <meta property="og:image" content="https://yourapp.com/og-image.png" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Goal Planner & Daily Action Tracker" />
  <meta name="twitter:description" content="Track yearly goals and daily habits." />
  <meta name="twitter:image" content="https://yourapp.com/twitter-image.png" />
  
  <title>Goal Planner & Daily Action Tracker</title>
</head>
```

---

## 📊 Performance Monitoring

### Lighthouse CI

**Install:**
```bash
npm install -g @lhci/cli
```

**Configuration (lighthouserc.json):**
```json
{
  "ci": {
    "collect": {
      "startServerCommand": "npm run build && npx serve -s build",
      "url": ["http://localhost:3000"]
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:best-practices": ["error", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.9}]
      }
    }
  }
}
```

**Run:**
```bash
lhci autorun
```

---

## 🎯 Launch Checklist

### Pre-Launch
- [ ] All features tested
- [ ] No console errors
- [ ] Responsive on all devices
- [ ] Cross-browser tested
- [ ] Performance optimized
- [ ] SEO meta tags added
- [ ] Analytics configured
- [ ] Error tracking setup
- [ ] Security headers configured
- [ ] HTTPS enabled
- [ ] Custom domain configured
- [ ] Backup strategy in place

### Launch Day
- [ ] Deploy to production
- [ ] Verify deployment
- [ ] Test all features in production
- [ ] Monitor error logs
- [ ] Check analytics
- [ ] Announce launch

### Post-Launch
- [ ] Monitor performance
- [ ] Track user feedback
- [ ] Fix critical bugs
- [ ] Plan next features
- [ ] Regular backups
- [ ] Security updates

---

## 🆘 Rollback Strategy

### Quick Rollback (Netlify)
```bash
# List deployments
netlify deploy:list

# Rollback to previous
netlify rollback
```

### Manual Rollback
```bash
# Checkout previous commit
git checkout <previous-commit-hash>

# Rebuild and deploy
npm run build
netlify deploy --prod --dir=build
```

---

## 📞 Support & Maintenance

### Regular Maintenance Tasks

**Weekly:**
- Check error logs
- Review analytics
- Monitor performance
- Respond to user feedback

**Monthly:**
- Update dependencies: `npm update`
- Security audit: `npm audit fix`
- Review and optimize bundle size
- Backup data

**Quarterly:**
- Major dependency updates
- Performance audit
- Security review
- Feature planning

---

## 🎉 You're Ready to Deploy!

Follow this guide step-by-step for a smooth deployment process.

**Remember:**
- Test thoroughly before deploying
- Monitor after deployment
- Keep dependencies updated
- Backup regularly

**Good luck with your launch! 🚀**
