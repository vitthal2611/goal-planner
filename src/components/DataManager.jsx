import React, { useState } from 'react';
import { exportToCSV, exportToPDF, exportToExcel, exportBudgetSummary, importFromCSV } from '../services/dataExport.js';

const DataManager = ({ transactions, envelopes, onImportTransactions }) => {
  const [importing, setImporting] = useState(false);

  const handleExport = (format) => {
    if (transactions.length === 0) {
      alert('No transactions to export');
      return;
    }

    switch (format) {
      case 'csv':
        exportToCSV(transactions);
        break;
      case 'pdf':
        exportToPDF(transactions);
        break;
      case 'excel':
        exportToExcel(transactions);
        break;
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImporting(true);
    try {
      const importedData = await importFromCSV(file);
      onImportTransactions(importedData);
      alert(`Successfully imported ${importedData.length} transactions`);
    } catch (error) {
      alert('Error importing file: ' + error.message);
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>📊 Data Management</h3>
      </div>
      <div className="card-content">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          
          <div>
            <h4>Export Data</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                onClick={() => handleExport('csv')} 
                className="btn btn-secondary"
                disabled={transactions.length === 0}
              >
                📄 Export CSV
              </button>
              <button 
                onClick={() => handleExport('excel')} 
                className="btn btn-secondary"
                disabled={transactions.length === 0}
              >
                📊 Export Excel
              </button>
              <button 
                onClick={() => handleExport('pdf')} 
                className="btn btn-secondary"
                disabled={transactions.length === 0}
              >
                📋 Export PDF
              </button>
              <button 
                onClick={() => exportBudgetSummary(envelopes, transactions)} 
                className="btn btn-secondary"
                disabled={Object.keys(envelopes).length === 0}
              >
                📊 Export Budget Summary
              </button>
            </div>
          </div>

          <div>
            <h4>Import Data</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                type="file"
                accept=".csv"
                onChange={handleImport}
                disabled={importing}
                style={{ display: 'none' }}
                id="csv-import"
              />
              <label 
                htmlFor="csv-import" 
                className="btn btn-primary"
                style={{ cursor: importing ? 'not-allowed' : 'pointer', textAlign: 'center' }}
              >
                {importing ? '⏳ Importing...' : '📥 Import CSV'}
              </label>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DataManager;