# Google Sheets Integration Setup

## Overview
Your budget planner now uses Google Sheets API instead of Firebase for data storage. Each data type (income, expenses, transfers, budgets) is stored in separate sheets within a single spreadsheet.

## Required Environment Variables

Add these to your `.env` file:

```env
VITE_GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id
VITE_GOOGLE_SHEETS_ID=your_spreadsheet_id_optional
```

## Setup Steps

### 1. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Sheets API
4. Create OAuth 2.0 credentials (Web application)
5. Add your domain to authorized origins

### 2. OAuth Configuration
- **Authorized JavaScript origins**: `http://localhost:5173` (for development)
- **Authorized redirect URIs**: Not required for this implementation
- **Scopes**: `https://www.googleapis.com/auth/spreadsheets`

### 3. Spreadsheet Structure
The system automatically creates these sheets:
- **Income**: Monthly income records
- **Expenses**: All expense transactions  
- **Transfers**: Money transfers between accounts
- **Budgets**: Budget allocations per category/envelope

### 4. Data Format
Sample data structure matches your requirement:
```
Month     | Type    | Description  | Envelope | Category | Amount | Payment Method
2026-01   | Expense | Quick expense| BAI      | BAI      | 5000   | HDFC
2026-01   | Expense | Car wash     | BAI      | BAI      | 400    | HDFC
```

## Features
- ✅ Single authorization per user
- ✅ Automatic spreadsheet creation if not exists
- ✅ Separate sheets for different data types
- ✅ Real-time data sync
- ✅ Offline-capable with caching
- ✅ Structured data format matching your sample

## Usage
1. User authorizes once with Google OAuth
2. System creates/uses spreadsheet automatically
3. All transactions saved to appropriate sheets
4. Data loads from sheets on app startup

## Migration from Firebase
The new system replaces Firebase completely. Your existing data structure is preserved but now stored in Google Sheets format.