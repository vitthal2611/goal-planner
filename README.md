# Budget Planner - Google Sheets Dashboard

A modern, mobile-friendly budget planner that uses Google Sheets as the backend storage. Track income, expenses, transfers, and budget allocations seamlessly across all your devices.

## Features

- 💰 **Income Tracking** - Record income from various sources
- 💸 **Expense Management** - Track expenses by category and envelope
- 🔄 **Fund Transfers** - Transfer money between payment methods
- 📋 **Budget Allocation** - Set and monitor budget limits for categories
- 💳 **Payment Methods** - Configure and manage payment methods
- 📱 **Mobile Friendly** - Responsive design optimized for mobile devices
- 🔐 **Secure OAuth2** - Google OAuth2 authentication for secure access
- ☁️ **Cloud Storage** - Data stored in Google Sheets, accessible anywhere
- ⚡ **Real-time Sync** - Changes sync instantly across devices

## Quick Start

### Prerequisites

1. **Google Account** - You need a Google account to use Google Sheets
2. **Google Cloud Project** - Set up OAuth2 credentials (see setup below)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd goal-planner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Google OAuth2**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google Sheets API
   - Create OAuth2 credentials (Web application)
   - Add your domain to authorized origins
   - Copy the Client ID

4. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Update `VITE_GOOGLE_OAUTH_CLIENT_ID` with your OAuth2 Client ID
   - Optionally set `VITE_GOOGLE_SHEETS_ID` for a specific spreadsheet

5. **Run the application**
   ```bash
   npm run dev
   ```

6. **Access the app**
   - Open your browser to `http://localhost:5173`
   - Click "Authorize Google Sheets" to authenticate
   - Start managing your budget!

## Usage Guide

### First Time Setup

1. **Authorize Google Sheets** - Click the authorization button on first visit
2. **Configure Payment Methods** - Add your bank accounts, credit cards, etc.
3. **Set Monthly Budget** - Allocate budget to different categories
4. **Start Tracking** - Add income and expenses

### Daily Usage

#### Adding Income
1. Go to the "Income" tab
2. Enter amount, description, and payment method
3. Click "Add Income"

#### Recording Expenses
1. Go to the "Expense" tab
2. Fill in amount, description, category, envelope, and payment method
3. Click "Add Expense"

#### Transferring Funds
1. Go to the "Transfer" tab
2. Select source and destination accounts
3. Enter amount and optional description
4. Click "Transfer Funds"

#### Budget Management
1. Go to the "Budget" tab
2. Enter category, envelope, and budget amount
3. Click "Allocate Budget"
4. View current budget status below

### Data Structure

The app creates a Google Sheet with the following structure:

#### Transactions Sheet
- Month, Type, Description, Envelope, Category, Amount, Payment Method, Date, ID

#### Budgets Sheet
- Month, Category, Envelope, Budgeted, Spent

#### PaymentMethods Sheet
- Name, Type, Active

### Sample Data Format

```
Month: 2026-01
Type: Expense
Description: Dmart grocery shopping
Envelope: DMART
Category: DMART
Amount: 1500
Payment Method: HDFC
```

## Mobile Optimization

- **Touch-friendly** - All buttons and inputs are optimized for touch
- **Responsive design** - Works on all screen sizes
- **Fast loading** - Minimal dependencies for quick startup
- **Offline-ready** - Basic functionality works offline with sync when online

## Security & Privacy

- **OAuth2 Authentication** - Secure Google authentication
- **No data storage** - All data stored in your Google Sheets
- **Client-side only** - No server-side data processing
- **Encrypted communication** - All API calls use HTTPS

## Troubleshooting

### Common Issues

1. **Authorization Failed**
   - Check OAuth2 Client ID in `.env`
   - Verify domain is added to authorized origins
   - Clear browser cache and try again

2. **Spreadsheet Not Found**
   - Check `VITE_GOOGLE_SHEETS_ID` in `.env`
   - Ensure you have access to the spreadsheet
   - Let the app create a new spreadsheet automatically

3. **Data Not Syncing**
   - Check internet connection
   - Refresh the page to reload data
   - Verify Google Sheets API permissions

### Performance Tips

- **Use categories consistently** - Stick to the same category names
- **Regular cleanup** - Archive old data periodically
- **Limit transactions** - The app shows recent transactions for better performance

## Development

### Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.jsx   # Main dashboard
│   └── PaymentMethodsConfig.jsx
├── contexts/           # React contexts
│   └── SimpleBudgetContext.jsx
├── hooks/              # Custom hooks
│   └── useGoogleAuth.js
├── services/           # API services
│   ├── googleSheetsService.js
│   └── dataService.js
└── App.jsx            # Main app component
```

### Building for Production

```bash
npm run build
```

### Deployment

The app can be deployed to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- Firebase Hosting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Search existing issues
3. Create a new issue with detailed information

---

**Note**: This app requires internet connection for Google Sheets access. All data is stored in your personal Google Sheets, ensuring privacy and data ownership.