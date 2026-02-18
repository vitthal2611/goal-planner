import React from 'react';
import './BudgetHeader.css';

const BudgetHeader = ({ currentPeriod, onPeriodChange, generatePeriodOptions }) => {
  const isYearView = currentPeriod.match(/^\d{4}$/);
  const currentYear = isYearView ? currentPeriod : currentPeriod.split('-')[0];
  
  const years = generatePeriodOptions().filter(p => p.isYear);
  const months = generatePeriodOptions().filter(p => !p.isYear && p.key.startsWith(currentYear));

  const handleQuickNav = (direction) => {
    const [year, month] = currentPeriod.split('-').map(Number);
    let newPeriod;
    
    if (isYearView) {
      newPeriod = direction === 'prev' ? `${year - 1}` : `${year + 1}`;
    } else {
      if (direction === 'prev') {
        newPeriod = month === 1 ? `${year - 1}-12` : `${year}-${String(month - 1).padStart(2, '0')}`;
      } else {
        newPeriod = month === 12 ? `${year + 1}-01` : `${year}-${String(month + 1).padStart(2, '0')}`;
      }
    }
    onPeriodChange(newPeriod);
  };

  return (
    <div className="budget-header">
      <div className="header-top">
        <h1 className="header-title">
          <span className="title-icon">💰</span>
          <span className="title-text">Envelope Budget</span>
        </h1>
        <div className="header-badge">Tracker</div>
      </div>
      
      <div className="period-controls">
        <button 
          className="nav-btn prev-btn" 
          onClick={() => handleQuickNav('prev')}
          aria-label="Previous period"
        >
          ←
        </button>
        
        <div className="period-selectors">
          <div className="selector-group">
            <label>Year</label>
            <select 
              value={currentYear}
              onChange={(e) => onPeriodChange(e.target.value)}
              className="period-select"
            >
              {years.map(y => (
                <option key={y.key} value={y.key}>{y.label}</option>
              ))}
            </select>
          </div>
          
          <div className="selector-group">
            <label>Month</label>
            <select 
              value={isYearView ? '' : currentPeriod}
              onChange={(e) => onPeriodChange(e.target.value || currentYear)}
              className="period-select"
            >
              <option value="">All Months</option>
              {months.map(m => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <button 
          className="nav-btn next-btn" 
          onClick={() => handleQuickNav('next')}
          aria-label="Next period"
        >
          →
        </button>
      </div>
      
      <div className="period-display">
        <span className="current-period">
          {isYearView ? currentYear : months.find(m => m.key === currentPeriod)?.label || currentPeriod}
        </span>
      </div>
    </div>
  );
};

export default BudgetHeader;
