# 🔧 Troubleshooting Guide

Common issues and solutions for the Life Tracker application.

---

## 🚨 Common Issues

### 1. App Won't Start

**Symptom:** `npm run dev` fails or shows errors

**Solutions:**

```bash
# Solution 1: Clear and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev

# Solution 2: Check Node version
node --version  # Should be 16+

# Solution 3: Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

---

### 2. Build Fails

**Symptom:** `npm run build` shows errors

**Solutions:**

```bash
# Solution 1: Check for syntax errors
npm run dev  # Check console for errors

# Solution 2: Clear and rebuild
rm -rf dist
npm run build

# Solution 3: Check dependencies
npm install
npm run build
```

**Common Build Errors:**

```
Error: Cannot find module 'react'
→ Solution: npm install react react-dom

Error: Unexpected token
→ Solution: Check for syntax errors in JSX files

Error: Module not found
→ Solution: Check import paths (case-sensitive!)
```

---

### 3. Data Not Saving

**Symptom:** Transactions/habits disappear after refresh

**Solutions:**

1. **Check localStorage permissions:**
   - Open DevTools (F12)
   - Go to Application → Local Storage
   - Verify data is being saved

2. **Clear and test:**
   ```javascript
   // In browser console
   localStorage.clear()
   // Refresh and try again
   ```

3. **Check browser settings:**
   - Ensure cookies/storage is enabled
   - Disable private/incognito mode
   - Check browser extensions

---

### 4. Styles Not Loading

**Symptom:** App looks broken, no styling

**Solutions:**

```bash
# Solution 1: Hard refresh
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)

# Solution 2: Clear browser cache
# In DevTools: Right-click refresh → Empty cache and hard reload

# Solution 3: Check CSS imports
# Verify all .css files are imported in components
```

---

### 5. Charts Not Rendering

**Symptom:** Insights tab shows no charts

**Solutions:**

```bash
# Solution 1: Check recharts installation
npm list recharts

# Solution 2: Reinstall recharts
npm uninstall recharts
npm install recharts react-is

# Solution 3: Check data
# Open DevTools console
# Verify transactions exist
```

---

### 6. Hot Module Replacement Not Working

**Symptom:** Changes don't reflect without full refresh

**Solutions:**

```bash
# Solution 1: Restart dev server
# Stop: Ctrl + C
npm run dev

# Solution 2: Clear Vite cache
rm -rf node_modules/.vite
npm run dev

# Solution 3: Check vite.config.js
# Ensure React plugin is configured
```

---

### 7. Production Build Issues

**Symptom:** Works in dev but not in production

**Solutions:**

```bash
# Solution 1: Test production build locally
npm run build
npm run preview

# Solution 2: Check console errors
# Open DevTools in preview
# Fix any errors shown

# Solution 3: Check base URL
# In vite.config.js, ensure base is correct
```

---

### 8. Mobile Responsiveness Issues

**Symptom:** App looks broken on mobile

**Solutions:**

1. **Test in DevTools:**
   - Open DevTools (F12)
   - Toggle device toolbar (Ctrl+Shift+M)
   - Test different screen sizes

2. **Check viewport meta tag:**
   ```html
   <!-- In index.html -->
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   ```

3. **Test on real device:**
   - Use your phone's browser
   - Check all features work

---

### 9. Firebase Deployment Issues

**Symptom:** Firebase deploy fails

**Solutions:**

```bash
# Solution 1: Check Firebase CLI
firebase --version
# Update if needed: npm i -g firebase-tools

# Solution 2: Re-login
firebase logout
firebase login

# Solution 3: Check firebase.json
# Ensure hosting config is correct:
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}

# Solution 4: Build first
npm run build
firebase deploy
```

---

### 10. Vercel Deployment Issues

**Symptom:** Vercel deploy fails

**Solutions:**

```bash
# Solution 1: Check build settings
# Framework Preset: Vite
# Build Command: npm run build
# Output Directory: dist

# Solution 2: Check environment variables
# Add in Vercel dashboard if needed

# Solution 3: Check logs
vercel logs
```

---

## 🐛 Debugging Tips

### Check Browser Console

```javascript
// Open DevTools (F12)
// Look for errors in Console tab

// Common errors:
// - Module not found → Check imports
// - Undefined variable → Check variable names
// - Network error → Check API calls
```

### Check React DevTools

```bash
# Install React DevTools extension
# Chrome: https://chrome.google.com/webstore
# Firefox: https://addons.mozilla.org

# Use to inspect:
# - Component tree
# - Props and state
# - Context values
```

### Check Network Tab

```javascript
// Open DevTools → Network tab
// Look for:
// - Failed requests (red)
// - Slow requests (timing)
// - Missing files (404)
```

---

## 📊 Performance Issues

### Slow Loading

**Solutions:**

1. **Check bundle size:**
   ```bash
   npm run build
   # Check dist folder size
   ```

2. **Optimize images:**
   - Compress images
   - Use appropriate formats
   - Lazy load images

3. **Code splitting:**
   - Already implemented with React.lazy
   - Check if working correctly

### Slow Charts

**Solutions:**

1. **Limit data points:**
   ```javascript
   // In chart components
   // Limit to last 30 days instead of all time
   ```

2. **Use useMemo:**
   ```javascript
   // Already implemented
   // Verify memoization is working
   ```

---

## 🔍 Data Issues

### Calculations Wrong

**Solutions:**

1. **Check data format:**
   ```javascript
   // Ensure amounts are numbers
   parseFloat(transaction.amount)
   ```

2. **Check date filtering:**
   ```javascript
   // Verify date comparisons
   console.log('Selected date:', selectedDate)
   console.log('Transaction date:', transaction.date)
   ```

3. **Check localStorage data:**
   ```javascript
   // In browser console
   console.log(JSON.parse(localStorage.getItem('transactions')))
   ```

### Data Corruption

**Solutions:**

```javascript
// Clear all data and start fresh
localStorage.clear()
// Refresh page

// Or clear specific items
localStorage.removeItem('transactions')
localStorage.removeItem('habits')
```

---

## 🌐 Browser Compatibility

### Works in Chrome but not Safari

**Solutions:**

1. **Check for unsupported features:**
   - Use caniuse.com
   - Add polyfills if needed

2. **Test in Safari:**
   - Use Safari's Web Inspector
   - Check console for errors

### Works in Desktop but not Mobile

**Solutions:**

1. **Check touch events:**
   - Ensure buttons are touch-friendly
   - Minimum 44px touch targets

2. **Check viewport:**
   - Verify responsive CSS
   - Test different screen sizes

---

## 🔐 Security Issues

### CORS Errors

**Solutions:**

```javascript
// If using external APIs
// Configure CORS on server side
// Or use proxy in vite.config.js

export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://your-api-server.com'
    }
  }
})
```

### Content Security Policy

**Solutions:**

```html
<!-- Add to index.html if needed -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline'">
```

---

## 📱 PWA Issues

### Service Worker Not Registering

**Solutions:**

```javascript
// Check registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('SW registered', reg))
    .catch(err => console.log('SW error', err))
}
```

---

## 🆘 Still Having Issues?

### Steps to Get Help

1. **Check documentation:**
   - README.md
   - GETTING_STARTED.md
   - DEPLOYMENT_GUIDE.md

2. **Search for error message:**
   - Google the exact error
   - Check Stack Overflow
   - Check GitHub issues

3. **Provide details:**
   - Error message
   - Steps to reproduce
   - Browser/OS version
   - Screenshots

4. **Test in isolation:**
   - Create minimal reproduction
   - Test in incognito mode
   - Test on different device

---

## 🔧 Quick Fixes

### Reset Everything

```bash
# Nuclear option - start fresh
rm -rf node_modules package-lock.json dist
npm install
npm run dev
```

### Clear All Caches

```bash
# Clear npm cache
npm cache clean --force

# Clear Vite cache
rm -rf node_modules/.vite

# Clear browser cache
# DevTools → Application → Clear storage
```

### Verify Installation

```bash
# Check versions
node --version    # Should be 16+
npm --version     # Should be 8+

# Check dependencies
npm list react
npm list vite
npm list recharts
```

---

## 📞 Support Resources

- **Documentation:** Check all .md files in project root
- **React Docs:** https://react.dev
- **Vite Docs:** https://vitejs.dev
- **Recharts Docs:** https://recharts.org
- **Firebase Docs:** https://firebase.google.com/docs

---

## ✅ Prevention Tips

1. **Keep dependencies updated:**
   ```bash
   npm outdated
   npm update
   ```

2. **Test before deploying:**
   ```bash
   npm run build
   npm run preview
   ```

3. **Use version control:**
   ```bash
   git commit -m "Working version"
   ```

4. **Backup data:**
   - Export localStorage regularly
   - Keep backups of important data

5. **Monitor console:**
   - Check for warnings
   - Fix issues early

---

**Most issues can be solved by:**
1. Clearing cache
2. Reinstalling dependencies
3. Checking browser console
4. Testing in incognito mode

Good luck! 🍀
