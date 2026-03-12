# Budget Planner - Google Sheets Dashboard

A clean, mobile-friendly budget planner using Google Sheets as the single source of truth. Track income, expenses, transfers, and budget allocations seamlessly.

## Features

- 💰 **Income Tracking** - Record income with payment methods
- 💸 **Expense Management** - Track expenses by envelope/category
- 🔄 **Fund Transfers** - Transfer money between payment methods
- 📋 **Budget Allocation** - Set and monitor budget limits per envelope per month
- 💳 **Payment Methods** - Configure payment methods in settings
- 📱 **Mobile Friendly** - Fully responsive design
- 🔐 **OAuth2** - Simple Google authentication
- ☁️ **Google Sheets** - All data stored in Google Sheets
- ⚡ **Optimized** - Minimal dependencies, fast performance

## Google Sheets Structure

The app creates a "Budget Tracker" spreadsheet with 3 sheets:

### Transactions Sheet
| Month | Type | Description | Envelope | Amount | Payment Method |
|-------|------|-------------|----------|--------|----------------|
| 2026-01 | Income | Salary | Income | 50000 | HDFC Bank |
| 2026-01 | Expense | Groceries | Food | 5000 | Cash |
| 2026-01 | Transfer | - | Transfer | 10000 | HDFC → SBI |

### Envelopes Sheet
| Name | Month | Budget |
|------|-------|--------|
| EMI | 2026-01 | 85000 |
| Food | 2026-01 | 15000 |

### PaymentMethods Sheet
| Name | Type |
|------|------|
| HDFC Bank | Bank |
| SBI Bank | Bank |
| Cash | Cash |

## Setup

### 1. Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **Google Sheets API** and **Google Drive API**
4. Create OAuth2 credentials (Web application)
5. Add authorized origins:
   - `http://localhost:5173` (development)
   - `https://your-app.web.app` (production)
6. Copy the Client ID

### 2. Local Development

```bash
# Install dependencies
npm install

# Create .env file
echo VITE_GOOGLE_OAUTH_CLIENT_ID=your_client_id_here > .env

# Start dev server
npm run dev
```

### 3. Firebase Deployment

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (select Hosting)
firebase init hosting

# Build and deploy
npm run build
firebase deploy
```

Update Firebase authorized origin in Google Cloud Console.

## Usage

### First Time
1. Click "Sign in with Google"
2. Grant permissions
3. App creates "Budget Tracker" spreadsheet automatically
4. Go to Settings (⚙️) to add payment methods
5. Start tracking!

### Adding Transactions

**Income**: Amount → Description → Payment Method → Add

**Expense**: Amount → Description → Envelope → Payment Method → Add

**Transfer**: Amount → From → To → Add

**Budget**: Envelope Name → Budget Amount → Allocate

### Settings
- **Payment Methods**: Add/remove payment methods
- **Envelopes**: View all envelopes (created when allocating budgets)

## Architecture

```
src/
├── services/
│   ├── googleSheets.js      # Google Sheets API + OAuth
│   └── dataService.js        # Business logic
├── contexts/
│   └── BudgetContext.jsx     # State management
├── components/
│   ├── Dashboard.jsx         # Main dashboard
│   ├── TransactionForm.jsx   # Add transactions/budgets
│   ├── TransactionsList.jsx  # Display transactions
│   ├── BudgetSummary.jsx     # Budget overview
│   └── ProfileModal.jsx      # Settings
├── App.jsx                   # Auth wrapper
└── main.jsx                  # Entry point
```

## Key Features

### Single Authorization
- One-time Google sign-in
- No repeated authorization prompts
- Automatic spreadsheet creation/detection

### Normalized Data
- No duplicate entries
- Envelopes created from budget allocations
- Payment methods configured once

### Mobile Optimized
- Touch-friendly interface
- Responsive grid layouts
- Optimized forms
- Fast loading

### Performance
- Minimal dependencies (React + React-DOM only)
- Optimized API calls
- Efficient state management
- No localStorage or Firebase

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Troubleshooting

**Authorization Failed**
- Verify Client ID in .env
- Check authorized origins in Google Cloud Console
- Clear browser cache

**Spreadsheet Not Found**
- Refresh the page
- Check Google Sheets API is enabled
- Verify permissions

## License

MIT License
