# 🚀 Quick Start Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Prepare Your Excel File

Your Excel file should be saved as CSV with these columns:

| TrxID | Date | Amt | Description | Payment Mode | TrxType | Envelope |
|-------|------|-----|-------------|--------------|---------|----------|
| 1 | 24/12/25 | 1147 | Old Balance | HDFC | Income | Income |
| 2 | 24/12/25 | -850 | UPI Payment | HDFC | Expense | Food |

### Converting Excel to CSV:

1. Open your Excel file
2. Click **File > Save As**
3. Choose **CSV (Comma delimited) (*.csv)**
4. Save the file

## Step 3: Start the App

```bash
npm run dev
```

The app will open at `http://localhost:5000`

## Step 4: Upload Your Transactions

1. Click **"Choose File"** button
2. Select your CSV file
3. Review the preview (first 10 transactions)
4. Click **"Upload All Transactions"**
5. Wait for completion (don't close the window!)

## ✅ Success!

All your transactions are now in Firebase Firestore!

## 🔍 Verify Upload

Check your Firebase Console:
1. Go to https://console.firebase.google.com
2. Select your project: **goal-planner-b604e**
3. Navigate to **Firestore Database**
4. Look for the **transactions** collection

## ⚠️ Important Notes

- **Atomic Upload**: All transactions upload together or none at all
- **Don't Close Window**: Wait until you see the success message
- **Date Format**: Use DD/MM/YY or DD/MM/YYYY
- **Negative Amounts**: Automatically treated as expenses

## 🐛 Common Issues

### "Could not find header row"
- Make sure your CSV has column headers
- Headers should include: TrxID, Date, Amt, Description

### "User not authenticated"
- The app uses anonymous authentication
- Check your internet connection
- Verify Firebase is accessible

### "Upload failed"
- Check your CSV format
- Ensure all dates are valid
- Verify amounts are numeric

## 📞 Need Help?

Check the full documentation in `BULK_UPLOAD_README.md`
