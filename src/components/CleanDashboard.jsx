import React, { useState, useMemo, useEffect, useCallback } from 'react';
import './CleanDashboard.css';
import QuickEntryBar from './QuickEntryBar';
import { TRANSACTION_TYPES, ICONS } from '../config/constants';
import { formatCurrency, formatDate, sortByDateDesc } from '../utils/helpers';

const CleanDashboard = ({ 
  envelopes,
  paymentMethods,
  transactions,
  currentPeriod,
  onAddTransaction,
  onAddIncome,
  onTransfer,
  onShowNotification,
  onDeleteTransaction
}) => {
  const [activeTab, setActiveTab] = useState(TRANSACTION_TYPES.INCOME);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all'
  });

  // Handle tab switching from bottom nav
  useEffect(() => {
    const handleTabSwitch = (e) => {
      setActiveTab(e.detail);
      setShowModal(true);
    };
    window.addEventListener('switchTab', handleTabSwitch);
    return () => window.removeEventListener('switchTab', handleTabSwitch);
  }, []);

  // Memoized handlers
  const closeModal = useCallback(() => setShowModal(false), []);
  
  const handleFilterChange = useCallback((e) => {
    setFilters(prev => ({ ...prev, type: e.target.value }));
  }, []);
  
  const handleTransactionAdded = useCallback((data) => {
    onAddTransaction(data);
    closeModal();
  }, [onAddTransaction, closeModal]);
  
  const handleIncomeAdded = useCallback((data) => {
    onAddIncome(data);
    closeModal();
  }, [onAddIncome, closeModal]);
  
  const handleTransferCompleted = useCallback((from, to, amount) => {
    onTransfer(from, to, amount);
    closeModal();
  }, [onTransfer, closeModal]);

  // Memoized filtered data calculations
  const filteredData = useMemo(() => {
    const filtered = transactions.filter(t => {
      return filters.type === 'all' || t.type === filters.type;
    });

    const income = filtered
      .filter(t => t.type === TRANSACTION_TYPES.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expense = filtered
      .filter(t => t.type === TRANSACTION_TYPES.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
      
    const transfer = filtered
      .filter(t => t.type === TRANSACTION_TYPES.TRANSFER)
      .reduce((sum, t) => sum + t.amount, 0);

    const sortedTransactions = [...filtered].sort(sortByDateDesc);

    return { 
      income, 
      expense, 
      transfer, 
      balance: income - expense, 
      count: filtered.length, 
      transactions: sortedTransactions 
    };
  }, [transactions, filters]);
  
  // Get transaction icon
  const getTransactionIcon = useCallback((type) => {
    switch(type) {
      case TRANSACTION_TYPES.INCOME: return ICONS.INCOME;
      case TRANSACTION_TYPES.EXPENSE: return ICONS.EXPENSE;
      case TRANSACTION_TYPES.TRANSFER: return ICONS.TRANSFER;
      default: return ICONS.INFO;
    }
  }, []);
  
  // Get modal title
  const getModalTitle = useCallback(() => {
    switch(activeTab) {
      case TRANSACTION_TYPES.INCOME: return `${ICONS.INCOME} Add Income`;
      case TRANSACTION_TYPES.EXPENSE: return `${ICONS.EXPENSE} Add Expense`;
      case TRANSACTION_TYPES.TRANSFER: return `${ICONS.TRANSFER} Add Transfer`;
      default: return 'Add Transaction';
    }
  }, [activeTab]);

  return (
    <div className="clean-dashboard">
      {showModal && (
        <div className="entry-modal-overlay" onClick={closeModal} role="dialog" aria-modal="true">
          <div className="entry-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{getModalTitle()}</h3>
              <button 
                className="close-btn" 
                onClick={closeModal}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <QuickEntryBar
              envelopes={envelopes}
              paymentMethods={paymentMethods}
              onAddTransaction={handleTransactionAdded}
              onAddIncome={handleIncomeAdded}
              onTransfer={handleTransferCompleted}
              onShowNotification={onShowNotification}
              initialMode={activeTab}
            />
          </div>
        </div>
      )}

      <div className="filter-bar">
        <select 
          value={filters.type} 
          onChange={handleFilterChange}
          aria-label="Filter transactions by type"
        >
          <option value="all">All Types</option>
          <option value={TRANSACTION_TYPES.INCOME}>Income</option>
          <option value={TRANSACTION_TYPES.EXPENSE}>Expense</option>
          <option value={TRANSACTION_TYPES.TRANSFER}>Transfer</option>
        </select>
      </div>

      <div className="insights-grid" role="region" aria-label="Financial summary">
        <div className="insight-card income-insight">
          <div className="insight-icon" aria-hidden="true">{ICONS.INCOME}</div>
          <div className="insight-content">
            <div className="insight-label">Income</div>
            <div className="insight-value">{formatCurrency(filteredData.income)}</div>
          </div>
        </div>
        <div className="insight-card expense-insight">
          <div className="insight-icon" aria-hidden="true">{ICONS.EXPENSE}</div>
          <div className="insight-content">
            <div className="insight-label">Expense</div>
            <div className="insight-value">{formatCurrency(filteredData.expense)}</div>
          </div>
        </div>
        <div className="insight-card balance-insight">
          <div className="insight-icon" aria-hidden="true">💵</div>
          <div className="insight-content">
            <div className="insight-label">Balance</div>
            <div className={`insight-value ${filteredData.balance >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(filteredData.balance)}
            </div>
          </div>
        </div>
        <div className="insight-card transfer-insight">
          <div className="insight-icon" aria-hidden="true">{ICONS.TRANSFER}</div>
          <div className="insight-content">
            <div className="insight-label">Transfers</div>
            <div className="insight-value">{formatCurrency(filteredData.transfer)}</div>
          </div>
        </div>
      </div>

      <div className="transactions-list" role="region" aria-label="Transaction list">
        <div className="list-header">
          <h3>Transactions ({filteredData.count})</h3>
        </div>
        {filteredData.transactions.length === 0 ? (
          <div className="empty-list" role="status">
            <div className="empty-icon" aria-hidden="true">{ICONS.EMPTY}</div>
            <div className="empty-text">No transactions found</div>
          </div>
        ) : (
          <div className="transaction-items">
            {filteredData.transactions.slice(0, 50).map(t => (
              <div key={t.id} className={`transaction-item ${t.type}`}>
                <div className="transaction-icon" aria-hidden="true">
                  {getTransactionIcon(t.type)}
                </div>
                <div className="transaction-details">
                  <div className="transaction-desc">{t.description || t.envelope || 'Transaction'}</div>
                  <div className="transaction-date">{formatDate(t.date)}</div>
                </div>
                <div className={`transaction-amount ${t.type}`}>
                  {t.type === TRANSACTION_TYPES.INCOME ? '+' : '-'}{formatCurrency(t.amount)}
                </div>
                <button 
                  className="delete-btn" 
                  onClick={() => onDeleteTransaction(t.id)}
                  aria-label={`Delete ${t.description || 'transaction'}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CleanDashboard;
