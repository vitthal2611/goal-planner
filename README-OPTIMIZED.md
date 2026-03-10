# Budget Planner - Google Sheets Dashboard

A modern, mobile-friendly budget planner that uses Google Sheets as the single source of truth. Track income, expenses, transfers, and budget allocations seamlessly across all your devices.

## ✨ Features

- 💰 **Income Tracking** - Record income from various sources
- 💸 **Expense Management** - Track expenses by category and envelope
- 🔄 **Fund Transfers** - Transfer money between payment methods
- 📋 **Budget Allocation** - Set and monitor budget limits for categories
- 💳 **Payment Methods** - Configure and manage payment methods
- 📱 **Mobile Optimized** - Touch-friendly responsive design
- 🔐 **Secure OAuth2** - Google OAuth2 authentication
- ☁️ **Cloud Storage** - Data stored in Google Sheets
- ⚡ **Real-time Sync** - Changes sync instantly across devices
- 🚀 **High Performance** - Optimized caching and minimal API calls

## 🚀 Quick Start

### Prerequisites

1. **Google Account** - You need a Google account to use Google Sheets
2. **Google Cloud Project** - Set up OAuth2 credentials

### Setup Instructions

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd goal-planner
   npm install
   ```

2. **Configure Google OAuth2**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google Sheets API
   - Create OAuth2 credentials (Web application)
   - Add your domain to authorized origins
   - Copy the Client ID

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your OAuth2 Client ID:
   ```
   VITE_GOOGLE_OAUTH_CLIENT_ID=your_client_id_here
   ```

4. **Run the Application**
   ```bash
   npm run dev
   ```

5. **Access and Authorize**
   - Open `http://localhost:5173`
   - Click "Authorize Google Sheets"
   - Start managing your budget!

## 📱 Usage Guide

### First Time Setup

1. **Authorize Google Sheets** - One-time OAuth2 authentication
2. **Configure Payment Methods** - Add your accounts (HDFC, SBI Credit Card, etc.)
3. **Set Monthly Budget** - Allocate budget to categories/envelopes
4. **Start Tracking** - Add income and expenses

### Daily Usage

#### Adding Income
- Go to Income tab → Enter amount, description, payment method → Add Income

#### Recording Expenses  
- Go to Expense tab → Fill amount, description, category, envelope, payment method → Add Expense

#### Transferring Funds
- Go to Transfer tab → Select accounts, enter amount → Transfer Funds

#### Budget Management
- Go to Budget tab → Enter category, envelope, amount → Allocate Budget

### Data Structure

Google Sheet automatically created with:

#### Transactions Sheet
```
Month | Type | Description | Envelope | Category | Amount | Payment Method | Date | ID
2026-01 | Expense | Dmart grocery | DMART | DMART | 1500 | HDFC | 2026-01-15 | abc123
```

#### Budgets Sheet
```
Month | Category | Envelope | Budgeted | Spent
2026-01 | DMART | DMART | 15000 | 8500
```

#### PaymentMethods Sheet
```
Name | Type | Active
HDFC | card | true
SBI Credit Card | card | true
```

## 🏗️ Architecture

### Core Components

- **OptimizedApp.jsx** - Main application with authentication
- **OptimizedDashboard.jsx** - Mobile-first dashboard interface
- **OptimizedBudgetContext.jsx** - State management with React Context
- **optimizedGoogleSheetsService.js** - Google Sheets API integration

### Key Features

- **Single Source of Truth** - All data in Google Sheets
- **Optimized Caching** - 30-second cache for better performance
- **Mobile-First Design** - Touch-friendly interface
- **Real-time Updates** - Automatic data synchronization
- **Error Handling** - Comprehensive error management
- **Data Integrity** - No data loss with proper validation

## 🔧 Technical Details

### Performance Optimizations

- **Efficient API Calls** - Batch operations and caching
- **Minimal Dependencies** - Only React and Vite
- **Lazy Loading** - Components loaded on demand
- **Optimized Rendering** - React best practices

### Security

- **OAuth2 Authentication** - Secure Google authentication
- **No Local Storage** - All data in Google Sheets
- **Client-side Only** - No server-side data processing
- **HTTPS Communication** - Encrypted API calls

## 📱 Mobile Features

- **Touch Optimized** - 44px minimum touch targets
- **Responsive Design** - Works on all screen sizes
- **Fast Loading** - Optimized for mobile networks
- **Gesture Support** - Swipe and touch interactions

## 🛠️ Development

### Project Structure

```
src/
├── components/
│   └── OptimizedDashboard.jsx
├── contexts/
│   └── OptimizedBudgetContext.jsx
├── services/
│   └── optimizedGoogleSheetsService.js
├── OptimizedApp.jsx
├── OptimizedApp.css
└── index.jsx
```

### Building for Production

```bash
npm run build
```

### Deployment

Deploy to any static hosting service:
- Netlify: `npm run deploy:netlify`
- Vercel: `npm run deploy:vercel`
- GitHub Pages
- Firebase Hosting

## 🔍 Troubleshooting

### Common Issues

1. **Authorization Failed**
   - Check OAuth2 Client ID in `.env`
   - Verify authorized origins in Google Cloud Console
   - Clear browser cache

2. **Spreadsheet Access Issues**
   - Ensure Google Sheets API is enabled
   - Check OAuth2 permissions
   - Verify spreadsheet sharing settings

3. **Performance Issues**
   - Check internet connection
   - Clear browser cache
   - Refresh to reload data

## 📊 Sample Data

The app works with data in this format:

```
Month: 2026-01
Type: Expense
Description: Dmart grocery shopping
Envelope: DMART
Category: DMART
Amount: 1500
Payment Method: HDFC
```

Budget allocation example:
- EMI envelope: ₹85,000 budget for 2026-03
- All EMI transactions deducted from EMI envelope

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check troubleshooting section
2. Search existing issues
3. Create new issue with details

---

**Note**: This app requires internet connection for Google Sheets access. All data is stored in your personal Google Sheets, ensuring complete privacy and data ownership.