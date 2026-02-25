import React from 'react';

const BudgetAllocation = ({ 
    income,
    envelopes,
    incomeTransaction,
    setIncomeTransaction,
    customIncomePayment,
    setCustomIncomePayment,
    customPaymentMethods,
    dateRange,
    insights,
    blockedTransactions,
    onAddIncome,
    onExportData,
    onBackup,
    onRollover
}) => {
    return (
        <>
            {/* Budget Controls */}
            <div className="card">
                <div className="card-header">
                    <h3>💼 Budget Controls</h3>
                </div>
                <div className="card-content">
                    <div className="control-group">
                        <label>Add Monthly Income</label>
                        <div className="income-form">
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="₹ Income Amount"
                                value={incomeTransaction.amount}
                                onChange={(e) => setIncomeTransaction({...incomeTransaction, amount: e.target.value})}
                                className="income-input"
                                inputMode="decimal"
                                autoComplete="off"
                                aria-label="Income amount"
                            />
                            <input
                                type="date"
                                value={incomeTransaction.date}
                                min={dateRange.min}
                                max={dateRange.max}
                                onChange={(e) => setIncomeTransaction({...incomeTransaction, date: e.target.value})}
                                className="income-input"
                            />
                            <input
                                type="text"
                                placeholder="Description (e.g., Salary, Bonus)"
                                value={incomeTransaction.description}
                                onChange={(e) => setIncomeTransaction({...incomeTransaction, description: e.target.value})}
                                className="income-input"
                                autoComplete="off"
                                aria-label="Income description"
                            />
                            <select
                                value={incomeTransaction.paymentMethod}
                                onChange={(e) => {
                                    setIncomeTransaction({...incomeTransaction, paymentMethod: e.target.value});
                                    if (e.target.value !== 'Custom') setCustomIncomePayment('');
                                }}
                                className="income-input"
                            >
                                <option value="">Select Payment Method</option>
                                {customPaymentMethods.sort((a, b) => a.localeCompare(b)).map(method => (
                                    <option key={method} value={method}>{method}</option>
                                ))}
                                <option value="Custom">➕ Add New</option>
                            </select>
                            {incomeTransaction.paymentMethod === 'Custom' && (
                                <input
                                    type="text"
                                    placeholder="Enter payment method"
                                    value={customIncomePayment}
                                    onChange={(e) => setCustomIncomePayment(e.target.value)}
                                    className="income-input"
                                />
                            )}
                            <button className="btn btn-success" onClick={onAddIncome}>
                                ➕ Add Income
                            </button>
                        </div>
                    </div>
                    <div className="budget-actions">
                        <button className="btn btn-secondary" onClick={onExportData}>
                            📤 Export
                        </button>
                        <button className="btn btn-warning" onClick={onBackup}>
                            💾 Backup All Data
                        </button>
                        <button className="btn btn-primary" onClick={onRollover}>
                            🔄 Rollover Unused Funds
                        </button>
                    </div>
                </div>
            </div>

            {/* Monthly Insights */}
            <div className="card">
                <div className="card-header">
                    <h3>📈 Monthly Insights</h3>
                </div>
                <div className="card-content">
                    <div className="insights-grid">
                        <div className="insight-item healthy">
                            <div className="insight-label">✅ Healthy Envelopes</div>
                            <div className="insight-value">
                                {insights.healthy.length > 0 ? insights.healthy.join(', ') : 'None'}
                            </div>
                        </div>
                        <div className="insight-item warning">
                            <div className="insight-label">⚠️ Warning Envelopes</div>
                            <div className="insight-value">
                                {insights.warnings.length > 0 ? insights.warnings.join(', ') : 'None'}
                            </div>
                        </div>
                        <div className="insight-item blocked">
                            <div className="insight-label">🚫 Blocked Envelopes</div>
                            <div className="insight-value">
                                {insights.blocked.length > 0 ? insights.blocked.join(', ') : 'None'}
                            </div>
                        </div>
                        <div className="insight-item blocked">
                            <div className="insight-label">❌ Blocked Transactions</div>
                            <div className="insight-value">{blockedTransactions?.length || 0} transactions</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BudgetAllocation;