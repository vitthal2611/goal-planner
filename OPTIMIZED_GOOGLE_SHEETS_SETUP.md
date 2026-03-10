# Optimized Google Sheets Budget Planner Setup

## Overview
This optimized version uses Google Sheets API with OAuth2 authentication to store all budget data. No Firebase, no bulk operations, no CSV imports - just clean, fast Google Sheets integration.

## Features
- ✅ Single OAuth2 authorization per user
- ✅ Automatic sheet creation if not exists
- ✅ Separate sheets for Income, Expenses, Transfers, and Budgets
- ✅ Optimized performance with caching
- ✅ Data integrity protection
- ✅ Real-time data synchronization
- ❌ No Firebase dependency
- ❌ No bulk operations
- ❌ No CSV import/export
- ❌ No backup functionality

## Setup Instructions

### 1. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Sheets API
4. Create OAuth 2.0 credentials (Web application)
5. Add your domain to authorized origins
6. Copy the Client ID

### 2. Environment Configuration
Update your `.env` file:
```env
VITE_GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id_here
# Optional: Specific spreadsheet ID (if not provided, app creates new one)
# VITE_GOOGLE_SHEETS_ID=your_spreadsheet_id_here
```

### 3. Sheet Structure
The app automatically creates these sheets:
- **Income**: Month, Description, Amount, Payment Method, Date, ID
- **Expenses**: Month, Type, Description, Envelope, Category, Amount, Payment Method, Date, ID  
- **Transfers**: Month, From, To, Amount, Description, Date, ID
- **Budgets**: Month, Category, Envelope, Budgeted, Spent

### 4. Sample Data Format
Based on your requirements, data is stored as:
```
Month: 2026-01
Type: Expense
Description: Quick expense
Envelope: BAI
Category: BAI
Amount: 5000
Payment Method: HDFC
```

## Performance Optimizations
- **Caching**: 30-second cache for read operations
- **Batch Operations**: Efficient API calls
- **Minimal Data Transfer**: Only necessary data
- **Optimized Queries**: Targeted sheet operations
- **Error Handling**: Robust error recovery

## Usage
1. User clicks "Authorize Google Sheets"
2. OAuth2 flow completes
3. App creates/accesses spreadsheet
4. All data operations sync to Google Sheets
5. Real-time updates across devices

## Data Security
- OAuth2 with minimal required scopes
- No data stored locally
- All data in user's Google account
- Automatic token refresh
- Secure API communication

## API Limits
- Google Sheets API: 300 requests per minute per project
- 100 requests per 100 seconds per user
- Optimized to stay well within limits

## Troubleshooting
- Ensure Google Sheets API is enabled
- Check OAuth2 credentials configuration
- Verify authorized domains
- Clear browser cache if authentication fails