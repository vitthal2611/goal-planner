import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { saveToLocalStorage, loadFromLocalStorage, getDefaultEnvelopes } from '../utils/localStorage';
import { addGlobalEnvelope, removeGlobalEnvelope } from '../utils/globalEnvelopes';
import { auth } from '../config/firebase';
import { saveData, getData } from '../services/database';
import { backupTransactions } from '../services/backup';
import { useSwipeGesture, usePullToRefresh } from '../hooks/useSwipeGesture';
import { sanitizeInput, sanitizeCSVData, validatePaymentMethod } from '../utils/sanitize';
import TransactionsList from './TransactionsList';
import QuickAddOptimized from './QuickAddOptimized';
import { useHapticFeedback } from '../hooks/useEnhancedMobile';

import './EnvelopeBudget.css';
import './MobileEnhancements.css';

const EnvelopeBudget = ({ activeView, setActiveView }) => {
    const { success, error, lightTap } = useHapticFeedback();
    // Generate budget period options (years + months)
    const generatePeriodOptions = () => {
        const periods = [];
        const startYear = new Date().getFullYear();
        const startMonth = 0;

        // Add year options
        for (let y = 0; y <= 3; y++) {
            const year = startYear + y;
            periods.push({ key: `${year}`, label: `${year}`, isYear: true });
        }

        // Add month options
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        for (let i = 0; i <= 36; i++) {
            const date = new Date(startYear, startMonth + i, 1);
            const year = date.getFullYear();
            const month = date.getMonth();
            const periodKey = `${year}-${String(month + 1).padStart(2, '0')}`;
            const periodLabel = `${monthNames[month]} ${year}`;
            periods.push({ key: periodKey, label: periodLabel, isYear: false });
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
    const [incomeTransaction, setIncomeTransaction] = useState({ amount: '', description: '', paymentMethod: '', date: new Date().toISOString().split('T')[0], type: 'income' });
    const [customIncomePayment, setCustomIncomePayment] = useState('');
    const [customPaymentMethods, setCustomPaymentMethods] = useState([]);
    const [newEnvelope, setNewEnvelope] = useState({ category: '', name: '' });
    const [notification, setNotification] = useState({ type: '', message: '' });
    const [deleteConfirm, setDeleteConfirm] = useState({ type: '', id: '', name: '' });
    const [editingPayment, setEditingPayment] = useState({ id: null, method: '' });
    const [transferModal, setTransferModal] = useState({ show: false, from: '', to: '', amount: '' });
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [swipeIndicator, setSwipeIndicator] = useState({ show: false, direction: '' });
    const [quickActionSheet, setQuickActionSheet] = useState(false);
    const [showQuickExpenseModal, setShowQuickExpenseModal] = useState(false);
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

    // Get current period's data with simple calculation
    const getCurrentPeriodData = async () => {
        const defaultEnvelopes = await getDefaultEnvelopes();
        const periodData = monthlyData[currentPeriod];
        
        if (!periodData) {
            // Check previous period for available balance
            const previousPeriod = getPreviousPeriod(currentPeriod);
            const previousData = monthlyData[previousPeriod];
            
            if (previousData?.envelopes) {
                // Available Balance = Previous Available + Current Budget - Current Spent
                const newEnvelopes = {};
                Object.keys(defaultEnvelopes).forEach(category => {
                    newEnvelopes[category] = {};
                    Object.keys(defaultEnvelopes[category]).forEach(name => {
                        const prevEnv = previousData.envelopes[category]?.[name];
                        if (prevEnv) {
                            const prevBudgeted = prevEnv.budgeted || 0;
                            const prevRollover = prevEnv.rollover || 0;
                            const prevSpent = prevEnv.spent || 0;
                            const prevAvailable = prevBudgeted + prevRollover - prevSpent;
                            
                            console.log(`${category}.${name} ROLLOVER CALCULATION:`);
                            console.log(`  Previous Budgeted: ${prevBudgeted}`);
                            console.log(`  Previous Rollover: ${prevRollover}`);
                            console.log(`  Previous Spent: ${prevSpent}`);
                            console.log(`  Previous Available: ${prevBudgeted} + ${prevRollover} - ${prevSpent} = ${prevAvailable}`);
                            console.log(`  New Rollover: ${Math.max(0, prevAvailable)}`);
                            console.log('---');
                        } else {
                            console.log(`${category}.${name} - No previous data, rollover = 0`);
                        }
                        
                        const prevAvailable = prevEnv ? (prevEnv.budgeted + (prevEnv.rollover || 0) - prevEnv.spent) : 0;
                        
                        newEnvelopes[category][name] = {
                            budgeted: 0
                        };
                    });
                });
                
                return {
                    income: 0,
                    envelopes: newEnvelopes,
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
        
        return {
            income: periodData.income || 0,
            envelopes: periodData.envelopes || defaultEnvelopes,
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
        const { amount, description, type } = incomeTransaction;

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
            envelope: type === 'loan' ? 'LOAN' : 'INCOME',
            amount: incomeAmount,
            description: sanitizeInput(description || (type === 'loan' ? 'Borrowed money' : 'Monthly Income')),
            paymentMethod: sanitizeInput(paymentMethod),
            type: type === 'loan' ? 'loan' : 'income'
        };

        try {
            // Only add to income if it's actual income, not a loan
            const newIncome = type === 'loan' ? income : income + incomeAmount;
            
            await updatePeriodData({
                income: newIncome,
                transactions: [...transactions, transactionRecord]
            });

            setIncomeTransaction({ amount: '', description: '', paymentMethod: incomeTransaction.paymentMethod, date: new Date().toISOString().split('T')[0], type: 'income' });
            setCustomIncomePayment('');
            showNotification('success', type === 'loan' ? '✓ Loan Added!' : '✓ Income Added!');
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
        // Enhanced haptic feedback
        if (type === 'success') {
            success();
        } else if (type === 'error') {
            error();
        } else {
            lightTap();
        }
        setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    };

    const getStatus = (envelope, category, name) => {
        // Available Balance = Budgeted + Rollover(calculated) - Spent(calculated)
        const rollover = getRolloverAmount(category, name);
        const spent = getSpentAmount(category, name);
        const available = envelope.budgeted + rollover - spent;
        const percentage = envelope.budgeted > 0 ? (spent / envelope.budgeted) * 100 : 0;
        
        // Console log calculation for debugging
        console.log(`${category}.${name} - Budgeted: ${envelope.budgeted}, Rollover: ${rollover}, Spent: ${spent}, Available: ${available}`);
        
        if (available <= 0) return { status: 'blocked', icon: '🚫', color: 'var(--danger)' };
        if (percentage >= 90) return { status: 'critical', icon: '⚠️', color: '#dc2626' };
        if (percentage >= 75) return { status: 'warning', icon: '⚡', color: 'var(--warning)' };
        if (percentage >= 50) return { status: 'moderate', icon: '📊', color: '#3b82f6' };
        return { status: 'healthy', icon: '✅', color: 'var(--success)' };
    };

    const getRolloverAmount = (category, name, forPeriod = currentPeriod) => {
        const targetPeriod = forPeriod || currentPeriod;
        const previousPeriod = getPreviousPeriod(targetPeriod);
        const previousData = monthlyData[previousPeriod];
        
        if (!previousData?.envelopes?.[category]?.[name]) return 0;
        
        const prevEnv = previousData.envelopes[category][name];
        // Calculate previous month's rollover recursively
        const prevRollover = getRolloverAmount(category, name, previousPeriod);
        const prevSpent = getSpentAmount(category, name, previousPeriod);
        const lastMonthBalance = prevEnv.budgeted + prevRollover - prevSpent;
        
        return Math.max(0, lastMonthBalance);
    };

    const getSpentAmount = (category, name, forPeriod = currentPeriod) => {
        const periodData = monthlyData[forPeriod];
        if (!periodData?.transactions) return 0;
        
        return periodData.transactions
            .filter(t => t.envelope === `${category}.${name}` && !t.type)
            .reduce((sum, t) => sum + t.amount, 0);
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

        const expenseAmount = parseFloat(amount);

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
            // Regular expense transaction - remove transaction only
            await updatePeriodData({
                transactions: transactions.filter(t => t.id !== id)
            });
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
        
        if (confirm(`Rollover unused funds to ${nextPeriod}?`)) {
            confirmRollover(nextPeriod);
        }
    };
    
    const resetCurrentMonth = async () => {
        if (!confirm(`Reset budget allocations for ${currentPeriod}? This will set all envelope budgets to zero but keep transactions.`)) {
            return;
        }
        
        const resetEnvelopes = {};
        Object.keys(envelopes).forEach(category => {
            resetEnvelopes[category] = {};
            Object.keys(envelopes[category]).forEach(name => {
                resetEnvelopes[category][name] = {
                    budgeted: 0
                };
            });
        });
        
        await updatePeriodData({
            envelopes: resetEnvelopes
        });
        
        showNotification('success', `${currentPeriod} budget allocations reset to zero`);
    };
    
    const confirmRollover = async (targetPeriod) => {
        try {
            const rolledOverEnvelopes = {};
            let totalRollover = 0;
            
            // Calculate rollover for all envelopes
            Object.keys(envelopes).forEach(category => {
                rolledOverEnvelopes[category] = {};
                Object.keys(envelopes[category]).forEach(name => {
                    const env = envelopes[category][name];
                    const unused = env.budgeted + env.rollover - env.spent;
                    const rolloverAmount = Math.max(0, unused);
                    
                    rolledOverEnvelopes[category][name] = {
                        budgeted: 0
                    };
                    
                    totalRollover += rolloverAmount;
                });
            });

            // Get existing target period data
            const existingData = monthlyData[targetPeriod];
            if (existingData?.envelopes) {
                Object.keys(rolledOverEnvelopes).forEach(category => {
                    Object.keys(rolledOverEnvelopes[category]).forEach(name => {
                        const existing = existingData.envelopes[category]?.[name];
                        if (existing) {
                            rolledOverEnvelopes[category][name].budgeted = existing.budgeted;
                        }
                    });
                });
            }

            // Update target period
            setMonthlyData(prev => ({
                ...prev,
                [targetPeriod]: {
                    income: existingData?.income || 0,
                    envelopes: rolledOverEnvelopes,
                    transactions: existingData?.transactions || [],
                    blockedTransactions: existingData?.blockedTransactions || []
                }
            }));

            setCurrentPeriod(targetPeriod);
            showNotification('success', `₹${totalRollover.toLocaleString()} rolled over to ${targetPeriod}`);
        } catch (error) {
            console.error('Rollover failed:', error);
            showNotification('error', 'Rollover failed');
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
                const status = getStatus(env, category, name);
                if (status.status === 'healthy') healthy.push(name);
                else if (status.status === 'blocked') blocked.push(name);
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
        transactions
            .filter(t => !t.type || t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0), 
        [transactions]
    );

    const getPaymentMethodBalances = useMemo(() => {
        const balances = {};
        
        // Get transactions based on current period selection
        let relevantTransactions = [];
        if (currentPeriod.match(/^\d{4}$/)) {
            // Year selected - get all transactions for that year
            relevantTransactions = Object.keys(monthlyData)
                .filter(period => period.startsWith(currentPeriod))
                .flatMap(period => monthlyData[period]?.transactions || []);
        } else {
            // Month selected - get only that month's transactions
            relevantTransactions = monthlyData[currentPeriod]?.transactions || [];
        }
        
        relevantTransactions.forEach(transaction => {
            const method = sanitizeInput(transaction.paymentMethod || 'Unknown');
            if (!balances[method]) balances[method] = 0;
            
            if (transaction.type === 'income' || transaction.type === 'transfer-in' || transaction.type === 'loan') {
                balances[method] += transaction.amount;
            } else if (transaction.type === 'transfer-out') {
                balances[method] -= transaction.amount;
            } else {
                balances[method] -= transaction.amount;
            }
        });
        return balances;
    }, [monthlyData, currentPeriod]);

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
                                   t.envelope === 'LOAN' ? 'LOAN' :
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
            else if (t.envelope === 'LOAN') envelopes.add('LOAN');
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
        <div 
            className="envelope-budget" 
            onTouchStart={swipeGesture.onTouchStart}
            onTouchMove={swipeGesture.onTouchMove}
            onTouchEnd={swipeGesture.onTouchEnd}
            style={pullToRefresh.isPulling ? { transform: `translateY(${pullToRefresh.pullDistance}px)` } : {}}
        >
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
                <div className="header-controls" style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                        <label style={{fontSize: '12px', fontWeight: '600'}}>Year</label>
                        <select
                            value={currentPeriod.match(/^\d{4}$/) ? currentPeriod : currentPeriod.split('-')[0]}
                            onChange={(e) => setCurrentPeriod(e.target.value)}
                            className="period-selector"
                        >
                            {generatePeriodOptions().filter(p => p.isYear).map(period => (
                                <option key={period.key} value={period.key}>
                                    {period.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                        <label style={{fontSize: '12px', fontWeight: '600'}}>Month</label>
                        <select
                            value={currentPeriod.match(/^\d{4}$/) ? '' : currentPeriod}
                            onChange={(e) => setCurrentPeriod(e.target.value || currentPeriod.split('-')[0])}
                            className="period-selector"
                        >
                            <option value="">All Months</option>
                            {generatePeriodOptions().filter(p => !p.isYear && p.key.startsWith(currentPeriod.match(/^\d{4}$/) ? currentPeriod : currentPeriod.split('-')[0])).map(period => (
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
                    className={`tab-btn touch-feedback ${activeView === 'quickadd' ? 'active' : ''}`}
                    onClick={() => setActiveView('quickadd')}
                >
                    ⚡ QuickAdd
                </button>
                <button
                    className={`tab-btn touch-feedback ${activeView === 'daily' ? 'active' : ''}`}
                    onClick={() => setActiveView('daily')}
                >
                    📋 Daily
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
                    className={`tab-btn touch-feedback ${activeView === 'yearly' ? 'active' : ''}`}
                    onClick={() => setActiveView('yearly')}
                >
                    📅 Yearly
                </button>
            </div>

            {notification.message && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            {activeView !== 'quickadd' && !currentPeriod.match(/^\d{4}$/) && (
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
                    <div className="summary-value">₹{(income - totalBudgeted).toLocaleString()}</div>
                    <div className="summary-label">Unallocated Budget</div>
                </div>
            </div>
            )}

            {/* Year Summary - Show when year is selected */}
            {currentPeriod.match(/^\d{4}$/) && activeView !== 'quickadd' && (() => {
                const year = currentPeriod;
                const yearData = { totalIncome: 0, totalBudgeted: 0, totalSpent: 0, months: {} };
                
                for (let m = 1; m <= 12; m++) {
                    const monthKey = `${year}-${String(m).padStart(2, '0')}`;
                    const data = monthlyData[monthKey];
                    if (data) {
                        yearData.totalIncome += data.income || 0;
                        if (data.envelopes) {
                            Object.values(data.envelopes).forEach(category => {
                                Object.values(category).forEach(env => {
                                    yearData.totalBudgeted += env.budgeted || 0;
                                });
                            });
                        }
                        if (data.transactions) {
                            data.transactions.forEach(t => {
                                if (!t.type || t.type === 'expense') {
                                    yearData.totalSpent += t.amount;
                                }
                            });
                        }
                    }
                }
                
                return (
                    <div className="summary-grid">
                        <div className="summary-card">
                            <div className="summary-value">₹{yearData.totalIncome.toLocaleString()}</div>
                            <div className="summary-label">Yearly Income</div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-value">₹{yearData.totalBudgeted.toLocaleString()}</div>
                            <div className="summary-label">Total Budgeted</div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-value">₹{yearData.totalSpent.toLocaleString()}</div>
                            <div className="summary-label">Total Spent</div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-value" style={{color: yearData.totalIncome - yearData.totalSpent >= 0 ? 'var(--success)' : 'var(--danger)'}}>₹{(yearData.totalIncome - yearData.totalSpent).toLocaleString()}</div>
                            <div className="summary-label">Net Savings</div>
                        </div>
                    </div>
                );
            })()}
            }

            {/* Payment Method Overview - Shows balances based on selected period */}
            {Object.keys(paymentBalances).length > 0 && (
                <div className="card payment-overview-compact">
                    <div className="card-header">
                        <h3>💳 Payment Methods Balance</h3>
                        <small style={{color: 'var(--gray-600)', fontSize: '0.8em'}}>Balance for {currentPeriod.match(/^\d{4}$/) ? `${currentPeriod} (Full Year)` : currentPeriod}</small>
                    </div>
                    <div className="card-content">
                        <div className="payment-methods-grid">
                            {Object.entries(paymentBalances).map(([method, amount]) => (
                                <div 
                                    key={method} 
                                    className="payment-method-item"
                                >
                                    <span className="payment-method-name">{method}</span>
                                    <span className="payment-method-balance" style={{
                                        color: amount >= 0 ? 'var(--success)' : 'var(--danger)',
                                        fontWeight: '600'
                                    }}>₹{amount.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Enhanced Spending Breakdown */}
            {activeView !== 'quickadd' && (
            <div className="card spending-insights-enhanced">
                <div className="card-header-enhanced">
                    <div className="header-content">
                        <h3>📊 Spending Breakdown</h3>
                        <div className="period-badge">{currentPeriod}</div>
                    </div>
                    <div className="total-spent-summary">
                        ₹{totalSpent.toLocaleString()} spent this month
                    </div>
                </div>
                <div className="card-content-enhanced">
                    {(() => {
                        const needsSpent = Object.keys(envelopes.needs || {}).reduce((sum, name) => sum + (getSpentAmount('needs', name) || 0), 0);
                        const wantsSpent = Object.keys(envelopes.wants || {}).reduce((sum, name) => sum + (getSpentAmount('wants', name) || 0), 0);
                        const savingsSpent = Object.keys(envelopes.savings || {}).reduce((sum, name) => sum + (getSpentAmount('savings', name) || 0), 0);
                        const total = needsSpent + wantsSpent + savingsSpent;
                        
                        const needsPercent = total > 0 ? ((needsSpent / total) * 100) : 0;
                        const wantsPercent = total > 0 ? ((wantsSpent / total) * 100) : 0;
                        const savingsPercent = total > 0 ? ((savingsSpent / total) * 100) : 0;
                        
                        if (total === 0) {
                            return (
                                <div className="no-spending-state">
                                    <div className="empty-chart-icon">📈</div>
                                    <h4>No spending data yet</h4>
                                    <p>Start adding expenses to see your spending breakdown</p>
                                </div>
                            );
                        }
                        
                        return (
                            <div className="spending-breakdown-enhanced">
                                <div className="chart-and-legend">
                                    <div className="enhanced-pie-container">
                                        <svg width="240" height="240" viewBox="0 0 240 240" className="enhanced-pie-chart">
                                            <defs>
                                                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                                                    <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="rgba(0,0,0,0.1)"/>
                                                </filter>
                                                <linearGradient id="needsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#10b981"/>
                                                    <stop offset="100%" stopColor="#059669"/>
                                                </linearGradient>
                                                <linearGradient id="wantsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#3b82f6"/>
                                                    <stop offset="100%" stopColor="#2563eb"/>
                                                </linearGradient>
                                                <linearGradient id="savingsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#f59e0b"/>
                                                    <stop offset="100%" stopColor="#d97706"/>
                                                </linearGradient>
                                            </defs>
                                            
                                            {/* Background circle */}
                                            <circle cx="120" cy="120" r="90" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2"/>
                                            
                                            {(() => {
                                                let currentAngle = -90; // Start from top
                                                const radius = 85;
                                                const centerX = 120;
                                                const centerY = 120;
                                                
                                                const createEnhancedPath = (startAngle, endAngle, gradient, category) => {
                                                    const start = (startAngle * Math.PI) / 180;
                                                    const end = (endAngle * Math.PI) / 180;
                                                    const x1 = centerX + radius * Math.cos(start);
                                                    const y1 = centerY + radius * Math.sin(start);
                                                    const x2 = centerX + radius * Math.cos(end);
                                                    const y2 = centerY + radius * Math.sin(end);
                                                    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
                                                    
                                                    return (
                                                        <g key={category} className={`pie-segment ${category}-segment`}>
                                                            <path
                                                                d={`M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                                                fill={gradient}
                                                                stroke="white"
                                                                strokeWidth="3"
                                                                filter="url(#shadow)"
                                                                className="pie-slice"
                                                            />
                                                        </g>
                                                    );
                                                };
                                                
                                                const segments = [];
                                                if (needsPercent > 0) {
                                                    segments.push(createEnhancedPath(currentAngle, currentAngle + (needsPercent * 3.6), 'url(#needsGradient)', 'needs'));
                                                    currentAngle += needsPercent * 3.6;
                                                }
                                                if (wantsPercent > 0) {
                                                    segments.push(createEnhancedPath(currentAngle, currentAngle + (wantsPercent * 3.6), 'url(#wantsGradient)', 'wants'));
                                                    currentAngle += wantsPercent * 3.6;
                                                }
                                                if (savingsPercent > 0) {
                                                    segments.push(createEnhancedPath(currentAngle, currentAngle + (savingsPercent * 3.6), 'url(#savingsGradient)', 'savings'));
                                                }
                                                
                                                return segments;
                                            })()
                                            }
                                            
                                            {/* Center circle with total */}
                                            <circle cx="120" cy="120" r="45" fill="white" stroke="#e2e8f0" strokeWidth="2" filter="url(#shadow)"/>
                                            <text x="120" y="115" textAnchor="middle" className="chart-center-label">Total</text>
                                            <text x="120" y="130" textAnchor="middle" className="chart-center-value">₹{total.toLocaleString()}</text>
                                        </svg>
                                    </div>
                                    
                                    <div className="chart-legend">
                                        <div className="legend-item needs-legend">
                                            <div className="legend-color"></div>
                                            <div className="legend-details">
                                                <div className="legend-label">🏠 Needs</div>
                                                <div className="legend-value">₹{needsSpent.toLocaleString()}</div>
                                                <div className="legend-percent">{needsPercent.toFixed(1)}%</div>
                                            </div>
                                        </div>
                                        
                                        <div className="legend-item wants-legend">
                                            <div className="legend-color"></div>
                                            <div className="legend-details">
                                                <div className="legend-label">🎯 Wants</div>
                                                <div className="legend-value">₹{wantsSpent.toLocaleString()}</div>
                                                <div className="legend-percent">{wantsPercent.toFixed(1)}%</div>
                                            </div>
                                        </div>
                                        
                                        <div className="legend-item savings-legend">
                                            <div className="legend-color"></div>
                                            <div className="legend-details">
                                                <div className="legend-label">💰 Savings</div>
                                                <div className="legend-value">₹{savingsSpent.toLocaleString()}</div>
                                                <div className="legend-percent">{savingsPercent.toFixed(1)}%</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="spending-insights-grid">
                                    <div className="insight-card needs-insight">
                                        <div className="insight-icon">🏠</div>
                                        <div className="insight-content">
                                            <div className="insight-title">Essential Needs</div>
                                            <div className="insight-amount">₹{needsSpent.toLocaleString()}</div>
                                            <div className="insight-bar">
                                                <div className="insight-fill needs-fill" style={{width: `${needsPercent}%`}}></div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="insight-card wants-insight">
                                        <div className="insight-icon">🎯</div>
                                        <div className="insight-content">
                                            <div className="insight-title">Lifestyle Wants</div>
                                            <div className="insight-amount">₹{wantsSpent.toLocaleString()}</div>
                                            <div className="insight-bar">
                                                <div className="insight-fill wants-fill" style={{width: `${wantsPercent}%`}}></div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="insight-card savings-insight">
                                        <div className="insight-icon">💰</div>
                                        <div className="insight-content">
                                            <div className="insight-title">Future Savings</div>
                                            <div className="insight-amount">₹{savingsSpent.toLocaleString()}</div>
                                            <div className="insight-bar">
                                                <div className="insight-fill savings-fill" style={{width: `${savingsPercent}%`}}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()
                    }
                </div>
            </div>
            )}

            {/* Year View - Show monthly breakdown when year is selected */}
            {currentPeriod.match(/^\d{4}$/) && activeView !== 'quickadd' && (
                <div className="card">
                    <div className="card-header">
                        <h3>📅 {currentPeriod} - Monthly Breakdown</h3>
                    </div>
                    <div className="card-content">
                        {(() => {
                            const year = currentPeriod;
                            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                            
                            return (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                        <thead>
                                            <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Month</th>
                                                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Income</th>
                                                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Budgeted</th>
                                                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Spent</th>
                                                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Savings</th>
                                                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {monthNames.map((monthName, idx) => {
                                                const monthNum = String(idx + 1).padStart(2, '0');
                                                const monthKey = `${year}-${monthNum}`;
                                                const monthData = monthlyData[monthKey];
                                                const hasData = !!monthData;
                                                
                                                let income = 0, budgeted = 0, spent = 0;
                                                if (monthData) {
                                                    income = monthData.income || 0;
                                                    if (monthData.envelopes) {
                                                        Object.values(monthData.envelopes).forEach(category => {
                                                            Object.values(category).forEach(env => {
                                                                budgeted += env.budgeted || 0;
                                                            });
                                                        });
                                                    }
                                                    if (monthData.transactions) {
                                                        monthData.transactions.forEach(t => {
                                                            if (!t.type || t.type === 'expense') {
                                                                spent += t.amount;
                                                            }
                                                        });
                                                    }
                                                }
                                                const savings = income - spent;
                                                
                                                return (
                                                    <tr key={monthNum} style={{ borderBottom: '1px solid #f1f5f9', background: hasData ? 'white' : '#fafafa' }}>
                                                        <td style={{ padding: '12px', fontWeight: hasData ? '600' : '400', color: hasData ? '#1f2937' : '#9ca3af' }}>{monthName}</td>
                                                        <td style={{ padding: '12px', textAlign: 'right', color: hasData ? '#3b82f6' : '#d1d5db' }}>₹{income.toLocaleString()}</td>
                                                        <td style={{ padding: '12px', textAlign: 'right', color: hasData ? '#f59e0b' : '#d1d5db' }}>₹{budgeted.toLocaleString()}</td>
                                                        <td style={{ padding: '12px', textAlign: 'right', color: hasData ? '#ef4444' : '#d1d5db' }}>₹{spent.toLocaleString()}</td>
                                                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: hasData ? (savings >= 0 ? '#10b981' : '#ef4444') : '#d1d5db' }}>₹{savings.toLocaleString()}</td>
                                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                                            <button
                                                                className="btn btn-primary"
                                                                onClick={() => setCurrentPeriod(monthKey)}
                                                                style={{ padding: '4px 12px', fontSize: '12px' }}
                                                            >
                                                                View
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* Conditional Views */}
            {activeView === 'quickadd' ? (
                <QuickAddOptimized
                    envelopes={envelopes}
                    customPaymentMethods={customPaymentMethods}
                    dateRange={dateRange}
                    onAddTransaction={addTransaction}
                    onShowNotification={showNotification}
                    transactions={transactions}
                    monthlyData={monthlyData}
                    currentPeriod={currentPeriod}
                    onTransferClick={() => setTransferModal({ show: true, from: '', to: '', amount: '' })}
                />
            ) : activeView === 'yearly' ? (
                <div className="card">
                    <div className="card-header">
                        <h3>📅 Yearly Summary</h3>
                    </div>
                    <div className="card-content">
                        {(() => {
                            const yearlyData = {};
                            Object.keys(monthlyData).forEach(period => {
                                const [year, month] = period.split('-');
                                if (!yearlyData[year]) {
                                    yearlyData[year] = { 
                                        totalIncome: 0, 
                                        totalBudgeted: 0, 
                                        totalSpent: 0, 
                                        months: {} 
                                    };
                                }
                                
                                const data = monthlyData[period];
                                const monthIncome = data.income || 0;
                                let monthBudgeted = 0;
                                let monthSpent = 0;
                                
                                if (data.envelopes) {
                                    Object.values(data.envelopes).forEach(category => {
                                        Object.values(category).forEach(env => {
                                            monthBudgeted += env.budgeted || 0;
                                        });
                                    });
                                }
                                
                                if (data.transactions) {
                                    data.transactions.forEach(t => {
                                        if (!t.type || t.type === 'expense') {
                                            monthSpent += t.amount;
                                        }
                                    });
                                }
                                
                                yearlyData[year].totalIncome += monthIncome;
                                yearlyData[year].totalBudgeted += monthBudgeted;
                                yearlyData[year].totalSpent += monthSpent;
                                yearlyData[year].months[month] = {
                                    income: monthIncome,
                                    budgeted: monthBudgeted,
                                    spent: monthSpent
                                };
                            });
                            
                            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                            
                            return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    {Object.keys(yearlyData).sort().reverse().map(year => {
                                        const data = yearlyData[year];
                                        return (
                                            <div key={year} style={{ border: '2px solid #e5e7eb', borderRadius: '12px', padding: '20px', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' }}>
                                                <h2 style={{ margin: '0 0 20px 0', color: '#1f2937', fontSize: '24px' }}>📆 {year}</h2>
                                                
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                                                    <div style={{ background: '#dbeafe', padding: '16px', borderRadius: '8px', border: '2px solid #3b82f6' }}>
                                                        <div style={{ fontSize: '12px', color: '#1e40af', fontWeight: '600', marginBottom: '4px' }}>Total Income</div>
                                                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e40af' }}>₹{data.totalIncome.toLocaleString()}</div>
                                                    </div>
                                                    <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '8px', border: '2px solid #f59e0b' }}>
                                                        <div style={{ fontSize: '12px', color: '#92400e', fontWeight: '600', marginBottom: '4px' }}>Total Budgeted</div>
                                                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#92400e' }}>₹{data.totalBudgeted.toLocaleString()}</div>
                                                    </div>
                                                    <div style={{ background: '#fee2e2', padding: '16px', borderRadius: '8px', border: '2px solid #ef4444' }}>
                                                        <div style={{ fontSize: '12px', color: '#991b1b', fontWeight: '600', marginBottom: '4px' }}>Total Spent</div>
                                                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#991b1b' }}>₹{data.totalSpent.toLocaleString()}</div>
                                                    </div>
                                                    <div style={{ background: data.totalIncome - data.totalSpent >= 0 ? '#d1fae5' : '#fee2e2', padding: '16px', borderRadius: '8px', border: `2px solid ${data.totalIncome - data.totalSpent >= 0 ? '#10b981' : '#ef4444'}` }}>
                                                        <div style={{ fontSize: '12px', color: data.totalIncome - data.totalSpent >= 0 ? '#065f46' : '#991b1b', fontWeight: '600', marginBottom: '4px' }}>Net Savings</div>
                                                        <div style={{ fontSize: '24px', fontWeight: '700', color: data.totalIncome - data.totalSpent >= 0 ? '#065f46' : '#991b1b' }}>₹{(data.totalIncome - data.totalSpent).toLocaleString()}</div>
                                                    </div>
                                                </div>
                                                
                                                <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>Monthly Breakdown</h4>
                                                <div style={{ overflowX: 'auto' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                                        <thead>
                                                            <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                                                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Month</th>
                                                                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Income</th>
                                                                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Budgeted</th>
                                                                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Spent</th>
                                                                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Savings</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {monthNames.map((monthName, idx) => {
                                                                const monthNum = String(idx + 1).padStart(2, '0');
                                                                const monthData = data.months[monthNum];
                                                                const hasData = !!monthData;
                                                                const income = monthData?.income || 0;
                                                                const budgeted = monthData?.budgeted || 0;
                                                                const spent = monthData?.spent || 0;
                                                                const savings = income - spent;
                                                                
                                                                return (
                                                                    <tr key={monthNum} style={{ borderBottom: '1px solid #f1f5f9', background: hasData ? 'white' : '#fafafa' }}>
                                                                        <td style={{ padding: '12px', fontWeight: hasData ? '600' : '400', color: hasData ? '#1f2937' : '#9ca3af' }}>{monthName}</td>
                                                                        <td style={{ padding: '12px', textAlign: 'right', color: hasData ? '#3b82f6' : '#d1d5db' }}>₹{income.toLocaleString()}</td>
                                                                        <td style={{ padding: '12px', textAlign: 'right', color: hasData ? '#f59e0b' : '#d1d5db' }}>₹{budgeted.toLocaleString()}</td>
                                                                        <td style={{ padding: '12px', textAlign: 'right', color: hasData ? '#ef4444' : '#d1d5db' }}>₹{spent.toLocaleString()}</td>
                                                                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: hasData ? (savings >= 0 ? '#10b981' : '#ef4444') : '#d1d5db' }}>₹{savings.toLocaleString()}</td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            ) : activeView === 'daily' ? (
                <>
                    {/* Last 10 Transactions */}
                    <TransactionsList
                        transactions={transactions}
                        onDeleteTransaction={deleteTransaction}
                        onUpdatePaymentMethod={updateTransactionPayment}
                        customPaymentMethods={customPaymentMethods}
                        title="📋 Last 10 Transactions"
                        limit={10}
                    />
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
                                            <option value="loan">Loan</option>
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
                                                                  transaction.type === 'loan' ? '🤝' :
                                                                  transaction.type === 'transfer-in' ? '⬅️' :
                                                                  transaction.type === 'transfer-out' ? '➡️' : '💸';
                                            const typeLabel = transaction.type === 'income' ? 'Income' : 
                                                            transaction.type === 'loan' ? 'Loan' :
                                                            transaction.type === 'transfer-in' ? 'Transfer In' :
                                                            transaction.type === 'transfer-out' ? 'Transfer Out' : 'Expense';
                                            return (
                                                <tr key={transaction.id}>
                                                    <td>{transaction.date}</td>
                                                    <td>{transactionType} {typeLabel}</td>
                                                    <td>{transaction.description}</td>
                                                    <td style={{textTransform: 'uppercase'}}>
                                                        {transaction.envelope === 'INCOME' ? 'INCOME' :
                                                         transaction.envelope === 'LOAN' ? 'LOAN' :
                                                         transaction.envelope === 'TRANSFER' ? 'TRANSFER' :
                                                         transaction.envelope.replace('.', ' - ')}
                                                    </td>
                                                    <td style={{
                                                        color: transaction.type === 'income' || transaction.type === 'loan' || transaction.type === 'transfer-in' ? 'var(--success)' : 'var(--danger)',
                                                        fontWeight: '600'
                                                    }}>
                                                        {transaction.type === 'income' || transaction.type === 'loan' || transaction.type === 'transfer-in' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
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
                                                                  transaction.type === 'loan' ? '🤝' :
                                                                  transaction.type === 'transfer-in' ? '⬅️' :
                                                                  transaction.type === 'transfer-out' ? '➡️' : '💸';
                                            const typeLabel = transaction.type === 'income' ? 'Income' : 
                                                            transaction.type === 'loan' ? 'Loan' :
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
                                                                color: transaction.type === 'income' || transaction.type === 'loan' || transaction.type === 'transfer-in' ? 'var(--success)' : 'var(--danger)',
                                                                fontWeight: '600'
                                                            }}>
                                                                {transaction.type === 'income' || transaction.type === 'loan' || transaction.type === 'transfer-in' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <div className="mobile-card-field">
                                                            <span className="mobile-card-label">Envelope</span>
                                                            <span className="mobile-card-value" style={{textTransform: 'uppercase'}}>
                                                                {transaction.envelope === 'INCOME' ? 'INCOME' :
                                                                 transaction.envelope === 'LOAN' ? 'LOAN' :
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
            ) : (
                <>
                    {/* Budget Controls */}
                    <div className="card">
                        <div className="card-header">
                            <h3>💼 Budget Controls</h3>
                        </div>
                        <div className="card-content">
                            <div className="control-group">
                                <label>Add Monthly Income / Loan</label>
                                <div className="income-form">
                                    <select
                                        value={incomeTransaction.type}
                                        onChange={(e) => setIncomeTransaction({...incomeTransaction, type: e.target.value})}
                                        className="income-input"
                                    >
                                        <option value="income">💵 Income</option>
                                        <option value="loan">🤝 Loan/Borrow</option>
                                    </select>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="₹ Amount"
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
                                        placeholder={incomeTransaction.type === 'loan' ? 'Description (e.g., Borrowed from Abhay)' : 'Description (e.g., Salary, Bonus)'}
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
                                        {incomeTransaction.type === 'loan' ? '➕ Add Loan' : '➕ Add Income'}
                                    </button>
                                </div>
                            </div>
                            <div className="budget-actions">
                                <button className="btn btn-info" onClick={() => setTransferModal({ show: true, from: '', to: '', amount: '' })}>
                                    🔄 Transfer
                                </button>
                                <button className="btn btn-secondary" onClick={exportData}>
                                    📤 Export
                                </button>
                                <button className="btn btn-warning" onClick={handleBackup}>
                                    💾 Backup All Data
                                </button>
                                <button className="btn btn-primary" onClick={rolloverToNextPeriod}>
                                    🔄 Rollover Unused Funds
                                </button>
                                <button className="btn btn-danger" onClick={resetCurrentMonth}>
                                    🗑️ Reset Current Month
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
                                        setActiveView('budget');
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

            {showQuickExpenseModal && (
                <div className="modal-overlay" onClick={() => {
                    setShowQuickExpenseModal(false);
                }}>
                    <div className="modal mobile-optimized quick-expense-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-enhanced">
                            <div className="modal-icon">💸</div>
                            <div className="modal-title-section">
                                <h2>Add Expense</h2>
                            </div>
                            <button 
                                className="modal-close-enhanced"
                                onClick={() => {
                                    setShowQuickExpenseModal(false);
                                }}
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-footer-actions">
                            <button 
                                className="btn btn-secondary btn-cancel"
                                onClick={() => {
                                    setShowQuickExpenseModal(false);
                                }}
                            >
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