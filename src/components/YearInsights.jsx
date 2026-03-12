import React, { useState, useMemo } from 'react';
import { useBudget } from '../contexts/BudgetContext.jsx';
import './YearInsights.css';

const YearInsights = ({ currentMonth }) => {
  const { allTransactions } = useBudget();
  const [isOpen, setIsOpen] = useState(false);

  const currentYear = currentMonth.split('-')[0];

  const yearData = useMemo(() => {
    const yearTransactions = allTransactions.filter(t => t.month.startsWith(currentYear));
    
    const monthlyData = {};
    for (let m = 1; m <= 12; m++) {
      const month = `${currentYear}-${String(m).padStart(2, '0')}`;
      const monthTrans = yearTransactions.filter(t => t.month === month);
      
      monthlyData[month] = {
        income: monthTrans.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0),
        expense: monthTrans.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0),
      };
    }

    const categoryTotals = yearTransactions
      .filter(t => t.type === 'Expense')
      .reduce((acc, t) => {
        acc[t.envelope] = (acc[t.envelope] || 0) + t.amount;
        return acc;
      }, {});

    return {
      monthly: monthlyData,
      categories: Object.entries(categoryTotals).sort(([, a], [, b]) => b - a),
      totalIncome: Object.values(monthlyData).reduce((sum, m) => sum + m.income, 0),
      totalExpense: Object.values(monthlyData).reduce((sum, m) => sum + m.expense, 0),
    };
  }, [allTransactions, currentYear]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <>
      <button className="year-insights-btn" onClick={() => setIsOpen(true)}>
        📊 {currentYear}
      </button>

      {isOpen && (
        <div className="year-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="year-modal" onClick={(e) => e.stopPropagation()}>
            <div className="year-modal-header">
              <h2>📊 {currentYear} Insights</h2>
              <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
            </div>

            <div className="year-content">
              <div className="year-summary">
                <div className="summary-card income">
                  <div className="summary-label">Total Income</div>
                  <div className="summary-value">₹{yearData.totalIncome.toLocaleString()}</div>
                </div>
                <div className="summary-card expense">
                  <div className="summary-label">Total Expense</div>
                  <div className="summary-value">₹{yearData.totalExpense.toLocaleString()}</div>
                </div>
                <div className="summary-card savings">
                  <div className="summary-label">Net Savings</div>
                  <div className="summary-value">₹{(yearData.totalIncome - yearData.totalExpense).toLocaleString()}</div>
                </div>
              </div>

              <div className="monthly-chart">
                <h3>Monthly Trend</h3>
                <div className="chart-bars">
                  {Object.entries(yearData.monthly).map(([month, data], idx) => {
                    const maxAmount = Math.max(...Object.values(yearData.monthly).map(m => Math.max(m.income, m.expense)));
                    const incomeHeight = maxAmount > 0 ? (data.income / maxAmount) * 100 : 0;
                    const expenseHeight = maxAmount > 0 ? (data.expense / maxAmount) * 100 : 0;
                    
                    return (
                      <div key={month} className="chart-bar-group">
                        <div className="chart-bars-wrapper">
                          <div className="chart-bar income" style={{ height: `${incomeHeight}%` }} title={`₹${data.income}`} />
                          <div className="chart-bar expense" style={{ height: `${expenseHeight}%` }} title={`₹${data.expense}`} />
                        </div>
                        <div className="chart-label">{monthNames[idx]}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="chart-legend">
                  <span><span className="legend-dot income"></span> Income</span>
                  <span><span className="legend-dot expense"></span> Expense</span>
                </div>
              </div>

              <div className="category-breakdown">
                <h3>Top Categories</h3>
                <div className="category-list">
                  {yearData.categories.slice(0, 10).map(([category, amount]) => {
                    const percentage = yearData.totalExpense > 0 ? (amount / yearData.totalExpense) * 100 : 0;
                    return (
                      <div key={category} className="category-item">
                        <div className="category-name">{category}</div>
                        <div className="category-bar">
                          <div className="category-fill" style={{ width: `${percentage}%` }} />
                        </div>
                        <div className="category-amount">₹{amount.toLocaleString()}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default YearInsights;
