import React from 'react';

const EnvelopeGrid = ({ envelopes, dashboardData, onEnvelopeClick, onCreateEnvelope }) => {
  if (Object.keys(envelopes).length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📊</div>
        <div className="empty-title">No envelopes created</div>
        <div className="empty-text">Create envelopes to start budgeting</div>
        <button className="btn-empty-action" onClick={onCreateEnvelope}>
          ➕ Create Envelope
        </button>
      </div>
    );
  }

  return (
    <>
      {Object.keys(envelopes).map(category => (
        <div key={category} className="category-section">
          <h3 className="category-title">
            {category === 'needs' ? '🏠 Needs' :
             category === 'savings' ? '💰 Savings' : '🎯 Wants'}
          </h3>
          <div className="envelope-cards">
            {Object.keys(envelopes[category]).map(name => {
              const envelopeData = dashboardData.envelopeBalances[category]?.[name];
              if (!envelopeData) return null;

              return (
                <div
                  key={name}
                  className={`compact-envelope-card ${envelopeData.balance <= 0 ? 'disabled' : ''}`}
                  onClick={() => onEnvelopeClick(category, name)}
                >
                  <div className="envelope-name">{name.toUpperCase()}</div>
                  <div className="envelope-balance" style={{ color: envelopeData.statusColor }}>
                    ₹{envelopeData.balance.toLocaleString()}
                  </div>
                  <div className="envelope-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${Math.min((envelopeData.spent / envelopeData.budgeted) * 100, 100)}%`,
                          backgroundColor: envelopeData.statusColor
                        }}
                      />
                    </div>
                  </div>
                  <div className="envelope-meta">
                    ₹{envelopeData.spent.toLocaleString()} / ₹{envelopeData.budgeted.toLocaleString()}
                    {envelopeData.rollover > 0 && (
                      <span className="rollover-badge">↻ ₹{envelopeData.rollover.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
};

export default EnvelopeGrid;
