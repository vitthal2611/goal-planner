import React, { useState, useCallback, memo } from 'react';
import EnvelopeGrid from './EnvelopeGrid';
import QuickExpenseForm from './QuickExpenseForm';
import TransactionsList from './TransactionsList';
import './EnvelopeGrid.css';

const EnhancedDashboard = memo(({ 
  envelopes,
  transactions,
  customPaymentMethods,
  dateRange,
  onAddTransaction,
  onDeleteTransaction,
  onUpdatePaymentMethod,
  onAddCustomPaymentMethod,
  onShowNotification,
  activeView,
  setActiveView
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('balance');
  const [selectedEnvelope, setSelectedEnvelope] = useState(null);
  const [showQuickForm, setShowQuickForm] = useState(false);

  const handleAddExpense = useCallback((transaction) => {
    onAddTransaction(transaction);
    onShowNotification('success', `Added ₹${transaction.amount} to ${transaction.envelope.split('.')[1]}`);
  }, [onAddTransaction, onShowNotification]);

  const handleViewDetails = useCallback((category, name) => {
    setSelectedEnvelope({ category, name });
    setActiveView('transactions');
  }, [setActiveView]);

  const today = new Date().toISOString().split('T')[0];
  const todaysTransactions = transactions.filter(t => t.date === today);
  const todaysSpent = todaysTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  const selectedEnvelopeTransactions = selectedEnvelope 
    ? transactions.filter(t => t.envelope === `${selectedEnvelope.category}.${selectedEnvelope.name}`)
    : [];

  return (
    <div className="enhanced-dashboard">
      <div className="mobile-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            <span className="title-icon">💰</span>
            Envelope Budget
          </h1>
          <div className="header-actions">
            <button 
              className="header-btn search-btn"
              onClick={() => document.querySelector('.search-input')?.focus()}
              aria-label="Search envelopes"
            >
              🔍
            </button>
            <button 
              className="header-btn add-btn"
              onClick={() => setShowQuickForm(!showQuickForm)}
              aria-label="Quick add expense"
            >
              ➕
            </button>
          </div>
        </div>
      </div>

      {showQuickForm && (
        <div className="quick-form-overlay">
          <div className="quick-form-container">
            <div className="quick-form-header">
              <h3>Quick Add Expense</h3>
              <button 
                className="close-quick-form"
                onClick={() => setShowQuickForm(false)}
                aria-label="Close quick form"
              >
                ×
              </button>
            </div>
            <QuickExpenseForm
              envelopes={envelopes}
              customPaymentMethods={customPaymentMethods}
              dateRange={dateRange}
              onAddTransaction={(transaction) => {
                handleAddExpense(transaction);
                setShowQuickForm(false);
              }}
              onAddCustomPaymentMethod={onAddCustomPaymentMethod}
              onShowNotification={onShowNotification}
            />
          </div>
        </div>
      )}

      <div className="dashboard-content">
        {activeView === 'daily' && (
          <div className="daily-view">
            <div className="today-summary">
              <div className="summary-header">
                <h2>Today's Activity</h2>
                <span className="summary-date">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              <div className="summary-stats">
                <div className="summary-stat">
                  <span className="stat-value">
                    ₹{todaysSpent.toLocaleString()}
                  </span>
                  <span className="stat-label">Spent Today</span>
                </div>
                <div className="summary-stat">
                  <span className="stat-value">{todaysTransactions.length}</span>
                  <span className="stat-label">Transactions</span>
                </div>
              </div>
            </div>

            <EnvelopeGrid
              envelopes={envelopes}
              onAddExpense={handleAddExpense}
              onViewDetails={handleViewDetails}
              customPaymentMethods={customPaymentMethods}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />

            {todaysTransactions.length > 0 && (
              <TransactionsList
                transactions={todaysTransactions}
                onDeleteTransaction={onDeleteTransaction}
                onUpdatePaymentMethod={onUpdatePaymentMethod}
                customPaymentMethods={customPaymentMethods}
                title="📅 Today's Expenses"
              />
            )}
          </div>
        )}

        {activeView === 'spending' && (
          <div className="spending-view">
            <div className="spending-header">
              <h2>All Envelopes</h2>
              <p>Tap any envelope to add an expense</p>
            </div>
            <EnvelopeGrid
              envelopes={envelopes}
              onAddExpense={handleAddExpense}
              onViewDetails={handleViewDetails}
              customPaymentMethods={customPaymentMethods}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </div>
        )}

        {activeView === 'transactions' && (
          <div className="transactions-view">
            {selectedEnvelope ? (
              <div className="envelope-transactions">
                <div className="envelope-header">
                  <button 
                    className="back-btn"
                    onClick={() => setSelectedEnvelope(null)}
                    aria-label="Back to all transactions"
                  >
                    ← Back
                  </button>
                  <div className="envelope-info">
                    <h2>{selectedEnvelope.name.toUpperCase()}</h2>
                    <p>{selectedEnvelope.category.toUpperCase()}</p>
                  </div>
                </div>
                <TransactionsList
                  transactions={selectedEnvelopeTransactions}
                  onDeleteTransaction={onDeleteTransaction}
                  onUpdatePaymentMethod={onUpdatePaymentMethod}
                  customPaymentMethods={customPaymentMethods}
                  title={`${selectedEnvelope.name} Transactions`}
                />
              </div>
            ) : (
              <TransactionsList
                transactions={transactions}
                onDeleteTransaction={onDeleteTransaction}
                onUpdatePaymentMethod={onUpdatePaymentMethod}
                customPaymentMethods={customPaymentMethods}
                title="All Transactions"
              />
            )}
          </div>
        )}
      </div>

      <button 
        className="fab main-fab"
        onClick={() => setShowQuickForm(!showQuickForm)}
        aria-label="Add expense"
      >
        ➕
      </button>
    </div>
  );
});

EnhancedDashboard.displayName = 'EnhancedDashboard';

export default EnhancedDashboard;