# Budget Planner - Google Sheets Dashboard

A modern, mobile-friendly budget planner that uses Google Sheets as the backend storage. Track income, expenses, transfers, and budget allocations seamlessly with a single OAuth2 authorization.

## 🎯 Features

- 💰 **Income Tracking** - Record income from various sources
- 💸 **Expense Management** - Track expenses by envelope/category
- 🔄 **Fund Transfers** - Transfer money between payment methods
- 📋 **Budget Allocation** - Set and monitor budget limits for envelopes
- 💳 **Payment Methods** - Configure and manage payment methods
- 📱 **Mobile Friendly** - Fully responsive design
- 🔐 **Secure OAuth2** - Google OAuth2 authentication
- ☁️ **Cloud Storage** - Data stored in Google Sheets
- ⚡ **Real-time Sync** - Changes sync instantly
- 🚀 **High Performance** - Optimized caching and minimal dependencies

## 🏗️ Architecture

### Single Source of Truth
All data is stored in Google Sheets with 4 sheets:
- **Transactions** - All income, expense, and transfer transactions
- **Budgets** - Monthly budget allocations per envelope
- **Envelopes** - Category/envelope definitions
- **PaymentMethods** - Payment method configurations

### Tech Stack
- **Frontend:** React 18.2.0
- **Build Tool:** Vite 5.0.0
- **API:** Google Sheets API v4
- **Authentication:** OAuth2
- **Hosting:** Firebase Hosting
- **Storage:** Google Drive

## 🚀 Quick Start

### 1. Google Cloud Console Setup (5 min)
```bash
1. Go to https://console.cloud.google.com/
2. Create new project
3. Enable Google Sheets API
4. Create OAuth2 credentials (Web application)
5. Add authorized origins:
   - http://localhost:5173 (development)
   - https://your-firebase-domain.web.app (production)
6. Copy the Client ID
```

### 2. Local Setup (2 min)
```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your Client ID
VITE_GOOGLE_OAUTH_CLIENT_ID=your_client_id_here

# Start development server
npm run dev
```

### 3. First Time Usage
1. Click "🔐 Authorize Google Sheets"
2. Grant permissions
3. App creates "Budget Tracker" spreadsheet
4. Go to "⚙️ Profile" tab
5. Add payment methods (e.g., HDFC, SBI)
6. Add envelopes/categories (e.g., EMI, DMART)
7. Go to "📋 Budget" tab
8. Allocate budgets for each envelope
9. Start adding transactions!

## 📊 Tab Navigation

| Tab | Purpose |
|-----|---------|
| 📊 Overview | View summary and all transactions |
| 💰 Income | Add income transactions |
| 💸 Expense | Add expense transactions with category |
| 🔄 Transfer | Transfer between payment methods |
| 📋 Budget | Allocate monthly budgets |
| ⚙️ Profile | Manage envelopes & payment methods |

## 📋 Data Structure

### Transactions Sheet
```
Month | Type | Description | Envelope | Amount | Payment Method | Date | ID
2026-01 | Expense | Tea | EMI | 50 | HDFC | 2026-01-15T10:30:00Z | abc123
```

### Budgets Sheet
```
Month | Envelope | Budgeted | Spent
2026-01 | EMI | 85000 | 0
```

### Envelopes Sheet
```
Name | Active
EMI | true
DMART | true
```

### PaymentMethods Sheet
```
Name | Type | Active
HDFC | Bank | true
SBI Credit Card | Credit Card | true
```

## 🎨 Mobile Responsive Design

- **Desktop (>768px):** Full tab labels, multi-column layouts
- **Tablet (481-768px):** Compact tabs, 2-column grids
- **Mobile (<480px):** Icon-only tabs, single column, touch-optimized

## ⚡ Performance

- **Initial Load:** ~2-3 seconds
- **Subsequent Loads:** <1 second (cached)
- **Add Transaction:** ~1-2 seconds
- **Bundle Size:** ~50KB gzipped
- **Caching:** 30-second TTL for API calls

## 🔒 Security

- OAuth2 authentication (no credentials stored)
- All data in user's Google Drive
- No server-side processing
- No local storage
- HTTPS only in production
- Token stored in memory only

## 📁 Project Structure

```
src/
├── services/
│   ├── googleAuth.js          # OAuth2 authentication
│   └── sheetsAPI.js           # Google Sheets API wrapper
├── contexts/
│   └── BudgetContext.jsx      # React context
├── components/
│   ├── Dashboard.jsx          # Main dashboard
│   ├── IncomeForm.jsx         # Income form
│   ├── ExpenseForm.jsx        # Expense form
│   ├── TransferForm.jsx       # Transfer form
│   ├── BudgetForm.jsx         # Budget form
│   ├── BudgetSummary.jsx      # Budget overview
│   ├── TransactionsList.jsx   # Transactions list
│   ├── ProfileSettings.jsx    # Profile settings
│   └── *.css                  # Component styles
├── App.jsx                    # Main app
├── App.css                    # App styles
└── main.jsx                   # Entry point
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase
```bash
firebase deploy
```

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - 5-minute setup guide
- **[REDESIGN_GUIDE.md](./REDESIGN_GUIDE.md)** - Comprehensive implementation guide
- **[TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md)** - Detailed architecture
- **[API_REFERENCE.md](./API_REFERENCE.md)** - Complete API reference
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Deployment guide
- **[FILE_INDEX.md](./FILE_INDEX.md)** - Complete file listing

## 🔧 Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Firebase
npm run deploy
```

## 🌐 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📊 Example Workflow

### Setup Phase
1. Add payment methods: HDFC, SBI Credit Card
2. Add envelopes: EMI, DMART, EATOUT

### Budget Phase
1. Set EMI budget: ₹85,000
2. Set DMART budget: ₹10,000
3. Set EATOUT budget: ₹5,000

### Transaction Phase
1. Add income: ₹100,000 (Salary)
2. Add expense: ₹5,000 (EMI) → HDFC
3. Add expense: ₹500 (Groceries) → DMART
4. Transfer: ₹20,000 from HDFC to SBI

### Review Phase
1. View overview with budget status
2. Check remaining budget for each envelope
3. See all transactions with details

## 🐛 Troubleshooting

### Authorization Failed
- Verify Client ID in .env
- Check authorized origins in Google Cloud Console
- Clear browser cache
- Try incognito mode

### Spreadsheet Not Found
- Check internet connection
- Refresh the page
- Verify Google Sheets API is enabled
- Check Google account permissions

### Data Not Syncing
- Check internet connection
- Refresh the page
- Verify Google Sheets API permissions
- Check browser console for errors

## 💡 Tips

- Use month dropdown to view different months
- Budget vs spent is calculated in real-time
- Envelopes are global and used across all months
- Payment methods are used for all transactions
- All data is automatically saved to Google Sheets
- Refresh page to get latest data from sheets

## 🎯 Key Features

✅ Single OAuth2 authorization
✅ Automatic spreadsheet creation
✅ Income tracking
✅ Expense tracking with categories
✅ Fund transfers
✅ Monthly budget allocation
✅ Budget vs spent tracking
✅ Category management
✅ Payment method configuration
✅ Mobile-responsive design
✅ Real-time data sync
✅ No local storage
✅ No Firebase Database
✅ Optimized performance
✅ Clean, minimal code

## 📝 Notes

- All data stored in Google Sheets
- Single source of truth
- No server-side processing
- Automatic data normalization
- Prevents data duplication
- Optimized for performance
- Mobile-first responsive design

## 🤝 Support

For issues and questions:
1. Check troubleshooting section
2. Review Google Sheets data
3. Check browser console (F12)
4. Verify internet connection
5. Try incognito mode

## 📄 License

MIT License

## 🎉 Ready to Start?

1. Follow the Quick Start guide
2. Set up Google Cloud Console
3. Configure local environment
4. Run `npm run dev`
5. Authorize with Google
6. Start managing your budget!

---

**Version:** 2.0.0
**Last Updated:** 2024
**Status:** ✅ Production Ready
