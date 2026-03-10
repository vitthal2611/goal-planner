import React, { useState, useEffect, useMemo } from 'react';
import { useBudget } from '../contexts/SimpleBudgetContext.jsx';
import PaymentMethodsConfig from './PaymentMethodsConfig.jsx';

const Dashboard = () => {
  const { state, actions, getCurrentData } = useBudget();
  const [activeTab, setActiveTab] = useState('overview');
  const [showPaymentConfig, setShowPaymentConfig] = useState(false);
  const [forms, setForms] = useState({
    income: { amount: '', description: '', paymentMethod: '' },
    expense: { amount: '', description: '', envelope: '', category: '', paymentMethod: '' },
    transfer: { from: '', to: '', amount: '', description: '' },
    budget: { category: '', envelope: '', amount: '' }
  });

  const currentData = getCurrentData();
  const { income, envelopes, transactions } = currentData;

  useEffect(() => {
    actions.loadData();
  }, []);

  useEffect(() => {
    if (state.paymentMethods.length > 0 && !forms.income.paymentMethod) {
      setForms(prev => ({
        ...prev,
        income: { ...prev.income, paymentMethod: state.paymentMethods[0] },
        expense: { ...prev.expense, paymentMethod: state.paymentMethods[0] }
      }));
    }
  }, [state.paymentMethods]);

  const summary = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const totalBudget = Object.values(envelopes).reduce((sum, category) => 
      sum + Object.values(category).reduce((catSum, env) => catSum + env.budgeted, 0), 0
    );
    
    return {
      income,
      expenses,
      balance: income - expenses,
      totalBudget,
      remaining: totalBudget - expenses
    };
  }, [income, transactions, envelopes]);

  const handleFormChange = (formType, field, value) => {
    setForms(prev => ({
      ...prev,
      [formType]: { ...prev[formType], [field]: value }
    }));
  };

  const resetForm = (formType) => {
    const defaultForms = {
      income: { amount: '', description: '', paymentMethod: state.paymentMethods[0] || '' },
      expense: { amount: '', description: '', envelope: '', category: '', paymentMethod: state.paymentMethods[0] || '' },
      transfer: { from: '', to: '', amount: '', description: '' },
      budget: { category: '', envelope: '', amount: '' }
    };
    setForms(prev => ({ ...prev, [formType]: defaultForms[formType] }));
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

    if (success) {
      resetForm('income');
    }
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

    if (success) {
      resetForm('expense');
    }
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

    if (success) {
      resetForm('transfer');
    }
  };

  const handleAllocateBudget = async () => {
    const { category, envelope, amount } = forms.budget;
    if (!category || !envelope || !amount) {
      actions.showNotification('error', 'Please fill all fields');
      return;
    }

    const success = await actions.allocateBudget(category, envelope, parseFloat(amount));

    if (success) {
      resetForm('budget');
    }
  };

  if (state.loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto', padding: '16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' }}>
          💰 Budget Planner
        </h1>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          Period: {state.currentPeriod}
        </p>
      </div>

      {/* Notification */}
      {state.notification.message && (
        <div style={{
          padding: '12px',
          marginBottom: '16px',
          borderRadius: '8px',
          backgroundColor: state.notification.type === 'error' ? '#fee' : '#efe',
          color: state.notification.type === 'error' ? '#c33' : '#363',
          border: `1px solid ${state.notification.type === 'error' ? '#fcc' : '#cfc'}`
        }}>
          {state.notification.message}
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '12px', 
        marginBottom: '24px' 
      }}>
        <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
          <button
            onClick={() => setShowPaymentConfig(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6f42c1',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              width: '100%',
              marginBottom: '8px'
            }}
          >
            💳 Configure Payment Methods
          </button>
        </div>
        <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
            ₹{summary.income.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Income</div>
        </div>
        <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
            ₹{summary.expenses.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Expenses</div>
        </div>
        <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: summary.balance >= 0 ? '#28a745' : '#dc3545' 
          }}>
            ₹{summary.balance.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Balance</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        overflowX: 'auto', 
        marginBottom: '24px',
        borderBottom: '1px solid #ddd'
      }}>
        {[
          { key: 'overview', label: '📊 Overview' },
          { key: 'income', label: '💰 Income' },
          { key: 'expense', label: '💸 Expense' },
          { key: 'transfer', label: '🔄 Transfer' },
          { key: 'budget', label: '📋 Budget' }
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
              fontSize: '14px'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div>
          <h3 style={{ marginBottom: '16px' }}>📋 Recent Transactions</h3>
          {transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
              <div>No transactions yet</div>
              <div style={{ fontSize: '14px', marginTop: '8px' }}>Add income or expenses to get started</div>
            </div>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {transactions.slice(0, 10).map((transaction, index) => (
                <div key={index} style={{
                  padding: '12px',
                  marginBottom: '8px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                      {transaction.description}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {transaction.type} • {transaction.paymentMethod}
                      {transaction.envelope && ` • ${transaction.envelope}`}
                    </div>
                  </div>
                  <div style={{
                    fontWeight: 'bold',
                    color: transaction.type === 'income' ? '#28a745' : '#dc3545'
                  }}>
                    {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'income' && (
        <div>
          <h3 style={{ marginBottom: '16px' }}>💰 Add Income</h3>
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
              <option key="income-payment-default" value="">Select Payment Method</option>
              {state.paymentMethods.map(method => (
                <option key={`income-payment-${method}`} value={method}>{method}</option>
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
          <h3 style={{ marginBottom: '16px' }}>💸 Add Expense</h3>
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
              onChange={(e) => handleFormChange('expense', 'category', e.target.value)}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
            <input
              type="text"
              placeholder="Envelope (same as category for simplicity)"
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
              <option key="expense-payment-default" value="">Select Payment Method</option>
              {state.paymentMethods.map(method => (
                <option key={`expense-payment-${method}`} value={method}>{method}</option>
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
          <h3 style={{ marginBottom: '16px' }}>🔄 Transfer Funds</h3>
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
              <option key="transfer-from-default" value="">From Account</option>
              {state.paymentMethods.map(method => (
                <option key={`transfer-from-${method}`} value={method}>{method}</option>
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
              <option key="transfer-to-default" value="">To Account</option>
              {state.paymentMethods.filter(m => m !== forms.transfer.from).map(method => (
                <option key={`transfer-to-${method}`} value={method}>{method}</option>
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
          <h3 style={{ marginBottom: '16px' }}>📋 Allocate Budget</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              placeholder="Category (e.g., DMART, EATOUT, EMI)"
              value={forms.budget.category}
              onChange={(e) => handleFormChange('budget', 'category', e.target.value)}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
            <input
              type="text"
              placeholder="Envelope (same as category for simplicity)"
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
          {Object.keys(envelopes).length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <h4 style={{ marginBottom: '16px' }}>Current Budgets</h4>
              {Object.entries(envelopes).map(([category, categoryEnvelopes]) => (
                <div key={category} style={{ marginBottom: '16px' }}>
                  <h5 style={{ marginBottom: '8px', color: '#666' }}>{category}</h5>
                  {Object.entries(categoryEnvelopes).map(([envelope, data]) => (
                    <div key={envelope} style={{
                      padding: '12px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{envelope}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          Spent: ₹{data.spent.toLocaleString()} / ₹{data.budgeted.toLocaleString()}
                        </div>
                      </div>
                      <div style={{
                        fontWeight: 'bold',
                        color: data.spent <= data.budgeted ? '#28a745' : '#dc3545'
                      }}>
                        ₹{(data.budgeted - data.spent).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payment Methods Configuration Modal */}
      {showPaymentConfig && (
        <PaymentMethodsConfig
          onClose={() => setShowPaymentConfig(false)}
          onUpdate={(newMethods) => {
            setShowPaymentConfig(false);
            actions.showNotification('success', 'Payment methods updated');
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;