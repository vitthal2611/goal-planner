# 📋 Paste Import Guide

## Overview
The Bulk Upload feature now supports **direct paste import** - copy transaction data from Excel, Google Sheets, bank statements, or any spreadsheet and paste it directly into the UI!

## How to Use

### Method 1: Upload File (Original)
1. Click "Upload File" tab
2. Choose your CSV file
3. Preview and upload

### Method 2: Paste Data (New!)
1. Click "Paste Data" tab
2. Copy data from your source (Excel, Google Sheets, bank statement)
3. Paste into the text area
4. Click "Analyze & Preview"
5. Review the parsed transactions
6. Click "Upload All Transactions"

## Supported Paste Formats

### CSV Format (Comma Separated)
```
Date, Amount, Description, Payment Mode, TrxType, Envelope
01/01/24, 500, Groceries, HDFC, expense, Food
02/01/24, 1000, Salary, Bank, income, Salary
```

### Tab Separated (Excel Copy)
```
Date	Amount	Description	Payment Mode
01/01/24	500	Groceries	HDFC
02/01/24	-200	Shopping	Credit Card
```

### Bank Statement Format
```
Date, Particulars, Debit, Credit, Account
01/01/2024, ATM Withdrawal, 500, , HDFC
02/01/2024, Salary Credit, , 50000, HDFC
```

## Column Mapping

The system automatically detects these column names (case-insensitive):

| Data Field | Recognized Column Names |
|------------|------------------------|
| Date | Date, Transaction Date |
| Amount | Amount, Amt, Debit, Credit |
| Description | Description, Desc, Particulars, Narration, Note |
| Payment Mode | Payment Mode, Payment, Account, Bank, Method |
| Type | Type, TrxType, Transaction Type |
| Envelope | Envelope, Category, Tag |
| Transaction ID | ID, TrxID, Transaction ID |

## Date Formats Supported

- DD/MM/YY (e.g., 01/01/24)
- DD/MM/YYYY (e.g., 01/01/2024)
- YYYY-MM-DD (e.g., 2024-01-01)
- DD-MM-YYYY (e.g., 01-01-2024)

## Smart Features

### Auto Type Detection
- Negative amounts → Automatically marked as "expense"
- Positive amounts → Automatically marked as "income"
- Can be overridden with TrxType column

### Flexible Delimiters
- Comma separated (CSV)
- Tab separated (Excel/Sheets)
- Mixed formats detected automatically

### Header Detection
- Automatically finds header row (checks first 20 lines)
- Looks for common patterns: "date", "amount", "description"
- Falls back to first line if no standard header found

## Tips for Best Results

1. **Include Headers**: Always include a header row with column names
2. **Required Fields**: Date and Amount are mandatory
3. **Clean Data**: Remove extra spaces, special characters from amounts
4. **Consistent Dates**: Use the same date format throughout
5. **Test Small**: Try with 5-10 transactions first to verify format

## Example: Copy from Excel

1. Open your Excel file
2. Select the data range (including headers)
3. Press Ctrl+C (Windows) or Cmd+C (Mac)
4. Go to Bulk Upload → Paste Data tab
5. Click in the text area and paste (Ctrl+V or Cmd+V)
6. Click "Analyze & Preview"

## Example: Bank Statement

Most bank statements can be copied directly:

```
Transaction Date, Description, Debit, Credit, Balance
01/01/2024, ATM Withdrawal, 500.00, , 45000.00
02/01/2024, Grocery Store, 1200.50, , 43799.50
05/01/2024, Salary Credit, , 50000.00, 93799.50
```

Just copy the relevant columns and paste!

## Troubleshooting

### "No valid transactions found"
- Check if Date and Amount columns are present
- Verify date format is recognized
- Ensure amounts are numeric (remove currency symbols)

### "Error parsing data"
- Check for mismatched quotes in descriptions
- Verify delimiter consistency (all commas or all tabs)
- Remove empty rows between data

### Wrong transaction types
- Add a "TrxType" column with values: income, expense, transfer
- Or use negative amounts for expenses

## Advanced: Transfer Transactions

For transfers between accounts, include these columns:
```
Date, Amount, Type, From Account, To Account
01/01/24, 5000, transfer, HDFC, Savings
```

## Benefits

✅ No need to save CSV files  
✅ Copy directly from any source  
✅ Faster workflow  
✅ Same validation and preview  
✅ Atomic upload (all or nothing)  

## Need Help?

See also:
- `BULK_UPLOAD_README.md` - General bulk upload guide
- `CONVERT_EXCEL.md` - Converting Excel files to CSV
- `QUICKSTART.md` - Getting started guide
