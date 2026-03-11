import React, { useContext } from 'react';
import { BudgetContext } from '../contexts/BudgetContext.jsx';
import './BudgetSummary.css';

const BudgetSummary = () => {
  const { budgets, transactions, envelopes, calculateSpent } = useContext(BudgetContext);

  const getTotalIncome = () => {
    return transactions
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalExpense = () => {
    return transactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalBudgeted = () => {
    return budgets.reduce((sum, b) => sum + b.budgeted, 0);
  };

  const getEnvelopeStatus = (envelope) => {
    const budget = budgets.find(b => b.envelope === envelope);
    const spent = calculateSpent(envelope);
    const budgeted = budget?.budgeted || 0;
    const remaining = budgeted - spent;
    const percentage = budgeted > 0 ? (spent / budgeted) * 100 : 0;

    return { spent, budgeted, remaining, percentage };
  };

  const totalIncome = getTotalIncome();
  const totalExpense = getTotalExpense();
  const totalBudgeted = getTotalBudgeted();
  const balance = totalIncome - totalExpense;

  return (
    <div className="budget-summary">
      <div className="summary-cards">
        <div className="summary-card income">
          <div className="card-label">Total Income</div>
          <div className="card-amount">₹{totalIncome.toFixed(2)}</div>
        </div>
        <div className="summary-card expense">
          <div className="card-label">Total Expense</div>
          <div className="card-amount">₹{totalExpense.toFixed(2)}</div>
        </div>
        <div className="summary-card budget">
          <div className="card-label">Total Budgeted</div>
          <div className="card-amount">₹{totalBudgeted.toFixed(2)}</div>
        </div>
        <div className={`summary-card balance ${balance >= 0 ? 'positive' : 'negative'}`}>
          <div className="card-label">Balance</div>
          <div className="card-amount">₹{balance.toFixed(2)}</div>
        </div>
      </div>

      {envelopes.length > 0 && (
        <div className="envelope-status">
          <h3>Envelope Status</h3>
          <div className="envelope-list">
            {envelopes.map(envelope => {
              const status = getEnvelopeStatus(envelope);
              const isOverBudget = status.spent > status.budgeted;

              return (
                <div key={envelope} className="envelope-item">
                  <div className="envelope-header">
                    <div className="envelope-name">{envelope}</div>
                    <div className={`envelope-amount ${isOverBudget ? 'over-budget' : ''}`}>
                      ₹{status.spent.toFixed(2)} / ₹{status.budgeted.toFixed(2)}
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${isOverBudget ? 'over' : ''}`}
                      style={{ width: `${Math.min(status.percentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="envelope-footer">
                    <span className={`remaining ${isOverBudget ? 'over' : ''}`}>
                      {isOverBudget ? `Over by ₹${Math.abs(status.remaining).toFixed(2)}` : `₹${status.remaining.toFixed(2)} left`}
                    </span>
                    <span className="percentage">{status.percentage.toFixed(0)}%</span>
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

export default BudgetSummary;
