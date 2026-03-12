# Budget Planner - Complete Setup & Deployment Guide

## Architecture Overview

This is a complete redesign using Google Sheets as the single source of truth with OAuth2 authentication.

### Key Features
- ✅ Single OAuth2 authorization per user
- ✅ Google Sheets as backend (no Firebase, no localStorage)
- ✅ Responsive desktop and mobile UI
- ✅ Minimal dependencies (React + React-DOM only)
- ✅ Optimized performance
- ✅ Data integrity with no overwrites

### Google Sheets Structure

**Transactions Sheet**
- Month: 2026-01, 2026-02, etc.
- Type: Income, Expense, Transfer
- Description: Transaction description
- Envelope: Category name
- Amount: Transaction amount
- Payment Method: Payment method used

**Budgets Sheet**
- Month: Budget month
- Envelope: Envelope/Category name
- Amount: Allocated budget amount

**Envelopes Sheet**
- Name: Envelope/Category name
- Active: TRUE/FALSE

**PaymentMethods Sheet**
- Name: Payment method name
- Active: TRUE/FALSE

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to https://console.cloud.google.com/
2. Create a new project (e.g., "Budget Planner")
3. Enable APIs:
   - Google Sheets API
   - Google Drive API
4. Create OAuth2 credentials:
   - Go to Credentials → Create Credentials → OAuth 2.0 Client ID
   - Choose "Web application"
   - Add Authorized JavaScript origins:
     - `http://localhost:5173` (development)
     - `https://your-firebase-domain.web.app` (production)
   - Add Authorized redirect URIs:
     - `http://localhost:5173` (development)
     - `https://your-firebase-domain.web.app` (production)
5. Copy the Client ID

### 2. Local Development Setup

```bash
# Clone and setup
cd goal-planner
npm install

# Create .env file
cp .env.example .env

# Add your Google OAuth Client ID to .env
VITE_GOOGLE_OAUTH_CLIENT_ID=your_client_id_here

# Start development server
npm run dev
```

The app will open at http://localhost:5173

### 3. Firebase Deployment

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not done)
firebase init hosting

# Build and deploy
npm run build
firebase deploy
```

Update your Google Cloud Console with the Firebase hosting URL.

## Usage Guide

### First Time Setup

1. Click "Authorize with Google"
2. Grant permissions to access Google Sheets and Drive
3. App automatically creates "Budget Tracker" spreadsheet
4. Go to Profile Settings to add:
   - Payment Methods (e.g., HDFC Bank, SBI Credit Card)
   - Envelopes/Categories (e.g., EMI, Groceries, Entertainment)

### Adding Transactions

#### Income
1. Select month from dropdown
2. Click "💰 Income" tab
3. Enter description, amount, payment method
4. Click "Add Income"

#### Expense
1. Select month from dropdown
2. Click "💸 Expense" tab
3. Enter description, select envelope, amount, payment method
4. Click "Add Expense"

#### Transfer
1. Select month from dropdown
2. Click "🔄 Transfer" tab
3. Enter description, amount, payment method
4. Click "Transfer Funds"

### Budget Management

1. Select month from dropdown
2. Click "📋 Budget" tab
3. Select envelope and enter budget amount
4. Click "Allocate Budget"
5. View budget status in "📊 Overview" tab

### Profile Configuration

1. Click "⚙️ Profile" tab
2. Add new envelopes (categories)
3. Add new payment methods
4. All changes sync to Google Sheets

## Mobile Optimization

- Touch-friendly interface
- Icon-based tabs on mobile (emoji icons)
- Responsive forms and tables
- Optimized for all screen sizes
- Works on iOS Safari and Chrome Mobile

## Data Flow

```
User Action
    ↓
React Component
    ↓
BudgetContext (State Management)
    ↓
googleSheetsAPI Service
    ↓
Google Sheets API
    ↓
Google Sheets (Single Source of Truth)
```

## Performance Optimizations

- Minimal dependencies (React + React-DOM)
- No external UI libraries
- Efficient API calls with batch operations
- Lazy loading of data
- Optimized bundle size (~50KB gzipped)
- No localStorage or client-side caching

## Data Safety

- All data stored in Google Sheets
- OAuth2 authentication (no passwords stored)
- No server-side processing
- No data stored locally
- Automatic backup in Google Drive
- Data integrity checks prevent overwrites

## Troubleshooting

### Authorization Failed
- Verify Client ID in .env
- Check authorized origins in Google Cloud Console
- Clear browser cache and try again
- Try incognito mode

### Spreadsheet Not Found
- Check internet connection
- Refresh the page
- Verify Google Sheets API is enabled
- Check Google account permissions

### Data Not Syncing
- Check internet connection
- Refresh the page
- Verify API permissions
- Check browser console for errors

### Mobile Issues
- Ensure viewport meta tag is present
- Test on actual device
- Check browser console for errors
- Try different browser

## Project Structure

```
src/
├── services/
│   └── googleSheetsAPI.js       # Google Sheets API wrapper
├── contexts/
│   └── AppContext.jsx           # React context for state
├── components/
│   ├── Dashboard.jsx            # Main dashboard
│   ├── TransactionForm.jsx      # Transaction entry
│   ├── BudgetForm.jsx           # Budget allocation
│   ├── ProfileSettings.jsx      # Settings
│   ├── TransactionsList.jsx     # Transactions display
│   ├── BudgetSummary.jsx        # Overview
│   └── *.css                    # Component styles
├── App.jsx                      # Main app
└── main.jsx                     # Entry point
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Environment Variables

```
VITE_GOOGLE_OAUTH_CLIENT_ID=your_client_id_here
```

## Building for Production

```bash
npm run build
```

Output: `dist/` directory ready for Firebase hosting

## Key Improvements

1. **Single Source of Truth**: All data in Google Sheets
2. **No Data Loss**: Duplicate detection and update logic
3. **Optimized Performance**: Minimal dependencies and efficient API calls
4. **Mobile First**: Responsive design for all devices
5. **Security**: OAuth2 authentication, no credentials stored
6. **Simplicity**: Clean code, easy to maintain and extend

## Support

For issues:
1. Check troubleshooting section
2. Review Google Sheets data
3. Check browser console for errors
4. Verify Google Cloud Console settings

---

**Note**: This app requires internet connection for Google Sheets access. All data is stored in your personal Google Sheets.
