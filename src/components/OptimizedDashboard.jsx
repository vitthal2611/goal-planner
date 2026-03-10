import React, { useState, useEffect } from 'react';
import { useOptimizedBudget } from '../contexts/OptimizedBudgetContext.jsx';

const OptimizedDashboard = () => {
  const { state, actions, getSummary } = useOptimizedBudget();
  const [activeTab, setActiveTab] = useState('overview');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [forms, setForms] = useState({
    income: { amount: '', description: '', paymentMethod: '' },
    expense: { amount: '', description: '', envelope: '', category: '', paymentMethod: '' },
    transfer: { from: '', to: '', amount: '', description: '' },
    budget: { category: '', envelope: '', amount: '' },
    payment: { name: '', type: 'card' }
  });

  const summary = getSummary();

  useEffect(() => {
    actions.loadData();
  }, []);

  useEffect(() => {
    if (state.paymentMethods.length > 0 && !forms.income.paymentMethod) {
      const firstMethod = state.paymentMethods[0].name;
      setForms(prev => ({
        ...prev,
        income: { ...prev.income, paymentMethod: firstMethod },
        expense: { ...prev.expense, paymentMethod: firstMethod }
      }));
    }
  }, [state.paymentMethods]);

  const handleFormChange = (formType, field, value) => {
    setForms(prev => ({
      ...prev,
      [formType]: { ...prev[formType], [field]: value }
    }));
  };

  const resetForm = (formType) => {
    const defaultMethod = state.paymentMethods[0]?.name || '';
    const defaults = {
      income: { amount: '', description: '', paymentMethod: defaultMethod },
      expense: { amount: '', description: '', envelope: '', category: '', paymentMethod: defaultMethod },
      transfer: { from: '', to: '', amount: '', description: '' },
      budget: { category: '', envelope: '', amount: '' },
      payment: { name: '', type: 'card' }
    };
    setForms(prev => ({ ...prev, [formType]: defaults[formType] }));
  };

  const handleAddIncome = async () => {
    const { amount, description, paymentMethod } = forms.income;
    if (!amount || !description || !paymentMethod) {
      actions.showNotification('error', 'Please fill all fields');
      return;
    }

    const success = await actions.addIncome({
      amount: parseFloat(amount),
      description,
      paymentMethod
    });

    if (success) resetForm('income');
  };

  const handleAddExpense = async () => {
    const { amount, description, envelope, category, paymentMethod } = forms.expense;
    if (!amount || !description || !envelope || !category || !paymentMethod) {
      actions.showNotification('error', 'Please fill all fields');
      return;
    }

    const success = await actions.addExpense({
      amount: parseFloat(amount),
      description,
      envelope,
      category,
      paymentMethod
    });

    if (success) resetForm('expense');
  };

  const handleAddTransfer = async () => {
    const { from, to, amount, description } = forms.transfer;
    if (!from || !to || !amount) {
      actions.showNotification('error', 'Please fill required fields');
      return;
    }

    if (from === to) {
      actions.showNotification('error', 'Cannot transfer to same account');
      return;
    }

    const success = await actions.addTransfer({
      from,
      to,
      amount: parseFloat(amount),
      description: description || `Transfer from ${from} to ${to}`
    });

    if (success) resetForm('transfer');
  };

  const handleAllocateBudget = async () => {
    const { category, envelope, amount } = forms.budget;
    if (!category || !envelope || !amount) {
      actions.showNotification('error', 'Please fill all fields');
      return;
    }

    const success = await actions.allocateBudget(category, envelope, parseFloat(amount));
    if (success) resetForm('budget');
  };

  const handleAddPaymentMethod = async () => {
    const { name, type } = forms.payment;
    if (!name) {
      actions.showNotification('error', 'Please enter payment method name');
      return;
    }

    const success = await actions.addPaymentMethod({ name, type, active: true });
    if (success) {
      resetForm('payment');
      setShowPaymentModal(false);
    }
  };

  if (state.loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto', padding: '16px', minHeight: '100vh' }}>
      {/* Notification */}
      {state.notification.message && (
        <div style={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          right: '16px',
          padding: '12px',
          borderRadius: '8px',
          backgroundColor: state.notification.type === 'error' ? '#fee' : '#efe',
          color: state.notification.type === 'error' ? '#c33' : '#363',
          border: `1px solid ${state.notification.type === 'error' ? '#fcc' : '#cfc'}`,
          zIndex: 1000,
          textAlign: 'center'
        }}>
          {state.notification.message}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' }}>
          💰 Budget Planner
        </h1>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          {state.currentPeriod}
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '12px', 
        marginBottom: '24px' 
      }}>
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px', 
          textAlign: 'center',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>
            ₹{summary.income.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Income</div>
        </div>
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px', 
          textAlign: 'center',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc3545' }}>
            ₹{summary.expenses.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Expenses</div>
        </div>
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px', 
          textAlign: 'center',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: summary.balance >= 0 ? '#28a745' : '#dc3545' 
          }}>
            ₹{summary.balance.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Balance</div>
        </div>
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px', 
          textAlign: 'center',
          border: '1px solid #e9ecef'
        }}>
          <button
            onClick={() => setShowPaymentModal(true)}
            style={{
              padding: '8px 12px',
              backgroundColor: '#6f42c1',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            💳 Payment Methods
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        overflowX: 'auto', 
        marginBottom: '24px',
        borderBottom: '1px solid #ddd',
        gap: '4px'
      }}>
        {[
          { key: 'overview', label: '📊', title: 'Overview' },
          { key: 'income', label: '💰', title: 'Income' },
          { key: 'expense', label: '💸', title: 'Expense' },
          { key: 'transfer', label: '🔄', title: 'Transfer' },
          { key: 'budget', label: '📋', title: 'Budget' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '12px 16px',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: activeTab === tab.key ? '2px solid #007bff' : '2px solid transparent',
              color: activeTab === tab.key ? '#007bff' : '#666',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontSize: '14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              minWidth: '60px'
            }}
          >
            <span style={{ fontSize: '18px' }}>{tab.label}</span>
            <span style={{ fontSize: '10px' }}>{tab.title}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Recent Transactions</h3>
          {state.transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
              <div>No transactions yet</div>
              <div style={{ fontSize: '14px', marginTop: '8px' }}>Add income or expenses to get started</div>
            </div>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {state.transactions.slice(0, 10).map((transaction, index) => (
                <div key={index} style={{
                  padding: '12px',
                  marginBottom: '8px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
                        {transaction.description}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {transaction.type} • {transaction.paymentMethod}
                        {transaction.envelope && ` • ${transaction.envelope}`}
                      </div>
                    </div>
                    <div style={{
                      fontWeight: 'bold',
                      color: transaction.type === 'income' ? '#28a745' : '#dc3545',
                      fontSize: '14px'
                    }}>
                      {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'income' && (
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>💰 Add Income</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="number"
              placeholder="Amount"
              value={forms.income.amount}
              onChange={(e) => handleFormChange('income', 'amount', e.target.value)}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
            <input
              type="text"
              placeholder="Description"
              value={forms.income.description}
              onChange={(e) => handleFormChange('income', 'description', e.target.value)}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
            <select
              value={forms.income.paymentMethod}
              onChange={(e) => handleFormChange('income', 'paymentMethod', e.target.value)}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            >
              <option value="">Select Payment Method</option>
              {state.paymentMethods.map(method => (
                <option key={method.name} value={method.name}>{method.name}</option>
              ))}
            </select>
            <button
              onClick={handleAddIncome}
              style={{
                padding: '12px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Add Income
            </button>
          </div>
        </div>
      )}

      {activeTab === 'expense' && (
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>💸 Add Expense</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="number"
              placeholder="Amount"
              value={forms.expense.amount}
              onChange={(e) => handleFormChange('expense', 'amount', e.target.value)}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
            <input
              type="text"
              placeholder="Description"
              value={forms.expense.description}
              onChange={(e) => handleFormChange('expense', 'description', e.target.value)}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
            <input
              type="text"
              placeholder="Category (e.g., DMART, EATOUT, EMI)"
              value={forms.expense.category}
              onChange={(e) => {
                const value = e.target.value;
                handleFormChange('expense', 'category', value);
                handleFormChange('expense', 'envelope', value); // Auto-fill envelope
              }}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
            <input
              type="text"
              placeholder="Envelope"
              value={forms.expense.envelope}
              onChange={(e) => handleFormChange('expense', 'envelope', e.target.value)}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
            <select
              value={forms.expense.paymentMethod}
              onChange={(e) => handleFormChange('expense', 'paymentMethod', e.target.value)}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            >
              <option value="">Select Payment Method</option>
              {state.paymentMethods.map(method => (
                <option key={method.name} value={method.name}>{method.name}</option>
              ))}
            </select>
            <button
              onClick={handleAddExpense}
              style={{
                padding: '12px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Add Expense
            </button>
          </div>
        </div>
      )}

      {activeTab === 'transfer' && (
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>🔄 Transfer Funds</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <select
              value={forms.transfer.from}
              onChange={(e) => handleFormChange('transfer', 'from', e.target.value)}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            >
              <option value="">From Account</option>
              {state.paymentMethods.map(method => (
                <option key={method.name} value={method.name}>{method.name}</option>
              ))}
            </select>
            <select
              value={forms.transfer.to}
              onChange={(e) => handleFormChange('transfer', 'to', e.target.value)}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            >
              <option value="">To Account</option>
              {state.paymentMethods.filter(m => m.name !== forms.transfer.from).map(method => (
                <option key={method.name} value={method.name}>{method.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Amount"
              value={forms.transfer.amount}
              onChange={(e) => handleFormChange('transfer', 'amount', e.target.value)}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={forms.transfer.description}
              onChange={(e) => handleFormChange('transfer', 'description', e.target.value)}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
            <button
              onClick={handleAddTransfer}
              style={{
                padding: '12px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Transfer Funds
            </button>
          </div>
        </div>
      )}

      {activeTab === 'budget' && (
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>📋 Allocate Budget</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              placeholder="Category (e.g., DMART, EATOUT, EMI)"
              value={forms.budget.category}
              onChange={(e) => {
                const value = e.target.value;
                handleFormChange('budget', 'category', value);
                handleFormChange('budget', 'envelope', value); // Auto-fill envelope
              }}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
            <input
              type="text"
              placeholder="Envelope"
              value={forms.budget.envelope}
              onChange={(e) => handleFormChange('budget', 'envelope', e.target.value)}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
            <input
              type="number"
              placeholder="Budget Amount"
              value={forms.budget.amount}
              onChange={(e) => handleFormChange('budget', 'amount', e.target.value)}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
            <button
              onClick={handleAllocateBudget}
              style={{
                padding: '12px',
                backgroundColor: '#6f42c1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Allocate Budget
            </button>
          </div>

          {/* Budget Overview */}
          {state.budgets.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <h4 style={{ marginBottom: '16px', fontSize: '16px' }}>Current Budgets</h4>
              {state.budgets.map((budget, index) => (
                <div key={index} style={{
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{budget.envelope}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Spent: ₹{budget.spent.toLocaleString()} / ₹{budget.budgeted.toLocaleString()}
                      </div>
                    </div>
                    <div style={{
                      fontWeight: 'bold',
                      color: budget.spent <= budget.budgeted ? '#28a745' : '#dc3545',
                      fontSize: '14px'
                    }}>
                      ₹{(budget.budgeted - budget.spent).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payment Methods Modal */}
      {showPaymentModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '400px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>💳 Payment Methods</h3>
            
            {/* Add New Payment Method */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ marginBottom: '12px', fontSize: '16px' }}>Add New Method</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Payment Method Name"
                  value={forms.payment.name}
                  onChange={(e) => handleFormChange('payment', 'name', e.target.value)}
                  style={{
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
                <select
                  value={forms.payment.type}
                  onChange={(e) => handleFormChange('payment', 'type', e.target.value)}
                  style={{
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                >
                  <option value="card">Card</option>
                  <option value="bank">Bank Account</option>
                  <option value="cash">Cash</option>
                  <option value="wallet">Digital Wallet</option>
                </select>
                <button
                  onClick={handleAddPaymentMethod}
                  style={{
                    padding: '12px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    cursor: 'pointer'
                  }}
                >
                  Add Method
                </button>
              </div>
            </div>

            {/* Existing Payment Methods */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ marginBottom: '12px', fontSize: '16px' }}>Current Methods</h4>
              {state.paymentMethods.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                  No payment methods configured
                </div>
              ) : (
                state.paymentMethods.map((method, index) => (
                  <div key={index} style={{
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid #e9ecef'
                  }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{method.name}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{method.type}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowPaymentModal(false)}
              style={{
                padding: '12px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedDashboard;