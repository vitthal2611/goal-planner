import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export const exportToCSV = (data, filename = 'transactions') => {
  const headers = ['Date', 'Type', 'Description', 'Envelope', 'Amount', 'Payment Method'];
  const csvContent = [
    headers.join(','),
    ...data.map(row => [
      row.date,
      row.type || 'expense',
      `"${row.description}"`,
      `"${row.envelope}"`,
      row.amount,
      `"${row.paymentMethod || ''}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  downloadFile(blob, `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
};

export const exportToPDF = (data, filename = 'transactions') => {
  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.text('Transaction Report', 20, 20);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
  
  let y = 50;
  const pageHeight = doc.internal.pageSize.height;
  
  data.forEach((transaction, index) => {
    if (y > pageHeight - 30) {
      doc.addPage();
      y = 20;
    }
    
    doc.text(`${transaction.date} | ${transaction.type || 'expense'} | ${transaction.description}`, 20, y);
    doc.text(`${transaction.envelope} | ₹${transaction.amount} | ${transaction.paymentMethod || ''}`, 20, y + 5);
    y += 15;
  });
  
  doc.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportToExcel = (data, filename = 'transactions') => {
  const worksheet = XLSX.utils.json_to_sheet(data.map(row => ({
    Date: row.date,
    Type: row.type || 'expense',
    Description: row.description,
    Envelope: row.envelope,
    Amount: row.amount,
    'Payment Method': row.paymentMethod || ''
  })));
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
  
  XLSX.writeFile(workbook, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const importFromCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        
        const data = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = line.split(',').map(val => val.replace(/"/g, ''));
          return {
            date: values[0],
            type: values[1],
            description: values[2],
            envelope: values[3],
            amount: parseFloat(values[4]),
            paymentMethod: values[5]
          };
        });
        
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsText(file);
  });
};

export const exportBudgetSummary = (envelopes, transactions, filename = 'budget-summary') => {
  const summaryData = Object.entries(envelopes).flatMap(([category, categoryEnvelopes]) =>
    Object.entries(categoryEnvelopes).map(([name, envelope]) => {
      const spent = transactions
        .filter(t => t.envelope === `${category}.${name}` && t.type !== 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        Category: category,
        Envelope: name,
        Budgeted: envelope.budgeted || 0,
        Spent: spent,
        Remaining: (envelope.budgeted || 0) - spent,
        'Usage %': envelope.budgeted > 0 ? Math.round((spent / envelope.budgeted) * 100) : 0
      };
    })
  );
  
  const worksheet = XLSX.utils.json_to_sheet(summaryData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Budget Summary');
  
  XLSX.writeFile(workbook, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`);
};

const downloadFile = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};