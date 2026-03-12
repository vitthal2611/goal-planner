import React, { useState, useEffect, useRef } from 'react';
import { useBudget } from '../contexts/BudgetContext.jsx';
import './QuickAddFAB.css';

const QuickAddFAB = () => {
  const { addTransaction, paymentMethods, getEnvelopeNames } = useBudget();
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [envelope, setEnvelope] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [recentTransactions, setRecentTransactions] = useState([]);
  const amountInputRef = useRef(null);

  const envelopeNames = getEnvelopeNames();

  // Load smart defaults from localStorage
  useEffect(() => {
    const lastEnvelope = localStorage.getItem('lastEnvelope');
    const lastPayment = localStorage.getItem('lastPayment');
    const recent = JSON.parse(localStorage.getItem('recentTransactions') || '[]');
    
    if (lastEnvelope) setEnvelope(lastEnvelope);
    if (lastPayment) setPaymentMethod(lastPayment);
    setRecentTransactions(recent.slice(0, 3));
  }, []);

  // Focus amount input when opened
  useEffect(() => {
    if (isOpen && amountInputRef.current) {
      amountInputRef.current.focus();
    }
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setAmount('');
    setDescription('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const transaction = {
        type: 'Expense',
        description: description || 'Quick expense',
        envelope,
        amount: parseFloat(amount),
        paymentMethod,
      };

      await addTransaction(transaction);

      // Save to smart defaults
      localStorage.setItem('lastEnvelope', envelope);
      localStorage.setItem('lastPayment', paymentMethod);
      
      // Save to recent transactions
      const recent = JSON.parse(localStorage.getItem('recentTransactions') || '[]');
      recent.unshift({ description, envelope, amount: parseFloat(amount) });
      localStorage.setItem('recentTransactions', JSON.stringify(recent.slice(0, 5)));

      handleClose();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleQuickAdd = async (recent) => {
    try {
      await addTransaction({
        type: 'Expense',
        description: recent.description,
        envelope: recent.envelope,
        amount: recent.amount,
        paymentMethod,
      });
      handleClose();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && amount && envelope && paymentMethod) {
      handleSubmit(e);
    }
  };

  return (
    <>
      {/* FAB Button */}
      <button 
        className="quick-add-fab" 
        onClick={handleOpen}
        title="Quick Add Expense"
      >
        <span className="fab-icon">+</span>
      </button>

      {/* Bottom Sheet */}
      {isOpen && (
        <>
          <div className="quick-add-overlay" onClick={handleClose} />
          <div className="quick-add-sheet">
            <div className="sheet-header">
              <h3>💸 Quick Add Expense</h3>
              <button className="btn-close" onClick={handleClose}>✕</button>
            </div>

            {/* Recent Transactions */}
            {recentTransactions.length > 0 && (
              <div className="recent-section">
                <div className="recent-label">Recent</div>
                <div className="recent-list">
                  {recentTransactions.map((recent, idx) => (
                    <button
                      key={idx}
                      className="recent-item"
                      onClick={() => handleQuickAdd(recent)}
                    >
                      <span className="recent-desc">{recent.description}</span>
                      <span className="recent-amount">₹{recent.amount}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Form */}
            <form className="quick-form" onSubmit={handleSubmit}>
              <input
                ref={amountInputRef}
                type="number"
                inputMode="decimal"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyPress={handleKeyPress}
                className="quick-input amount-input"
                required
              />

              <input
                type="text"
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyPress={handleKeyPress}
                className="quick-input"
              />

              <select
                value={envelope}
                onChange={(e) => setEnvelope(e.target.value)}
                className="quick-select"
                required
              >
                <option value="">Select Envelope</option>
                {envelopeNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>

              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="quick-select"
                required
              >
                <option value="">Payment Method</option>
                {paymentMethods.map(pm => (
                  <option key={pm.id} value={pm.name}>{pm.name}</option>
                ))}
              </select>

              <button 
                type="submit" 
                className="btn-quick-submit"
                disabled={!amount || !envelope || !paymentMethod}
              >
                Add Expense
              </button>
            </form>
          </div>
        </>
      )}
    </>
  );
};

export default QuickAddFAB;
