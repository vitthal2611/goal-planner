import React from 'react';

const TransactionsList = ({ transactions }) => {
  if (transactions.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>📭</div>
        <div style={styles.emptyText}>No transactions yet</div>
      </div>
    );
  }

  return (
    <div style={styles.list}>
      {transactions.map((transaction, idx) => (
        <div key={idx} style={styles.item}>
          <div style={styles.itemLeft}>
            <div style={styles.description}>{transaction.description}</div>
            <div style={styles.meta}>
              {transaction.type} • {transaction.paymentMethod}
              {transaction.envelope && ` • ${transaction.envelope}`}
            </div>
          </div>
          <div style={{
            ...styles.amount,
            color: transaction.type === 'Income' || transaction.type === 'Transfer-In' ? '#28a745' : '#dc3545',
          }}>
            {transaction.type === 'Income' || transaction.type === 'Transfer-In' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
};

const styles = {
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#666',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  emptyText: {
    fontSize: '14px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  itemLeft: {
    flex: 1,
  },
  description: {
    fontWeight: '500',
    color: '#333',
    marginBottom: '4px',
  },
  meta: {
    fontSize: '12px',
    color: '#666',
  },
  amount: {
    fontWeight: 'bold',
    fontSize: '14px',
    marginLeft: '12px',
  },
};

export default TransactionsList;
