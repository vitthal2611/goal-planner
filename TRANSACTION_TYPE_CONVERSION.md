# Transaction Type Conversion Feature

## Overview

You can now convert any transaction between Income, Expense, and Transfer types directly from the edit modal.

## How to Use

1. Open the Transaction Review tab
2. Click the edit button (✏️) on any transaction
3. At the top of the edit modal, you'll see three type buttons:
   - 💰 Income
   - 💸 Expense
   - 🔄 Transfer
4. Click on the desired type to convert the transaction
5. A warning message will appear showing the conversion
6. Fill in the required fields for the new type
7. Click "Save Changes"

## Conversion Logic

### Converting to Transfer
- Clears: Category (envelope), Payment Method, Expense Type
- Requires: From Account and To Account
- Smart field mapping: If the original transaction had a payment method, it's suggested as the "From" account

### Converting to Expense
- Clears: From Account, To Account
- Requires: Payment Method, Category (optional), Expense Type
- Smart field mapping: If converting from transfer, the "From" account becomes the payment method

### Converting to Income
- Clears: Category (envelope), From Account, To Account, Expense Type
- Requires: Payment Method
- Smart field mapping: If converting from transfer, the "To" account becomes the payment method

## Validation

The system validates:
- Amount must be greater than 0
- Transfer: Both From and To accounts must be selected and different
- Expense/Income: Payment method must be selected

## Technical Details

- Transaction IDs are updated to reflect the new type (INC-, EXP-, TRF- prefix)
- Original timestamp is preserved
- Unused fields are cleared when converting types
- Changes are saved to localStorage automatically

## Visual Feedback

- Active type button is highlighted with color-coded styling:
  - Income: Green gradient
  - Expense: Red gradient
  - Transfer: Blue gradient
- Warning banner shows when type is changed
- All form fields update dynamically based on selected type
