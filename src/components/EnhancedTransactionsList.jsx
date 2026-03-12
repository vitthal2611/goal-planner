import React, { useState, useMemo } from 'react';
import { useBudget } from '../contexts/BudgetContext.jsx';
import './EnhancedTransactionsList.css';

const EnhancedTransactionsList = () => {
  const { transactions, deleteTransaction, paymentMethods, getEnvelopeNames } = useBudget();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [swipedId, setSwipedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const envelopeNames = getEnvelopeNames();

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    if (filter !== 'all') {
      filtered = filtered.filter(t => t.type.toLowerCase() === filter);
    }

    if (sortBy === 'amount') {
      filtered.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === 'date') {
      filtered.reverse();
    }

    return filtered;
  }, [transactions, filter, sortBy]);

  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, count: transactions.length };
  }, [transactions]);

  const handleDelete = async (id) => {
    if (confirm('Delete this transaction?')) {
      try {
        await deleteTransaction(id);
        setSwipedId(null);
      } catch (error) {
        alert('Error deleting transaction: ' + error.message);
      }
    }
  };

  const handleEdit = (transaction) => {
    setEditingId(transaction.id);
    setEditForm({
      description: transaction.description,
      envelope: transaction.envelope,
      amount: transaction.amount,
      paymentMethod: transaction.paymentMethod,
    });
    setSwipedId(null);
  };

  const handleSaveEdit = async (id) => {
    try {
      // For now, we'll delete and re-add since updateTransaction isn't in context
      // In production, add updateTransaction to BudgetContext
      alert('Edit feature requires updateTransaction in context. For now, please delete and re-add.');
      setEditingId(null);
    } catch (error) {
      alert('Error updating transaction: ' + error.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (id) => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setSwipedId(id);
    } else if (isRightSwipe) {
      setSwipedId(null);
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Income': return '💰';
      case 'Expense': return '💸';
      case 'Transfer': return '🔄';
      default: return '📝';
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="empty-state-enhanced">
        <div className="empty-icon">📊</div>
        <h3>No transactions yet</h3>
        <p>Start by adding your first transaction</p>
      </div>
    );
  }

  return (
    <div className="enhanced-transactions">
      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-label">Total</div>
          <div className="stat-value">{stats.count}</div>
        </div>
        <div className="stat-item income">
          <div className="stat-label">Income</div>
          <div className="stat-value">₹{stats.income.toLocaleString()}</div>
        </div>
        <div className="stat-item expense">
          <div className="stat-label">Expense</div>
          <div className="stat-value">₹{stats.expense.toLocaleString()}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="transactions-controls">
        <div className="filter-tabs">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={filter === 'income' ? 'active' : ''} 
            onClick={() => setFilter('income')}
          >
            💰 Income
          </button>
          <button 
            className={filter === 'expense' ? 'active' : ''} 
            onClick={() => setFilter('expense')}
          >
            💸 Expense
          </button>
          <button 
            className={filter === 'transfer' ? 'active' : ''} 
            onClick={() => setFilter('transfer')}
          >
            🔄 Transfer
          </button>
        </div>

        <select 
          className="sort-select" 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="date">Latest First</option>
          <option value="amount">Highest Amount</option>
        </select>
      </div>

      {/* Transactions List */}
      <div className="transactions-list-enhanced">
        {filteredTransactions.map(t => (
          <div 
            key={t.id} 
            className={`transaction-item ${t.type.toLowerCase()} ${swipedId === t.id ? 'swiped' : ''} ${editingId === t.id ? 'editing' : ''}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => handleTouchEnd(t.id)}
          >
            {editingId === t.id ? (
              /* Edit Mode */
              <div className="transaction-edit-form">
                <input
                  type="number"
                  inputMode="decimal"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
                  className="edit-input"
                  placeholder="Amount"
                />
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="edit-input"
                  placeholder="Description"
                />
                {t.type === 'Expense' && (
                  <select
                    value={editForm.envelope}
                    onChange={(e) => setEditForm({ ...editForm, envelope: e.target.value })}
                    className="edit-select"
                  >
                    {envelopeNames.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                )}
                <select
                  value={editForm.paymentMethod}
                  onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value })}
                  className="edit-select"
                >
                  {paymentMethods.map(pm => (
                    <option key={pm.id} value={pm.name}>{pm.name}</option>
                  ))}
                </select>
                <div className="edit-actions">
                  <button className="btn-save" onClick={() => handleSaveEdit(t.id)}>✓ Save</button>
                  <button className="btn-cancel" onClick={handleCancelEdit}>✕ Cancel</button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <>
                <div className="transaction-content" onClick={() => handleEdit(t)}>
                  <div className="transaction-icon">{getTypeIcon(t.type)}</div>
                  
                  <div className="transaction-info">
                    <div className="transaction-desc">{t.description}</div>
                    <div className="transaction-meta">
                      <span className="meta-tag">{t.envelope}</span>
                      <span className="meta-divider">•</span>
                      <span className="meta-tag">{t.paymentMethod}</span>
                    </div>
                  </div>

                  <div className="transaction-amount-wrapper">
                    <div className={`transaction-amount ${t.type.toLowerCase()}`}>
                      {t.type === 'Income' ? '+' : t.type === 'Expense' ? '-' : ''}₹{t.amount.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="transaction-actions">
                  <button 
                    className="action-edit" 
                    onClick={() => handleEdit(t)}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className="action-delete" 
                    onClick={() => handleDelete(t.id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {filteredTransactions.length === 0 && (
        <div className="no-results">
          <p>No {filter} transactions found</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedTransactionsList;
