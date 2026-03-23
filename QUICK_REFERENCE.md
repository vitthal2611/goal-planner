# Quick Reference - Life Tracker

One-page reference for common tasks and information.

---

## 🚀 Getting Started

```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

**URL:** http://localhost:5173

---

## 📂 Project Structure

```
src/
├── components/
│   ├── QuickTrack/          # Add transactions
│   ├── BalanceSummary/      # Financial overview
│   ├── TodayTransactions/   # Today's activity
│   ├── TransactionReview/   # Full history
│   └── shared/              # Reusable components
├── contexts/AppContext.jsx  # Global state
├── services/firebase.js     # Firebase service
└── styles/                  # Global styles
```

---

## ✨ Features

| Tab | Features |
|-----|----------|
| **Quick Track** | Add income/expense/transfer, form validation, real-time balances |
| **Balance Summary** | Income/expense cards, category breakdown, progress bars |
| **Today** | Today's transactions, expand details, delete |
| **Review** | Search, filter, sort, edit, delete, export CSV |

---

## 🎯 Common Tasks

### Add Transaction
1. Go to Quick Track tab
2. Select type (Income/Expense/Transfer)
3. Fill form
4. Click "Add" button

### Search Transactions
1. Go to Review tab
2. Type in search box
3. Results filter in real-time

### Edit Transaction
1. Go to Review tab
2. Click ✏️ edit button
3. Modify fields
4. Click "Save Changes"

### Export Data
1. Go to Review tab
2. Apply filters (optional)
3. Click "📥 Export CSV"
4. File downloads automatically

### Manage Payment Methods
1. Click ⚙️ settings icon
2. Go to "Payment Methods" tab
3. Add or delete methods

---

## 🔧 Configuration

### Environment Variables
Create `.env` file:
```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
# ... other Firebase config
```

### Default Data
- **Payment Methods:** Cash, Credit Card, Debit Card, UPI
- **Categories:** Food, Transport, Shopping, Entertainment, Bills, Savings

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| App won't start | `rm -rf node_modules && npm install` |
| Data not persisting | Check localStorage permissions |
| Styles not loading | Hard refresh (Ctrl+Shift+R) |
| Build fails | Clear cache and rebuild |

### Clear All Data
```javascript
// In browser console
localStorage.clear()
location.reload()
```

---

## 📊 Data Structure

### Transaction
```javascript
{
  id: "EXP-1234567890",
  type: "expense",
  amount: 500,
  description: "Groceries",
  envelope: "Food",
  payment: "Cash",
  expenseType: "need",
  date: "2024-01-15T10:30:00.000Z"
}
```

### Payment Method
```javascript
"Cash"
```

### Envelope
```javascript
{
  name: "Food",
  icon: "🍔",
  type: "need"
}
```

---

## 🎨 Design Tokens

### Colors
```css
--color-primary: #4f46e5       /* Indigo */
--color-success: #059669       /* Green */
--color-danger: #dc2626        /* Red */
--color-warning: #d97706       /* Amber */
```

### Spacing
```css
--space-xs: 6px
--space-sm: 10px
--space-md: 16px
--space-lg: 20px
--space-xl: 28px
```

### Border Radius
```css
--radius-sm: 10px
--radius-md: 16px
--radius-lg: 20px
--radius-pill: 999px
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 600px) { }

/* Tablet */
@media (max-width: 768px) { }

/* Desktop */
@media (min-width: 1024px) { }
```

---

## 🧪 Testing

### Quick Test
1. Add income transaction
2. Add expense transaction
3. Check Balance Summary
4. Check Today tab
5. Search in Review tab
6. Export CSV

### Full Test
See **TESTING_CHECKLIST.md**

---

## 🚀 Deployment

### Firebase
```bash
npm run build
firebase deploy --only hosting
```

### Vercel
```bash
vercel --prod
```

### Netlify
```bash
netlify deploy --prod --dir=dist
```

See **DEPLOYMENT_GUIDE.md** for details.

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| README.md | Project overview |
| MIGRATION_GUIDE.md | Complete roadmap |
| GETTING_STARTED.md | User guide |
| TESTING_CHECKLIST.md | Testing guide |
| DEPLOYMENT_GUIDE.md | Deployment instructions |
| PROJECT_STATUS_FINAL.md | Detailed status |

---

## 🎯 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Tab | Navigate between fields |
| Enter | Submit form |
| Escape | Close modal |
| Arrow keys | Navigate dropdowns |

---

## 💡 Tips

1. **Add transactions regularly** for accurate tracking
2. **Use categories** to organize expenses
3. **Export data monthly** for backup
4. **Check Balance Summary** for overview
5. **Use filters** to find transactions quickly

---

## 📊 Progress

**Current:** 50% Complete
**Completed:** 4/8 tabs
**Next:** Insights & Analytics

---

## 🔗 Quick Links

- **Start Dev:** `npm run dev`
- **Build:** `npm run build`
- **Test:** See TESTING_CHECKLIST.md
- **Deploy:** See DEPLOYMENT_GUIDE.md
- **Docs:** See README.md

---

## 📞 Support

**Issues?**
1. Check documentation
2. Check browser console
3. Clear localStorage
4. Test in incognito mode

**Console Commands:**
```javascript
// View transactions
JSON.parse(localStorage.getItem('transactions'))

// Clear data
localStorage.clear()
```

---

**Quick Start:** `npm run dev` → http://localhost:5173 🚀
