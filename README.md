# Budget Planner - Google Sheets Dashboard

A modern, mobile-friendly budget planner that uses Google Sheets as the backend storage. Track income, expenses, transfers, and budget allocations seamlessly.

## Features

- 💰 **Income Tracking** - Record income from various sources
- 💸 **Expense Management** - Track expenses by envelope/category
- 🔄 **Fund Transfers** - Transfer money between payment methods
- 📋 **Budget Allocation** - Set and monitor budget limits for envelopes
- 💳 **Payment Methods** - Configure and manage payment methods
- 📱 **Mobile Friendly** - Fully responsive design
- 🔐 **Secure OAuth2** - Google OAuth2 authentication
- ☁️ **Cloud Storage** - Data stored in Google Sheets
- ⚡ **Real-time Sync** - Changes sync instantly

## Architecture

### Google Sheets Structure

**Transactions Sheet**
- Month: 2026-01, 2026-02, etc.
- Type: Income, Expense, Transfer-In, Transfer-Out
- Description: Transaction description
- Envelope: Category/Envelope name
- Amount: Transaction amount
- Payment Method: Payment method used
- Date: Transaction date
- ID: Unique transaction ID

**Budgets Sheet**
- Month: Budget month
- Envelope: Envelope/Category name
- Budgeted: Allocated budget amount
- Spent: Amount spent (auto-calculated)

**PaymentMethods Sheet**
- Name: Payment method name
- Type: Bank, Credit Card, Debit Card, Wallet, Cash
- Active: TRUE/FALSE

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google Sheets API
4. Create OAuth2 credentials (Web application)
5. Add authorized origins:
   - `http://localhost:5173` (development)
   - `https://your-firebase-domain.web.app` (production)
6. Copy the Client ID

### 2. Local Setup

```bash
# Clone repository
git clone <repository-url>
cd goal-planner

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your Google OAuth Client ID
VITE_GOOGLE_OAUTH_CLIENT_ID=your_client_id_here

# Start development server
npm run dev
```

### 3. Firebase Deployment

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase
firebase init hosting

# Build and deploy
npm run build
firebase deploy
```

## Usage Guide

### First Time Setup

1. Click "Authorize Google Sheets"
2. Grant permissions to access Google Sheets
3. App automatically creates "Budget Tracker" spreadsheet
4. Add payment methods
5. Allocate monthly budgets
6. Start tracking transactions

### Adding Transactions

#### Income
1. Go to "💰 Income" tab
2. Enter amount, description, payment method
3. Click "Add Income"

#### Expense
1. Go to "💸 Expense" tab
2. Enter amount, description, envelope, payment method
3. Click "Add Expense"

#### Transfer
1. Go to "🔄 Transfer" tab
2. Select from/to accounts
3. Enter amount and optional description
4. Click "Transfer Funds"

### Budget Management

1. Go to "📋 Budget" tab
2. Enter envelope name and budget amount
3. Click "Allocate Budget"
4. View budget status with progress bars

### Payment Methods

1. Click "💳 Payment Methods" button
2. Add new payment method with name and type
3. Remove methods as needed

## Mobile Optimization

- Touch-friendly interface
- Responsive grid layouts
- Optimized form inputs
- Fast loading times
- Works on all screen sizes

## Performance Optimizations

- Minimal dependencies (React + React-DOM only)
- Lazy loading of components
- Efficient Google Sheets API calls
- Optimized bundle size
- No localStorage or Firebase

## Data Safety

- All data stored in Google Sheets
- OAuth2 authentication
- No server-side processing
- No data stored locally
- Automatic backup in Google Drive

## Troubleshooting

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

## Development

### Project Structure

```
src/
├── services/
│   ├── sheetsAPI.js          # Google Sheets API wrapper
│   └── dataService.js        # Business logic
├── contexts/
│   └── BudgetContext.js      # React context
├── components/
│   ├── Dashboard.jsx         # Main dashboard
│   ├── IncomeForm.jsx        # Income form
│   ├── ExpenseForm.jsx       # Expense form
│   ├── TransferForm.jsx      # Transfer form
│   ├── BudgetForm.jsx        # Budget form
│   ├── TransactionsList.jsx  # Transactions list
│   ├── BudgetSummary.jsx     # Budget summary
│   └── PaymentMethodsModal.jsx
├── App.jsx                   # Main app
└── main.jsx                  # Entry point
```

### Building

```bash
npm run build
```

Output: `dist/` directory

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT License

## Support

For issues and questions:
1. Check troubleshooting section
2. Review Google Sheets data
3. Check browser console for errors
4. Create an issue with details

---

**Note**: This app requires internet connection for Google Sheets access. All data is stored in your personal Google Sheets.
