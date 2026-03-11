import React from 'react';

const BudgetSummary = ({ budgets }) => {
  if (budgets.length === 0) {
    return <div style={styles.empty}>No budgets allocated</div>;
  }

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.budgeted, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudgeted - totalSpent;

  return (
    <div>
      <div style={styles.overallStats}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Budgeted</div>
          <div style={styles.statValue}>₹{totalBudgeted.toLocaleString()}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Spent</div>
          <div style={styles.statValue}>₹{totalSpent.toLocaleString()}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Remaining</div>
          <div style={{ ...styles.statValue, color: totalRemaining >= 0 ? '#28a745' : '#dc3545' }}>
            ₹{totalRemaining.toLocaleString()}
          </div>
        </div>
      </div>

      <div style={styles.budgetsList}>
        {budgets.map((budget, idx) => (
          <div key={idx} style={styles.budgetCard}>
            <div style={styles.budgetHeader}>
              <span style={styles.budgetName}>{budget.envelope}</span>
              <span style={styles.budgetAmount}>₹{budget.budgeted.toLocaleString()}</span>
            </div>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${Math.min((budget.spent / budget.budgeted) * 100, 100)}%`,
                  backgroundColor: budget.spent > budget.budgeted ? '#dc3545' : '#28a745',
                }}
              />
            </div>
            <div style={styles.budgetFooter}>
              <span>Spent: ₹{budget.spent.toLocaleString()}</span>
              <span style={{ color: budget.remaining >= 0 ? '#28a745' : '#dc3545' }}>
                {budget.remaining >= 0 ? '✓' : '✗'} ₹{Math.abs(budget.remaining).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  empty: {
    textAlign: 'center',
    padding: '20px',
    color: '#666',
  },
  overallStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px',
    marginBottom: '24px',
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    padding: '16px',
    borderRadius: '8px',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '8px',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
  },
  budgetsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  budgetCard: {
    backgroundColor: '#f8f9fa',
    padding: '16px',
    borderRadius: '8px',
  },
  budgetHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  budgetName: {
    fontWeight: 'bold',
    color: '#333',
  },
  budgetAmount: {
    fontWeight: 'bold',
    color: '#007bff',
  },
  progressBar: {
    height: '8px',
    backgroundColor: '#e9ecef',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  progressFill: {
    height: '100%',
    transition: 'width 0.3s',
  },
  budgetFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#666',
  },
};

export default BudgetSummary;
