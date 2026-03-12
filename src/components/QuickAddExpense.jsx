import React, { useState, useEffect, useRef } from 'react';
import { useBudget } from '../contexts/BudgetContext.jsx';
import './QuickAddExpense.css';

const QuickAddExpense = () => {
  const { addTransaction, paymentMethods, getEnvelopeNames } = useBudget();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    envelope: '',
    paymentMethod: '',
  });
  const [recentItems, setRecentItems] = useState({
    descriptions: [],
    envelopes: [],
  });

  const amountRef = useRef(null);
  const envelopeNames = getEnvelopeNames();

  useEffect(() => {
    const stored = localStorage.getItem('recentExpenses');
    if (stored) {
      setRecentItems(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (isOpen && step === 1 && amountRef.current) {
      amountRef.current.focus();
    }
  }, [isOpen, step]);

  const handleOpen = () => {
    setIsOpen(true);
    setStep(1);
  };

  const handleClose = () => {
    setIsOpen(false);
    setStep(1);
    setFormData({ amount: '', description: '', envelope: '', paymentMethod: '' });
  };

  const handleNext = () => {
    if (step === 1 && formData.amount) setStep(2);
    else if (step === 2 && formData.description) setStep(3);
    else if (step === 3 && formData.envelope) setStep(4);
  };

  const handleSubmit = async () => {
    if (!formData.paymentMethod) return;

    try {
      await addTransaction({
        type: 'Expense',
        description: formData.description,
        envelope: formData.envelope,
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
      });

      // Save to recent items
      const newRecent = {
        descriptions: [formData.description, ...recentItems.descriptions.filter(d => d !== formData.description)].slice(0, 5),
        envelopes: [formData.envelope, ...recentItems.envelopes.filter(e => e !== formData.envelope)].slice(0, 5),
      };
      setRecentItems(newRecent);
      localStorage.setItem('recentExpenses', JSON.stringify(newRecent));

      handleClose();
    } catch (error) {
      alert('Error adding expense: ' + error.message);
    }
  };

  const commonAmounts = [50, 100, 200, 500, 1000, 2000];

  return (
    <>
      {/* Floating Action Button */}
      <button className="fab" onClick={handleOpen} aria-label="Quick add expense">
        <span className="fab-icon">💸</span>
      </button>

      {/* Bottom Sheet Modal */}
      {isOpen && (
        <div className="quick-add-overlay" onClick={handleClose}>
          <div className="quick-add-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            
            <div className="sheet-header">
              <h3>Quick Add Expense</h3>
              <button className="btn-close-sheet" onClick={handleClose}>✕</button>
            </div>

            <div className="sheet-progress">
              <div className={`progress-dot ${step >= 1 ? 'active' : ''}`} />
              <div className={`progress-dot ${step >= 2 ? 'active' : ''}`} />
              <div className={`progress-dot ${step >= 3 ? 'active' : ''}`} />
              <div className={`progress-dot ${step >= 4 ? 'active' : ''}`} />
            </div>

            <div className="sheet-body">
              {/* Step 1: Amount */}
              {step === 1 && (
                <div className="step-content">
                  <label className="step-label">How much?</label>
                  <div className="amount-input-wrapper">
                    <span className="currency-symbol">₹</span>
                    <input
                      ref={amountRef}
                      type="number"
                      inputMode="decimal"
                      className="amount-input"
                      placeholder="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                    />
                  </div>
                  <div className="quick-amounts">
                    {commonAmounts.map(amt => (
                      <button
                        key={amt}
                        className="quick-amount-btn"
                        onClick={() => setFormData({ ...formData, amount: amt.toString() })}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Description */}
              {step === 2 && (
                <div className="step-content">
                  <label className="step-label">What for?</label>
                  <input
                    type="text"
                    className="text-input"
                    placeholder="e.g., Groceries, Lunch, Uber"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                    autoFocus
                  />
                  {recentItems.descriptions.length > 0 && (
                    <div className="recent-items">
                      <div className="recent-label">Recent:</div>
                      {recentItems.descriptions.map((desc, idx) => (
                        <button
                          key={idx}
                          className="recent-item-btn"
                          onClick={() => setFormData({ ...formData, description: desc })}
                        >
                          {desc}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Envelope */}
              {step === 3 && (
                <div className="step-content">
                  <label className="step-label">Which category?</label>
                  <div className="envelope-grid">
                    {envelopeNames.map(name => (
                      <button
                        key={name}
                        className={`envelope-btn ${formData.envelope === name ? 'selected' : ''}`}
                        onClick={() => setFormData({ ...formData, envelope: name })}
                      >
                        📁 {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Payment Method */}
              {step === 4 && (
                <div className="step-content">
                  <label className="step-label">Payment method?</label>
                  <div className="payment-grid">
                    {paymentMethods.map(pm => (
                      <button
                        key={pm.id}
                        className={`payment-btn ${formData.paymentMethod === pm.name ? 'selected' : ''}`}
                        onClick={() => setFormData({ ...formData, paymentMethod: pm.name })}
                      >
                        <div className="payment-icon">
                          {pm.type === 'Bank' ? '🏦' : pm.type === 'Cash' ? '💵' : '💳'}
                        </div>
                        <div className="payment-name">{pm.name}</div>
                        <div className="payment-type">{pm.type}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sheet-footer">
              {step > 1 && (
                <button className="btn-back" onClick={() => setStep(step - 1)}>
                  ← Back
                </button>
              )}
              {step < 4 ? (
                <button 
                  className="btn-next" 
                  onClick={handleNext}
                  disabled={
                    (step === 1 && !formData.amount) ||
                    (step === 2 && !formData.description) ||
                    (step === 3 && !formData.envelope)
                  }
                >
                  Next →
                </button>
              ) : (
                <button 
                  className="btn-submit" 
                  onClick={handleSubmit}
                  disabled={!formData.paymentMethod}
                >
                  ✓ Add Expense
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickAddExpense;
