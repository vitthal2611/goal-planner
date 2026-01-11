import React, { memo, useMemo } from 'react';

const BudgetSummary = memo(({ income, totalBudgeted, totalSpent, paymentBalances, onTransferClick }) => {
    const remaining = useMemo(() => income - totalSpent, [income, totalSpent]);
    const hasPaymentBalances = useMemo(() => Object.keys(paymentBalances).length > 0, [paymentBalances]);
    const spentPercentage = useMemo(() => income > 0 ? (totalSpent / income) * 100 : 0, [totalSpent, income]);
    const budgetedPercentage = useMemo(() => income > 0 ? (totalBudgeted / income) * 100 : 0, [totalBudgeted, income]);
    
    return (
        <>
            <div className="summary-grid">
                <div className="summary-card">
                    <div className="summary-value">₹{income.toLocaleString()}</div>
                    <div className="summary-label">Monthly Income</div>
                    <div style={{
                        width: '100%',
                        height: '4px',
                        background: 'var(--gray-200)',
                        borderRadius: '2px',
                        marginTop: '8px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(90deg, var(--success), var(--primary))',
                            borderRadius: '2px'
                        }} />
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-value">₹{totalBudgeted.toLocaleString()}</div>
                    <div className="summary-label">Total Budgeted</div>
                    <div style={{
                        width: '100%',
                        height: '4px',
                        background: 'var(--gray-200)',
                        borderRadius: '2px',
                        marginTop: '8px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${Math.min(budgetedPercentage, 100)}%`,
                            height: '100%',
                            background: budgetedPercentage > 100 ? 'var(--danger)' : 'var(--info)',
                            borderRadius: '2px',
                            transition: 'width 0.3s ease'
                        }} />
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '4px' }}>
                        {budgetedPercentage.toFixed(1)}% of income
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-value" style={{
                        color: spentPercentage > 90 ? 'var(--danger)' : spentPercentage > 70 ? 'var(--warning)' : 'var(--success)'
                    }}>₹{totalSpent.toLocaleString()}</div>
                    <div className="summary-label">Total Spent</div>
                    <div style={{
                        width: '100%',
                        height: '4px',
                        background: 'var(--gray-200)',
                        borderRadius: '2px',
                        marginTop: '8px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${Math.min(spentPercentage, 100)}%`,
                            height: '100%',
                            background: spentPercentage > 90 ? 'var(--danger)' : spentPercentage > 70 ? 'var(--warning)' : 'var(--success)',
                            borderRadius: '2px',
                            transition: 'width 0.3s ease'
                        }} />
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '4px' }}>
                        {spentPercentage.toFixed(1)}% of income
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-value" style={{
                        color: remaining < 0 ? 'var(--danger)' : 'var(--success)'
                    }}>₹{remaining.toLocaleString()}</div>
                    <div className="summary-label">Remaining</div>
                    <div style={{
                        width: '100%',
                        height: '4px',
                        background: 'var(--gray-200)',
                        borderRadius: '2px',
                        marginTop: '8px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${Math.max(0, Math.min((remaining / income) * 100, 100))}%`,
                            height: '100%',
                            background: remaining < 0 ? 'var(--danger)' : 'var(--success)',
                            borderRadius: '2px',
                            transition: 'width 0.3s ease'
                        }} />
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '4px' }}>
                        {remaining < 0 ? 'Over budget!' : 'Available'}
                    </div>
                </div>
            </div>

            {/* Payment Method Overview */}
            {hasPaymentBalances && (
                <div className="card">
                    <div className="card-header">
                        <h3>💳 Payment Method Overview</h3>
                        <button 
                            className="btn btn-primary touch-feedback"
                            onClick={onTransferClick}
                        >
                            🔄 Transfer
                        </button>
                    </div>
                    <div className="card-content">
                        <div className="summary-grid">
                            {Object.entries(paymentBalances).map(([method, amount]) => (
                                <div key={method} className="summary-card">
                                    <div className="summary-value">₹{amount.toLocaleString()}</div>
                                    <div className="summary-label">{method}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
});

BudgetSummary.displayName = 'BudgetSummary';

export default BudgetSummary;