import React from 'react';
import './QuickStats.css';

const QuickStats = ({ income, totalBudgeted, totalSpent, currentPeriod }) => {
  const unallocated = income - totalBudgeted;
  const savings = income - totalSpent;
  const spendingRate = income > 0 ? ((totalSpent / income) * 100).toFixed(1) : 0;

  const stats = [
    {
      label: 'Monthly Income',
      value: `₹${income.toLocaleString()}`,
      icon: '💰',
      color: '#3b82f6',
      trend: null
    },
    {
      label: 'Total Budgeted',
      value: `₹${totalBudgeted.toLocaleString()}`,
      icon: '📊',
      color: '#f59e0b',
      percentage: income > 0 ? `${((totalBudgeted / income) * 100).toFixed(0)}%` : '0%'
    },
    {
      label: 'Total Spent',
      value: `₹${totalSpent.toLocaleString()}`,
      icon: '💸',
      color: '#ef4444',
      percentage: income > 0 ? `${spendingRate}%` : '0%'
    },
    {
      label: 'Unallocated',
      value: `₹${unallocated.toLocaleString()}`,
      icon: unallocated > 0 ? '✨' : '⚠️',
      color: unallocated > 0 ? '#10b981' : '#f59e0b',
      alert: unallocated < 0 ? 'Over budget!' : null
    }
  ];

  return (
    <div className="quick-stats-container">
      <div className="quick-stats-grid">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="quick-stat-card"
            style={{ '--stat-color': stat.color }}
          >
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
              {stat.percentage && (
                <div className="stat-percentage">{stat.percentage} of income</div>
              )}
              {stat.alert && (
                <div className="stat-alert">{stat.alert}</div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Quick Insights */}
      <div className="quick-insights">
        <div className="insight-item">
          <span className="insight-icon">💡</span>
          <span className="insight-text">
            {savings >= 0 
              ? `You're saving ₹${savings.toLocaleString()} this month!` 
              : `You're ₹${Math.abs(savings).toLocaleString()} over budget`}
          </span>
        </div>
        {unallocated > 0 && (
          <div className="insight-item">
            <span className="insight-icon">📌</span>
            <span className="insight-text">
              Allocate remaining ₹{unallocated.toLocaleString()} to envelopes
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickStats;
