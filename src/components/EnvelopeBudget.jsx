import React, { useState, useEffect, useCallback } from 'react';
import { saveToLocalStorage, loadFromLocalStorage, getDefaultEnvelopes } from '../utils/localStorage';
import { addGlobalEnvelope, removeGlobalEnvelope } from '../utils/globalEnvelopes';
import { auth } from '../config/firebase';
import { saveData, getData } from '../services/database';
import { useSwipeGesture, usePullToRefresh } from '../hooks/useSwipeGesture';
import './EnvelopeBudget.css';

const EnvelopeBudget = () => {
    // Generate budget period (1st to last day of month)
    // Generate list of budget periods (Jan 2026 + next 3 years)
    const generatePeriodOptions = () => {
        const periods = [];
        const startYear = 2026;
        const startMonth = 0; // January (0-indexed)

        for (let i = 0; i <= 36; i++) { // 36 months = 3 years
            const date = new Date(startYear, startMonth + i, 1);
            const year = date.getFullYear();
            const month = date.getMonth();
            
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            const periodKey = `${year}-${String(month + 1).padStart(2, '0')}`;
            const periodLabel = `${monthNames[month]} ${year}`;

            periods.push({ key: periodKey, label: periodLabel });
        }

        return periods;
    };

    const getCurrentBudgetPeriod = () => {
        return '2026-01'; // Default to Jan 2026
    };

    const [currentPeriod, setCurrentPeriod] = useState(getCurrentBudgetPeriod());
    const [monthlyData, setMonthlyData] = useState({});
    const [newTransaction, setNewTransaction] = useState({ envelope: '', amount: '', description: '', paymentMethod: 'UPI', date: new Date().toISOString().split('T')[0] });
    const [customPaymentMethod, setCustomPaymentMethod] = useState('');
    const [incomeTransaction, setIncomeTransaction] = useState({ amount: '', description: '', paymentMethod: '', date: new Date().toISOString().split('T')[0] });
    const [customIncomePayment, setCustomIncomePayment] = useState('');
    const [customPaymentMethods, setCustomPaymentMethods] = useState([]);
    const [newEnvelope, setNewEnvelope] = useState({ category: '', name: '' });
    const [notification, setNotification] = useState({ type: '', message: '' });
    const [deleteConfirm, setDeleteConfirm] = useState({ type: '', id: '', name: '' });
    const [editingPayment, setEditingPayment] = useState({ id: null, method: '' });
    const [transferModal, setTransferModal] = useState({ show: false, from: '', to: '', amount: '' });
    const [activeView, setActiveView] = useState('daily'); // 'daily', 'spending', 'budget'
    
    // Mobile gesture support
    const swipeGesture = useSwipeGesture(
        () => {
            // Swipe left - next period
            const nextPeriod = getNextBudgetPeriod(currentPeriod);
            setCurrentPeriod(nextPeriod);
        },
        () => {
            // Swipe right - previous period
            const prevPeriod = getPreviousPeriod(currentPeriod);
            setCurrentPeriod(prevPeriod);
        }
    );
    
    const pullToRefresh = usePullToRefresh(() => {
        // Refresh current data
        window.location.reload();
    });
    // Get date range for current budget period
    const getPeriodDateRange = () => {
        const [year, month] = currentPeriod.split('-').map(Number);
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate(); // Last day of month
        const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
        return { min: startDate, max: endDate };
    };

    const getPreviousPeriod = (currentPeriodStr) => {
        const [year, month] = currentPeriodStr.split('-').map(Number);
        
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevYear = month === 1 ? year - 1 : year;
        
        return `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
    };

    const dateRange = getPeriodDateRange();
    const [budgetInputs, setBudgetInputs] = useState({});
    const [dataLoaded, setDataLoaded] = useState(false);
    const [rolloverConfirm, setRolloverConfirm] = useState(false);

    // Get current period's data with automatic rollover calculation
    const getCurrentPeriodData = async () => {
        const defaultEnvelopes = await getDefaultEnvelopes();
        const periodData = monthlyData[currentPeriod];
        
        if (!periodData) {
            // Check if we need to calculate rollover from previous period
            const previousPeriod = getPreviousPeriod(currentPeriod);
            const previousData = monthlyData[previousPeriod];
            
            if (previousData && previousData.envelopes) {
                // Calculate rollover from previous period
                const rolledOverEnvelopes = {};
                Object.keys(defaultEnvelopes).forEach(category => {
                    rolledOverEnvelopes[category] = {};
                    Object.keys(defaultEnvelopes[category]).forEach(name => {
                        const prevEnv = previousData.envelopes?.[category]?.[name];
                        const rolloverAmount = prevEnv ? Math.max(0, prevEnv.budgeted + prevEnv.rollover - prevEnv.spent) : 0;
                        
                        rolledOverEnvelopes[category][name] = {
                            budgeted: 0,
                            spent: 0,
                            rollover: rolloverAmount
                        };
                    });
                });
                
                return {
                    income: 0,
                    envelopes: rolledOverEnvelopes,
                    transactions: [],
                    blockedTransactions: []
                };
            }
            
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
                
                // Save rollover data if it was calculated
                if (!monthlyData[currentPeriod] && data.envelopes) {
                    const hasRollover = Object.values(data.envelopes).some(category =>
                        Object.values(category).some(env => env.rollover > 0)
                    );
                    
                    if (hasRollover) {
                        await updatePeriodData({
                            income: data.income,
                            envelopes: data.envelopes,
                            transactions: data.transactions,
                            blockedTransactions: data.blockedTransactions
                        });
                    }
                }
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
                
                // Load custom payment methods from Firebase
                const paymentMethodsResult = await getData(`users/${user.uid}/customPaymentMethods`);
                if (paymentMethodsResult.success && paymentMethodsResult.data) {
                    setCustomPaymentMethods(paymentMethodsResult.data);
                }
                
                setDataLoaded(true);
            } else {
                console.log('User logged out');
                setDataLoaded(false);
            }
        });
        
        return () => unsubscribe();
    }, []);

    const saveLocalData = useCallback(async () => {
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
        saveLocalData();
    }, [saveLocalData]);

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

    const transferBetweenPaymentMethods = async () => {
        const { from, to, amount } = transferModal;
        const transferAmount = parseFloat(amount);
        
        if (!from || !to || !transferAmount || transferAmount <= 0) {
            showNotification('error', 'Fill all transfer details');
            return;
        }
        
        if (from === to) {
            showNotification('error', 'Cannot transfer to same payment method');
            return;
        }
        
        const transferOut = {
            id: Date.now() + Math.random(),
            date: new Date().toISOString().split('T')[0],
            envelope: 'TRANSFER',
            amount: transferAmount,
            description: `Transfer to ${to}`,
            paymentMethod: from,
            type: 'transfer-out'
        };
        
        const transferIn = {
            id: Date.now() + Math.random() + 1,
            date: new Date().toISOString().split('T')[0],
            envelope: 'TRANSFER',
            amount: transferAmount,
            description: `Transfer from ${from}`,
            paymentMethod: to,
            type: 'transfer-in'
        };
        
        await updatePeriodData({
            transactions: [...transactions, transferOut, transferIn]
        });
        
        setTransferModal({ show: false, from: '', to: '', amount: '' });
        showNotification('success', `₹${transferAmount.toLocaleString()} transferred from ${from} to ${to}`);
    };

    const updateTransactionPayment = async (transactionId, newPaymentMethod) => {
        const updatedTransactions = transactions.map(t => 
            t.id === transactionId ? { ...t, paymentMethod: newPaymentMethod } : t
        );
        
        await updatePeriodData({ transactions: updatedTransactions });
        setEditingPayment({ id: null, method: '' });
        showNotification('success', 'Payment method updated');
    };

    const addCustomPaymentMethod = async (method) => {
        if (method && !customPaymentMethods.includes(method)) {
            const updatedMethods = [...customPaymentMethods, method];
            setCustomPaymentMethods(updatedMethods);
            
            // Save to Firebase
            const user = auth.currentUser;
            if (user) {
                await saveData(`users/${user.uid}/customPaymentMethods`, updatedMethods);
            }
        }
    };

    const addIncome = async () => {
        const { amount, description } = incomeTransaction;

        if (!amount || parseFloat(amount) <= 0) {
            showNotification('error', 'Enter valid income amount');
            return;
        }

        const incomeAmount = parseFloat(amount);

        const paymentMethod = incomeTransaction.paymentMethod === 'Custom' ? customIncomePayment : incomeTransaction.paymentMethod;
        
        if (incomeTransaction.paymentMethod === 'Custom' && customIncomePayment) {
            addCustomPaymentMethod(customIncomePayment);
        }

        const transactionRecord = {
            id: Date.now() + Math.random(),
            date: incomeTransaction.date,
            envelope: 'INCOME',
            amount: incomeAmount,
            description: description || 'Monthly Income',
            paymentMethod: paymentMethod,
            type: 'income'
        };

        await updatePeriodData({
            income: income + incomeAmount,
            transactions: [...transactions, transactionRecord]
        });

        setIncomeTransaction({ amount: '', description: '', paymentMethod: incomeTransaction.paymentMethod, date: new Date().toISOString().split('T')[0] });
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

        const paymentMethod = newTransaction.paymentMethod === 'Custom' ? customPaymentMethod : newTransaction.paymentMethod;
        
        if (newTransaction.paymentMethod === 'Custom' && customPaymentMethod) {
            addCustomPaymentMethod(customPaymentMethod);
        }

        const transactionRecord = {
            id: Date.now() + Math.random(),
            date: newTransaction.date,
            envelope,
            amount: expenseAmount,
            description: description || 'Quick expense',
            paymentMethod: paymentMethod
        };

        updatePeriodData({
            envelopes: updatedEnvelopes,
            transactions: [...transactions, transactionRecord]
        });

        setNewTransaction({
            envelope: newTransaction.envelope,
            amount: '',
            description: '',
            paymentMethod: newTransaction.paymentMethod,
            date: new Date().toISOString().split('T')[0]
        });

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
        const [year, month] = currentPeriodStr.split('-').map(Number);
        
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? year + 1 : year;
        
        return `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
    };
    const rolloverToNextPeriod = () => {
        const nextPeriod = getNextBudgetPeriod(currentPeriod);
        const today = new Date();
        const currentDay = today.getDate();
        
        // Check if there are unused funds to rollover
        const hasUnusedFunds = Object.values(envelopes).some(category =>
            Object.values(category).some(env => {
                const unused = env.budgeted + env.rollover - env.spent;
                return unused > 0;
            })
        );
        
        if (!hasUnusedFunds) {
            showNotification('info', 'No unused funds to rollover');
            return;
        }
        
        // Smart rollover logic - check if near end of month
        const [currentYear, currentMonth] = currentPeriod.split('-').map(Number);
        const lastDayOfMonth = new Date(currentYear, currentMonth, 0).getDate();
        const todayDate = new Date();
        const dayOfMonth = todayDate.getDate();
        
        if (dayOfMonth >= lastDayOfMonth - 5) { // Last 5 days of month
            const nextPeriodLabel = nextPeriod.replace(/-/g, '-');
            if (confirm(`Smart Rollover: Roll unused balances to next period (${nextPeriodLabel})?`)) {
                confirmRollover(nextPeriod);
            }
        } else {
            // Not near end - show period selection
            setRolloverConfirm(true);
        }
    };
    
    const confirmRollover = async (targetPeriod) => {
        try {
            // Calculate rollover amounts
            const defaultEnvelopes = await getDefaultEnvelopes();
            const rolledOverEnvelopes = {};
            let totalRollover = 0;
            
            Object.keys(defaultEnvelopes).forEach(category => {
                rolledOverEnvelopes[category] = {};
                Object.keys(defaultEnvelopes[category]).forEach(name => {
                    const env = envelopes[category]?.[name] || { budgeted: 0, spent: 0, rollover: 0 };
                    const unused = env.budgeted + env.rollover - env.spent;
                    const rolloverAmount = Math.max(0, unused);
                    
                    rolledOverEnvelopes[category][name] = {
                        budgeted: 0,
                        spent: 0,
                        rollover: rolloverAmount
                    };
                    
                    totalRollover += rolloverAmount;
                });
            });

            // Check if target period already exists
            const existingData = monthlyData[targetPeriod];
            if (existingData) {
                // Merge with existing rollover amounts
                Object.keys(rolledOverEnvelopes).forEach(category => {
                    Object.keys(rolledOverEnvelopes[category]).forEach(name => {
                        const existing = existingData.envelopes?.[category]?.[name];
                        if (existing) {
                            rolledOverEnvelopes[category][name].rollover += existing.rollover;
                            rolledOverEnvelopes[category][name].budgeted = existing.budgeted;
                            rolledOverEnvelopes[category][name].spent = existing.spent;
                        }
                    });
                });
            }

            // Set data for target period
            setMonthlyData(prev => ({
                ...prev,
                [targetPeriod]: {
                    income: existingData?.income || 0,
                    envelopes: rolledOverEnvelopes,
                    transactions: existingData?.transactions || [],
                    blockedTransactions: existingData?.blockedTransactions || []
                }
            }));

            // Switch to target period
            setCurrentPeriod(targetPeriod);
            setRolloverConfirm(false);
            showNotification('success', `Rollover completed! ₹${totalRollover.toLocaleString()} rolled over to ${targetPeriod}`);
        } catch (error) {
            console.error('Rollover failed:', error);
            showNotification('error', 'Rollover failed. Please try again.');
        }
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

    const getPaymentMethodBalances = () => {
        const balances = {};
        transactions.forEach(transaction => {
            const method = transaction.paymentMethod || 'Unknown';
            if (!balances[method]) balances[method] = 0;
            
            if (transaction.type === 'income' || transaction.type === 'transfer-in') {
                balances[method] += transaction.amount;
            } else if (transaction.type === 'transfer-out') {
                balances[method] -= transaction.amount;
            } else {
                balances[method] -= transaction.amount;
            }
        });
        return balances;
    };

    const paymentBalances = getPaymentMethodBalances();

    return (
        <div className="envelope-budget" {...swipeGesture} {...pullToRefresh}>
            <div className="header">
                <h1>💰 Envelope Budget Tracker</h1>
                <div className="header-controls">
                    <div className="control-group">
                        <label>Budget Period (Monthly)</label>
                        <div className="period-navigation">
                            <select
                                value={currentPeriod}
                                onChange={(e) => setCurrentPeriod(e.target.value)}
                                className="period-selector"
                                aria-label="Select budget period"
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
            </div>

            {/* Tab Navigation */}
            <div className="tab-navigation">
                <button
                    className={`tab-btn touch-feedback ${activeView === 'daily' ? 'active' : ''}`}
                    onClick={() => setActiveView('daily')}
                >
                    ⚡ Daily
                </button>
                <button
                    className={`tab-btn touch-feedback ${activeView === 'spending' ? 'active' : ''}`}
                    onClick={() => setActiveView('spending')}
                >
                    💳 Spending
                </button>
                <button
                    className={`tab-btn touch-feedback ${activeView === 'budget' ? 'active' : ''}`}
                    onClick={() => setActiveView('budget')}
                >
                    📊 Budget
                </button>
            </div>

            {notification.message && (
                <div className={`notification ${notification.type}`}>
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

            {/* Payment Method Overview */}
            {Object.keys(paymentBalances).length > 0 && (
                <div className="card">
                    <div className="card-header">
                        <h3>💳 Payment Method Overview</h3>
                        <button 
                            className="btn btn-primary touch-feedback"
                            onClick={() => setTransferModal({ show: true, from: '', to: '', amount: '' })}
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
                                        aria-label="Select envelope"
                                    >
                                        <option value="">Select Envelope</option>
                                        {Object.keys(envelopes)
                                            .flatMap(category =>
                                                Object.keys(envelopes[category]).map(name => ({
                                                    category,
                                                    name,
                                                    env: envelopes[category][name]
                                                }))
                                            )
                                            .sort((a, b) => a.name.localeCompare(b.name))
                                            .map(({ category, name, env }) => {
                                                const balance = env.budgeted + env.rollover - env.spent;
                                                return (
                                                    <option key={`${category}.${name}`} value={`${category}.${name}`}>
                                                        {name.toUpperCase()} - ₹{balance.toLocaleString()}
                                                    </option>
                                                );
                                            })
                                        }
                                    </select>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="₹ Amount"
                                        value={newTransaction.amount}
                                        onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                                        className="quick-amount"
                                        inputMode="decimal"
                                        autoComplete="off"
                                        aria-label="Transaction amount"
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
                                        autoComplete="off"
                                        aria-label="Transaction description"
                                    />
                                    <select
                                        value={newTransaction.paymentMethod}
                                        onChange={(e) => {
                                            setNewTransaction({...newTransaction, paymentMethod: e.target.value});
                                            if (e.target.value !== 'Custom') setCustomPaymentMethod('');
                                        }}
                                        className="quick-payment"
                                        aria-label="Select payment method"
                                    >
                                        <option value="">Select Payment Method</option>
                                        {customPaymentMethods.sort((a, b) => a.localeCompare(b)).map(method => (
                                            <option key={method} value={method}>{method}</option>
                                        ))}
                                        <option value="Custom">➕ Add New</option>
                                    </select>
                                    {newTransaction.paymentMethod === 'Custom' && (
                                        <input
                                            type="text"
                                            placeholder="Enter payment method"
                                            value={customPaymentMethod}
                                            onChange={(e) => setCustomPaymentMethod(e.target.value)}
                                            className="quick-payment"
                                            autoComplete="off"
                                            aria-label="Custom payment method name"
                                        />
                                    )}
                                </div>
                                <div className="quick-form-row">
                                    <button className="btn btn-success quick-add-btn touch-feedback" onClick={addTransaction}>
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
                        <div className="card-content">
                            <div className="table-container">
                                <table className="envelope-table">
                                    <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Description</th>
                                        <th>Envelope</th>
                                        <th>Amount</th>
                                        <th>Payment</th>
                                        <th>Action</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {transactions.filter(t => t.date === newTransaction.date).reverse().map((transaction, index) => (
                                        <tr key={transaction.id}>
                                            <td>#{index + 1}</td>
                                            <td>{transaction.description}</td>
                                            <td style={{textTransform: 'uppercase'}}>
                                                {transaction.envelope.replace('.', ' - ')}
                                            </td>
                                            <td style={{fontWeight: '600', color: 'var(--danger)'}}>₹{transaction.amount.toLocaleString()}</td>
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
                                            <td colSpan="6" style={{textAlign: 'center', color: 'var(--gray-600)', padding: '20px'}}>No expenses on selected date</td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                                <div className="mobile-card-view">
                                    {transactions.filter(t => t.date === newTransaction.date).reverse().map((transaction, index) => (
                                        <div key={transaction.id} className="mobile-transaction-card">
                                            <div className="mobile-card-header">
                                                <span>#{index + 1} - {transaction.description}</span>
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
                                            </div>
                                            <div className="mobile-card-content">
                                                <div className="mobile-card-field">
                                                    <span className="mobile-card-label">Envelope</span>
                                                    <span className="mobile-card-value" style={{textTransform: 'uppercase'}}>
                                                        {transaction.envelope.replace('.', ' - ')}
                                                    </span>
                                                </div>
                                                <div className="mobile-card-field">
                                                    <span className="mobile-card-label">Amount</span>
                                                    <span className="mobile-card-value" style={{fontWeight: '600', color: 'var(--danger)'}}>₹{transaction.amount.toLocaleString()}</span>
                                                </div>
                                                <div className="mobile-card-field">
                                                    <span className="mobile-card-label">Payment</span>
                                                    <span className="mobile-card-value">{transaction.paymentMethod || 'UPI'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {transactions.filter(t => t.date === newTransaction.date).length === 0 && (
                                        <div style={{textAlign: 'center', color: 'var(--gray-600)', padding: '20px'}}>No expenses on selected date</div>
                                    )}
                                </div>
                            </div>
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
                            <div className="mobile-card-view">
                                {Object.keys(envelopes).map(category =>
                                    Object.keys(envelopes[category]).map(name => {
                                        const env = envelopes[category][name];
                                        const remaining = env.budgeted + env.rollover - env.spent;
                                        const status = getStatus(env);
                                        return (
                                            <div key={`${category}.${name}`} className="mobile-envelope-card">
                                                <div className="mobile-card-header">
                                                    <span style={{textTransform: 'uppercase'}}>{name}</span>
                                                    <span className={`status ${status}`}>{status}</span>
                                                </div>
                                                <div className="mobile-card-content">
                                                    <div className="mobile-card-field">
                                                        <span className="mobile-card-label">Category</span>
                                                        <span className="mobile-card-value" style={{textTransform: 'uppercase'}}>{category}</span>
                                                    </div>
                                                    <div className="mobile-card-field">
                                                        <span className="mobile-card-label">Budgeted</span>
                                                        <span className="mobile-card-value">₹{env.budgeted.toLocaleString()}</span>
                                                    </div>
                                                    <div className="mobile-card-field">
                                                        <span className="mobile-card-label">Spent</span>
                                                        <span className="mobile-card-value">₹{env.spent.toLocaleString()}</span>
                                                    </div>
                                                    <div className="mobile-card-field">
                                                        <span className="mobile-card-label">Remaining</span>
                                                        <span className="mobile-card-value">₹{remaining.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
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
                                        <td 
                                            onDoubleClick={() => setEditingPayment({ id: transaction.id, method: transaction.paymentMethod || '' })}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {editingPayment.id === transaction.id ? (
                                                <select
                                                    value={editingPayment.method}
                                                    onChange={(e) => setEditingPayment({ ...editingPayment, method: e.target.value })}
                                                    onBlur={() => updateTransactionPayment(transaction.id, editingPayment.method)}
                                                    onKeyDown={(e) => e.key === 'Enter' && updateTransactionPayment(transaction.id, editingPayment.method)}
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
                            <div className="mobile-card-view">
                                {transactions.slice(-10).reverse().map(transaction => (
                                    <div key={transaction.id} className="mobile-transaction-card">
                                        <div className="mobile-card-header">
                                            <span>{transaction.description}</span>
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
                                        </div>
                                        <div className="mobile-card-content">
                                            <div className="mobile-card-field">
                                                <span className="mobile-card-label">Date</span>
                                                <span className="mobile-card-value">{transaction.date}</span>
                                            </div>
                                            <div className="mobile-card-field">
                                                <span className="mobile-card-label">Amount</span>
                                                <span className="mobile-card-value">₹{transaction.amount.toLocaleString()}</span>
                                            </div>
                                            <div className="mobile-card-field">
                                                <span className="mobile-card-label">Envelope</span>
                                                <span className="mobile-card-value" style={{textTransform: 'uppercase'}}>
                                                    {transaction.envelope.replace('.', ' - ')}
                                                </span>
                                            </div>
                                            <div className="mobile-card-field">
                                                <span className="mobile-card-label">Payment</span>
                                                <span className="mobile-card-value">{transaction.paymentMethod || 'Unknown'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {transactions.length === 0 && (
                                    <div style={{textAlign: 'center', color: 'var(--gray-600)', padding: '20px'}}>No transactions yet</div>
                                )}
                            </div>
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
                                    <button className="btn btn-success" onClick={addIncome}>
                                        ➕ Add Income
                                    </button>
                                </div>
                            </div>
                            <div className="budget-actions">
                                <button className="btn btn-secondary" onClick={exportData}>
                                    📤 Export
                                </button>
                                <button className="btn btn-primary" onClick={rolloverToNextPeriod}>
                                    🔄 Rollover Unused Funds
                                </button>
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

            {transferModal.show && (
                <div className="modal-overlay" onClick={() => setTransferModal({ show: false, from: '', to: '', amount: '' })}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <button 
                            className="modal-close"
                            onClick={() => setTransferModal({ show: false, from: '', to: '', amount: '' })}
                            aria-label="Close modal"
                        >
                            ×
                        </button>
                        <h3>🔄 Transfer Between Payment Methods</h3>
                        <div style={{ margin: '20px 0' }}>
                            <div style={{ marginBottom: '15px' }}>
                                <label>From:</label>
                                <select
                                    value={transferModal.from}
                                    onChange={(e) => setTransferModal({ ...transferModal, from: e.target.value })}
                                    style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                                >
                                    <option value="">Select source payment method</option>
                                    {customPaymentMethods.sort((a, b) => a.localeCompare(b)).map(method => (
                                        <option key={method} value={method}>{method}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label>To:</label>
                                <select
                                    value={transferModal.to}
                                    onChange={(e) => setTransferModal({ ...transferModal, to: e.target.value })}
                                    style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                                >
                                    <option value="">Select destination payment method</option>
                                    {customPaymentMethods.sort((a, b) => a.localeCompare(b)).map(method => (
                                        <option key={method} value={method}>{method}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label>Amount:</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="₹ Transfer Amount"
                                    value={transferModal.amount}
                                    onChange={(e) => setTransferModal({ ...transferModal, amount: e.target.value })}
                                    style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                                />
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setTransferModal({ show: false, from: '', to: '', amount: '' })}>
                                Cancel
                            </button>
                            <button className="btn btn-success" onClick={transferBetweenPaymentMethods}>
                                Transfer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {rolloverConfirm && (
                <div className="modal-overlay" onClick={() => setRolloverConfirm(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <button 
                            className="modal-close"
                            onClick={() => setRolloverConfirm(false)}
                            aria-label="Close modal"
                        >
                            ×
                        </button>
                        <h3>🔄 Rollover to Which Period?</h3>
                        <p>Select the target budget period for rollover:</p>
                        <div style={{ maxHeight: '300px', overflowY: 'auto', margin: '20px 0' }}>
                            {generatePeriodOptions().filter(period => period.key !== currentPeriod).map(period => (
                                <button
                                    key={period.key}
                                    onClick={() => confirmRollover(period.key)}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        padding: '10px',
                                        margin: '5px 0',
                                        backgroundColor: '#f8f9fa',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                                >
                                    {period.label}
                                </button>
                            ))}
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setRolloverConfirm(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deleteConfirm.type && (
                <div className="modal-overlay" onClick={() => setDeleteConfirm({ type: '', id: '', name: '' })}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <button 
                            className="modal-close"
                            onClick={() => setDeleteConfirm({ type: '', id: '', name: '' })}
                            aria-label="Close modal"
                        >
                            ×
                        </button>
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