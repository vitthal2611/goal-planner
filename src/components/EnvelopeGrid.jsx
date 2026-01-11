import React, { useState, useMemo, memo } from 'react';
import EnvelopeCard from './EnvelopeCard';
import './EnvelopeCard.css';

const EnvelopeGrid = memo(({ 
  envelopes, 
  onAddExpense, 
  onViewDetails,
  customPaymentMethods = [],
  searchTerm = '',
  onSearchChange,
  sortBy = 'balance',
  onSortChange 
}) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'healthy', 'warning', 'blocked'

  // Flatten and process envelopes
  const processedEnvelopes = useMemo(() => {
    const flattened = [];
    
    Object.keys(envelopes).forEach(category => {
      Object.keys(envelopes[category]).forEach(name => {
        const envelope = envelopes[category][name];
        const balance = envelope.budgeted + envelope.rollover - envelope.spent;
        const percentage = envelope.budgeted > 0 ? (envelope.spent / envelope.budgeted) * 100 : 0;
        
        let status = 'healthy';
        if (balance <= 0) status = 'blocked';
        else if (percentage > 80) status = 'warning';

        flattened.push({
          category,
          name,
          envelope,
          balance,
          percentage,
          status,
          searchText: `${category} ${name}`.toLowerCase()
        });
      });
    });

    return flattened;
  }, [envelopes]);

  // Filter and sort envelopes
  const filteredEnvelopes = useMemo(() => {
    let filtered = processedEnvelopes;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.searchText.includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'balance':
          return b.balance - a.balance;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'spent':
          return b.envelope.spent - a.envelope.spent;
        case 'percentage':
          return b.percentage - a.percentage;
        default:
          return 0;
      }
    });

    return filtered;
  }, [processedEnvelopes, searchTerm, filterStatus, sortBy]);

  const getStatusCounts = () => {
    const counts = { all: 0, healthy: 0, warning: 0, blocked: 0 };
    processedEnvelopes.forEach(item => {
      counts.all++;
      counts[item.status]++;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="envelope-grid-container">
      {/* Header Controls */}
      <div className="envelope-controls">
        <div className="search-section">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="🔍 Search envelopes..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                className="clear-search"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="filter-section">
          <div className="status-filters">
            {[
              { key: 'all', label: 'All', icon: '📊' },
              { key: 'healthy', label: 'Healthy', icon: '✅' },
              { key: 'warning', label: 'Warning', icon: '⚠️' },
              { key: 'blocked', label: 'Blocked', icon: '🚫' }
            ].map(filter => (
              <button
                key={filter.key}
                className={`filter-btn ${filterStatus === filter.key ? 'active' : ''}`}
                onClick={() => setFilterStatus(filter.key)}
                aria-label={`Filter by ${filter.label}`}
              >
                <span className="filter-icon">{filter.icon}</span>
                <span className="filter-label">{filter.label}</span>
                <span className="filter-count">({statusCounts[filter.key]})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="view-controls">
          <div className="sort-section">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="sort-select"
              aria-label="Sort envelopes by"
            >
              <option value="balance">Sort by Balance</option>
              <option value="name">Sort by Name</option>
              <option value="category">Sort by Category</option>
              <option value="spent">Sort by Spent</option>
              <option value="percentage">Sort by Usage %</option>
            </select>
          </div>

          <div className="view-mode-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              ⊞
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <span className="results-text">
          {filteredEnvelopes.length} envelope{filteredEnvelopes.length !== 1 ? 's' : ''} 
          {searchTerm && ` matching "${searchTerm}"`}
          {filterStatus !== 'all' && ` with ${filterStatus} status`}
        </span>
        {filteredEnvelopes.length > 0 && (
          <span className="total-balance">
            Total Available: ₹{filteredEnvelopes.reduce((sum, item) => sum + item.balance, 0).toLocaleString()}
          </span>
        )}
      </div>

      {/* Envelope Grid/List */}
      <div className={`envelope-grid ${viewMode}`}>
        {filteredEnvelopes.length > 0 ? (
          filteredEnvelopes.map(({ category, name, envelope }) => (
            <EnvelopeCard
              key={`${category}.${name}`}
              category={category}
              name={name}
              envelope={envelope}
              onAddExpense={onAddExpense}
              onViewDetails={onViewDetails}
              customPaymentMethods={customPaymentMethods}
              isCompact={viewMode === 'list'}
            />
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              {searchTerm ? '🔍' : filterStatus !== 'all' ? '📊' : '💰'}
            </div>
            <div className="empty-title">
              {searchTerm 
                ? 'No envelopes found' 
                : filterStatus !== 'all' 
                  ? `No ${filterStatus} envelopes` 
                  : 'No envelopes available'
              }
            </div>
            <div className="empty-subtitle">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : filterStatus !== 'all'
                  ? 'Try changing the filter or add some budget'
                  : 'Create your first envelope to get started'
              }
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {filteredEnvelopes.length > 0 && (
        <div className="quick-stats">
          <div className="stat-card">
            <span className="stat-value">
              ₹{filteredEnvelopes.reduce((sum, item) => sum + item.envelope.budgeted, 0).toLocaleString()}
            </span>
            <span className="stat-label">Total Budgeted</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">
              ₹{filteredEnvelopes.reduce((sum, item) => sum + item.envelope.spent, 0).toLocaleString()}
            </span>
            <span className="stat-label">Total Spent</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">
              ₹{filteredEnvelopes.reduce((sum, item) => sum + item.balance, 0).toLocaleString()}
            </span>
            <span className="stat-label">Available</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">
              {filteredEnvelopes.length > 0 
                ? Math.round(filteredEnvelopes.reduce((sum, item) => sum + item.percentage, 0) / filteredEnvelopes.length)
                : 0
              }%
            </span>
            <span className="stat-label">Avg Usage</span>
          </div>
        </div>
      )}
    </div>
  );
});

EnvelopeGrid.displayName = 'EnvelopeGrid';

export default EnvelopeGrid;