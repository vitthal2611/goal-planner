# Google Sheets Integration - Setup Complete

## Files Created:

1. `.env` - Environment variables with API key
2. `src/utils/googleSheetsAPI.js` - Google Sheets API utilities
3. `src/hooks/usePaymentMethods.js` - Updated to use Google Sheets

## Setup Instructions:

### Step 1: Make Google Sheet Accessible
1. Open: https://docs.google.com/spreadsheets/d/1Eqa25EkEi4zj2wCGDamuYsDK6blEUHfbAnENqE9Nvsw/edit
2. Click Share button (top right)
3. Change to "Anyone with the link" - Viewer
4. Click Done

### Step 2: Create Sheet Tab
1. In your Google Sheet, create a new tab named: **PaymentMethods**
2. The code will auto-create columns: UserID, PaymentMethod, UsageCount

### Step 3: Test
```bash
npm run dev
```

## Data Structure:

| UserID | PaymentMethod | UsageCount |
|--------|---------------|------------|
| user123 | Cash | 0 |
| user123 | UPI | 0 |

Each user's data is isolated by Firebase UID.

## How It Works:

- **Read**: Fetches payment methods from Google Sheets filtered by user ID
- **Add**: Appends new payment method to sheet
- **Delete**: Removes payment method from sheet
- **Update**: Bulk updates payment methods

## Troubleshooting:

- Verify sheet is shared publicly
- Check tab name is exactly "PaymentMethods"
- Verify API key in .env file
- Restart dev server after changing .env
