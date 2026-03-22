import React, { useState, useRef, useEffect } from 'react';
import './QuickEntryBar.css';

const QuickEntryBar = ({ 
  envelopes, 
  paymentMethods, 
  onAddTransaction, 
  onAddIncome,
  onTransfer,
  onShowNotification,
  initialMode = 'expense'
}) => {
  const [mode, setMode] = useState(initialMode);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEnvelope, setSelectedEnvelope] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0] || '');
  const [fromPayment, setFromPayment] = useState('');
  const [toPayment, setToPayment] = useState('');
  const amountInputRef = useRef(null);

  useEffect(() => {
    if (paymentMethods.length > 0 && !selectedPayment) {
      setSelectedPayment(paymentMethods[0]);
    }
  }, [paymentMethods, selectedPayment]);

  const handleQuickSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      onShowNotification('error', 'Enter amount');
      return;
    }

    if (mode === 'expense') {
      if (!selectedEnvelope) {
        onShowNotification('error', 'Select category');
        return;
      }
      onAddTransaction({
        category: selectedEnvelope.category,
        envelope: selectedEnvelope.name,
        amount: parseFloat(amount),
        description: `Quick ${selectedEnvelope.name}`,
        paymentMethod: selectedPayment,
        date: date,
        allowOverspend: true
      });
      onShowNotification('success', `₹${amount} spent`);
    } else if (mode === 'income') {
      onAddIncome({
        amount: parseFloat(amount),
        description: 'Quick Income',
        paymentMethod: selectedPayment,
        date: date
      });
      onShowNotification('success', `₹${amount} added`);
    } else if (mode === 'transfer') {
      if (!fromPayment || !toPayment) {
        onShowNotification('error', 'Select accounts');
        return;
      }
      onTransfer(fromPayment, toPayment, parseFloat(amount));
      onShowNotification('success', `₹${amount} transferred`);
    }

    setAmount('');
    amountInputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleQuickSubmit();
    }
  };

  const flatEnvelopes = Object.entries(envelopes).flatMap(([category, envs]) =>
    Object.entries(envs).map(([name, data]) => ({ category, name, ...data }))
  );

  return (
    <div className="quick-entry-bar">
      <div className="quick-entry-form">
        <input
          type="month"
          value={date.substring(0, 7)}
          onChange={(e) => setDate(`${e.target.value}-01`)}
          className="month-picker"
        />
        <input
          ref={amountInputRef}
          type="number"
          inputMode="decimal"
          placeholder="₹ Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyPress={handleKeyPress}
          className="amount-quick-input"
          autoFocus
        />

        {mode === 'expense' && (
          <>
            <select
              value={selectedEnvelope ? `${selectedEnvelope.category}.${selectedEnvelope.name}` : ''}
              onChange={(e) => {
                const [cat, name] = e.target.value.split('.');
                const env = flatEnvelopes.find(env => env.category === cat && env.name === name);
                setSelectedEnvelope(env);
              }}
              className="quick-select"
            >
              <option value="">Category</option>
              {flatEnvelopes.map(env => (
                <option key={`${env.category}.${env.name}`} value={`${env.category}.${env.name}`}>
                  {env.name.toUpperCase()}
                </option>
              ))}
            </select>
            <select
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value)}
              className="quick-select"
            >
              {paymentMethods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </>
        )}

        {mode === 'income' && (
          <select
            value={selectedPayment}
            onChange={(e) => setSelectedPayment(e.target.value)}
            className="quick-select"
          >
            {paymentMethods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        )}

        {mode === 'transfer' && (
          <>
            <select
              value={fromPayment}
              onChange={(e) => setFromPayment(e.target.value)}
              className="quick-select"
            >
              <option value="">From</option>
              {paymentMethods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
            <select
              value={toPayment}
              onChange={(e) => setToPayment(e.target.value)}
              className="quick-select"
            >
              <option value="">To</option>
              {paymentMethods.filter(m => m !== fromPayment).map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </>
        )}

        <button onClick={handleQuickSubmit} className="quick-submit-btn">
          ✓
        </button>
      </div>
    </div>
  );
};

export default QuickEntryBar;
