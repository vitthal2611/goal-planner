// Simple script to convert your Excel data to CSV format
// Run with: node convert-excel-to-csv.js

const fs = require('fs');

// Sample data from your Excel file
const sampleData = [
  { TrxID: 1, Date: '24/12/25', Amt: 1147, Description: 'Old Balance', PaymentMode: 'HDFC', TrxType: 'Income', Envelope: 'Income' },
  { TrxID: 2, Date: '24/12/25', Amt: 201700, Description: 'SALARY FOR DEC-25', PaymentMode: 'HDFC', TrxType: 'Income', Envelope: 'Income' },
  { TrxID: 3, Date: '24/12/25', Amt: -850, Description: 'UPI-GUPTA BINAYKUMAR', PaymentMode: 'HDFC', TrxType: 'Expense', Envelope: '' },
];

// Convert to CSV
function convertToCSV(data) {
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Escape commas and quotes in descriptions
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

// Example usage
const csv = convertToCSV(sampleData);
console.log('CSV Output:');
console.log(csv);

// Save to file
fs.writeFileSync('sample-transactions.csv', csv);
console.log('\n✅ Saved to sample-transactions.csv');

// Instructions
console.log('\n📋 To convert your full Excel file:');
console.log('1. Open your Excel file');
console.log('2. Save As > CSV (Comma delimited)');
console.log('3. Make sure columns are: TrxID, Date, Amt, Description, Payment Mode, TrxType, Envelope');
console.log('4. Upload the CSV file in the app');
