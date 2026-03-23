# 📋 How to Access Bulk Upload Feature

You have **TWO ways** to import transactions in bulk:

## Option 1: Standalone React Bulk Upload App (NEW PASTE FEATURE!)

This is a dedicated bulk upload interface with the new paste functionality.

### How to Access:
```bash
# Start the development server
npm run dev
```

This opens at `http://localhost:5000` and shows:

### Features:
- ✅ **Upload File Tab** - Upload CSV files
- ✅ **Paste Data Tab** - NEW! Paste directly from Excel/Google Sheets
- ✅ Smart parsing with auto-detection
- ✅ Preview before upload
- ✅ Atomic upload (all or nothing)

### When to Use:
- When you have a large Excel file or bank statement
- When you want to copy-paste data directly
- For bulk imports of 50+ transactions
- First-time data migration

---

## Option 2: Main Life Tracker App (Existing CSV Import)

Your main app already has CSV import built-in!

### How to Access:
1. Open your Life Tracker app (public/index.html)
2. Click the **Profile button** (top-right corner)
3. Scroll down to **"📊 Import from CSV / Excel"** section
4. Click **"📂 Choose CSV / Excel File"**

### Features:
- ✅ CSV file upload
- ✅ Preview with validation
- ✅ Shows missing fields warnings
- ✅ Editable after import
- ✅ Integrated with your existing data

### When to Use:
- Quick imports while using the app
- Small to medium datasets (< 50 transactions)
- When you already have a CSV file ready

---

## Comparison

| Feature | React Bulk Upload | Main App CSV Import |
|---------|------------------|-------------------|
| **Paste from Excel** | ✅ Yes (NEW!) | ❌ No |
| **Upload CSV File** | ✅ Yes | ✅ Yes |
| **Preview** | ✅ Yes | ✅ Yes |
| **Validation** | ✅ Yes | ✅ Yes |
| **Access** | Separate app | Built into main app |
| **Best For** | Large imports, paste data | Quick imports |

---

## Quick Start Guide

### For Paste Import (React App):
1. Run `npm run dev`
2. Click "Paste Data" tab
3. Copy data from Excel (Ctrl+C)
4. Paste into textarea (Ctrl+V)
5. Click "Analyze & Preview"
6. Review and upload

### For File Import (Main App):
1. Open Life Tracker
2. Click Profile button
3. Scroll to CSV Import section
4. Choose your CSV file
5. Review preview
6. Confirm import

---

## Which Should I Use?

### Use React Bulk Upload App if:
- You want to paste data directly from Excel/Sheets
- You have a large dataset to import
- You're doing initial data migration
- You prefer a dedicated import interface

### Use Main App CSV Import if:
- You already have a CSV file
- You're doing quick imports
- You want to stay in the main app
- You need to edit transactions after import

---

## File Formats Supported

Both methods support:
- CSV (comma-separated)
- TSV (tab-separated from Excel)
- Multiple date formats (DD/MM/YY, DD/MM/YYYY, YYYY-MM-DD)
- Negative amounts for expenses
- Auto-type detection

---

## Need Help?

See these guides:
- `PASTE_IMPORT_GUIDE.md` - Detailed paste import guide
- `BULK_UPLOAD_README.md` - General bulk upload help
- `CONVERT_EXCEL.md` - Converting Excel files
- `QUICKSTART.md` - Getting started

---

## Running the Apps

### React Bulk Upload:
```bash
npm run dev          # Development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Main Life Tracker:
Just open `public/index.html` in your browser or deploy to Firebase:
```bash
npm run deploy       # Deploy to Firebase
```

---

## Summary

🎯 **For paste functionality**: Use the React Bulk Upload app (`npm run dev`)  
🎯 **For quick CSV imports**: Use the main app's built-in CSV import (Profile → Import CSV)

Both methods are reliable and use the same parsing logic!
