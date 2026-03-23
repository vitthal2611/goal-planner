import React, { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import './EnvelopeList.css';

const EnvelopeList = ({ envelopeBreakdown, totalExpense }) => {
  const { envelopes } = useApp();

  const sortedEnvelopes = useMemo(() => {
    return Object.entries(envelopeBreakdown)
      .map(([name, amount]) => {
        const envelope = envelopes.find(e => e.name === name);
        return {
          name,
          amount,
          icon: envelope?.icon || '📦',
          type: envelope?.type || 'need',
          percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [envelopeBreakdown, envelopes, totalExpense]);

  if (sortedEnvelopes.length === 0) {
    return null;
  }

  return (
    <div className="envelope-list-section">
      <h3 className="section-title">Category Breakdown</h3>
      <div className="envelope-list">
        {sortedEnvelopes.map((envelope) => (
          <div key={envelope.name} className="envelope-item">
            <div className="envelope-item-header">
              <div className="envelope-item-left">
                <span className="envelope-icon">{envelope.icon}</span>
                <span className="envelope-name">{envelope.name}</span>
              </div>
              <div className="envelope-item-right">
                <span className="envelope-amount">
                  ₹{envelope.amount.toLocaleString('en-IN')}
                </span>
                <span className="envelope-percentage">
                  {envelope.percentage.toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="envelope-progress-bar">
              <div
                className="envelope-progress-fill"
                style={{ width: `${envelope.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnvelopeList;
