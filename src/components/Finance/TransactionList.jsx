import { useAuthStore } from '../../store/authStore';
import { useFinanceStore } from '../../store/financeStore';
import toast from 'react-hot-toast';

export default function TransactionList() {
  const { user } = useAuthStore();
  const { deleteTransaction } = useFinanceStore();
  const getFilteredTransactions = useFinanceStore(state => state.getFilteredTransactions);

  const transactions = getFilteredTransactions()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 20);

  const getIcon = (type, expenseType) => {
    if (type === 'income') return '💰';
    if (type === 'transfer') return '🔄';
    if (expenseType === 'need') return '🎯';
    if (expenseType === 'want') return '🎉';
    if (expenseType === 'save') return '💰';
    return '💸';
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this transaction?')) {
      deleteTransaction(id, user.uid);
      toast.error('Transaction deleted');
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📊</div>
        <p>No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="transaction-list">
      <h3 className="section-title">Recent Transactions</h3>
      {transactions.map(t => (
        <div key={t.id} className="transaction-item">
          <div className="transaction-icon">{getIcon(t.type, t.expenseType)}</div>
          <div className="transaction-details">
            <div className="transaction-desc">{t.description}</div>
            <div className="transaction-meta">
              {t.envelope || t.payment} • {new Date(t.date).toLocaleDateString('en-IN')}
            </div>
          </div>
          <div className="transaction-amount">
            {t.type === 'income' ? '+' : '-'}₹{parseFloat(t.amount).toLocaleString('en-IN')}
          </div>
          <button className="tx-delete" onClick={() => handleDelete(t.id)}>
            🗑️
          </button>
        </div>
      ))}
    </div>
  );
}
