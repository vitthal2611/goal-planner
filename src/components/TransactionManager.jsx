import React from 'react';

const TransactionManager = ({ 
    transactions, 
    filters, 
    setFilters, 
    sortConfig, 
    onSort, 
    onDeleteTransaction, 
    onUpdatePaymentMethod,
    customPaymentMethods,
    editingPayment,
    setEditingPayment
}) => {
    const getSortedTransactions = () => {
        let filteredTransactions = [...transactions];
        
        // Apply filters
        if (filters.type) {
            filteredTransactions = filteredTransactions.filter(t => {
                const transactionType = t.type || 'expense';
                return transactionType === filters.type;
            });
        }
        
        if (filters.envelope) {
            filteredTransactions = filteredTransactions.filter(t => {
                const envelopeName = t.envelope === 'INCOME' ? 'INCOME' : 
                                   t.envelope === 'TRANSFER' ? 'TRANSFER' : 
                                   t.envelope.replace('.', ' - ').toLowerCase();
                return envelopeName.includes(filters.envelope.toLowerCase());
            });
        }
        
        if (filters.paymentMethod) {
            filteredTransactions = filteredTransactions.filter(t => 
                (t.paymentMethod || '').toLowerCase().includes(filters.paymentMethod.toLowerCase())
            );
        }
        
        if (filters.description) {
            filteredTransactions = filteredTransactions.filter(t => 
                (t.description || '').toLowerCase().includes(filters.description.toLowerCase())
            );
        }
        
        if (filters.amountMin) {
            filteredTransactions = filteredTransactions.filter(t => t.amount >= parseFloat(filters.amountMin));
        }
        
        if (filters.amountMax) {
            filteredTransactions = filteredTransactions.filter(t => t.amount <= parseFloat(filters.amountMax));
        }
        
        if (filters.dateFrom) {
            filteredTransactions = filteredTransactions.filter(t => t.date >= filters.dateFrom);
        }
        
        if (filters.dateTo) {
            filteredTransactions = filteredTransactions.filter(t => t.date <= filters.dateTo);
        }
        
        // Apply sorting
        if (sortConfig.key) {
            filteredTransactions.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                if (sortConfig.key === 'amount') {
                    aValue = parseFloat(aValue);
                    bValue = parseFloat(bValue);
                } else if (sortConfig.key === 'date') {
                    aValue = new Date(aValue);
                    bValue = new Date(bValue);
                } else if (sortConfig.key === 'type') {
                    aValue = a.type || 'expense';
                    bValue = b.type || 'expense';
                } else if (sortConfig.key === 'envelope') {
                    aValue = aValue === 'INCOME' ? 'INCOME' : aValue === 'TRANSFER' ? 'TRANSFER' : aValue.replace('.', ' - ');
                    bValue = bValue === 'INCOME' ? 'INCOME' : bValue === 'TRANSFER' ? 'TRANSFER' : bValue.replace('.', ' - ');
                } else {
                    aValue = String(aValue || '').toLowerCase();
                    bValue = String(bValue || '').toLowerCase();
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        } else {
            filteredTransactions.reverse();
        }
        
        return filteredTransactions;
    };

    const getSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) {
            return '↕️';
        }
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    const clearFilters = () => {
        setFilters({
            type: '',
            envelope: '',
            paymentMethod: '',
            dateFrom: '',
            dateTo: '',
            description: '',
            amountMin: '',
            amountMax: ''
        });
    };

    const getUniqueEnvelopes = () => {
        const envelopes = new Set();
        transactions.forEach(t => {
            if (t.envelope === 'INCOME') envelopes.add('INCOME');
            else if (t.envelope === 'TRANSFER') envelopes.add('TRANSFER');
            else envelopes.add(t.envelope.replace('.', ' - '));
        });
        return Array.from(envelopes).sort();
    };

    const getUniquePaymentMethods = () => {
        const methods = new Set();
        transactions.forEach(t => {
            if (t.paymentMethod) methods.add(t.paymentMethod);
        });
        return Array.from(methods).sort();
    };

    return (
        <div className="card">
            <div className="card-header">
                <h3>📝 Transactions</h3>
            </div>
            <div className="card-content">
                {/* Transactions Summary */}
                <div className="transactions-summary">
                    <div className="summary-grid">
                        <div className="summary-card">
                            <div className="summary-value">{transactions.filter(t => t.type === 'income').length}</div>
                            <div className="summary-label">Income Entries</div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-value">{transactions.filter(t => !t.type || t.type === 'expense').length}</div>
                            <div className="summary-label">Expenses</div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-value">{transactions.filter(t => t.type && t.type.includes('transfer')).length / 2}</div>
                            <div className="summary-label">Transfers</div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-value">{transactions.length}</div>
                            <div className="summary-label">Total Transactions</div>
                        </div>
                    </div>
                </div>
                
                {/* Transaction Details */}
                <div className="transactions-details">
                    <h4>📋 Recent Transaction Details</h4>
                    
                    {/* Filter Controls */}
                    <div className="transaction-filters">
                        <div className="filter-row">
                            <select
                                value={filters.type}
                                onChange={(e) => setFilters({...filters, type: e.target.value})}
                                className="filter-select"
                            >
                                <option value="">All Types</option>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                                <option value="transfer-in">Transfer In</option>
                                <option value="transfer-out">Transfer Out</option>
                            </select>
                            
                            <select
                                value={filters.envelope}
                                onChange={(e) => setFilters({...filters, envelope: e.target.value})}
                                className="filter-select"
                            >
                                <option value="">All Envelopes</option>
                                {getUniqueEnvelopes().map(envelope => (
                                    <option key={envelope} value={envelope}>{envelope}</option>
                                ))}
                            </select>
                            
                            <select
                                value={filters.paymentMethod}
                                onChange={(e) => setFilters({...filters, paymentMethod: e.target.value})}
                                className="filter-select"
                            >
                                <option value="">All Payment Methods</option>
                                {getUniquePaymentMethods().map(method => (
                                    <option key={method} value={method}>{method}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="filter-row">
                            <input
                                type="text"
                                placeholder="Search description..."
                                value={filters.description}
                                onChange={(e) => setFilters({...filters, description: e.target.value})}
                                className="filter-input"
                            />
                            
                            <input
                                type="number"
                                placeholder="Min amount"
                                value={filters.amountMin}
                                onChange={(e) => setFilters({...filters, amountMin: e.target.value})}
                                className="filter-input"
                            />
                            
                            <input
                                type="number"
                                placeholder="Max amount"
                                value={filters.amountMax}
                                onChange={(e) => setFilters({...filters, amountMax: e.target.value})}
                                className="filter-input"
                            />
                        </div>
                        
                        <div className="filter-row">
                            <input
                                type="date"
                                placeholder="From date"
                                value={filters.dateFrom}
                                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                                className="filter-input"
                            />
                            
                            <input
                                type="date"
                                placeholder="To date"
                                value={filters.dateTo}
                                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                                className="filter-input"
                            />
                            
                            <button
                                onClick={clearFilters}
                                className="btn btn-secondary filter-clear-btn"
                            >
                                🗑️ Clear All
                            </button>
                        </div>
                    </div>

                    <div className="table-container">
                        <table className="envelope-table">
                            <thead>
                                <tr>
                                    <th onClick={() => onSort('date')} style={{cursor: 'pointer'}}>
                                        Date {getSortIcon('date')}
                                    </th>
                                    <th onClick={() => onSort('type')} style={{cursor: 'pointer'}}>
                                        Type {getSortIcon('type')}
                                    </th>
                                    <th onClick={() => onSort('description')} style={{cursor: 'pointer'}}>
                                        Description {getSortIcon('description')}
                                    </th>
                                    <th onClick={() => onSort('envelope')} style={{cursor: 'pointer'}}>
                                        Envelope {getSortIcon('envelope')}
                                    </th>
                                    <th onClick={() => onSort('amount')} style={{cursor: 'pointer'}}>
                                        Amount {getSortIcon('amount')}
                                    </th>
                                    <th onClick={() => onSort('paymentMethod')} style={{cursor: 'pointer'}}>
                                        Payment {getSortIcon('paymentMethod')}
                                    </th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {getSortedTransactions().map(transaction => {
                                    const transactionType = transaction.type === 'income' ? '💰' : 
                                                          transaction.type === 'transfer-in' ? '⬅️' :
                                                          transaction.type === 'transfer-out' ? '➡️' : '💸';
                                    const typeLabel = transaction.type === 'income' ? 'Income' : 
                                                    transaction.type === 'transfer-in' ? 'Transfer In' :
                                                    transaction.type === 'transfer-out' ? 'Transfer Out' : 'Expense';
                                    return (
                                        <tr key={transaction.id}>
                                            <td>{transaction.date}</td>
                                            <td>{transactionType} {typeLabel}</td>
                                            <td>{transaction.description}</td>
                                            <td style={{textTransform: 'uppercase'}}>
                                                {transaction.envelope === 'INCOME' ? 'INCOME' :
                                                 transaction.envelope === 'TRANSFER' ? 'TRANSFER' :
                                                 transaction.envelope.replace('.', ' - ')}
                                            </td>
                                            <td style={{
                                                color: transaction.type === 'income' || transaction.type === 'transfer-in' ? 'var(--success)' : 'var(--danger)',
                                                fontWeight: '600'
                                            }}>
                                                {transaction.type === 'income' || transaction.type === 'transfer-in' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                                            </td>
                                            <td 
                                                onDoubleClick={() => setEditingPayment({ id: transaction.id, method: transaction.paymentMethod || '' })}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {editingPayment.id === transaction.id ? (
                                                    <select
                                                        value={editingPayment.method}
                                                        onChange={(e) => setEditingPayment({ ...editingPayment, method: e.target.value })}
                                                        onBlur={() => onUpdatePaymentMethod(transaction.id, editingPayment.method)}
                                                        onKeyDown={(e) => e.key === 'Enter' && onUpdatePaymentMethod(transaction.id, editingPayment.method)}
                                                        autoFocus
                                                        style={{ width: '100%' }}
                                                    >
                                                        {customPaymentMethods.sort((a, b) => a.localeCompare(b)).map(method => (
                                                            <option key={method} value={method}>{method}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    transaction.paymentMethod || 'Unknown'
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => onDeleteTransaction(transaction.id, transaction.description)}
                                                    title="Delete transaction"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {transactions.length === 0 && (
                                    <tr>
                                        <td colSpan="7" style={{textAlign: 'center', color: 'var(--gray-600)'}}>No transactions yet</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Mobile Card View */}
                        <div className="mobile-card-view">
                            {getSortedTransactions().map(transaction => {
                                const transactionType = transaction.type === 'income' ? '💰' : 
                                                      transaction.type === 'transfer-in' ? '⬅️' :
                                                      transaction.type === 'transfer-out' ? '➡️' : '💸';
                                const typeLabel = transaction.type === 'income' ? 'Income' : 
                                                transaction.type === 'transfer-in' ? 'Transfer In' :
                                                transaction.type === 'transfer-out' ? 'Transfer Out' : 'Expense';
                                return (
                                    <div key={transaction.id} className="mobile-transaction-card">
                                        <div className="mobile-card-header">
                                            <span>{transactionType} {transaction.description}</span>
                                            <button
                                                className="btn-delete"
                                                onClick={() => onDeleteTransaction(transaction.id, transaction.description)}
                                                title="Delete transaction"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                        <div className="mobile-card-content">
                                            <div className="mobile-card-field">
                                                <span className="mobile-card-label">Date</span>
                                                <span className="mobile-card-value">{transaction.date}</span>
                                            </div>
                                            <div className="mobile-card-field">
                                                <span className="mobile-card-label">Type</span>
                                                <span className="mobile-card-value">{typeLabel}</span>
                                            </div>
                                            <div className="mobile-card-field">
                                                <span className="mobile-card-label">Amount</span>
                                                <span className="mobile-card-value" style={{
                                                    color: transaction.type === 'income' || transaction.type === 'transfer-in' ? 'var(--success)' : 'var(--danger)',
                                                    fontWeight: '600'
                                                }}>
                                                    {transaction.type === 'income' || transaction.type === 'transfer-in' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="mobile-card-field">
                                                <span className="mobile-card-label">Envelope</span>
                                                <span className="mobile-card-value" style={{textTransform: 'uppercase'}}>
                                                    {transaction.envelope === 'INCOME' ? 'INCOME' :
                                                     transaction.envelope === 'TRANSFER' ? 'TRANSFER' :
                                                     transaction.envelope.replace('.', ' - ')}
                                                </span>
                                            </div>
                                            <div className="mobile-card-field">
                                                <span className="mobile-card-label">Payment</span>
                                                <span className="mobile-card-value">{transaction.paymentMethod || 'Unknown'}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {transactions.length === 0 && (
                                <div style={{textAlign: 'center', color: 'var(--gray-600)', padding: '20px'}}>No transactions yet</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionManager;