import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useFinanceStore } from '../../store/financeStore';
import toast from 'react-hot-toast';
import './TransactionModal.css';

export default function TransactionModal({ isOpen, onClose, type: initialType }) {
  const { user } = useAuthStore();
  const { paymentMethods, envelopes, addTransaction, addMultipleTransactions } = useFinanceStore();
  
  const [type, setType] = useState(initialType || 'expense');
  const [entries, setEntries] = useState([{
    amount: '',
    description: '',
    payment: '',
    envelope: '',
    expenseType: 'need',
    from: '',
    to: ''
  }]);

  const addEntry = () => {
    const lastEntry = entries[entries.length - 1];
    setEntries([...entries, {
      amount: '',
      description: '',
      payment: lastEntry.payment,
      envelope: lastEntry.envelope,
      expenseType: 'need',
      from: '',
      to: ''
    }]);
  };

  const removeEntry = (index) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index, field, value) => {
    const updated = [...entries];
    updated[index][field] = value;
    setEntries(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (type === 'expense' && entries.length > 1) {
      // Multiple expenses
      const transactions = entries.map(entry => ({
        type: 'expense',
        amount: parseFloat(entry.amount),
        description: entry.description || 'Expense',
        payment: entry.payment,
        envelope: entry.envelope,
        expenseType: entry.expenseType,
        date: new Date().toISOString()
      }));
      
      addMultipleTransactions(transactions, user.uid);
      toast.success(`${entries.length} expenses added!`);
    } else {
      // Single transaction
      const entry = entries[0];
      
      if (type === 'transfer') {
        if (!entry.amount || !entry.from || !entry.to) {
          toast.error('Please fill all transfer fields');
          return;
        }
        
        addTransaction({
          type: 'transfer',
          amount: parseFloat(entry.amount),
          from: entry.from,
          to: entry.to,
          description: entry.description || `Transfer from ${entry.from} to ${entry.to}`,
          date: new Date().toISOString()
        }, user.uid);
        
        toast.success('Transfer added! 🔄');
      } else if (type === 'income') {
        if (!entry.amount || !entry.payment) {
          toast.error('Please fill amount and payment method');
          return;
        }
        
        addTransaction({
          type: 'income',
          amount: parseFloat(entry.amount),
          description: entry.description || 'Income',
          payment: entry.payment,
          date: new Date().toISOString()
        }, user.uid);
        
        toast.success('Income added! 💰');
      } else {
        if (!entry.amount || !entry.payment || !entry.envelope) {
          toast.error('Please fill all fields');
          return;
        }
        
        addTransaction({
          type: 'expense',
          amount: parseFloat(entry.amount),
          description: entry.description || 'Expense',
          payment: entry.payment,
          envelope: entry.envelope,
          expenseType: entry.expenseType,
          date: new Date().toISOString()
        }, user.uid);
        
        toast.success('Expense added! 💸');
      }
    }

    // Reset and close
    setEntries([{
      amount: '',
      description: '',
      payment: '',
      envelope: '',
      expenseType: 'need',
      from: '',
      to: ''
    }]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {type === 'income' ? '💰 Add Income' : type === 'transfer' ? '🔄 Transfer Money' : '💸 Add Expense'}
          </h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="type-selector">
          <button
            className={`type-btn ${type === 'income' ? 'active' : ''}`}
            onClick={() => setType('income')}
          >
            💰 Income
          </button>
          <button
            className={`type-btn ${type === 'expense' ? 'active' : ''}`}
            onClick={() => setType('expense')}
          >
            💸 Expense
          </button>
          <button
            className={`type-btn ${type === 'transfer' ? 'active' : ''}`}
            onClick={() => setType('transfer')}
          >
            🔄 Transfer
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {entries.map((entry, index) => (
            <div key={index} className="transaction-entry">
              {entries.length > 1 && (
                <div className="entry-header">
                  <span>Expense #{index + 1}</span>
                  <button type="button" className="remove-entry-btn" onClick={() => removeEntry(index)}>
                    ✕
                  </button>
                </div>
              )}

              <input
                type="number"
                placeholder="Amount"
                value={entry.amount}
                onChange={(e) => updateEntry(index, 'amount', e.target.value)}
                className="transaction-input"
                step="0.01"
                required
              />

              <input
                type="text"
                placeholder="Description"
                value={entry.description}
                onChange={(e) => updateEntry(index, 'description', e.target.value)}
                className="transaction-input"
              />

              {type === 'transfer' ? (
                <>
                  <select
                    value={entry.from}
                    onChange={(e) => updateEntry(index, 'from', e.target.value)}
                    className="transaction-select"
                    required
                  >
                    <option value="">From Account</option>
                    {paymentMethods.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>

                  <select
                    value={entry.to}
                    onChange={(e) => updateEntry(index, 'to', e.target.value)}
                    className="transaction-select"
                    required
                  >
                    <option value="">To Account</option>
                    {paymentMethods.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </>
              ) : (
                <>
                  <select
                    value={entry.payment}
                    onChange={(e) => updateEntry(index, 'payment', e.target.value)}
                    className="transaction-select"
                    required
                  >
                    <option value="">Payment Method</option>
                    {paymentMethods.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>

                  {type === 'expense' && (
                    <>
                      <select
                        value={entry.envelope}
                        onChange={(e) => updateEntry(index, 'envelope', e.target.value)}
                        className="transaction-select"
                        required
                      >
                        <option value="">Category</option>
                        {envelopes.map(e => (
                          <option key={e} value={e}>{e}</option>
                        ))}
                      </select>

                      <div className="expense-type-selector">
                        <button
                          type="button"
                          className={`expense-type-btn ${entry.expenseType === 'need' ? 'active need' : ''}`}
                          onClick={() => updateEntry(index, 'expenseType', 'need')}
                        >
                          🎯 Need
                        </button>
                        <button
                          type="button"
                          className={`expense-type-btn ${entry.expenseType === 'want' ? 'active want' : ''}`}
                          onClick={() => updateEntry(index, 'expenseType', 'want')}
                        >
                          🎉 Want
                        </button>
                        <button
                          type="button"
                          className={`expense-type-btn ${entry.expenseType === 'save' ? 'active save' : ''}`}
                          onClick={() => updateEntry(index, 'expenseType', 'save')}
                        >
                          💰 Save
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          ))}

          {type === 'expense' && (
            <button type="button" className="add-another-btn" onClick={addEntry}>
              + Add Another Expense
            </button>
          )}

          <button type="submit" className="submit-transaction-btn">
            {type === 'income' ? 'Add Income' : type === 'transfer' ? 'Transfer Money' : 
             entries.length > 1 ? `Add ${entries.length} Expenses` : 'Add Expense'}
          </button>
        </form>
      </div>
    </div>
  );
}
