# 🔧 Paste Import Troubleshooting

## Issue: "Could not find header row"

This happens when the parser can't detect your column headers. Here's how to fix it:

### ✅ Solution 1: Ensure Headers are Present

Your first line MUST contain column headers. The parser looks for these keywords:

**Required (at least 2):**
- Date, Dt, Txn Date, Transaction Date
- Amount, Amt, Debit, Credit, Value
- Description, Desc, Particulars, Narration, Details

**Optional:**
- Payment, Method, Account, Bank
- Type, Expense, Income, Category, Envelope
- ID, Sno, Sr No, Transaction ID

### ✅ Solution 2: Correct Format

Your header row should look like this:

```
ID   Date   Amount   Description   Payment Method   Expense Type   Category/Envelope
```

Or simpler:

```
Date   Amount   Description
```

### ✅ Solution 3: Copy from Excel Correctly

When copying from Excel:

1. **Select the entire range** including headers
2. Press Ctrl+C (Windows) or Cmd+C (Mac)
3. Paste into the textarea
4. Click "Analyze & Preview"

### ✅ Solution 4: Check Your Data

Make sure:
- ✅ First line has text headers (not numbers)
- ✅ Headers contain words like "Date", "Amount", "Description"
- ✅ Data starts from second line
- ✅ Columns are separated by spaces, tabs, or commas

### 📋 Working Example

```
ID   Date   Amount   Description   Payment Method   Expense Type   Category/Envelope
1   24/12/25   1147   Old Balance   HDFC   Income   Income
2   24/12/25   201700   NEFT CR-SALARY   HDFC   Income   Income
3   24/12/25   -850   UPI-GUPTA BINAYKUMAR   HDFC   Expense   Food
4   24/12/25   -825   UPI-PANKAJ HARDWARE   HDFC   Expense   Shopping
```

### 🔍 What the Parser Looks For

The parser checks the first 20 lines for a header row by:

1. Looking for keywords: date, amount, description, payment, type, id
2. Counting how many keywords it finds
3. If it finds 2+ keywords, it treats that line as the header
4. If no header found but first line has dates/numbers, it creates default headers

### ⚠️ Common Mistakes

❌ **No header row**
```
1   24/12/25   1147   Old Balance
2   24/12/25   201700   NEFT CR-SALARY
```

✅ **With header row**
```
ID   Date   Amount   Description
1   24/12/25   1147   Old Balance
2   24/12/25   201700   NEFT CR-SALARY
```

❌ **Headers in wrong language**
```
आईडी   तारीख   राशि   विवरण
```

✅ **Headers in English**
```
ID   Date   Amount   Description
```

### 🎯 Quick Fix

If you keep getting the error, try this minimal format:

```
Date, Amount, Description
24/12/25, 1147, Old Balance
24/12/25, -850, UPI Payment
```

This simple format always works!

### 🔧 Advanced: Manual Headers

If your data doesn't have headers, add them manually:

**Before:**
```
1   24/12/25   1147   Old Balance   HDFC
2   24/12/25   -850   UPI Payment   HDFC
```

**After (add first line):**
```
ID   Date   Amount   Description   Payment
1   24/12/25   1147   Old Balance   HDFC
2   24/12/25   -850   UPI Payment   HDFC
```

### 📞 Still Not Working?

Try these steps:

1. **Check the browser console** (F12) for detailed error messages
2. **Try with just 2-3 rows** to test
3. **Use the sample file** `test-paste-data.txt` to verify it works
4. **Convert to CSV** and use file upload instead

### 💡 Pro Tips

- Copy directly from Excel/Sheets (preserves formatting)
- Don't manually type the data
- Include all column headers in the first row
- Use consistent date format (DD/MM/YY or DD/MM/YYYY)
- Negative amounts for expenses work automatically

### 📚 See Also

- `PASTE_IMPORT_GUIDE.md` - Complete paste import guide
- `test-paste-data.txt` - Working sample data
- `sample-bank-statement.txt` - Full bank statement example
