import { useAuthStore } from '../../store/authStore';
import { useFinanceStore } from '../../store/financeStore';
import './BudgetView.css';

export default function BudgetView() {
  const { user } = useAuthStore();
  const getEnvelopeBudgetData = useFinanceStore(state => state.getEnvelopeBudgetData);
  
  const budgetData = getEnvelopeBudgetData();

  if (budgetData.length === 0) {
    return (
      <div className="empty-budget">
        <div className="empty-icon">📊</div>
        <p>No budgets set. Add categories in settings!</p>
      </div>
    );
  }

  return (
    <div className="budget-view">
      <h3 className="budget-title">📊 Budget Overview</h3>
      
      {budgetData.map(data => {
        const percentage = Math.min(data.percentage, 100);
        const isOverBudget = data.spent > data.budgetAmount;
        
        return (
          <div key={data.envelope} className="budget-card">
            <div className="budget-header">
              <span className="budget-envelope">{data.envelope}</span>
              <span className="budget-amount">
                ₹{data.spent.toLocaleString('en-IN')} / ₹{data.budgetAmount.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="budget-progress-bar">
              <div
                className={`budget-progress-fill ${isOverBudget ? 'over-budget' : ''}`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>

            <div className="budget-breakdown">
              {data.needSpent > 0 && (
                <span className="budget-chip need">
                  🎯 ₹{data.needSpent.toLocaleString('en-IN')}
                </span>
              )}
              {data.wantSpent > 0 && (
                <span className="budget-chip want">
                  🎉 ₹{data.wantSpent.toLocaleString('en-IN')}
                </span>
              )}
              {data.saveSpent > 0 && (
                <span className="budget-chip save">
                  💰 ₹{data.saveSpent.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            <div className="budget-remaining">
              {isOverBudget ? (
                <span className="over-budget-text">
                  ⚠️ Over by ₹{Math.abs(data.remaining).toLocaleString('en-IN')}
                </span>
              ) : (
                <span className="remaining-text">
                  ✅ ₹{data.remaining.toLocaleString('en-IN')} remaining
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
