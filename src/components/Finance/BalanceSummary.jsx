import { useFinanceStore } from '../../store/financeStore';

export default function BalanceSummary() {
  const getFilteredTransactions = useFinanceStore(state => state.getFilteredTransactions);
  
  const transactions = getFilteredTransactions();
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  return (
    <div className="balance-summary-wrapper">
      <div className="balance-summary">
        <div className="balance-item income">
          <div className="balance-label">Income</div>
          <div className="balance-value">₹{income.toLocaleString('en-IN')}</div>
        </div>
        <div className="balance-item expense">
          <div className="balance-label">Expense</div>
          <div className="balance-value">₹{expense.toLocaleString('en-IN')}</div>
        </div>
        <div className="balance-item net">
          <div className="balance-label">Net</div>
          <div className="balance-value">₹{(income - expense).toLocaleString('en-IN')}</div>
        </div>
      </div>
    </div>
  );
}
