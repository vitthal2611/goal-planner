# 📊 Bulk Transaction Upload App

A React + Vite application for bulk uploading transactions to Firebase Firestore with atomic operations (all or nothing).

## 🚀 Features

- **Atomic Uploads**: All transactions upload together or none at all (using Firestore batch)
- **CSV/Excel Support**: Parse and upload transactions from your Excel files
- **Date Format Support**: Handles DD/MM/YY and DD/MM/YYYY formats
- **Live Preview**: See first 10 transactions before uploading
- **Progress Tracking**: Real-time upload progress indicator
- **Error Handling**: Clear error messages if upload fails

## 📋 Prerequisites

- Node.js 16 or higher
- Firebase project (already configured in your app)

## 🛠️ Installation

1. Install dependencies:
```bash
npm install
```

## 🎯 Usage

1. Start the development server:
```bash
npm run dev
```

2. Open your browser to `http://localhost:5000`

3. Click "Choose File" and select your CSV/Excel file

4. Review the preview of transactions

5. Click "Upload All Transactions"

6. Wait for the atomic upload to complete

## 📄 File Format

Your CSV/Excel file should have these columns:

- **TrxID**: Transaction ID (e.g., 1, 2, 3...)
- **Date**: Transaction date (DD/MM/YY or DD/MM/YYYY)
- **Amt**: Amount (negative for expenses, positive for income)
- **Description**: Transaction description
- **Payment Mode**: Payment method (e.g., HDFC, Cash)
- **TrxType**: Transaction type (Income, Expense, Transfer)
- **Envelope**: Category/envelope (optional)

### Example CSV Format:

```csv
TrxID,Date,Amt,Description,Payment Mode,TrxType,Envelope
1,24/12/25,1147,Old Balance,HDFC,Income,Income
2,24/12/25,-850,UPI Payment,HDFC,Expense,Food
3,25/12/25,-200,Shopping,HDFC,Expense,Shopping
```

## 🔥 How Atomic Upload Works

The app uses Firestore's batch write feature:

1. All transactions are added to a batch
2. The batch is committed in a single operation
3. If ANY transaction fails, NONE are saved
4. This ensures data consistency

```javascript
const batch = db.batch();
transactions.forEach(txn => {
  const docRef = db.collection('transactions').doc();
  batch.set(docRef, txn);
});
await batch.commit(); // All or nothing!
```

## 🏗️ Build for Production

```bash
npm run build
```

## 🚀 Deploy to Firebase

```bash
npm run deploy:hosting
```

## 📊 Transaction Data Structure

Each transaction is stored with:

```javascript
{
  id: "TRX-123",
  date: "2025-12-24",
  amount: 850,
  description: "UPI Payment",
  paymentMode: "HDFC",
  type: "expense",
  envelope: "Food",
  userId: "user-id",
  createdAt: Timestamp,
  uploadedAt: "2026-03-23T..."
}
```

## ⚠️ Important Notes

- Maximum 500 transactions per batch (Firestore limit)
- For larger files, the app will need to be modified to use multiple batches
- Anonymous authentication is enabled by default for testing
- Replace with proper authentication in production

## 🐛 Troubleshooting

### Upload fails with "User not authenticated"
- Check Firebase authentication is working
- Ensure anonymous auth is enabled in Firebase Console

### CSV parsing errors
- Verify your file has the correct column headers
- Check date format is DD/MM/YY or DD/MM/YYYY
- Ensure amounts are numeric

### Batch write limit exceeded
- Firestore has a 500 document limit per batch
- For files with >500 transactions, split into multiple batches

## 📝 License

MIT
