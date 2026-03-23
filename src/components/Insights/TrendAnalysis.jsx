import React from 'react';
import './TrendAnalysis.css';

const TrendAnalysis = ({ insights }) => {
  const { income, expense, transactionCount, dailyData } = insights;
  const net = income - expense;
  const avgDailySpending = Object.keys(dailyData).length > 0
    ? expense / Object.keys(dailyData).length
    : 0;

  const largestExpense = Math.max(...Object.values(dailyData), 0);
  const savingsRate = income > 0 ? ((income - expense) / income * 100) : 0;

  return (
    <div className="trend-analysis">
      <h3 className="section-title">Key Metrics</h3>
      <div className="trend-cards">
        <div className="trend-card">
          <div className="trend-icon">💰</div>
          <div className="trend-info">
            <div className="trend-label">Total Income</div>
            <div className="trend-value">₹{income.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div className="trend-card">
          <div className="trend-icon">💸</div>
          <div className="trend-info">
            <div className="trend-label">Total Expense</div>
            <div className="trend-value">₹{expense.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div className={`trend-card ${net >= 0 ? 'positive' : 'negative'}`}>
          <div className="trend-icon">{net >= 0 ? '📈' : '📉'}</div>
          <div className="trend-info">
            <div className="trend-label">Net Balance</div>
            <div className="trend-value">₹{net.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div className="trend-card">
          <div className="trend-icon">📅</div>
          <div className="trend-info">
            <div className="trend-label">Avg Daily Spending</div>
            <div className="trend-value">₹{avgDailySpending.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
          </div>
        </div>

        <div className="trend-card">
          <div className="trend-icon">🔥</div>
          <div className="trend-info">
            <div className="trend-label">Highest Day</div>
            <div className="trend-value">₹{largestExpense.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div className={`trend-card ${savingsRate >= 20 ? 'positive' : ''}`}>
          <div className="trend-icon">💎</div>
          <div className="trend-info">
            <div className="trend-label">Savings Rate</div>
            <div className="trend-value">{savingsRate.toFixed(1)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendAnalysis;
