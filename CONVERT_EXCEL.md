# 📊 How to Convert Your Excel File

## Method 1: Save as CSV (Recommended)

1. Open your Excel file `Transactions-final.xls`
2. Click **File > Save As**
3. Choose location
4. In "Save as type" dropdown, select **CSV (Comma delimited) (*.csv)**
5. Click **Save**
6. If Excel asks about features, click **Yes** to continue

## Method 2: Copy-Paste to Google Sheets

1. Open your Excel file
2. Select all data (Ctrl+A)
3. Copy (Ctrl+C)
4. Go to Google Sheets (sheets.google.com)
5. Create new sheet
6. Paste (Ctrl+V)
7. Click **File > Download > Comma Separated Values (.csv)**

## Method 3: Use the Sample Format

I've created a sample CSV file for you: `sample-transactions.csv`

Your file should look like this:

```
TrxID,Date,Amt,Description,Payment Mode,TrxType,Envelope
1,24/12/25,1147,Old Balance,HDFC,Income,Income
2,24/12/25,201700,SALARY FOR DEC-25,HDFC,Income,Income
3,24/12/25,-850,UPI Payment,HDFC,Expense,Food
```

## ⚠️ Important Column Names

Make sure your CSV has these exact column names (case doesn't matter):

- **TrxID** or **Transaction ID** or **ID**
- **Date**
- **Amt** or **Amount**
- **Description** or **Desc**
- **Payment Mode** or **Payment Method** or **Account**
- **TrxType** or **Type** or **Transaction Type**
- **Envelope** or **Category** (optional)

## 🔍 Verify Your CSV

Open your CSV file in Notepad to verify it looks correct:

```
TrxID,Date,Amt,Description,Payment Mode,TrxType,Envelope
1,24/12/25,1147,Old Balance,HDFC,Income,Income
2,24/12/25,-850,UPI Payment,HDFC,Expense,
```

Each line should have values separated by commas.

## 🐛 Still Getting Errors?

If you still see "Could not find header row":

1. Make sure the first row contains column headers
2. Check that there are no empty rows at the top
3. Verify the file is actually CSV format (not XLS or XLSX)
4. Try opening in Notepad - you should see commas between values

## 📧 Need Help?

Share the first 3 lines of your CSV file and I can help debug!
