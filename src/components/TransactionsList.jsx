import React, { useState, useMemo } from 'react';
import { sanitizeInput } from '../utils/sanitize';
import './TransactionsList.css';

const TransactionsList = ({ 
  transactions, 
  onDeleteTransaction, 
  onUpdatePaymentMethod,
  customPaymentMethods,
  title = "📋 Last 10 Transactions",
  filterDate = null,
  limit = null
}) => {
  const [editingPayment, setEditingPayment] = useState({ id: null, method: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ id: null, name: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const getCategoryColor = (envelope) => {
    const category = envelope.split('.')[1]?.toLowerCase() || envelope.toLowerCase();
    const colorMap = {
      food: '#10b981', groceries: '#059669', transport: '#3b82f6',
      entertainment: '#8b5cf6', shopping: '#ec4899', bills: '#f59e0b',
      health: '#ef4444', education: '#06b6d4', savings: '#14b8a6', other: '#6b7280'
    };
    return colorMap[category] || '#6b7280';
  };

  const getAmountTier = (amount) => {
    if (amount >= 5000) return 'critical';
    if (amount >= 2000) return 'high';
    if (amount >= 500) return 'medium';
    return 'low';
  };

  const categories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.envelope.split('.')[1] || t.envelope));
    return ['all', ...Array.from(cats)];
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    let result = transactions;
    
    if (filterDate) {
      result = result.filter(t => t.date === filterDate);
    }

    if (searchTerm) {
      result = result.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.envelope.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      result = result.filter(t => 
        (t.envelope.split('.')[1] || t.envelope).toLowerCase() === categoryFilter.toLowerCase()
      );
    }
    
    result = [...result].sort((a, b) => {
      if (sortConfig.key === 'date') {
        const comparison = new Date(b.date) - new Date(a.date);
        return sortConfig.direction === 'asc' ? -comparison : comparison;
      }
      if (sortConfig.key === 'amount') {
        const comparison = b.amount - a.amount;
        return sortConfig.direction === 'asc' ? -comparison : comparison;
      }
      if (sortConfig.key === 'description') {
        const comparison = a.description.localeCompare(b.description);
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }
      return 0;
    });
    
    if (limit) {
      result = result.slice(0, limit);
    }
    
    return result;
  }, [transactions, filterDate, limit, searchTerm, categoryFilter, sortConfig]);

  const totalAmount = useMemo(() => 
    filteredTransactions.reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handlePaymentUpdate = (transactionId, newPaymentMethod) => {
    const sanitizedMethod = sanitizeInput(newPaymentMethod);
    onUpdatePaymentMethod(transactionId, sanitizedMethod);
    setEditingPayment({ id: null, method: '' });
  };

  const handleDelete = (transaction) => {
    setDeleteConfirm({ 
      id: transaction.id, 
      name: sanitizeInput(transaction.description) 
    });
  };

  const confirmDelete = () => {
    onDeleteTransaction(deleteConfirm.id);
    setDeleteConfirm({ id: null, name: '' });
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <span className="sort-icon">⇅</span>;
    return <span className="sort-icon active">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <>
      <div className="card mobile-optimized transactions-card">
        <div className="card-header">
          <h3>{title}</h3>
          <span className="transaction-count">{filteredTransactions.length}</span>
        </div>
        
        <div className="transactions-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              aria-label="Search transactions"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="category-filter"
            aria-label="Filter by category"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="card-content">
          <div className="table-container">
            <table className="transactions-table" role="table">
              <thead>
                <tr role="row">
                  <th role="columnheader">Date</th>
                  <th role="columnheader" className="sortable" onClick={() => handleSort('description')}>
                    Description <SortIcon column="description" />
                  </th>
                  <th role="columnheader">Category</th>
                  <th role="columnheader" className="text-right sortable" onClick={() => handleSort('amount')}>
                    Amount <SortIcon column="amount" />
                  </th>
                  <th role="columnheader">Payment</th>
                  <th role="columnheader" aria-label="Actions"></th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction, index) => {
                  const isToday = transaction.date === new Date().toISOString().split('T')[0];
                  const amountTier = getAmountTier(transaction.amount);
                  const categoryColor = getCategoryColor(transaction.envelope);
                  return (
                    <tr key={transaction.id} className={isToday ? 'today-transaction' : ''} role="row">
                      <td role="cell">
                        <div className="transaction-date">
                          {isToday ? <span className="badge badge-today">Today</span> : transaction.date}
                        </div>
                      </td>
                      <td role="cell">
                        <div className="transaction-desc-wrapper">
                          <div className="transaction-desc" title={sanitizeInput(transaction.description)}>
                            {sanitizeInput(transaction.description)}
                          </div>
                        </div>
                      </td>
                      <td role="cell">
                        <span className="transaction-envelope" style={{ backgroundColor: `${categoryColor}15`, color: categoryColor, borderColor: `${categoryColor}40` }}>
                          {transaction.envelope.split('.')[1]?.toUpperCase() || transaction.envelope}
                        </span>
                      </td>
                      <td role="cell" className="text-right">
                        <div className={`transaction-amount amount-${amountTier}`}>₹{transaction.amount.toLocaleString()}</div>
                      </td>
                      <td role="cell">
                        <span className="transaction-payment">{transaction.paymentMethod || 'UPI'}</span>
                      </td>
                      <td role="cell">
                        <button
                          className="btn-delete-mini"
                          onClick={() => handleDelete(transaction)}
                          title="Delete transaction"
                          aria-label={`Delete ${transaction.description}`}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan="6" className="empty-state-cell">
                      <div className="empty-state">
                        <div className="empty-icon">📝</div>
                        <div className="empty-text">No transactions found</div>
                        <div className="empty-subtext">
                          {searchTerm || categoryFilter !== 'all' ? 'Try adjusting your filters' : 'Start tracking your expenses'}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {filteredTransactions.length > 0 && (
            <div className="table-footer">
              <div className="total-summary">
                <span className="total-label">Total:</span>
                <span className="total-amount">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {deleteConfirm.id && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm({ id: null, name: '' })} role="dialog" aria-modal="true">
          <div className="modal mobile-optimized" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close touch-optimized"
              onClick={() => setDeleteConfirm({ id: null, name: '' })}
              aria-label="Close modal"
            >
              ×
            </button>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete transaction "{deleteConfirm.name}"?</p>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary touch-optimized" 
                onClick={() => setDeleteConfirm({ id: null, name: '' })}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger touch-optimized" 
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TransactionsList;
