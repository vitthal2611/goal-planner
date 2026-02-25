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
import EnvelopeStatusEnhanced from './EnvelopeStatusEnhanced';
import QuickAdd from './QuickAdd';
import PaymentMethodsManager from './PaymentMethodsManager';
import UserProfile from './UserProfile';

import './EnvelopeBudget.css';
import './MobileEnhancements.css';
import './SpendingBreakdown.css';
import './EnvelopeStatusEnhanced.css';

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
    const [activeView, setActiveView] = useState('quickadd'); // 'daily', 'spending', 'budget'
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [swipeIndicator, setSwipeIndicator] = useState({ show: false, direction: '' });
    const [quickActionSheet, setQuickActionSheet] = useState(false);
    const [selectedSpendingCategory, setSelectedSpendingCategory] = useState(null);
    const [preSelectedEnvelope, setPreSelectedEnvelope] = useState(null);
    const [showQuickExpenseModal, setShowQuickExpenseModal] = useState(false);
    const [showManagePaymentModal, setShowManagePaymentModal] = useState(false);
    const [showPaymentMethodsManager, setShowPaymentMethodsManager] = useState(false);
    const [showUserProfile, setShowUserProfile] = useState(false);
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
    const [bulkEditMode, setBulkEditMode] = useState(false);
    const [bulkEditValues, setBulkEditValues] = useState({});

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
            const user = auth.currentUser;
            if (!user) return;
            
            try {
                console.log('Loading data for:', user.uid);
                
                // PARALLEL LOADING - Load everything at once
                const [savedData, paymentMethodsResult] = await Promise.all([
                    loadFromLocalStorage(),
                    getData(`users/${user.uid}/paymentMethods`)
                ]);
                
                // Process budget data
                if (savedData?.monthlyData && Object.keys(savedData.monthlyData).length > 0) {
                    setMonthlyData(savedData.monthlyData);
                    if (savedData.currentPeriod) {
                        setCurrentPeriod(savedData.currentPeriod);
                    }
                    sessionStorage.setItem('budgetCache', JSON.stringify(savedData));
                }
                
                // Process payment methods
                if (paymentMethodsResult.success && paymentMethodsResult.data) {
                    setCustomPaymentMethods(paymentMethodsResult.data);
                } else {
                    const defaultMethods = ['Cash', 'UPI', 'Credit Card', 'Debit Card'];
                    setCustomPaymentMethods(defaultMethods);
                    saveData(`users/${user.uid}/paymentMethods`, defaultMethods);
                }
                
                setDataLoaded(true);
            } catch (error) {
                console.error('Error loading data:', error);
                setDataLoaded(true);
            }
        };
        
        // Check if user is already authenticated (from App.jsx)
        if (auth.currentUser) {
            loadData();
        }
        
        // Listen for profile open event
        const handleOpenProfile = () => setShowUserProfile(true);
        window.addEventListener('openProfile', handleOpenProfile);
        
        return () => {
            window.removeEventListener('openProfile', handleOpenProfile);
        };
    }, []);

    const saveLocalData = useCallback(async () => {
        try {
            // Only save if data is loaded and we have actual data
            if (dataLoaded && Object.keys(monthlyData).length > 0) {
                console.log('Saving data:', { monthlyData, currentPeriod });
                const dataToSave = { monthlyData, currentPeriod };
                await saveToLocalStorage(dataToSave);
                // Update cache for instant loading next time
                sessionStorage.setItem('budgetCache', JSON.stringify(dataToSave));
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
            const updatedMethods = [...customPaymentMethods, sanitizedMethod].sort((a, b) => a.localeCompare(b));
            setCustomPaymentMethods(updatedMethods);
            
            // Save to Firebase
            const user = auth.currentUser;
            if (user) {
                try {
                    await saveData(`users/${user.uid}/paymentMethods`, updatedMethods);
                    showNotification('success', `${sanitizedMethod} added`);
                } catch (error) {
                    console.error('Failed to save payment method:', error);
                    showNotification('error', 'Failed to save payment method');
                }
            }
        }
    };

    const deletePaymentMethod = async (method) => {
        // Check if payment method is used in any transaction
        const isUsed = transactions.some(t => t.paymentMethod === method);
        if (isUsed) {
            showNotification('error', `Cannot delete ${method}. It is used in transactions.`);
            return;
        }
        
        const updatedMethods = customPaymentMethods.filter(m => m !== method);
        setCustomPaymentMethods(updatedMethods);
        
        // Save to Firebase
        const user = auth.currentUser;
        if (user) {
            try {
                await saveData(`users/${user.uid}/paymentMethods`, updatedMethods);
                showNotification('success', `${method} deleted`);
            } catch (error) {
                console.error('Failed to delete payment method:', error);
                showNotification('error', 'Failed to delete payment method');
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
        
        if (!paymentMethod) {
            showNotification('error', 'Select payment method');
            return;
        }
        
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

        if (!paymentMethod) {
            showNotification('error', 'Select payment method');
            return;
        }

        const [category, name] = envelope.split('.');
        const env = envelopes[category]?.[name];

        if (!env) {
            showNotification('error', 'Invalid envelope');
            return;
        }

        const available = env.budgeted + getRolloverAmount(category, name) - getSpentAmount(category, name);
        const expenseAmount = parseFloat(amount);

        if (available < expenseAmount) {
            showNotification('error', 'Insufficient funds!');
            return;
        }

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
            showNotification('error', 'Step 1: Add income first!');
            document.querySelector('.income-input')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
        } else if (deleteConfirm.type === 'paymentMethod') {
            deletePaymentMethod(deleteConfirm.id);
        }
        setDeleteConfirm({ type: '', id: '', name: '' });
    };

    const getNextBudgetPeriod = (currentPeriodStr) => {
        const [year, month] = currentPeriodStr.split('-').map(Number);
        
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? year + 1 : year;
        
        return `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
    };

    const copyFromLastMonth = async () => {
        const previousPeriod = getPreviousPeriod(currentPeriod);
        const previousData = monthlyData[previousPeriod];
        
        if (!previousData?.envelopes) {
            showNotification('error', 'No budget data found in previous month');
            return;
        }
        
        const copiedEnvelopes = {};
        Object.keys(envelopes).forEach(category => {
            copiedEnvelopes[category] = {};
            Object.keys(envelopes[category]).forEach(name => {
                const prevBudget = previousData.envelopes[category]?.[name]?.budgeted || 0;
                copiedEnvelopes[category][name] = {
                    budgeted: prevBudget
                };
            });
        });
        
        await updatePeriodData({ envelopes: copiedEnvelopes });
        showNotification('success', `Budget copied from ${previousPeriod}`);
    };
    
    const toggleBulkEditMode = () => {
        if (bulkEditMode) {
            setBulkEditValues({});
        } else {
            const initialValues = {};
            Object.keys(envelopes).forEach(category => {
                Object.keys(envelopes[category]).forEach(name => {
                    initialValues[`${category}.${name}`] = envelopes[category][name].budgeted;
                });
            });
            setBulkEditValues(initialValues);
        }
        setBulkEditMode(!bulkEditMode);
    };
    
    const saveBulkEdit = async () => {
        const updatedEnvelopes = { ...envelopes };
        let totalAllocated = 0;
        
        Object.keys(bulkEditValues).forEach(key => {
            const [category, name] = key.split('.');
            const amount = parseFloat(bulkEditValues[key]) || 0;
            totalAllocated += amount;
        });
        
        if (totalAllocated > income) {
            showNotification('error', `Total allocation (₹${totalAllocated.toLocaleString()}) exceeds income (₹${income.toLocaleString()})`);
            return;
        }
        
        Object.keys(bulkEditValues).forEach(key => {
            const [category, name] = key.split('.');
            const amount = parseFloat(bulkEditValues[key]) || 0;
            updatedEnvelopes[category][name] = {
                ...updatedEnvelopes[category][name],
                budgeted: amount
            };
        });
        
        await updatePeriodData({ envelopes: updatedEnvelopes });
        setBulkEditMode(false);
        setBulkEditValues({});
        showNotification('success', 'All budgets updated');
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

    const spendingTrend = useMemo(() => {
        const previousPeriod = getPreviousPeriod(currentPeriod);
        const previousData = monthlyData[previousPeriod];
        
        if (!previousData?.transactions) return null;
        
        const previousSpent = previousData.transactions
            .filter(t => !t.type || t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        if (previousSpent === 0) return null;
        
        const change = totalSpent - previousSpent;
        const percentChange = ((change / previousSpent) * 100).toFixed(1);
        
        return {
            change,
            percentChange,
            isIncrease: change > 0
        };
    }, [monthlyData, currentPeriod, totalSpent]);

    const getPaymentMethodBalances = useMemo(() => {
        const balances = {};
        
        // Get transactions from current period only
        const currentTransactions = transactions || [];
        
        currentTransactions.forEach(transaction => {
            const method = sanitizeInput(transaction.paymentMethod || '');
            if (!method) return; // Skip transactions without payment method
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
        <div className="envelope-budget" {...swipeGesture}>
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
                    <label>Budget Period</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                            onClick={() => setCurrentPeriod(getPreviousPeriod(currentPeriod))}
                            className="btn btn-secondary"
                            style={{ padding: '8px 12px', minWidth: 'auto' }}
                            title="Previous month"
                        >
                            ←
                        </button>
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
                        <button
                            onClick={() => setCurrentPeriod(getNextBudgetPeriod(currentPeriod))}
                            className="btn btn-secondary"
                            style={{ padding: '8px 12px', minWidth: 'auto' }}
                            title="Next month"
                        >
                            →
                        </button>
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
            </div>

            {notification.message && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            {/* Conditional Views */}
            <QuickAdd
                    envelopes={envelopes}
                    customPaymentMethods={customPaymentMethods}
                    dateRange={dateRange}
                    onAddTransaction={addTransaction}
                    onShowNotification={showNotification}
                    transactions={transactions}
                    monthlyData={monthlyData}
                    currentPeriod={currentPeriod}
                    onAddIncome={(incomeData) => {
                        const transactionRecord = {
                            id: Date.now() + Math.random(),
                            date: new Date().toISOString().split('T')[0],
                            envelope: 'INCOME',
                            amount: incomeData.amount,
                            description: incomeData.description,
                            paymentMethod: incomeData.paymentMethod,
                            type: 'income'
                        };
                        updatePeriodData({
                            income: income + incomeData.amount,
                            transactions: [...transactions, transactionRecord]
                        });
                        showNotification('success', '✓ Income Added!');
                    }}
                    onAddCustomPaymentMethod={addCustomPaymentMethod}
                    onDeleteTransaction={deleteTransaction}
                    onTransfer={() => setTransferModal({ show: true, from: '', to: '', amount: '' })}
                    onAddEnvelope={addEnvelope}
                    onAllocateBudget={allocateBudget}
                    onIncrementBudget={incrementBudget}
                    onDeleteEnvelope={(category, name) => setDeleteConfirm({ type: 'envelope', id: `${category}.${name}`, name })}
                    onCopyFromLastMonth={copyFromLastMonth}
                    onSaveBulkEdit={saveBulkEdit}
                    income={income}
                />
            ) : null}

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

{showQuickExpenseModal && (
                <div className="modal-overlay" onClick={() => {
                    setShowQuickExpenseModal(false);
                    setPreSelectedEnvelope(null);
                }}>
                    <div className="modal mobile-optimized quick-expense-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-enhanced">
                            <div className="modal-icon">💸</div>
                            <div className="modal-title-section">
                                <h2>Add Expense</h2>
                                {preSelectedEnvelope && (
                                    <div className="envelope-name-display">
                                        {preSelectedEnvelope.split('.')[1].toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <button 
                                className="modal-close-enhanced"
                                onClick={() => {
                                    setShowQuickExpenseModal(false);
                                    setPreSelectedEnvelope(null);
                                }}
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>
                        <QuickExpenseForm
                            envelopes={envelopes}
                            customPaymentMethods={customPaymentMethods}
                            dateRange={dateRange}
                            onAddTransaction={(transactionData) => {
                                addTransaction(transactionData);
                                setShowQuickExpenseModal(false);
                                setPreSelectedEnvelope(null);
                            }}
                            onAddCustomPaymentMethod={addCustomPaymentMethod}
                            onShowNotification={showNotification}
                            onTransfer={() => {
                                setShowQuickExpenseModal(false);
                                setTransferModal({ show: true, from: '', to: '', amount: '' });
                            }}
                            preSelectedEnvelope={preSelectedEnvelope}
                            hideSubmitButton={true}
                        />
                        <div className="modal-footer-actions">
                            <button 
                                className="btn btn-secondary btn-cancel"
                                onClick={() => {
                                    setShowQuickExpenseModal(false);
                                    setPreSelectedEnvelope(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                className="btn btn-success btn-add"
                                onClick={() => {
                                    const form = document.querySelector('.quick-expense-modal .quick-add-btn');
                                    if (form) form.click();
                                }}
                            >
                                ➕ Add Expense
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

            {showPaymentMethodsManager && (
                <div className="modal-overlay" onClick={() => setShowPaymentMethodsManager(false)}>
                    <div onClick={(e) => e.stopPropagation()}>
                        <PaymentMethodsManager
                            paymentMethods={customPaymentMethods}
                            onAdd={addCustomPaymentMethod}
                            onDelete={(method) => {
                                const isUsed = transactions.some(t => t.paymentMethod === method);
                                if (isUsed) {
                                    showNotification('error', `Cannot delete ${method}. It is used in transactions.`);
                                } else {
                                    deletePaymentMethod(method);
                                }
                            }}
                            transactions={transactions}
                            onClose={() => setShowPaymentMethodsManager(false)}
                        />
                    </div>
                </div>
            )}

            {showUserProfile && (
                <div className="modal-overlay" onClick={() => setShowUserProfile(false)}>
                    <div onClick={(e) => e.stopPropagation()}>
                        <UserProfile
                            user={auth.currentUser}
                            paymentMethods={customPaymentMethods}
                            envelopes={envelopes}
                            transactions={transactions}
                            onAddPaymentMethod={addCustomPaymentMethod}
                            onDeletePaymentMethod={(method) => {
                                const isUsed = transactions.some(t => t.paymentMethod === method);
                                if (isUsed) {
                                    showNotification('error', `Cannot delete ${method}. It is used in transactions.`);
                                } else {
                                    deletePaymentMethod(method);
                                }
                            }}
                            onAddEnvelope={addEnvelope}
                            onDeleteEnvelope={deleteEnvelope}
                            onClose={() => setShowUserProfile(false)}
                            onShowNotification={showNotification}
                        />
                    </div>
                </div>
            )}

            {showManagePaymentModal && (
                <div className="modal-overlay" onClick={() => setShowManagePaymentModal(false)}>
                    <div className="modal mobile-optimized" onClick={(e) => e.stopPropagation()}>
                        <button 
                            className="modal-close"
                            onClick={() => setShowManagePaymentModal(false)}
                            aria-label="Close modal"
                        >
                            ×
                        </button>
                        <h3>💳 Manage Payment Methods</h3>
                        <div style={{ margin: '20px 0' }}>
                            {customPaymentMethods.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#6b7280' }}>No payment methods yet</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {customPaymentMethods.sort((a, b) => a.localeCompare(b)).map(method => {
                                        const isUsed = transactions.some(t => t.paymentMethod === method);
                                        return (
                                            <div key={method} style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '12px',
                                                background: '#f9fafb',
                                                borderRadius: '8px',
                                                border: '1px solid #e5e7eb'
                                            }}>
                                                <span style={{ fontWeight: '600' }}>{method}</span>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => {
                                                        setShowManagePaymentModal(false);
                                                        setDeleteConfirm({ type: 'paymentMethod', id: method, name: method });
                                                    }}
                                                    disabled={isUsed}
                                                    title={isUsed ? 'Cannot delete - used in transactions' : 'Delete payment method'}
                                                    style={{ opacity: isUsed ? 0.3 : 1, cursor: isUsed ? 'not-allowed' : 'pointer' }}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowManagePaymentModal(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnvelopeBudget;