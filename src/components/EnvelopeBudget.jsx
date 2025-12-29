import React, { useState, useEffect, useCallback } from 'react';
import { saveToLocalStorage, loadFromLocalStorage, getDefaultEnvelopes } from '../utils/localStorage';
import { addGlobalEnvelope, removeGlobalEnvelope } from '../utils/globalEnvelopes';
import { auth } from '../config/firebase';
import './EnvelopeBudget.css';

const EnvelopeBudget = () => {
    // Generate budget period (25th to 24th)
    // Generate list of budget periods (last 6 months + next 6 months)
    const generatePeriodOptions = () => {
        const periods = [];
        const today = new Date();

        for (let i = -6; i <= 6; i++) {
            const startDate = new Date(today.getFullYear(), today.getMonth() + i, 25);
            const startYear = startDate.getFullYear();
            const startMonth = startDate.getMonth() + 1;

            const endDate = new Date(startYear, startMonth, 24); // Next month, 24th
            const endYear = endDate.getFullYear();
            const endMonth = endDate.getMonth() + 1;

            const periodKey = `${startYear}-${String(startMonth).padStart(2, '0')}-25_to_${endYear}-${String(endMonth).padStart(2, '0')}-24`;
            const periodLabel = `${startYear}/${String(startMonth).padStart(2, '0')}/25 to ${endYear}/${String(endMonth).padStart(2, '0')}/24`;

            periods.push({ key: periodKey, label: periodLabel });
        }

        return periods;
    };

    const getCurrentBudgetPeriod = () => {
        const today = new Date();
        const currentDay = today.getDate();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        if (currentDay >= 25) {
            // Current period: 25th of this month to 24th of next month
            const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
            const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
            return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-25_to_${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-24`;
        } else {
            // Current period: 25th of last month to 24th of this month
            const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const lastYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            return `${lastYear}-${String(lastMonth + 1).padStart(2, '0')}-25_to_${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-24`;
        }
    };

    const [currentPeriod, setCurrentPeriod] = useState(getCurrentBudgetPeriod());
    const [monthlyData, setMonthlyData] = useState({});
    const [newTransaction, setNewTransaction] = useState({ envelope: '', amount: '', description: '', paymentMethod: 'UPI', date: new Date().toISOString().split('T')[0] });
    const [customPaymentMethod, setCustomPaymentMethod] = useState('');
    const [incomeTransaction, setIncomeTransaction] = useState({ amount: '', description: '', paymentMethod: 'UPI', date: new Date().toISOString().split('T')[0] });
    const [customIncomePayment, setCustomIncomePayment] = useState('');
    const [newEnvelope, setNewEnvelope] = useState({ category: '', name: '' });
    const [notification, setNotification] = useState({ type: '', message: '' });
    const [deleteConfirm, setDeleteConfirm] = useState({ type: '', id: '', name: '' });
    const [activeView, setActiveView] = useState('daily'); // 'daily', 'spending', 'budget'
    // Get date range for current budget period
    const getPeriodDateRange = () => {
        const [startStr, endStr] = currentPeriod.split('_to_');
        const startDate = startStr; // YYYY-MM-DD format
        const endDate = endStr; // YYYY-MM-DD format
        return { min: startDate, max: endDate };
    };

    const dateRange = getPeriodDateRange();
    const [budgetInputs, setBudgetInputs] = useState({});
    const [dataLoaded, setDataLoaded] = useState(false);

    // Get current period's data
    const getCurrentPeriodData = async () => {
        const defaultEnvelopes = await getDefaultEnvelopes();
        const periodData = monthlyData[currentPeriod];
        
        if (!periodData) {
            return {
                income: 0,
                envelopes: defaultEnvelopes,
                transactions: [],
                blockedTransactions: []
            };
        }
        
        // Merge default envelope structure with saved allocations
        const mergedEnvelopes = {};
        Object.keys(defaultEnvelopes).forEach(category => {
            mergedEnvelopes[category] = {};
            Object.keys(defaultEnvelopes[category]).forEach(name => {
                mergedEnvelopes[category][name] = {
                    budgeted: periodData.envelopes?.[category]?.[name]?.budgeted || 0,
                    spent: periodData.envelopes?.[category]?.[name]?.spent || 0,
                    rollover: periodData.envelopes?.[category]?.[name]?.rollover || 0
                };
            });
        });
        
        return {
            income: periodData.income || 0,
            envelopes: mergedEnvelopes,
            transactions: periodData.transactions || [],
            blockedTransactions: periodData.blockedTransactions || []
        };
    };

    const [currentData, setCurrentData] = useState({ income: 0, envelopes: {}, transactions: [], blockedTransactions: [] });
    const { income, envelopes, transactions, blockedTransactions } = currentData;

    // Load current period data
    useEffect(() => {
        const loadCurrentData = async () => {
            if (dataLoaded) {
                const data = await getCurrentPeriodData();
                setCurrentData(data);
            }
        };
        loadCurrentData();
    }, [monthlyData, currentPeriod, dataLoaded]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const savedData = await loadFromLocalStorage();
                console.log('Loaded data:', savedData);
                if (savedData && savedData.monthlyData && Object.keys(savedData.monthlyData).length > 0) {
                    setMonthlyData(savedData.monthlyData);
                    if (savedData.currentPeriod) {
                        setCurrentPeriod(savedData.currentPeriod);
                    }
                } else {
                    console.log('No saved data found, using defaults');
                }
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };
        
        // Wait for auth state and load data
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                console.log('User authenticated, loading data for:', user.uid);
                setDataLoaded(false);
                await loadData();
                setDataLoaded(true);
            } else {
                console.log('User logged out');
                setDataLoaded(false);
            }
        });
        
        return () => unsubscribe();
    }, []);

    const saveData = useCallback(async () => {
        try {
            // Only save if data is loaded and we have actual data
            if (dataLoaded && Object.keys(monthlyData).length > 0) {
                console.log('Saving data:', { monthlyData, currentPeriod });
                await saveToLocalStorage({
                    monthlyData,
                    currentPeriod
                });
            } else {
                console.log('Skipping save - data not loaded or empty');
            }
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }, [monthlyData, currentPeriod, dataLoaded]);

    useEffect(() => {
        saveData();
    }, [saveData]);

    const updatePeriodData = async (updates) => {
        const currentPeriodData = await getCurrentPeriodData();
        setMonthlyData(prev => ({
            ...prev,
            [currentPeriod]: {
                ...currentPeriodData,
                ...updates
            }
        }));
    };

    const addIncome = async () => {
        const { amount, description } = incomeTransaction;

        if (!amount || parseFloat(amount) <= 0) {
            showNotification('error', 'Enter valid income amount');
            return;
        }

        const incomeAmount = parseFloat(amount);

        const transactionRecord = {
            id: Date.now() + Math.random(),
            date: incomeTransaction.date,
            envelope: 'INCOME',
            amount: incomeAmount,
            description: description || 'Monthly Income',
            paymentMethod: incomeTransaction.paymentMethod === 'Custom' ? customIncomePayment : incomeTransaction.paymentMethod,
            type: 'income'
        };

        await updatePeriodData({
            income: income + incomeAmount,
            transactions: [...transactions, transactionRecord]
        });

        setIncomeTransaction({ amount: '', description: '', paymentMethod: incomeTransaction.paymentMethod === 'Custom' ? 'UPI' : incomeTransaction.paymentMethod, date: new Date().toISOString().split('T')[0] });
        setCustomIncomePayment('');
        showNotification('success', '✓ Income Added!');
    };

    const addEnvelope = async () => {
        const { category, name } = newEnvelope;

        if (!category || !name.trim()) {
            showNotification('error', 'Enter category and envelope name');
            return;
        }

        const defaultEnvelopes = await getDefaultEnvelopes();
        if (defaultEnvelopes[category] && defaultEnvelopes[category][name.toLowerCase()]) {
            showNotification('error', 'Envelope already exists');
            return;
        }

        // Add to global structure (affects all periods)
        await addGlobalEnvelope(category, name.toLowerCase());
        
        // Refresh current data
        const updatedData = await getCurrentPeriodData();
        setCurrentData(updatedData);
        
        setNewEnvelope({ category: '', name: '' });
        showNotification('success', `✓ ${name} envelope added to all periods!`);
    };

    const setIncome = (value) => {
        updatePeriodData({ income: value });
    };

    const setEnvelopes = (value) => {
        updatePeriodData({ envelopes: typeof value === 'function' ? value(envelopes) : value });
    };

    const setTransactions = (value) => {
        updatePeriodData({ transactions: typeof value === 'function' ? value(transactions) : value });
    };

    const setBlockedTransactions = (value) => {
        updatePeriodData({ blockedTransactions: typeof value === 'function' ? value(blockedTransactions) : value });
    };

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    };

    const getStatus = (envelope) => {
        const available = envelope.budgeted + envelope.rollover - envelope.spent;
        if (available <= 0) return 'blocked';
        if (available < envelope.budgeted * 0.2) return 'warning';
        return 'healthy';
    };

    const addTransaction = () => {
        const { envelope, amount, description } = newTransaction;

        if (!amount || parseFloat(amount) <= 0) {
            showNotification('error', 'Enter valid amount');
            return;
        }

        if (!envelope) {
            showNotification('error', 'Select envelope');
            return;
        }

        const [category, name] = envelope.split('.');
        const env = envelopes[category]?.[name];

        if (!env) {
            showNotification('error', 'Invalid envelope');
            return;
        }

        const available = env.budgeted + env.rollover - env.spent;
        const expenseAmount = parseFloat(amount);

        if (available < expenseAmount) {
            showNotification('error', 'Insufficient funds!');
            return;
        }

        const updatedEnvelopes = {
            ...envelopes,
            [category]: {
                ...envelopes[category],
                [name]: {
                    ...envelopes[category][name],
                    spent: envelopes[category][name].spent + expenseAmount
                }
            }
        };

        const transactionRecord = {
            id: Date.now() + Math.random(),
            date: newTransaction.date,
            envelope,
            amount: expenseAmount,
            description: description || 'Quick expense',
            paymentMethod: newTransaction.paymentMethod === 'Custom' ? customPaymentMethod : newTransaction.paymentMethod
        };

        updatePeriodData({
            envelopes: updatedEnvelopes,
            transactions: [...transactions, transactionRecord]
        });

        setNewTransaction({
            envelope: newTransaction.envelope,
            amount: '',
            description: '',
            paymentMethod: newTransaction.paymentMethod === 'Custom' ? 'UPI' : newTransaction.paymentMethod,
            date: new Date().toISOString().split('T')[0]
        });
        setCustomPaymentMethod('');

        showNotification('success', '✓ Added!');
    };

    const allocateBudget = (category, name, amount) => {
        const budgetAmount = parseFloat(amount) || 0;

        if (budgetAmount > 0 && income <= 0) {
            showNotification('error', 'Add income first before allocating budget');
            return;
        }

        const totalAllocated = Object.values(envelopes).reduce((sum, cat) =>
            sum + Object.values(cat).reduce((catSum, env) => catSum + env.budgeted, 0), 0);

        const currentEnvelopeBudget = envelopes[category][name].budgeted;
        const newTotalAllocated = totalAllocated - currentEnvelopeBudget + budgetAmount;

        if (newTotalAllocated > income) {
            showNotification('error', `Cannot allocate ₹${budgetAmount.toLocaleString()}. Only ₹${(income - totalAllocated + currentEnvelopeBudget).toLocaleString()} available`);
            return;
        }

        const updatedEnvelopes = {
            ...envelopes,
            [category]: {
                ...envelopes[category],
                [name]: {
                    ...envelopes[category][name],
                    budgeted: budgetAmount
                }
            }
        };
        updatePeriodData({ envelopes: updatedEnvelopes });
    };

    const deleteTransaction = async (id) => {
        const transaction = transactions.find(t => t.id === id);
        if (!transaction) return;
        
        // If it's an income transaction, subtract from total income
        if (transaction.type === 'income') {
            await updatePeriodData({
                income: income - transaction.amount,
                transactions: transactions.filter(t => t.id !== id)
            });
        } else {
            // Regular expense transaction - add back to envelope
            const [category, name] = transaction.envelope.split('.');
            if (envelopes[category]?.[name]) {
                const updatedEnvelopes = {
                    ...envelopes,
                    [category]: {
                        ...envelopes[category],
                        [name]: {
                            ...envelopes[category][name],
                            spent: envelopes[category][name].spent - transaction.amount
                        }
                    }
                };
                
                await updatePeriodData({
                    envelopes: updatedEnvelopes,
                    transactions: transactions.filter(t => t.id !== id)
                });
            } else {
                // Just remove transaction if envelope doesn't exist
                await updatePeriodData({
                    transactions: transactions.filter(t => t.id !== id)
                });
            }
        }
        
        showNotification('success', 'Transaction deleted');
    };

    const deleteEnvelope = async (category, name) => {
        // Remove from global structure (affects all periods)
        await removeGlobalEnvelope(category, name);
        
        // Update current period
        setEnvelopes(prev => {
            const updated = { ...prev };
            delete updated[category][name];
            return updated;
        });
        setTransactions(prev => prev.filter(t => t.envelope !== `${category}.${name}`));
        
        // Refresh current data
        const updatedData = await getCurrentPeriodData();
        setCurrentData(updatedData);
        
        showNotification('success', 'Envelope deleted from all periods');
    };

    const confirmDelete = () => {
        if (deleteConfirm.type === 'transaction') {
            deleteTransaction(deleteConfirm.id);
        } else if (deleteConfirm.type === 'envelope') {
            const [category, name] = deleteConfirm.id.split('.');
            deleteEnvelope(category, name);
        }
        setDeleteConfirm({ type: '', id: '', name: '' });
    };

    const getNextBudgetPeriod = (currentPeriodStr) => {
        // Extract start date from current period
        const startDateStr = currentPeriodStr.split('_to_')[0];
        const [year, month, day] = startDateStr.split('-').map(Number);

        // Calculate next period start (add 1 month)
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? year + 1 : year;

        // Calculate next period end (add 1 month to end date)
        const endMonth = nextMonth === 12 ? 1 : nextMonth + 1;
        const endYear = nextMonth === 12 ? nextYear + 1 : nextYear;

        return `${nextYear}-${String(nextMonth).padStart(2, '0')}-25_to_${endYear}-${String(endMonth).padStart(2, '0')}-24`;
    };
    const rolloverToNextPeriod = () => {
        // Calculate next period
        const nextPeriod = getNextBudgetPeriod(currentPeriod);

        // Rollover unused funds to next period
        const rolledOverEnvelopes = { ...envelopes };
        Object.keys(rolledOverEnvelopes).forEach(category => {
            Object.keys(rolledOverEnvelopes[category]).forEach(name => {
                const env = rolledOverEnvelopes[category][name];
                const unused = env.budgeted + env.rollover - env.spent;
                rolledOverEnvelopes[category][name] = {
                    budgeted: 0,
                    spent: 0,
                    rollover: Math.max(0, unused)
                };
            });
        });

        // Set data for next period
        setMonthlyData(prev => ({
            ...prev,
            [nextPeriod]: {
                income: 0,
                envelopes: rolledOverEnvelopes,
                transactions: [],
                blockedTransactions: []
            }
        }));

        // Switch to next period
        setCurrentPeriod(nextPeriod);
        showNotification('success', 'Started next period with rollover balances');
    };

    const exportData = () => {
        const data = { monthlyData, currentPeriod };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `budget-${currentPeriod}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showNotification('success', 'Data exported successfully');
    };

    const importExpenses = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!confirm('This will add expenses from CSV. Continue?')) {
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const csv = e.target.result;
                const lines = csv.split('\n');
                const headers = lines[0].split(',').map(h => h.trim());
                
                let successCount = 0;
                let errorCount = 0;
                
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;
                    
                    const values = line.split(',').map(v => v.trim());
                    const expense = {
                        date: values[0],
                        envelope: values[1],
                        amount: parseFloat(values[2]),
                        description: values[3] || 'Bulk import',
                        paymentMethod: values[4] || 'UPI'
                    };
                    
                    // Validate expense
                    if (!expense.date || !expense.envelope || !expense.amount) {
                        errorCount++;
                        continue;
                    }
                    
                    const [category, name] = expense.envelope.split('.');
                    const env = envelopes[category]?.[name];
                    
                    if (!env) {
                        errorCount++;
                        continue;
                    }
                    
                    const available = env.budgeted + env.rollover - env.spent;
                    if (available < expense.amount) {
                        errorCount++;
                        continue;
                    }
                    
                    // Add expense
                    const updatedEnvelopes = {
                        ...envelopes,
                        [category]: {
                            ...envelopes[category],
                            [name]: {
                                ...envelopes[category][name],
                                spent: envelopes[category][name].spent + expense.amount
                            }
                        }
                    };
                    
                    const transactionRecord = {
                        id: Date.now() + Math.random() + i,
                        date: expense.date,
                        envelope: expense.envelope,
                        amount: expense.amount,
                        description: expense.description,
                        paymentMethod: expense.paymentMethod
                    };
                    
                    await updatePeriodData({
                        envelopes: updatedEnvelopes,
                        transactions: [...transactions, transactionRecord]
                    });
                    
                    successCount++;
                }
                
                showNotification('success', `✓ Imported ${successCount} expenses. ${errorCount} errors.`);
            } catch (error) {
                showNotification('error', 'Invalid CSV format');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const getInsights = () => {
        const healthy = [];
        const blocked = [];
        const warnings = [];

        Object.keys(envelopes).forEach(category => {
            Object.keys(envelopes[category]).forEach(name => {
                const env = envelopes[category][name];
                const status = getStatus(env);
                if (status === 'healthy') healthy.push(name);
                else if (status === 'blocked') blocked.push(name);
                else warnings.push(name);
            });
        });

        return { healthy, blocked, warnings };
    };

    const insights = getInsights();
    const totalBudgeted = Object.values(envelopes).reduce((sum, category) =>
        sum + Object.values(category).reduce((catSum, env) => catSum + env.budgeted, 0), 0);
    const totalSpent = Object.values(envelopes).reduce((sum, category) =>
        sum + Object.values(category).reduce((catSum, env) => catSum + env.spent, 0), 0);

    return (
        <div className="envelope-budget">
            <div className="header">
                <h1>💰 Envelope Budget Tracker</h1>
                <div className="header-controls">
                    <div className="control-group">
                        <label>Budget Period (25th to 24th)</label>
                        <select
                            value={currentPeriod}
                            onChange={(e) => setCurrentPeriod(e.target.value)}
                            className="period-selector"
                        >
                            {generatePeriodOptions().map(period => (
                                <option key={period.key} value={period.key}>
                                    {period.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="tab-navigation">
                <button
                    className={`tab-btn ${activeView === 'daily' ? 'active' : ''}`}
                    onClick={() => setActiveView('daily')}
                >
                    ⚡ Daily
                </button>
                <button
                    className={`tab-btn ${activeView === 'spending' ? 'active' : ''}`}
                    onClick={() => setActiveView('spending')}
                >
                    💳 Spending
                </button>
                <button
                    className={`tab-btn ${activeView === 'budget' ? 'active' : ''}`}
                    onClick={() => setActiveView('budget')}
                >
                    📊 Budget
                </button>
            </div>

            {notification.message && (
                <div className={notification.type}>
                    {notification.message}
                </div>
            )}

            <div className="summary-grid">
                <div className="summary-card">
                    <div className="summary-value">₹{income.toLocaleString()}</div>
                    <div className="summary-label">Monthly Income</div>
                </div>
                <div className="summary-card">
                    <div className="summary-value">₹{totalBudgeted.toLocaleString()}</div>
                    <div className="summary-label">Total Budgeted</div>
                </div>
                <div className="summary-card">
                    <div className="summary-value">₹{totalSpent.toLocaleString()}</div>
                    <div className="summary-label">Total Spent</div>
                </div>
                <div className="summary-card">
                    <div className="summary-value">₹{(income - totalSpent).toLocaleString()}</div>
                    <div className="summary-label">Remaining</div>
                </div>
            </div>

            {/* Conditional Views */}
            {activeView === 'daily' ? (
                <>
                    {/* Quick Expense Interface */}
                    <div className="card">
                        <div className="card-header">
                            <h3>⚡ Quick Expense</h3>
                        </div>
                        <div className="card-content">
                            <div className="quick-expense-form">
                                <div className="quick-form-row">
                                    <select
                                        value={newTransaction.envelope}
                                        onChange={(e) => setNewTransaction({...newTransaction, envelope: e.target.value})}
                                        className="quick-envelope"
                                    >
                                        <option value="">Select Envelope</option>
                                        {Object.keys(envelopes).map(category =>
                                            Object.keys(envelopes[category]).map(name => {
                                                const env = envelopes[category][name];
                                                const balance = env.budgeted + env.rollover - env.spent;
                                                return (
                                                    <option key={`${category}.${name}`} value={`${category}.${name}`}>
                                                        {name.toUpperCase()} - ₹{balance.toLocaleString()}
                                                    </option>
                                                );
                                            })
                                        )}
                                    </select>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="₹ Amount"
                                        value={newTransaction.amount}
                                        onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                                        className="quick-amount"
                                    />
                                    <input
                                        type="date"
                                        value={newTransaction.date}
                                        min={dateRange.min}
                                        max={dateRange.max}
                                        onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                                        className="quick-date"
                                    />
                                </div>
                                <div className="quick-form-row">
                                    <input
                                        type="text"
                                        placeholder="Description (optional)"
                                        value={newTransaction.description}
                                        onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                                        className="quick-description"
                                    />
                                    <select
                                        value={newTransaction.paymentMethod}
                                        onChange={(e) => {
                                            setNewTransaction({...newTransaction, paymentMethod: e.target.value});
                                            if (e.target.value !== 'Custom') setCustomPaymentMethod('');
                                        }}
                                        className="quick-payment"
                                    >
                                        <option value="UPI">💳 UPI</option>
                                        <option value="Credit Card">💳 Credit Card</option>
                                        <option value="Debit Card">💳 Debit Card</option>
                                        <option value="Cash">💵 Cash</option>
                                        <option value="Net Banking">🏦 Net Banking</option>
                                        <option value="Custom">➕ Add Custom</option>
                                    </select>
                                    {newTransaction.paymentMethod === 'Custom' && (
                                        <input
                                            type="text"
                                            placeholder="Enter payment method"
                                            value={customPaymentMethod}
                                            onChange={(e) => setCustomPaymentMethod(e.target.value)}
                                            className="quick-payment"
                                        />
                                    )}
                                </div>
                                <div className="quick-form-row">
                                    <button className="btn btn-success quick-add-btn" onClick={addTransaction}>
                                        ➕ Add Expense
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Today's Transactions */}
                    <div className="card">
                        <div className="card-header">
                            <h3>📅 Today's Expenses</h3>
                        </div>
                        <div className="table-container">
                            <table className="envelope-table">
                                <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>Envelope</th>
                                    <th>Amount</th>
                                    <th>Payment</th>
                                    <th>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {transactions.filter(t => t.date === newTransaction.date).reverse().map(transaction => (
                                    <tr key={transaction.id}>
                                        <td>{transaction.description}</td>
                                        <td style={{textTransform: 'uppercase'}}>
                                            {transaction.envelope.replace('.', ' - ')}
                                        </td>
                                        <td>₹{transaction.amount.toLocaleString()}</td>
                                        <td>{transaction.paymentMethod || 'UPI'}</td>
                                        <td>
                                            <button
                                                className="btn-delete"
                                                onClick={() => setDeleteConfirm({
                                                    type: 'transaction',
                                                    id: transaction.id,
                                                    name: transaction.description
                                                })}
                                                title="Delete transaction"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {transactions.filter(t => t.date === newTransaction.date).length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{textAlign: 'center', color: 'var(--gray-600)'}}>No expenses on selected date</td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : activeView === 'spending' ? (
                <>
                    {/* Envelope Status */}
                    <div className="card">
                        <div className="card-header">
                            <h3>📊 Envelope Status</h3>
                        </div>
                        <div className="table-container">
                            <table className="envelope-table">
                                <thead>
                                <tr>
                                    <th>Envelope</th>
                                    <th>Category</th>
                                    <th>Budgeted</th>
                                    <th>Spent</th>
                                    <th>Remaining</th>
                                    <th>Rollover</th>
                                    <th>Status</th>
                                </tr>
                                </thead>
                                <tbody>
                                {Object.keys(envelopes).map(category =>
                                        Object.keys(envelopes[category]).map(name => {
                                            const env = envelopes[category][name];
                                            const remaining = env.budgeted + env.rollover - env.spent;
                                            const status = getStatus(env);
                                            return (
                                                <tr key={`${category}.${name}`}>
                                                    <td style={{textTransform: 'uppercase'}}>{name}</td>
                                                    <td style={{textTransform: 'uppercase'}}>{category}</td>
                                                    <td>₹{env.budgeted.toLocaleString()}</td>
                                                    <td>₹{env.spent.toLocaleString()}</td>
                                                    <td>₹{remaining.toLocaleString()}</td>
                                                    <td>₹{env.rollover.toLocaleString()}</td>
                                                    <td>
                            <span className={`status ${status}`}>
                              {status}
                            </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="card">
                        <div className="card-header">
                            <h3>📝 Recent Transactions</h3>
                        </div>
                        <div className="table-container">
                            <table className="envelope-table">
                                <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Description</th>
                                    <th>Envelope</th>
                                    <th>Amount</th>
                                    <th>Payment</th>
                                    <th>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {transactions.slice(-10).reverse().map(transaction => (
                                    <tr key={transaction.id}>
                                        <td>{transaction.date}</td>
                                        <td>{transaction.description}</td>
                                        <td style={{textTransform: 'uppercase'}}>
                                            {transaction.envelope.replace('.', ' - ')}
                                        </td>
                                        <td>₹{transaction.amount.toLocaleString()}</td>
                                        <td>{transaction.paymentMethod || 'UPI'}</td>
                                        <td>
                                            <button
                                                className="btn-delete"
                                                onClick={() => setDeleteConfirm({
                                                    type: 'transaction',
                                                    id: transaction.id,
                                                    name: transaction.description
                                                })}
                                                title="Delete transaction"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {transactions.length === 0 && (
                                    <tr>
                                        <td colSpan="6" style={{textAlign: 'center', color: 'var(--gray-600)'}}>No transactions yet</td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
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
                                    />
                                    <select
                                        value={incomeTransaction.paymentMethod}
                                        onChange={(e) => {
                                            setIncomeTransaction({...incomeTransaction, paymentMethod: e.target.value});
                                            if (e.target.value !== 'Custom') setCustomIncomePayment('');
                                        }}
                                        className="income-input"
                                    >
                                        <option value="UPI">💳 UPI</option>
                                        <option value="Credit Card">💳 Credit Card</option>
                                        <option value="Debit Card">💳 Debit Card</option>
                                        <option value="Cash">💵 Cash</option>
                                        <option value="Net Banking">🏦 Net Banking</option>
                                        <option value="Custom">➕ Add Custom</option>
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
                                    <button className="btn btn-success" onClick={addIncome}>
                                        ➕ Add Income
                                    </button>
                                </div>
                            </div>
                            <div className="budget-actions">
                                <button className="btn btn-primary" onClick={rolloverToNextPeriod}>
                                    🔄 Start Next Period
                                </button>
                                <button className="btn btn-secondary" onClick={exportData}>
                                    📤 Export
                                </button>
                                <label className="btn btn-secondary">
                                    📥 Import Expenses (CSV)
                                    <input type="file" accept=".csv" onChange={importExpenses} style={{display: 'none'}} />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Budget Allocation */}
                    <div className="card">
                        <div className="card-header">
                            <h3>💼 Budget Allocation</h3>
                        </div>
                        <div className="card-content">
                            {/* Add New Envelope */}
                            <div className="add-envelope-form">
                                <h4>Add New Envelope</h4>
                                <div className="envelope-form-row">
                                    <select
                                        value={newEnvelope.category}
                                        onChange={(e) => setNewEnvelope({...newEnvelope, category: e.target.value})}
                                        className="envelope-select"
                                    >
                                        <option value="">Select Category</option>
                                        <option value="needs">🏠 Needs</option>
                                        <option value="savings">💰 Savings</option>
                                        <option value="wants">🎯 Wants</option>
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Envelope name"
                                        value={newEnvelope.name}
                                        onChange={(e) => setNewEnvelope({...newEnvelope, name: e.target.value})}
                                        className="envelope-input-field"
                                    />
                                    <button className="btn btn-success" onClick={addEnvelope}>
                                        ➕ Add
                                    </button>
                                </div>
                            </div>

                            <div className="budget-grid">
                                {Object.keys(envelopes).map(category => (
                                    <div key={category} className="category-card">
                                        <div className="category-title">
                                            {category === 'needs' ? '🏠 Needs' :
                                                category === 'savings' ? '💰 Savings' : '🎯 Wants'}
                                        </div>
                                        {Object.keys(envelopes[category]).map(name => (
                                            <div key={name} className="envelope-input">
                                                <label>{name.toUpperCase()}:</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={budgetInputs[`${category}.${name}`] ?? envelopes[category][name].budgeted}
                                                    onChange={(e) => {
                                                        setBudgetInputs(prev => ({
                                                            ...prev,
                                                            [`${category}.${name}`]: e.target.value
                                                        }));
                                                    }}
                                                    onBlur={(e) => {
                                                        allocateBudget(category, name, e.target.value);
                                                        setBudgetInputs(prev => {
                                                            const updated = { ...prev };
                                                            delete updated[`${category}.${name}`];
                                                            return updated;
                                                        });
                                                    }}
                                                    placeholder="0.00"
                                                />
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => setDeleteConfirm({ type: 'envelope', id: `${category}.${name}`, name })}
                                                    title="Delete envelope"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ))}
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
                                    <div className="insight-value">{blockedTransactions.length} transactions</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {deleteConfirm.type && (
                <div className="modal-overlay" onClick={() => setDeleteConfirm({ type: '', id: '', name: '' })}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Confirm Delete</h3>
                        <p>Are you sure you want to delete {deleteConfirm.type} "{deleteConfirm.name}"?</p>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setDeleteConfirm({ type: '', id: '', name: '' })}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={confirmDelete}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnvelopeBudget;