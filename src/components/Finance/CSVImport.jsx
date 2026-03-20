import { useState, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useFinanceStore } from '../../store/financeStore';
import { parseCSV } from '../../utils/csvParser';
import toast from 'react-hot-toast';
import './CSVImport.css';

export default function CSVImport() {
  const { user } = useAuthStore();
  const { addMultipleTransactions, paymentMethods, envelopes } = useFinanceStore();
  const fileInputRef = useRef(null);
  
  const [showPreview, setShowPreview] = useState(false);
  const [parsedData, setParsedData] = useState([]);
  const [fileName, setFileName] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const parsed = parseCSV(text);
        
        if (parsed.length === 0) {
          toast.error('No valid data found in CSV');
          return;
        }

        setParsedData(parsed);
        setShowPreview(true);
      } catch (error) {
        toast.error('Error parsing CSV file');
        console.error(error);
      }
    };

    reader.readAsText(file);
  };

  const handleImport = () => {
    const validTransactions = parsedData.filter(t => t.errors.length === 0);
    
    if (validTransactions.length === 0) {
      toast.error('No valid transactions to import');
      return;
    }

    // Auto-add new payment methods and envelopes
    const newPaymentMethods = new Set();
    const newEnvelopes = new Set();

    validTransactions.forEach(t => {
      if (t.payment && !paymentMethods.includes(t.payment)) {
        newPaymentMethods.add(t.payment);
      }
      if (t.envelope && !envelopes.includes(t.envelope)) {
        newEnvelopes.add(t.envelope);
      }
    });

    if (newPaymentMethods.size > 0) {
      toast.success(`Added ${newPaymentMethods.size} new payment methods`);
    }
    if (newEnvelopes.size > 0) {
      toast.success(`Added ${newEnvelopes.size} new categories`);
    }

    addMultipleTransactions(validTransactions, user.uid);
    toast.success(`✅ Imported ${validTransactions.length} transactions!`);
    
    setShowPreview(false);
    setParsedData([]);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCancel = () => {
    setShowPreview(false);
    setParsedData([]);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validCount = parsedData.filter(t => t.errors.length === 0).length;
  const errorCount = parsedData.filter(t => t.errors.length > 0).length;

  return (
    <div className="csv-import">
      <div className="csv-info-box">
        <div className="csv-info-title">📊 Import from CSV / Excel</div>
        <div className="csv-required-columns">
          <div className="csv-label">Required columns:</div>
          <div className="csv-chips">
            <span className="csv-chip">Date</span>
            <span className="csv-chip">Type</span>
            <span className="csv-chip">Description</span>
            <span className="csv-chip">Category</span>
            <span className="csv-chip">Payment Method</span>
            <span className="csv-chip">Expense Type</span>
            <span className="csv-chip">Amount</span>
          </div>
        </div>
        <div className="csv-hints">
          💡 Type: <strong>income</strong>, <strong>expense</strong>, <strong>transfer</strong><br/>
          💡 Expense Type: <strong>need</strong>, <strong>want</strong>, <strong>save</strong><br/>
          ✅ Adds to existing data — no data loss
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.txt"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <button
        className="csv-upload-btn"
        onClick={() => fileInputRef.current?.click()}
      >
        📂 Choose CSV / Excel File
      </button>

      {showPreview && (
        <div className="csv-preview-modal">
          <div className="csv-preview-content">
            <div className="csv-preview-header">
              <h3 className="csv-preview-title">📊 CSV Preview</h3>
              <button className="csv-close-btn" onClick={handleCancel}>×</button>
            </div>

            <div className="csv-stats">
              ✅ {validCount} valid transaction{validCount !== 1 ? 's' : ''}
              {errorCount > 0 && ` • ⚠️ ${errorCount} error${errorCount !== 1 ? 's' : ''}`}
            </div>

            {errorCount > 0 && (
              <div className="csv-errors">
                <strong>Errors found:</strong>
                {parsedData
                  .filter(t => t.errors.length > 0)
                  .slice(0, 3)
                  .map((t, i) => (
                    <div key={i}>• {t.errors.join(', ')}</div>
                  ))}
              </div>
            )}

            <div className="csv-preview-list">
              {parsedData
                .filter(t => t.errors.length === 0)
                .slice(0, 10)
                .map((t, i) => (
                  <div key={i} className="csv-preview-card">
                    <div className="csv-card-header">
                      <span className="csv-card-type">
                        {t.type === 'income' ? '💰' : t.type === 'transfer' ? '🔄' : '💸'} {t.type}
                      </span>
                      <span className="csv-card-amount">₹{t.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="csv-card-desc">{t.description}</div>
                    <div className="csv-card-meta">
                      {t.envelope && `${t.envelope} • `}
                      {t.payment && `${t.payment} • `}
                      {t.expenseType && `${t.expenseType}`}
                    </div>
                  </div>
                ))}
            </div>

            {parsedData.filter(t => t.errors.length === 0).length > 10 && (
              <div className="csv-more-rows">
                + {parsedData.filter(t => t.errors.length === 0).length - 10} more transactions...
              </div>
            )}

            <div className="csv-preview-actions">
              <button className="csv-cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
              <button className="csv-confirm-btn" onClick={handleImport}>
                ✅ Import {validCount} Transaction{validCount !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
