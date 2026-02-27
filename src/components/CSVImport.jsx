import React, { useState } from 'react';
import { sanitizeInput } from '../utils/sanitize';
import './CSVImport.css';

const CSVImport = ({ envelopes, paymentMethods, dateRange, onClose, onSubmit }) => {
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState('');

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const [envelope, amount, description, paymentMethod, date] = lines[i].split(',').map(s => s.trim());
      if (envelope && amount) {
        data.push({ envelope, amount, description: description || '', paymentMethod: paymentMethod || paymentMethods[0], date: date || new Date().toISOString().split('T')[0] });
      }
    }
    return data;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = parseCSV(event.target.result);
        if (parsed.length === 0) {
          setError('No valid expenses found in CSV');
          return;
        }
        setExpenses(parsed);
        setError('');
      } catch (err) {
        setError('Invalid CSV format');
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = () => {
    const valid = expenses.filter(e => e.envelope && parseFloat(e.amount) > 0).map(e => ({
      ...e,
      description: sanitizeInput(e.description || 'CSV import'),
      amount: parseFloat(e.amount)
    }));

    if (valid.length === 0) {
      setError('No valid expenses to import');
      return;
    }

    onSubmit(valid);
    onClose();
  };

  const downloadTemplate = () => {
    const csv = `envelope,amount,description,paymentMethod,date
needs.grocery,2500,Monthly groceries,HDFC,2026-01-15
needs.milk,450,Daily milk,Cash,2026-01-16
needs.vegetable,800,Weekly vegetables,GPay,2026-01-17
needs.petrol,3000,Fuel for car,Credit Card,2026-01-18
needs.electricity,1200,Monthly bill,HDFC,2026-01-19
needs.water,300,Water bill,HDFC,2026-01-20
needs.gas,900,LPG cylinder,Cash,2026-01-21
needs.medical,500,Pharmacy,HDFC,2026-01-22
wants.misc,1000,Entertainment,Credit Card,2026-01-23
wants.salary-bai,5000,House help salary,Cash,2026-01-24`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expense_template.csv';
    a.click();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="csv-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📥 Import Expenses from CSV</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="csv-content">
          <button className="btn btn-secondary" onClick={downloadTemplate}>
            📄 Download Template
          </button>

          <input type="file" accept=".csv" onChange={handleFileUpload} className="file-input" />

          {error && <div className="error-msg">{error}</div>}

          {expenses.length > 0 && (
            <div className="preview">
              <h4>Preview ({expenses.length} expenses)</h4>
              <div className="preview-list">
                {expenses.slice(0, 5).map((e, i) => (
                  <div key={i} className="preview-item">
                    {e.envelope} - ₹{e.amount} - {e.description}
                  </div>
                ))}
                {expenses.length > 5 && <div className="preview-more">+{expenses.length - 5} more</div>}
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-success" onClick={handleSubmit} disabled={expenses.length === 0}>
            Import {expenses.length} Expenses
          </button>
        </div>
      </div>
    </div>
  );
};

export default CSVImport;
