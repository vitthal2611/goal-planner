import React from 'react';

const SortIcon = ({ column, sortConfig }) => (
  <span>{sortConfig.key !== column ? '↕️' : sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
);

const TransactionTable = ({ 
  transactions, 
  selectedTransactions, 
  sortConfig,
  expandedRows = new Set(),
  onSort, 
  onSelectAll, 
  onSelectTransaction,
  onToggleExpand,
  onDelete 
}) => {
  const formatAmount = (amount) => {
    const num = parseFloat(amount);
    return isNaN(num) ? '₹0' : `₹${num.toLocaleString()}`;
  };

  const getTransactionIcon = (type) => {
    const icons = {
      'income': '💰',
      'transfer-in': '⬅️',
      'transfer-out': '➡️',
      'expense': '💸'
    };
    return icons[type] || '💸';
  };

  const getTransactionLabel = (type) => {
    const labels = {
      'income': 'Income',
      'transfer-in': 'Transfer In',
      'transfer-out': 'Transfer Out',
      'expense': 'Expense'
    };
    return labels[type] || 'Expense';
  };

  const formatEnvelopeName = (envelope) => {
    if (!envelope) return 'UNKNOWN';
    if (envelope === 'INCOME') return 'INCOME';
    if (envelope === 'TRANSFER') return 'TRANSFER';
    return envelope.replace('.', ' - ').toUpperCase();
  };

  const isIncome = (type) => type === 'income' || type === 'transfer-in';

  return (
    <div className="table-container">
      <table className="envelope-table">
        <thead>
          <tr>
            <th style={{width: '40px'}}>
              <input
                type="checkbox"
                checked={selectedTransactions.size === transactions.length && transactions.length > 0}
                onChange={(e) => onSelectAll(e.target.checked, transactions)}
              />
            </th>
            <th onClick={() => onSort('date')} style={{cursor: 'pointer'}}>
              Date <SortIcon column="date" sortConfig={sortConfig} />
            </th>
            <th onClick={() => onSort('description')} style={{cursor: 'pointer'}}>
              Type & Description <SortIcon column="description" sortConfig={sortConfig} />
            </th>
            <th onClick={() => onSort('envelope')} style={{cursor: 'pointer'}}>
              Envelope <SortIcon column="envelope" sortConfig={sortConfig} />
            </th>
            <th onClick={() => onSort('amount')} style={{cursor: 'pointer'}}>
              Amount <SortIcon column="amount" sortConfig={sortConfig} />
            </th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(transaction => {
            const type = transaction.type || 'expense';
            const isExpanded = expandedRows.has(transaction.id);
            
            return (
              <React.Fragment key={transaction.id}>
                <tr>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedTransactions.has(transaction.id)}
                      onChange={(e) => onSelectTransaction(transaction.id, e.target.checked)}
                    />
                  </td>
                  <td>{transaction.date}</td>
                  <td>
                    <div>
                      <span>{getTransactionIcon(type)} {getTransactionLabel(type)}</span>
                      <div style={{fontSize: '0.9em', color: '#666'}}>{transaction.description}</div>
                    </div>
                  </td>
                  <td>{formatEnvelopeName(transaction.envelope)}</td>
                  <td style={{
                    color: isIncome(type) ? 'var(--success)' : 'var(--danger)',
                    fontWeight: '600'
                  }}>
                    {isIncome(type) ? '+' : '-'}{formatAmount(transaction.amount)}
                  </td>
                  <td>
                    <button
                      className="btn-expand"
                      onClick={() => onToggleExpand(transaction.id)}
                      title="Show details"
                    >
                      {isExpanded ? '▲' : '▼'}
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => onDelete(transaction.id)}
                      title="Delete transaction"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="expanded-row">
                    <td colSpan="6">
                      <div className="transaction-details">
                        <strong>Payment Method:</strong> {transaction.paymentMethod || 'Unknown'}
                        {transaction.period && <div><strong>Period:</strong> {transaction.period}</div>}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
