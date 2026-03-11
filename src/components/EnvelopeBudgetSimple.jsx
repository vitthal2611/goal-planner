import React, { useState, useEffect } from 'react';
import { useBudgetActions } from '../hooks/useBudgetActions';
import { useBudget } from '../contexts/BudgetContext.jsx';
import QuickAdd from './QuickAdd';
import './EnvelopeBudget.css';
import './MobileEnhancements.css';

const EnvelopeBudget = () => {
    const { state } = useBudget();
    const { loadData, addExpense, addIncome, allocateBudget } = useBudgetActions();
    const [activeView, setActiveView] = useState('quickadd');

    const { currentPeriod, currentData, dataLoaded, notification } = state;
    const { income, envelopes, transactions } = currentData;

    useEffect(() => {
        loadData();
    }, []);

    const getPeriodDateRange = () => {
        const [year, month] = (currentPeriod || '2024-01').split('-').map(Number);
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
        return { min: startDate, max: endDate };
    };

    const dateRange = getPeriodDateRange();

    return (
        <div className="envelope-budget">
            <div className="header">
                <h1>💰 Budget Planner - Google Sheets</h1>
                <div className="header-controls">
                    <span>Period: {currentPeriod}</span>
                </div>
            </div>

            <div className="tab-navigation">
                <button
                    className={`tab-btn ${activeView === 'quickadd' ? 'active' : ''}`}
                    onClick={() => setActiveView('quickadd')}
                >
                    ⚡ QuickAdd
                </button>
            </div>

            {notification.message && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            {!dataLoaded ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="loading-spinner"></div>
                    <p>Loading data...</p>
                </div>
            ) : (
                <QuickAdd
                    envelopes={envelopes}
                    customPaymentMethods={['HDFC', 'SBI Credit Card']}
                    dateRange={dateRange}
                    onAddTransaction={addExpense}
                    onAddIncome={addIncome}
                    onAllocateBudget={allocateBudget}
                    transactions={transactions}
                    income={income}
                />
            )}
        </div>
    );
};

export default EnvelopeBudget;