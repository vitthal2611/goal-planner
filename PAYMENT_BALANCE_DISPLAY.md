# Payment Method Balance Display Enhancement

## Overview
Added real-time balance display to all payment method chips throughout the application.

## Changes Made

### 1. New Function: `getPaymentMethodBalance(method)`
- Calculates net balance for each payment method
- Considers all transaction types:
  - Income: Adds to balance
  - Expense: Subtracts from balance
  - Transfer: Subtracts from source, adds to destination
- Returns the total net balance as a number

### 2. Updated Function: `createPaymentChips()`
- Now displays balance alongside payment method name
- Balance formatting:
  - Positive balance: Green color (#10b981)
  - Negative balance: Red color (#ef4444) with minus sign
  - Format: ₹X,XXX (Indian locale formatting)
- Layout: Icon | Method Name | Balance

### 3. CSS Updates
- Changed grid layout from `minmax(130px, 1fr)` to `minmax(160px, 1fr)` for wider chips
- Mobile: Changed to single column layout (`grid-template-columns: 1fr`)
- Changed alignment from `center` to `flex-start` for better text layout
- Changed text-align from `center` to `left`

## Visual Design
```
┌─────────────────────────────────┐
│ 🏦  HDFC Bank        ₹12,500   │  ← Green (positive)
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 💵  Cash            -₹2,300    │  ← Red (negative)
└─────────────────────────────────┘
```

## Benefits
1. Users can see available balance before selecting payment method
2. Helps prevent overdrafts or selecting accounts with insufficient funds
3. Better financial awareness during transaction entry
4. No need to switch views to check balances

## Mobile Optimization
- Single column layout on mobile (< 400px)
- Maintains readability with 11px font for balance
- Proper spacing and alignment

## Implementation Details
- Balance calculated from all transactions (no date filtering in chips)
- Shows lifetime balance for each payment method
- Updates automatically when new transactions are added
- Color-coded for quick visual feedback

## Files Modified
- `public/index.html`
  - Added `getPaymentMethodBalance()` function
  - Updated `createPaymentChips()` function
  - Modified `.pm-chips` and `.pm-chip` CSS styles
