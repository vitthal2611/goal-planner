import React from 'react';
import { formatPeriodDisplay, getMonthName } from '../utils/dateUtils';

export const EnvelopeBudgetHeader = ({ 
  currentPeriod, 
  selectedYear, 
  viewMode, 
  onViewModeChange, 
  onYearChange, 
  onPeriodChange 
}) => {
  const [year, month] = currentPeriod.split('-');

  return (
    <div className="header">
      <h1>💰 Envelope Budget Tracker - {formatPeriodDisplay(currentPeriod)}</h1>
      <div className="period-controls">
        <div className="year-selector-group">
          <label>Year:</label>
          <select 
            value={selectedYear}
            onChange={(e) => onYearChange(parseInt(e.target.value))}
            className="period-selector"
          >
            {Array.from({ length: 5 }, (_, i) => 2026 + i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        
        <div className="view-toggle">
          <button 
            className={`toggle-option ${viewMode === 'monthly' ? 'active' : ''}`}
            onClick={() => onViewModeChange('monthly')}
          >
            📅 Monthly
          </button>
          <button 
            className={`toggle-option ${viewMode === 'annual' ? 'active' : ''}`}
            onClick={() => onViewModeChange('annual')}
          >
            📊 Annual
          </button>
        </div>

        {viewMode === 'monthly' && (
          <div className="month-selector-group">
            <label>Month:</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button onClick={() => onPeriodChange('prev')} className="btn btn-secondary" style={{ padding: '8px 12px', minWidth: 'auto' }}>←</button>
              <div style={{ minWidth: '150px', textAlign: 'center', fontWeight: 'bold' }}>
                {formatPeriodDisplay(currentPeriod)}
              </div>
              <button onClick={() => onPeriodChange('next')} className="btn btn-secondary" style={{ padding: '8px 12px', minWidth: 'auto' }}>→</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
