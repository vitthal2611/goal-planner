import React, { useMemo } from 'react';
import { calculateSpendingTrends, calculateBudgetVsActual, calculateCategoryInsights, calculateMonthlyComparison } from '../services/analytics.js';

const AnalyticsDashboard = ({ transactions, envelopes }) => {
  const analytics = useMemo(() => {
    if (!transactions.length) return null;
    
    return {
      trends: calculateSpendingTrends(transactions),
      budgetVsActual: calculateBudgetVsActual(envelopes, transactions),
      categoryInsights: calculateCategoryInsights(transactions),
      monthlyComparison: calculateMonthlyComparison(transactions)
    };
  }, [transactions, envelopes]);

  if (!analytics) {
    return (
      <div className="card">
        <div className="card-header">
          <h3>📈 Analytics & Insights</h3>
        </div>
        <div className="card-content">
          <p style={{ textAlign: 'center', color: 'var(--gray-600)' }}>
            No transaction data available for analysis
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>📈 Analytics & Insights</h3>
      </div>
      <div className="card-content">
        
        {/* Spending Trends */}
        <div style={{ marginBottom: '30px' }}>
          <h4>📊 Spending Trends (Last 30 Days)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '15px' }}>
            <div className="summary-card">
              <div className="summary-value">₹{analytics.trends.totalSpent.toLocaleString()}</div>
              <div className="summary-label">Total Spent</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">₹{Math.round(analytics.trends.avgDaily).toLocaleString()}</div>
              <div className="summary-label">Daily Average</div>
            </div>
          </div>
        </div>

        {/* Budget vs Actual */}
        <div style={{ marginBottom: '30px' }}>
          <h4>🎯 Budget vs Actual</h4>
          <div className="table-container">
            <table className="envelope-table">
              <thead>
                <tr>
                  <th>Envelope</th>
                  <th>Budgeted</th>
                  <th>Spent</th>
                  <th>Remaining</th>
                  <th>Usage %</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(analytics.budgetVsActual).map((item, index) => (
                  <tr key={`budget-${item.name}-${index}`}>
                    <td>{item.name}</td>
                    <td>₹{item.budgeted.toLocaleString()}</td>
                    <td>₹{item.actualSpent.toLocaleString()}</td>
                    <td style={{ color: item.remaining >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                      ₹{item.remaining.toLocaleString()}
                    </td>
                    <td>{Math.round(item.percentUsed)}%</td>
                    <td>
                      <span style={{
                        color: item.status === 'good' ? 'var(--success)' : 
                               item.status === 'warning' ? 'orange' : 'var(--danger)',
                        fontWeight: '600'
                      }}>
                        {item.status === 'good' ? '✅ Good' : 
                         item.status === 'warning' ? '⚠️ Warning' : '🚨 Over Budget'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Insights */}
        <div style={{ marginBottom: '30px' }}>
          <h4>🏷️ Category Spending Insights</h4>
          <div className="table-container">
            <table className="envelope-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Total Spent</th>
                  <th>Transactions</th>
                  <th>Avg per Transaction</th>
                  <th>% of Total</th>
                </tr>
              </thead>
              <tbody>
                {analytics.categoryInsights.slice(0, 10).map((category, index) => (
                  <tr key={`category-${category.name}-${index}`}>
                    <td>{category.name}</td>
                    <td>₹{category.totalSpent.toLocaleString()}</td>
                    <td>{category.transactionCount}</td>
                    <td>₹{Math.round(category.avgTransaction).toLocaleString()}</td>
                    <td>{Math.round(category.percentage)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Comparison */}
        <div>
          <h4>📅 Monthly Comparison</h4>
          <div className="table-container">
            <table className="envelope-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Income</th>
                  <th>Expenses</th>
                  <th>Net</th>
                </tr>
              </thead>
              <tbody>
                {analytics.monthlyComparison.slice(-6).map((month, index) => (
                  <tr key={`month-${month.month}-${index}`}>
                    <td>{month.month}</td>
                    <td style={{ color: 'var(--success)' }}>₹{month.income.toLocaleString()}</td>
                    <td style={{ color: 'var(--danger)' }}>₹{month.expenses.toLocaleString()}</td>
                    <td style={{ 
                      color: month.net >= 0 ? 'var(--success)' : 'var(--danger)',
                      fontWeight: '600'
                    }}>
                      ₹{month.net.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsDashboard;