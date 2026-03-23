# 📋 Import Field Requirements

## ✅ Required Fields (Must Have)

These fields MUST be present and valid, or the transaction will be skipped:

| Field | Description | Example |
|-------|-------------|---------|
| **Date** | Transaction date | 24/12/25, 24/12/2025, 2025-12-24 |
| **Amount** | Transaction amount (non-zero) | 1147, -850, 500.50 |

## 💡 Optional Fields (Can Assign Later)

These fields are optional. If missing, you can assign them later in the Transactions tab:

| Field | Description | Auto-Detected | Can Edit Later |
|-------|-------------|---------------|----------------|
| **Description** | Transaction description | ❌ No | ✅ Yes |
| **Category/Envelope** | Expense category | ❌ No | ✅ Yes |
| **Payment Method** | Payment account/method | ❌ No | ✅ Yes |
| **Type** | income/expense/transfer | ✅ Yes (from amount) | ✅ Yes |
| **Expense Type** | need/want/save | ❌ No | ✅ Yes |
| **ID** | Transaction ID | ✅ Yes (auto-generated) | ❌ No |

## 🎯 Import Behavior

### Valid Transaction (Will Import)
```
Date: 24/12/25 ✅
Amount: -850 ✅
Description: (empty) ⚠️ Can assign later
Category: (empty) ⚠️ Can assign later
Payment: (empty) ⚠️ Can assign later
```
**Result:** ✅ Imported with ID `EXP-0001`

### Invalid Transaction (Will Skip)
```
Date: (empty) ❌
Amount: 0 ❌
Description: UPI Payment
```
**Result:** ❌ Skipped - Missing required fields

## 📊 Preview Indicators

### No Warnings (Complete Data)
```
✅ EXP-0001: UPI Payment
   24/12/25 · Food · HDFC
   ₹850
```

### With Warnings (Missing Optional Fields)
```
⚠️ NEEDS EDIT
EXP-0002: UPI Payment
24/12/25 · ❓ · ❓
💡 Missing description, Missing payment method
₹825
```

## 🔧 How to Assign Missing Fields Later

### Method 1: Transactions Tab
1. Go to **Transactions** tab
2. Find the imported transaction
3. **Double-click** the cell you want to edit
4. Enter the value
5. Press Enter to save

### Method 2: Transaction Modal
1. Click on the transaction
2. Edit in the modal
3. Save changes

## 💡 Best Practices

### Minimal Import (Quick)
Just include Date and Amount - assign everything else later:
```
Date, Amount
24/12/25, 1147
24/12/25, -850
```

### Complete Import (Recommended)
Include all fields for better organization:
```
Date, Amount, Description, Payment Method, Category
24/12/25, 1147, Salary, HDFC, Income
24/12/25, -850, Groceries, HDFC, Food
```

### Bank Statement Import (Common)
Bank statements usually have Date, Amount, Description:
```
Date, Amount, Description, Payment Method
24/12/25, 1147, NEFT CR-SALARY, HDFC
24/12/25, -850, UPI-GROCERY STORE, HDFC
```
Then assign categories later in the app.

## 🎨 Visual Guide

### Import Flow
```
Paste Data
    ↓
Parser checks: Date ✅ + Amount ✅
    ↓
Valid? → Preview with warnings for missing fields
    ↓
Import → Transactions added with IDs
    ↓
Edit later → Assign categories, descriptions, etc.
```

## ⚠️ Common Scenarios

### Scenario 1: Bank Statement (No Categories)
```
ID   Date   Amount   Description   Payment
1   24/12/25   -850   UPI Payment   HDFC
```
**Result:** ✅ Imports successfully
**Warning:** Missing category (assign later)

### Scenario 2: Minimal Data
```
Date, Amount
24/12/25, -850
```
**Result:** ✅ Imports successfully
**Warning:** Missing description, payment, category (assign later)

### Scenario 3: Complete Data
```
Date, Amount, Description, Payment, Category
24/12/25, -850, Groceries, HDFC, Food
```
**Result:** ✅ Imports successfully
**Warning:** None - all fields present

### Scenario 4: Invalid Data
```
Date, Amount
, -850
```
**Result:** ❌ Skipped
**Error:** Invalid date

## 📝 Summary

### Critical Rules
1. ✅ **Date and Amount are REQUIRED**
2. ✅ **Everything else is OPTIONAL**
3. ✅ **Missing optional fields show warnings but still import**
4. ✅ **You can edit any field later in the Transactions tab**

### Workflow
1. Import with minimal data (Date + Amount)
2. Review preview
3. Confirm import
4. Assign categories/descriptions later as needed

This makes bulk imports much faster - you don't need perfect data upfront!
