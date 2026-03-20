export function parseCSV(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const results = [];
  
  if (lines.length < 2) return results;
  
  const headers = splitCSVLine(lines[0]).map(h => h.toLowerCase().trim());
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = splitCSVLine(line);
    const row = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    const mapped = mapCSVRow(row);
    if (mapped) results.push(mapped);
  }
  
  return results;
}

function splitCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') inQuotes = !inQuotes;
    else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function mapCSVRow(row) {
  const get = (...keys) => {
    for (const key of keys) {
      const value = row[key];
      if (value) return value;
    }
    return '';
  };

  const date = get('date', 'transaction date', 'txn date');
  const type = get('type', 'transaction type', 'txn type').toLowerCase();
  const description = get('description', 'desc', 'details', 'narration');
  const category = get('category', 'envelope', 'tag', 'label');
  const payment = get('payment method', 'payment', 'account', 'mode');
  const expenseType = get('expense type', 'need/want/save', 'classification').toLowerCase();
  const amount = get('amount', 'value', 'sum');

  const errors = [];

  if (!date) errors.push('Missing date');
  if (!type) errors.push('Missing type');
  if (!amount || isNaN(parseFloat(amount))) errors.push('Invalid amount');

  if (errors.length > 0) {
    return { errors, raw: row };
  }

  const transaction = {
    date: new Date(date).toISOString(),
    type: type.includes('income') ? 'income' : 
          type.includes('transfer') ? 'transfer' : 'expense',
    description: description || 'Imported',
    amount: parseFloat(amount),
    errors: []
  };

  if (transaction.type === 'expense') {
    transaction.envelope = category || 'Uncategorized';
    transaction.payment = payment || 'Cash';
    transaction.expenseType = expenseType.includes('want') ? 'want' :
                              expenseType.includes('save') ? 'save' : 'need';
  } else if (transaction.type === 'income') {
    transaction.payment = payment || 'Cash';
  } else if (transaction.type === 'transfer') {
    const parts = payment.split(/to|→/i);
    transaction.from = parts[0]?.trim() || 'Unknown';
    transaction.to = parts[1]?.trim() || 'Unknown';
  }

  return transaction;
}
