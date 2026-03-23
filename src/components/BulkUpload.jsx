import React, { useState } from 'react';
import './BulkUpload.css';

const BulkUpload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [pasteMode, setPasteMode] = useState(false);
  const [pastedText, setPastedText] = useState('');

  const parseDate = (dateStr) => {
    if (!dateStr) return '';
    
    // Remove any extra spaces
    dateStr = dateStr.trim();
    
    // Support DD/MM/YY and DD/MM/YYYY formats
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      let year = parts[2];
      
      // Convert 2-digit year to 4-digit
      if (year.length === 2) {
        const yearNum = parseInt(year);
        // 00-50 = 2000-2050, 51-99 = 1951-1999
        year = yearNum <= 50 ? `20${year}` : `19${year}`;
      }
      
      return `${year}-${month}-${day}`;
    }
    
    // Support YYYY-MM-DD format (already correct)
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateStr;
    }
    
    // Support DD-MM-YYYY format
    const dashParts = dateStr.split('-');
    if (dashParts.length === 3 && dashParts[0].length <= 2) {
      const day = dashParts[0].padStart(2, '0');
      const month = dashParts[1].padStart(2, '0');
      let year = dashParts[2];
      if (year.length === 2) {
        const yearNum = parseInt(year);
        year = yearNum <= 50 ? `20${year}` : `19${year}`;
      }
      return `${year}-${month}-${day}`;
    }
    
    return dateStr;
  };

  const parseCSV = (text) => {
    const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      throw new Error('No data found');
    }

    let headerLine = -1;

    // Find header row - VERY flexible detection
    for (let i = 0; i < Math.min(lines.length, 20); i++) {
      const lower = lines[i].toLowerCase();
      
      // Check for any common header keywords
      const hasDateColumn = /\b(date|dt|txn\s*date|transaction\s*date)\b/.test(lower);
      const hasAmountColumn = /\b(amt|amount|debit|credit|value|₹|rs)\b/.test(lower);
      const hasDescColumn = /\b(desc|description|particular|narration|detail)\b/.test(lower);
      const hasPaymentColumn = /\b(payment|method|account|bank)\b/.test(lower);
      const hasTypeColumn = /\b(type|expense|income|category|envelope)\b/.test(lower);
      const hasIdColumn = /\b(id|sno|sr\s*no|transaction\s*id|trx\s*id)\b/.test(lower);
      
      // Count how many header-like columns we found
      const headerScore = [hasDateColumn, hasAmountColumn, hasDescColumn, hasPaymentColumn, hasTypeColumn, hasIdColumn].filter(Boolean).length;
      
      // If we find 2 or more header keywords, consider it a header
      if (headerScore >= 2) {
        headerLine = i;
        console.log('Found header at line:', i, ':', lines[i]);
        console.log('Header score:', headerScore);
        break;
      }
    }

    if (headerLine === -1) {
      // Try to detect if first line looks like data (has numbers and dates)
      const firstLine = lines[0];
      const hasNumber = /\d+/.test(firstLine);
      const hasDatePattern = /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(firstLine);
      const hasNegativeAmount = /-\d+/.test(firstLine);
      
      // Check if first line looks like data
      if (hasNumber && hasDatePattern && lines.length > 1) {
        console.warn('First line looks like data. Creating default headers.');
        const cols = splitCSVLine(lines[0]);
        // Create generic headers based on column count
        const defaultHeaders = ['id', 'date', 'amount', 'description', 'payment', 'method', 'type', 'category'];
        lines.unshift(defaultHeaders.slice(0, cols.length).join('   '));
        headerLine = 0;
      } else {
        // Assume first line is header even if we can't detect it
        console.warn('Using first line as header (fallback)');
        headerLine = 0;
      }
    }

    const headers = splitCSVLine(lines[headerLine]).map(h => 
      h.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
    );

    console.log('Detected headers:', headers);
    console.log('Raw header line:', lines[headerLine]);

    const transactions = [];
    let transactionCounter = 1; // Start counter for incremental IDs
    
    for (let i = headerLine + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = splitCSVLine(line);
      if (cols.length < 2) continue;

      const row = {};
      headers.forEach((h, idx) => {
        row[h] = (cols[idx] || '').trim();
      });

      console.log('Sample row:', i === headerLine + 1 ? row : null);

      // Map to transaction format - handle various column name variations
      const trxId = row.trxid || row.id || row.transactionid || row.sno || row.srno || `TRX-${Date.now()}-${i}`;
      const dateStr = row.date || row.transactiondate || row.txndate || row.dt || '';
      const date = parseDate(dateStr);
      const amountStr = row.amt || row.amount || row.debit || row.credit || row.value || '0';
      const amount = parseFloat(amountStr.replace(/[^0-9.\-]/g, '') || '0');
      const description = row.description || row.desc || row.particulars || row.narration || row.details || row.detail || '';
      const paymentMode = row.paymentmode || row.payment || row.paymentmethod || row.account || row.bank || row.method || 'HDFC';
      const trxTypeRaw = row.trxtype || row.type || row.transactiontype || row.expensetype || '';
      const trxType = trxTypeRaw.toLowerCase() || (amount < 0 ? 'expense' : 'income');
      const envelope = row.envelope || row.category || row.categoryenvelope || '';

      if (date && !isNaN(amount) && amount !== 0) {
        // Generate incremental ID based on type
        let generatedId;
        if (trxType === 'income') {
          generatedId = `INC-${String(transactionCounter).padStart(4, '0')}`;
        } else if (trxType === 'expense') {
          generatedId = `EXP-${String(transactionCounter).padStart(4, '0')}`;
        } else if (trxType === 'transfer') {
          generatedId = `TRF-${String(transactionCounter).padStart(4, '0')}`;
        } else {
          generatedId = `TRX-${String(transactionCounter).padStart(4, '0')}`;
        }
        
        transactions.push({
          id: trxId || generatedId,
          date,
          amount: Math.abs(amount),
          description,
          paymentMode,
          type: trxType,
          envelope,
          isNegative: amount < 0
        });
        
        transactionCounter++;
      }
    }

    console.log('Total transactions parsed:', transactions.length);
    return transactions;
  };

  const splitCSVLine = (line) => {
    // First check if it's tab-delimited
    if (line.includes('\t')) {
      return line.split('\t').map(s => s.trim());
    }
    
    // Check if it's comma-delimited with quotes
    if (line.includes(',')) {
      const result = [];
      let current = '';
      let inQuotes = false;

      for (const ch of line) {
        if (ch === '"') {
          inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += ch;
        }
      }
      result.push(current.trim());
      return result;
    }
    
    // Handle whitespace-delimited (multiple spaces/tabs)
    // Split by 2+ spaces or tabs, which indicates column separation
    return line.split(/\s{2,}|\t+/).map(s => s.trim()).filter(s => s);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        console.log('File loaded, first 500 chars:', text.substring(0, 500));
        
        const transactions = parseCSV(text);
        console.log('Parsed transactions:', transactions.length);
        
        if (transactions.length === 0) {
          alert('No valid transactions found in file. Please check the format.');
          setFile(null);
          return;
        }
        
        setPreview(transactions.slice(0, 10));
      } catch (error) {
        console.error('Parse error:', error);
        alert(`Error parsing file: ${error.message}\n\nPlease check CONVERT_EXCEL.md for help.`);
        setFile(null);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handlePasteAnalyze = () => {
    if (!pastedText.trim()) {
      alert('Please paste some transaction data first');
      return;
    }

    try {
      const transactions = parseCSV(pastedText);
      
      if (transactions.length === 0) {
        alert('No valid transactions found. Please check the format.');
        return;
      }
      
      setPreview(transactions.slice(0, 10));
      setPasteMode(false);
    } catch (error) {
      console.error('Parse error:', error);
      alert(`Error parsing data: ${error.message}`);
    }
  };

  const uploadToFirebase = async () => {
    if (!file && preview.length === 0) return;

    setUploading(true);
    setProgress(0);
    setResult(null);

    try {
      let transactions;
      
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            transactions = parseCSV(event.target.result);
            await uploadTransactions(transactions);
          } catch (error) {
            handleUploadError(error);
          }
        };
        reader.readAsText(file);
      } else {
        // Upload from pasted preview
        const fullText = pastedText;
        transactions = parseCSV(fullText);
        await uploadTransactions(transactions);
      }
    } catch (error) {
      handleUploadError(error);
    }
  };

  const uploadTransactions = async (transactions) => {
    try {
      // Use Firestore batch for atomic operation
      const db = firebase.firestore();
      const batch = db.batch();
      const userId = firebase.auth().currentUser?.uid;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Add all transactions to batch
      transactions.forEach((txn, index) => {
        const docRef = db.collection('transactions').doc();
        batch.set(docRef, {
          ...txn,
          userId,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          uploadedAt: new Date().toISOString()
        });

        // Update progress
        setProgress(Math.round(((index + 1) / transactions.length) * 100));
      });

      // Commit batch - all or nothing
      await batch.commit();

      setResult({
        success: true,
        count: transactions.length,
        message: `Successfully uploaded ${transactions.length} transactions!`
      });

    } catch (error) {
      console.error('Upload error:', error);
      setResult({
        success: false,
        message: `Upload failed: ${error.message}. No transactions were saved.`
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUploadError = (error) => {
    setResult({
      success: false,
      message: `Error: ${error.message}`
    });
    setUploading(false);
  };

  return (
    <div className="bulk-upload-container">
      <div className="bulk-upload-card">
        <h1>📊 Bulk Transaction Upload</h1>
        <p className="subtitle">Upload your Excel/CSV file or paste transaction data directly</p>

        <div className="mode-toggle">
          <button 
            className={`mode-btn ${!pasteMode ? 'active' : ''}`}
            onClick={() => {
              setPasteMode(false);
              setPastedText('');
              setPreview([]);
            }}
          >
            📁 Upload File
          </button>
          <button 
            className={`mode-btn ${pasteMode ? 'active' : ''}`}
            onClick={() => {
              setPasteMode(true);
              setFile(null);
              setPreview([]);
            }}
          >
            📋 Paste Data
          </button>
        </div>

        {!pasteMode ? (
          <div className="upload-section">
            <input
              type="file"
              accept=".csv,.xls,.xlsx"
              onChange={handleFileChange}
              disabled={uploading}
              id="file-input"
            />
            <label htmlFor="file-input" className="file-label">
              {file ? `📄 ${file.name}` : '📁 Choose File'}
            </label>
          </div>
        ) : (
          <div className="paste-section">
            <textarea
              className="paste-textarea"
              placeholder="Paste your transaction data here...&#10;&#10;Supported formats:&#10;• CSV (comma or tab separated)&#10;• Excel data copied from spreadsheet&#10;• Bank statement text&#10;&#10;Example:&#10;Date, Amount, Description, Payment Mode&#10;01/01/24, 500, Groceries, HDFC&#10;02/01/24, -200, Shopping, Credit Card"
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              disabled={uploading}
            />
            <button 
              className="analyze-btn"
              onClick={handlePasteAnalyze}
              disabled={!pastedText.trim() || uploading}
            >
              🔍 Analyze & Preview
            </button>
          </div>
        )}

        {preview.length > 0 && (
          <div className="preview-section">
            <h3>Preview (first 10 transactions)</h3>
            <div className="preview-cards">
              {preview.map((txn, idx) => (
                <div key={idx} className={`preview-card ${txn.type}`}>
                  <div className="card-header">
                    <span className="txn-id">{txn.id}</span>
                    <span className={`txn-type ${txn.type}`}>{txn.type}</span>
                  </div>
                  <div className="card-body">
                    <div className="txn-description">{txn.description}</div>
                    <div className="txn-details">
                      <span>📅 {txn.date}</span>
                      <span>💳 {txn.paymentMode}</span>
                      {txn.envelope && <span>📁 {txn.envelope}</span>}
                    </div>
                  </div>
                  <div className="card-footer">
                    <span className={`txn-amount ${txn.isNegative ? 'negative' : 'positive'}`}>
                      ₹{txn.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="preview-note">...and {preview.length < 10 ? 0 : 'more'} transactions</p>
          </div>
        )}

        {((file || preview.length > 0) && !uploading && !result) && (
          <button className="upload-btn" onClick={uploadToFirebase}>
            🚀 Upload All Transactions
          </button>
        )}

        {uploading && (
          <div className="progress-section">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="progress-text">Uploading... {progress}%</p>
            <p className="warning-text">⚠️ Do not close this window</p>
          </div>
        )}

        {result && (
          <div className={`result-section ${result.success ? 'success' : 'error'}`}>
            <div className="result-icon">{result.success ? '✅' : '❌'}</div>
            <h3>{result.success ? 'Upload Successful!' : 'Upload Failed'}</h3>
            <p>{result.message}</p>
            {result.success && (
              <button className="reset-btn" onClick={() => {
                setFile(null);
                setPreview([]);
                setResult(null);
                setProgress(0);
                setPastedText('');
              }}>
                Upload More Transactions
              </button>
            )}
          </div>
        )}

        <div className="info-section">
          <h4>ℹ️ Important Notes:</h4>
          <ul>
            <li>Supported formats: CSV (comma or tab separated), pasted text from Excel/spreadsheets</li>
            <li>Required columns: Date, Amt (or Amount), Description</li>
            <li>Optional columns: TrxID, Payment Mode, TrxType, Envelope</li>
            <li>All transactions upload atomically - if one fails, none are saved</li>
            <li>Date format: DD/MM/YY, DD/MM/YYYY, or YYYY-MM-DD</li>
            <li>Negative amounts are treated as expenses</li>
            <li>Paste mode: Copy data directly from Excel, Google Sheets, or bank statements</li>
            <li>See <strong>PASTE_IMPORT_GUIDE.md</strong> for paste examples and tips</li>
            <li>See <strong>CONVERT_EXCEL.md</strong> for help converting files</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BulkUpload;
