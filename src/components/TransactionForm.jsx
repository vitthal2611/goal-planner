import React, { useState } from 'react';
import { useBudget } from '../contexts/BudgetContext.jsx';
import './TransactionForm.css';

const TransactionForm = ({ type }) => {
  const { addTransaction, addEnvelope, paymentMethods, getEnvelopeNames, budgetValidation } = useBudget();
  const [formData, setFormData] = useState({
    description: '',
    envelope: '',
    amount: '',
    paymentMethod: '',
    fromMethod: '',
    toMethod: '',
    budgetAmount: '',
  });
  const [error, setError] = useState('');

  const envelopeNames = getEnvelopeNames();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (type === 'income') {
        await addTransaction({
          type: 'Income',
          description: formData.description,
          envelope: 'Income',
          amount: parseFloat(formData.amount),
          paymentMethod: formData.paymentMethod,
        });
      } else if (type === 'expense') {
        await addTransaction({
          type: 'Expense',
          description: formData.description,
          envelope: formData.envelope,
          amount: parseFloat(formData.amount),
          paymentMethod: formData.paymentMethod,
        });
      } else if (type === 'transfer') {
        await addTransaction({
          type: 'Transfer',
          description: formData.description || `${formData.fromMethod} → ${formData.toMethod}`,
          envelope: 'Transfer',
          amount: parseFloat(formData.amount),
          paymentMethod: `${formData.fromMethod} → ${formData.toMethod}`,
        });
      } else if (type === 'budget') {
        await addEnvelope({
          name: formData.envelope,
          budget: parseFloat(formData.budgetAmount),
        });
      }
      
      setFormData({
        description: '',
        envelope: '',
        amount: '',
        paymentMethod: '',
        fromMethod: '',
        toMethod: '',
        budgetAmount: '',
      });
      
      // Refocus on first input after successful submission
      setTimeout(() => {
        const firstInput = document.querySelector('.transaction-form input');
        if (firstInput) firstInput.focus();
      }, 0);
    } catch (error) {
      setError(error.message);
    }
  };

  const renderForm = () => {
    if (type === 'income') {
      return (
        <>
          <input
            type="number"
            inputMode="decimal"
            placeholder="Amount"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
            autoFocus
          />
          <input
            type="text"
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
          <select
            value={formData.paymentMethod}
            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            required
          >
            <option value="">Payment Method</option>
            {paymentMethods.map(pm => (
              <option key={pm.id} value={pm.name}>{pm.name}</option>
            ))}
          </select>
        </>
      );
    }

    if (type === 'expense') {
      return (
        <>
          <input
            type="number"
            inputMode="decimal"
            placeholder="Amount"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
            autoFocus
          />
          <input
            type="text"
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
          <select
            value={formData.envelope}
            onChange={(e) => setFormData({ ...formData, envelope: e.target.value })}
            required
          >
            <option value="">Envelope</option>
            {envelopeNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <select
            value={formData.paymentMethod}
            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            required
          >
            <option value="">Payment Method</option>
            {paymentMethods.map(pm => (
              <option key={pm.id} value={pm.name}>{pm.name}</option>
            ))}
          </select>
        </>
      );
    }

    if (type === 'transfer') {
      return (
        <>
          <input
            type="number"
            inputMode="decimal"
            placeholder="Amount"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
            autoFocus
          />
          <select
            value={formData.fromMethod}
            onChange={(e) => setFormData({ ...formData, fromMethod: e.target.value })}
            required
          >
            <option value="">From</option>
            {paymentMethods.map(pm => (
              <option key={pm.id} value={pm.name}>{pm.name}</option>
            ))}
          </select>
          <select
            value={formData.toMethod}
            onChange={(e) => setFormData({ ...formData, toMethod: e.target.value })}
            required
          >
            <option value="">To</option>
            {paymentMethods.map(pm => (
              <option key={pm.id} value={pm.name}>{pm.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </>
      );
    }

    if (type === 'budget') {
      return (
        <>
          <input
            type="text"
            placeholder="Envelope Name"
            value={formData.envelope}
            onChange={(e) => setFormData({ ...formData, envelope: e.target.value })}
            required
            list="envelope-suggestions"
            autoFocus
          />
          <datalist id="envelope-suggestions">
            {envelopeNames.map(name => (
              <option key={name} value={name} />
            ))}
          </datalist>
          <input
            type="number"
            inputMode="decimal"
            placeholder="Budget Amount"
            value={formData.budgetAmount}
            onChange={(e) => setFormData({ ...formData, budgetAmount: e.target.value })}
            required
          />
        </>
      );
    }
  };

  const getButtonText = () => {
    switch (type) {
      case 'income': return '💰 Add Income';
      case 'expense': return '💸 Add Expense';
      case 'transfer': return '🔄 Transfer';
      case 'budget': return '📋 Allocate Budget';
      default: return 'Submit';
    }
  };

  return (
    <>
      {type === 'expense' && !budgetValidation.isValid && (
        <div className="validation-alert">
          ⚠️ Income (₹{budgetValidation.income.toLocaleString()}) and Allocated (₹{budgetValidation.allocated.toLocaleString()}) must match. 
          {budgetValidation.difference > 0 
            ? `Allocate ₹${budgetValidation.difference.toLocaleString()} more to envelopes` 
            : `Reduce allocation by ₹${Math.abs(budgetValidation.difference).toLocaleString()} or add more income`}
        </div>
      )}
      {error && <div className="error-alert">❌ {error}</div>}
      <form className="transaction-form" onSubmit={handleSubmit}>
        {renderForm()}
        <button type="submit" className="btn-primary" disabled={type === 'expense' && !budgetValidation.isValid}>
          {getButtonText()}
        </button>
      </form>
    </>
  );
};

export default TransactionForm;
