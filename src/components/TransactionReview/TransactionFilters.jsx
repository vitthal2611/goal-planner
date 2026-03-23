import React from 'react';
import { useApp } from '../../contexts/AppContext';
import './TransactionFilters.css';

const TransactionFilters = ({ filters, onFiltersChange }) => {
  const { envelopes, paymentMethods } = useApp();

  const handleChange = (field, value) => {
    onFiltersChange(prev => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    onFiltersChange({
      search: '',
      type: 'all',
      envelope: 'all',
      payment: 'all',
      sortBy: 'date-desc',
    });
  };

  const hasActiveFilters = 
    filters.search || 
    filters.type !== 'all' || 
    filters.envelope !== 'all' || 
    filters.payment !== 'all';

  return (
    <div className="transaction-filters">
      <div className="filters-row">
        <div className="filter-group search-group">
          <input
            type="text"
            className="filter-input search-input"
            placeholder="🔍 Search transactions..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select
            className="filter-select"
            value={filters.type}
            onChange={(e) => handleChange('type', e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="transfer">Transfer</option>
          </select>
        </div>

        <div className="filter-group">
          <select
            className="filter-select"
            value={filters.envelope}
            onChange={(e) => handleChange('envelope', e.target.value)}
          >
            <option value="all">All Categories</option>
            {envelopes.map(env => (
              <option key={env.name} value={env.name}>
                {env.icon} {env.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select
            className="filter-select"
            value={filters.payment}
            onChange={(e) => handleChange('payment', e.target.value)}
          >
            <option value="all">All Payments</option>
            {paymentMethods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select
            className="filter-select"
            value={filters.sortBy}
            onChange={(e) => handleChange('sortBy', e.target.value)}
          >
            <option value="date-desc">Date (Newest)</option>
            <option value="date-asc">Date (Oldest)</option>
            <option value="amount-desc">Amount (High to Low)</option>
            <option value="amount-asc">Amount (Low to High)</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button className="reset-btn" onClick={handleReset}>
            ✕ Reset
          </button>
        )}
      </div>
    </div>
  );
};

export default TransactionFilters;
