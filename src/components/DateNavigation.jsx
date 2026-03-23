import React from 'react';
import { useApp } from '../contexts/AppContext';
import './DateNavigation.css';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DateNavigation = () => {
  const { selectedYear, selectedMonth, navigateMonth, toggleAllMonths } = useApp();

  const getLabel = () => {
    if (selectedMonth === 0) {
      return `All ${selectedYear}`;
    }
    return `${MONTHS[selectedMonth - 1]} ${selectedYear}`;
  };

  return (
    <div className="date-nav-bar">
      <button 
        className="date-nav-btn" 
        onClick={() => navigateMonth(-1)}
        title="Previous"
      >
        ←
      </button>
      
      <div 
        className="date-nav-label" 
        onClick={toggleAllMonths}
        title="Click to toggle All Months"
      >
        {getLabel()}
      </div>
      
      <button 
        className="date-nav-btn" 
        onClick={() => navigateMonth(1)}
        title="Next"
      >
        →
      </button>
    </div>
  );
};

export default DateNavigation;
