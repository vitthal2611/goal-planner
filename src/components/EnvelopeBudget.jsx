import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { saveToLocalStorage, loadFromLocalStorage, getDefaultEnvelopes } from '../utils/localStorage';
import { addGlobalEnvelope, removeGlobalEnvelope } from '../utils/globalEnvelopes';
import { auth } from '../config/firebase';
import { saveData, getData } from '../services/database';
import { backupTransactions } from '../services/backup';
import { useSwipeGesture, usePullToRefresh } from '../hooks/useSwipeGesture';
import { sanitizeInput, sanitizeCSVData, validatePaymentMethod } from '../utils/sanitize';
import QuickExpenseForm from './QuickExpenseForm';
import TransactionsList from './TransactionsList';
import SchedulePlanner from './SchedulePlanner';
import './EnvelopeBudget.css';
import './MobileEnhancements.css';

const EnvelopeBudget = () => {
    // Generate budget period (1st to last day of month)
    // Generate list of budget periods (current year + next 3 years)
    const generatePeriodOptions = () => {
        const periods = [];
        const startYear = new Date().getFullYear(); // Use current year instead of hardcoded 2026
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
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`; // Default to current month/year
    };

    const [currentPeriod, setCurrentPeriod] = useState(getCurrentBudgetPeriod());
    const [monthlyData, setMonthlyData] = useState({});
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
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [swipeIndicator, setSwipeIndicator] = useState({ show: false, direction: '' });
    const [quickActionSheet, setQuickActionSheet] = useState(false);
    const [filters, setFilters] = useState({
        type: '',
        envelope: '',
        paymentMethod: '',
        dateFrom: '',
        dateTo: '',
        description: ''
    });
    
    // Mobile gesture support
    const swipeGesture = useSwipeGesture(
        () => {
            // Swipe left - next period
            setSwipeIndicator({ show: true, direction: 'left' });
            setTimeout(() => setSwipeIndicator({ show: false, direction: '' }), 500);
            const nextPeriod = getNextBudgetPeriod(currentPeriod);
            setCurrentPeriod(nextPeriod);
        },
        () => {
            // Swipe right - previous period
            setSwipeIndicator({ show: true, direction: 'right' });
            setTimeout(() => setSwipeIndicator({ show: false, direction: '' }), 500);
            const prevPeriod = getPreviousPeriod(currentPeriod);
            setCurrentPeriod(prevPeriod);
        }
    );
    
    const pullToRefresh = usePullToRefresh(() => {
        // Refresh current data
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
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
    const [incrementInputs, setIncrementInputs] = useState({});
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
        if (method && !customPaymentMethods.includes(method) && validatePaymentMethod(method)) {
            const sanitizedMethod = sanitizeInput(method);
            const updatedMethods = [...customPaymentMethods, sanitizedMethod];
            setCustomPaymentMethods(updatedMethods);
            
            // Save to Firebase
            const user = auth.currentUser;
            if (user) {
                try {
                    await saveData(`users/${user.uid}/customPaymentMethods`, updatedMethods);
                } catch (error) {
                    console.error('Failed to save payment method:', error);
                    showNotification('error', 'Failed to save payment method');
                }
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

        let paymentMethod = incomeTransaction.paymentMethod === 'Custom' ? customIncomePayment : incomeTransaction.paymentMethod;
        
        if (incomeTransaction.paymentMethod === 'Custom' && customIncomePayment) {
            if (!validatePaymentMethod(customIncomePayment)) {
                showNotification('error', 'Invalid payment method format');
                return;
            }
            paymentMethod = sanitizeInput(customIncomePayment);
            await addCustomPaymentMethod(paymentMethod);
        }

        const transactionRecord = {
            id: Date.now() + Math.random(),
            date: incomeTransaction.date,
            envelope: 'INCOME',
            amount: incomeAmount,
            description: sanitizeInput(description || 'Monthly Income'),
            paymentMethod: sanitizeInput(paymentMethod),
            type: 'income'
        };

        try {
            await updatePeriodData({
                income: income + incomeAmount,
                transactions: [...transactions, transactionRecord]
            });

            setIncomeTransaction({ amount: '', description: '', paymentMethod: incomeTransaction.paymentMethod, date: new Date().toISOString().split('T')[0] });
            setCustomIncomePayment('');
            showNotification('success', '✓ Income Added!');
        } catch (error) {
            console.error('Failed to add income:', error);
            showNotification('error', 'Failed to add income');
        }
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
        // Haptic feedback simulation
        if (navigator.vibrate) {
            navigator.vibrate(type === 'success' ? [50] : [100, 50, 100]);
        }
        setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    };

    const getStatus = (envelope) => {
        const available = envelope.budgeted + envelope.rollover - envelope.spent;
        if (available <= 0) return 'blocked';
        if (available < envelope.budgeted * 0.2) return 'warning';
        return 'healthy';
    };

    const addTransaction = async (transactionData) => {
        const { envelope, amount, description, paymentMethod } = transactionData;

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
            date: transactionData.date,
            envelope,
            amount: expenseAmount,
            description: sanitizeInput(description || 'Quick expense'),
            paymentMethod: sanitizeInput(paymentMethod)
        };

        try {
            await updatePeriodData({
                envelopes: updatedEnvelopes,
                transactions: [...transactions, transactionRecord]
            });

            // Smart scroll to show success on mobile
            if (window.innerWidth <= 768) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }

            showNotification('success', '✓ Added!');
        } catch (error) {
            console.error('Failed to add transaction:', error);
            showNotification('error', 'Failed to add transaction');
        }
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

    const incrementBudget = (category, name, incrementAmount) => {
        const increment = parseFloat(incrementAmount) || 0;
        
        if (increment <= 0) {
            showNotification('error', 'Enter valid increment amount');
            return;
        }

        if (income <= 0) {
            showNotification('error', 'Add income first before incrementing budget');
            return;
        }

        const totalAllocated = Object.values(envelopes).reduce((sum, cat) =>
            sum + Object.values(cat).reduce((catSum, env) => catSum + env.budgeted, 0), 0);

        const currentEnvelopeBudget = envelopes[category][name].budgeted;
        const newBudgetAmount = currentEnvelopeBudget + increment;
        const newTotalAllocated = totalAllocated + increment;

        if (newTotalAllocated > income) {
            showNotification('error', `Cannot increment by ₹${increment.toLocaleString()}. Only ₹${(income - totalAllocated).toLocaleString()} available`);
            return;
        }

        const updatedEnvelopes = {
            ...envelopes,
            [category]: {
                ...envelopes[category],
                [name]: {
                    ...envelopes[category][name],
                    budgeted: newBudgetAmount
                }
            }
        };
        updatePeriodData({ envelopes: updatedEnvelopes });
        showNotification('success', `✓ ${name.toUpperCase()} budget increased by ₹${increment.toLocaleString()}`);
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

    const handleBackup = async () => {
        const user = auth.currentUser;
        if (!user) {
            showNotification('error', 'Please login to backup data');
            return;
        }
        
        const result = await backupTransactions(user.uid);
        if (result.success) {
            showNotification('success', 'Backup downloaded successfully');
        } else {
            showNotification('error', `Backup failed: ${result.error}`);
        }
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
                    const rawExpense = {
                        date: values[0],
                        envelope: values[1],
                        amount: parseFloat(values[2]),
                        description: values[3] || 'Bulk import',
                        paymentMethod: values[4] || 'UPI'
                    };
                    
                    // Sanitize CSV data to prevent XSS
                    const expense = sanitizeCSVData(rawExpense);
                    
                    // Validate expense
                    if (!expense.date || !expense.envelope || !expense.amount) {
                        errorCount++;
                        continue;
                    }
                    
                    // Validate payment method format
                    if (!validatePaymentMethod(expense.paymentMethod)) {
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
                    
                    try {
                        await updatePeriodData({
                            envelopes: updatedEnvelopes,
                            transactions: [...transactions, transactionRecord]
                        });
                        successCount++;
                    } catch (error) {
                        console.error('Failed to import expense:', error);
                        errorCount++;
                    }
                }
                
                showNotification('success', `✓ Imported ${successCount} expenses. ${errorCount} errors.`);
            } catch (error) {
                console.error('CSV import error:', error);
                showNotification('error', 'Invalid CSV format or import failed');
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

    // Memoize expensive calculations for better performance
    const insights = useMemo(() => getInsights(), [envelopes]);
    const totalBudgeted = useMemo(() => 
        Object.values(envelopes).reduce((sum, category) =>
            sum + Object.values(category).reduce((catSum, env) => catSum + env.budgeted, 0), 0), 
        [envelopes]
    );
    const totalSpent = useMemo(() => 
        Object.values(envelopes).reduce((sum, category) =>
            sum + Object.values(category).reduce((catSum, env) => catSum + env.spent, 0), 0), 
        [envelopes]
    );

    const getPaymentMethodBalances = useMemo(() => {
        const balances = {};
        transactions.forEach(transaction => {
            const method = sanitizeInput(transaction.paymentMethod || 'Unknown');
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
    }, [transactions]);

    const paymentBalances = getPaymentMethodBalances;

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

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

                // Handle special cases
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
            filteredTransactions.reverse(); // Default to newest first
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
            description: ''
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
        <div className="envelope-budget" {...swipeGesture} {...pullToRefresh}>
            {/* Swipe Indicators */}
            {swipeIndicator.show && (
                <div className={`swipe-indicator ${swipeIndicator.direction} show`}>
                    {swipeIndicator.direction === 'left' ? '← Next Period' : '→ Previous Period'}
                </div>
            )}
            {/* Pull to Refresh Indicator */}
            {pullToRefresh.isPulling && (
                <div className="pull-to-refresh">
                    ↓ Pull to refresh
                </div>
            )}
            
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
                    className={`tab-btn touch-feedback ${activeView === 'transactions' ? 'active' : ''}`}
                    onClick={() => setActiveView('transactions')}
                >
                    📝 Transactions
                </button>
                <button
                    className={`tab-btn touch-feedback ${activeView === 'budget' ? 'active' : ''}`}
                    onClick={() => setActiveView('budget')}
                >
                    📊 Budget
                </button>
                <button
                    className={`tab-btn touch-feedback ${activeView === 'schedule' ? 'active' : ''}`}
                    onClick={() => setActiveView('schedule')}
                >
                    📅 Schedule
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
                    <QuickExpenseForm
                        envelopes={envelopes}
                        customPaymentMethods={customPaymentMethods}
                        dateRange={dateRange}
                        onAddTransaction={addTransaction}
                        onAddCustomPaymentMethod={addCustomPaymentMethod}
                        onShowNotification={showNotification}
                    />

                    {/* Today's Transactions */}
                    <TransactionsList
                        transactions={transactions}
                        onDeleteTransaction={deleteTransaction}
                        onUpdatePaymentMethod={updateTransactionPayment}
                        customPaymentMethods={customPaymentMethods}
                        title="📅 Today's Expenses"
                        filterDate={new Date().toISOString().split('T')[0]}
                    />
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
                </>
            ) : activeView === 'transactions' ? (
                <>
                    {/* Transactions */}
                    <div className="card">
                        <div className="card-header">
                            <h3>📝 Transactions</h3>
                        </div>
                        <div className="card-content">
                            {/* Recent Transactions Summary */}
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
                            
                            {/* Recent Transactions Details */}
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
                                            🗑️ Clear
                                        </button>
                                    </div>
                                </div>
                                <div className="table-container">
                                    <table className="envelope-table">
                                        <thead>
                                        <tr>
                                            <th onClick={() => handleSort('date')} style={{cursor: 'pointer'}}>
                                                Date {getSortIcon('date')}
                                            </th>
                                            <th onClick={() => handleSort('type')} style={{cursor: 'pointer'}}>
                                                Type {getSortIcon('type')}
                                            </th>
                                            <th onClick={() => handleSort('description')} style={{cursor: 'pointer'}}>
                                                Description {getSortIcon('description')}
                                            </th>
                                            <th onClick={() => handleSort('envelope')} style={{cursor: 'pointer'}}>
                                                Envelope {getSortIcon('envelope')}
                                            </th>
                                            <th onClick={() => handleSort('amount')} style={{cursor: 'pointer'}}>
                                                Amount {getSortIcon('amount')}
                                            </th>
                                            <th onClick={() => handleSort('paymentMethod')} style={{cursor: 'pointer'}}>
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
                                            );
                                        })}
                                        {transactions.length === 0 && (
                                            <tr>
                                                <td colSpan="7" style={{textAlign: 'center', color: 'var(--gray-600)'}}>No transactions yet</td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
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
                </>
            ) : activeView === 'schedule' ? (
                <SchedulePlanner />
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
                                <button className="btn btn-warning" onClick={handleBackup}>
                                    💾 Backup All Data
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
                                                <div className="envelope-header">
                                                    <label>{name.toUpperCase()}: ₹{envelopes[category][name].budgeted.toLocaleString()}</label>
                                                    <button
                                                        className="btn-delete"
                                                        onClick={() => setDeleteConfirm({ type: 'envelope', id: `${category}.${name}`, name })}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
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
                                                    placeholder="Set budget"
                                                />
                                                <div className="increment-row">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={incrementInputs[`${category}.${name}`] || ''}
                                                        onChange={(e) => {
                                                            setIncrementInputs(prev => ({
                                                                ...prev,
                                                                [`${category}.${name}`]: e.target.value
                                                            }));
                                                        }}
                                                        placeholder="+ Amount"
                                                        className="increment-input"
                                                    />
                                                    <button
                                                        className="btn btn-success increment-btn"
                                                        onClick={() => {
                                                            const incrementAmount = incrementInputs[`${category}.${name}`];
                                                            if (incrementAmount) {
                                                                incrementBudget(category, name, incrementAmount);
                                                                setIncrementInputs(prev => {
                                                                    const updated = { ...prev };
                                                                    delete updated[`${category}.${name}`];
                                                                    return updated;
                                                                });
                                                            }
                                                        }}
                                                    >
                                                        + Add
                                                    </button>
                                                </div>
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

            {/* Quick Actions for Mobile */}
            <div className="quick-actions">
                <button 
                    className="quick-action-btn"
                    style={{ background: 'var(--success)', color: 'white' }}
                    onClick={() => setQuickActionSheet(true)}
                    title="Quick Add"
                >
                    +
                </button>
            </div>

            {/* Bottom Sheet Modal */}
            {quickActionSheet && (
                <>
                    <div 
                        className="modal-overlay" 
                        onClick={() => setQuickActionSheet(false)}
                        style={{ background: 'rgba(0,0,0,0.3)' }}
                    />
                    <div className={`bottom-sheet ${quickActionSheet ? 'open' : ''}`}>
                        <div className="bottom-sheet-handle"></div>
                        <div style={{ padding: '0 20px 20px' }}>
                            <h3 style={{ margin: '0 0 20px', textAlign: 'center' }}>Quick Actions</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <button 
                                    className="btn btn-success"
                                    onClick={() => {
                                        setActiveView('daily');
                                        setQuickActionSheet(false);
                                    }}
                                    style={{ width: '100%', padding: '16px' }}
                                >
                                    💸 Add Expense
                                </button>
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => {
                                        setActiveView('budget');
                                        setQuickActionSheet(false);
                                    }}
                                    style={{ width: '100%', padding: '16px' }}
                                >
                                    💰 Add Income
                                </button>
                                <button 
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setActiveView('spending');
                                        setQuickActionSheet(false);
                                    }}
                                    style={{ width: '100%', padding: '16px' }}
                                >
                                    📊 View Budget
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Floating Action Button for Mobile */}
            <button 
                className="fab"
                onClick={() => setActiveView('daily')}
                title="Quick Add Expense"
                aria-label="Quick Add Expense"
            >
                +
            </button>

            {transferModal.show && (
                <div className="modal-overlay" onClick={() => setTransferModal({ show: false, from: '', to: '', amount: '' })}>
                    <div className="modal mobile-optimized" onClick={(e) => e.stopPropagation()}>
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
                    <div className="modal mobile-optimized" onClick={(e) => e.stopPropagation()}>
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
                    <div className="modal mobile-optimized" onClick={(e) => e.stopPropagation()}>
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