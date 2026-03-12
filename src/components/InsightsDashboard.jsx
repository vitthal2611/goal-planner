import React, { useMemo } from 'react';
import { useBudget } from '../contexts/BudgetContext.jsx';
import './InsightsDashboard.css';

const InsightsDashboard = () => {
  const { transactions, budgetSummary } = useBudget();

  const insights = useMemo(() => {
    const income = transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
    const savings = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;
    
    const totalBudget = budgetSummary.reduce((sum, b) => sum + b.budget, 0);
    const totalSpent = budgetSummary.reduce((sum, b) => sum + b.spent, 0);
    const budgetHealth = totalBudget > 0 ? Math.max(0, 100 - (totalSpent / totalBudget) * 100) : 100;

    const categorySpending = transactions
      .filter(t => t.type === 'Expense')
      .reduce((acc, t) => {
        acc[t.envelope] = (acc[t.envelope] || 0) + t.amount;
        return acc;
      }, {});

    const topCategories = Object.entries(categorySpending)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    const overBudgetCount = budgetSummary.filter(b => b.percentage > 100).length;
    const warningCount = budgetSummary.filter(b => b.percentage > 80 && b.percentage <= 100).length;

    return {
      income,
      expenses,
      savings,
      savingsRate,
      budgetHealth,
      topCategories,
      overBudgetCount,
      warningCount,
    };
  }, [transactions, budgetSummary]);

  const getHealthColor = (score) => {
    if (score >= 70) return '#10b981';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getHealthLabel = (score) => {
    if (score >= 70) return 'Excellent';
    if (score >= 40) return 'Good';
    return 'Needs Attention';
  };

  return (
    <div className="insights-dashboard">
      <div className="insights-grid">
        {/* Financial Health Score */}
        <div className="insight-card health-card">
          <div className="card-header">
            <span className="card-icon">💚</span>
            <span className="card-label">Financial Health</span>
          </div>
          <div className="health-score">
            <div className="score-circle" style={{ '--score': insights.budgetHealth, '--color': getHealthColor(insights.budgetHealth) }}>
              <span className="score-value">{Math.round(insights.budgetHealth)}</span>
            </div>
            <span className="score-label" style={{ color: getHealthColor(insights.budgetHealth) }}>
              {getHealthLabel(insights.budgetHealth)}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="insight-card income-card">
          <div className="card-header">
            <span className="card-icon">💰</span>
            <span className="card-label">Total Income</span>
          </div>
          <div className="card-value">₹{insights.income.toLocaleString()}</div>
        </div>

        <div className="insight-card expense-card">
          <div className="card-header">
            <span className="card-icon">💸</span>
            <span className="card-label">Total Expenses</span>
          </div>
          <div className="card-value">₹{insights.expenses.toLocaleString()}</div>
        </div>

        <div className="insight-card savings-card">
          <div className="card-header">
            <span className="card-icon">🎯</span>
            <span className="card-label">Net Savings</span>
          </div>
          <div className="card-value" style={{ color: insights.savings >= 0 ? '#10b981' : '#ef4444' }}>
            ₹{insights.savings.toLocaleString()}
          </div>
          <div className="card-subtitle">
            {insights.savingsRate.toFixed(1)}% savings rate
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {(insights.overBudgetCount > 0 || insights.warningCount > 0) && (
        <div className="alerts-section">
          <h3>⚠️ Budget Alerts</h3>
          <div className="alerts-grid">
            {insights.overBudgetCount > 0 && (
              <div className="alert alert-danger">
                <span className="alert-icon">🚨</span>
                <div>
                  <div className="alert-title">{insights.overBudgetCount} Over Budget</div>
                  <div className="alert-text">Some envelopes exceeded their limits</div>
                </div>
              </div>
            )}
            {insights.warningCount > 0 && (
              <div className="alert alert-warning">
                <span className="alert-icon">⚡</span>
                <div>
                  <div className="alert-title">{insights.warningCount} Near Limit</div>
                  <div className="alert-text">Watch your spending in these categories</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Spending Categories */}
      {insights.topCategories.length > 0 && (
        <div className="top-spending">
          <h3>📊 Top Spending Categories</h3>
          <div className="spending-list">
            {insights.topCategories.map(([category, amount], idx) => {
              const percentage = insights.expenses > 0 ? (amount / insights.expenses) * 100 : 0;
              return (
                <div key={category} className="spending-item">
                  <div className="spending-rank">#{idx + 1}</div>
                  <div className="spending-details">
                    <div className="spending-name">{category}</div>
                    <div className="spending-bar">
                      <div className="spending-fill" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                  <div className="spending-amount">
                    <div>₹{amount.toLocaleString()}</div>
                    <div className="spending-percent">{percentage.toFixed(0)}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default InsightsDashboard;
