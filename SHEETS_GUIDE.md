# Google Sheets Structure Guide

## 📊 Spreadsheet: "Budget Tracker"

The app automatically creates a Google Sheets spreadsheet named "Budget Tracker" with 3 sheets.

---

## 📄 Sheet 1: Transactions

**Purpose**: Store all income, expenses, and transfers

### Structure
```
┌─────────┬──────────┬─────────────┬──────────┬────────┬────────────────┐
│  Month  │   Type   │ Description │ Envelope │ Amount │ Payment Method │
├─────────┼──────────┼─────────────┼──────────┼────────┼────────────────┤
│ 2026-01 │ Income   │ Salary      │ Income   │ 50000  │ HDFC Bank      │
│ 2026-01 │ Expense  │ Groceries   │ Food     │ 5000   │ Cash           │
│ 2026-01 │ Expense  │ EMI Payment │ EMI      │ 25000  │ HDFC Bank      │
│ 2026-01 │ Transfer │ Savings     │ Transfer │ 10000  │ HDFC → SBI     │
│ 2026-02 │ Income   │ Salary      │ Income   │ 50000  │ HDFC Bank      │
│ 2026-02 │ Expense  │ Vegetables  │ Food     │ 2000   │ Cash           │
└─────────┴──────────┴─────────────┴──────────┴────────┴────────────────┘
```

### Column Details

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| Month | Text | Format: YYYY-MM | 2026-01 |
| Type | Text | Income, Expense, or Transfer | Expense |
| Description | Text | What the transaction is for | Groceries |
| Envelope | Text | Category/Envelope name | Food |
| Amount | Number | Transaction amount | 5000 |
| Payment Method | Text | Payment method used | Cash |

### Special Envelopes
- **Income**: Used for all income transactions
- **Transfer**: Used for all transfer transactions
- **Custom**: Any envelope you create via budget allocation

---

## 📄 Sheet 2: Envelopes

**Purpose**: Store budget allocations per envelope per month

### Structure
```
┌──────────┬─────────┬─────────┐
│   Name   │  Month  │ Budget  │
├──────────┼─────────┼─────────┤
│ EMI      │ 2026-01 │ 85000   │
│ Food     │ 2026-01 │ 15000   │
│ Transport│ 2026-01 │ 5000    │
│ EMI      │ 2026-02 │ 85000   │
│ Food     │ 2026-02 │ 18000   │
└──────────┴─────────┴─────────┘
```

### Column Details

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| Name | Text | Envelope/Category name | EMI |
| Month | Text | Format: YYYY-MM | 2026-01 |
| Budget | Number | Allocated budget amount | 85000 |

### How It Works
- Each envelope can have different budget per month
- Same envelope name can appear multiple times (different months)
- Budget is allocated from the Budget tab in the app
- Spent amount is calculated from Transactions sheet

---

## 📄 Sheet 3: PaymentMethods

**Purpose**: Store configured payment methods

### Structure
```
┌─────────────┬──────────────┐
│    Name     │     Type     │
├─────────────┼──────────────┤
│ HDFC Bank   │ Bank         │
│ SBI Bank    │ Bank         │
│ ICICI Card  │ Credit Card  │
│ Paytm       │ Wallet       │
│ Cash        │ Cash         │
└─────────────┴──────────────┘
```

### Column Details

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| Name | Text | Payment method name | HDFC Bank |
| Type | Text | Bank, Credit Card, Debit Card, Wallet, Cash | Bank |

### Payment Method Types
- **Bank**: Bank accounts
- **Credit Card**: Credit cards
- **Debit Card**: Debit cards
- **Wallet**: Digital wallets (Paytm, PhonePe, etc.)
- **Cash**: Physical cash

---

## 🔄 Data Flow Examples

### Example 1: Monthly Budget Setup

**Step 1**: Allocate budgets for January 2026
```
Envelopes Sheet:
EMI      | 2026-01 | 85000
Food     | 2026-01 | 15000
Transport| 2026-01 | 5000
```

**Step 2**: Add income
```
Transactions Sheet:
2026-01 | Income | Salary | Income | 50000 | HDFC Bank
```

**Step 3**: Add expenses
```
Transactions Sheet:
2026-01 | Expense | EMI Payment  | EMI      | 25000 | HDFC Bank
2026-01 | Expense | Groceries    | Food     | 5000  | Cash
2026-01 | Expense | Vegetables   | Food     | 2000  | Cash
2026-01 | Expense | Auto Fare    | Transport| 500   | Cash
```

**Result**: Budget Summary shows:
- EMI: ₹25,000 / ₹85,000 (29% used)
- Food: ₹7,000 / ₹15,000 (47% used)
- Transport: ₹500 / ₹5,000 (10% used)

---

### Example 2: Transfer Between Accounts

**Scenario**: Transfer ₹10,000 from HDFC Bank to SBI Bank

**Transactions Sheet**:
```
2026-01 | Transfer | Savings | Transfer | 10000 | HDFC → SBI
```

**Note**: Transfer doesn't affect budget envelopes

---

### Example 3: Over Budget Scenario

**Budget Allocated**:
```
Envelopes Sheet:
Food | 2026-01 | 15000
```

**Expenses**:
```
Transactions Sheet:
2026-01 | Expense | Groceries   | Food | 8000  | Cash
2026-01 | Expense | Vegetables  | Food | 5000  | Cash
2026-01 | Expense | Restaurant  | Food | 4000  | Card
```

**Result**: Budget Summary shows:
- Food: ₹17,000 / ₹15,000 (113% used) ⚠️ OVER BUDGET
- Remaining: -₹2,000 (₹2,000 over)

---

## 📊 Budget Calculation Logic

### For Each Envelope:
1. Get budget from Envelopes sheet for current month
2. Get all expenses from Transactions sheet for current month with matching envelope
3. Calculate: Spent = Sum of all matching expenses
4. Calculate: Remaining = Budget - Spent
5. Calculate: Percentage = (Spent / Budget) × 100

### Color Coding:
- **Green**: 0-80% of budget used
- **Orange**: 80-100% of budget used
- **Red**: Over 100% of budget used

---

## 🎯 Data Normalization

### Envelopes
- Envelope names are case-sensitive
- Same envelope can have different budgets per month
- Envelopes are created when you allocate budget

### Payment Methods
- Each payment method is unique
- Can be used across all transaction types
- Configured once, used everywhere

### Transactions
- Each row is a single transaction
- Month format is always YYYY-MM
- Type is always: Income, Expense, or Transfer
- Amount is always positive number

---

## 🔍 Direct Google Sheets Access

You can directly access and edit the Google Sheets:

1. Go to Google Drive
2. Find "Budget Tracker" spreadsheet
3. Open it
4. View/edit data directly

**Benefits**:
- Backup your data
- Create custom reports
- Use Google Sheets formulas
- Share with others
- Export to Excel

**Warning**: Be careful when editing directly to maintain data integrity!

---

## 📱 App vs. Sheets

### Use App For:
- ✅ Adding transactions
- ✅ Allocating budgets
- ✅ Viewing budget summary
- ✅ Managing payment methods
- ✅ Mobile access

### Use Sheets For:
- ✅ Bulk edits
- ✅ Custom reports
- ✅ Data analysis
- ✅ Backup
- ✅ Sharing

---

## 🎉 Summary

The Google Sheets structure is:
- **Simple**: 3 sheets, clear columns
- **Normalized**: No duplicate data
- **Flexible**: Easy to extend
- **Accessible**: Direct access anytime
- **Reliable**: Google's infrastructure

**Single Source of Truth**: All app data comes from and goes to these sheets!
