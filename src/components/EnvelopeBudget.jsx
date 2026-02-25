import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { saveToLocalStorage, loadFromLocalStorage, getDefaultEnvelopes } from '../utils/localStorage';
import { addGlobalEnvelope, removeGlobalEnvelope } from '../utils/globalEnvelopes';
import { auth } from '../config/firebase';
import { saveData, getData } from '../services/database';
import { useSwipeGesture, usePullToRefresh } from '../hooks/useSwipeGesture';
import { sanitizeInput, sanitizeCSVData, validatePaymentMethod } from '../utils/sanitize';
import QuickAdd from './QuickAdd';
import UserProfile from './UserProfile';

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
    const [customPaymentMethods, setCustomPaymentMethods] = useState([]);
    const [notification, setNotification] = useState({ type: '', message: '' });
    const [deleteConfirm, setDeleteConfirm] = useState({ type: '', id: '', name: '' });
    const [transferModal, setTransferModal] = useState({ show: false, from: '', to: '', amount: '' });
    const [activeView, setActiveView] = useState('quickadd');
    const [swipeIndicator, setSwipeIndicator] = useState({ show: false, direction: '' });
    const [quickActionSheet, setQuickActionSheet] = useState(false);
    const [showUserProfile, setShowUserProfile] = useState(false);
    
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
    const [dataLoaded, setDataLoaded] = useState(false);

    // Get current period's data with simple calculation
    const getCurrentPeriodData = async () => {
        const defaultEnvelopes = await getDefaultEnvelopes();
        const periodData = monthlyData[currentPeriod];
        
        if (!periodData) {
            const previousPeriod = getPreviousPeriod(currentPeriod);
            const previousData = monthlyData[previousPeriod];
            
            if (previousData?.envelopes) {
                const newEnvelopes = {};
                Object.keys(defaultEnvelopes).forEach(category => {
                    newEnvelopes[category] = {};
                    Object.keys(defaultEnvelopes[category]).forEach(name => {
                        const prevEnv = previousData.envelopes[category]?.[name];
                        newEnvelopes[category][name] = {
                            budgeted: prevEnv?.budgeted || 0
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
            if (dataLoaded && Object.keys(monthlyData).length > 0) {
                const data = await getCurrentPeriodData();
                setCurrentData(data);
                
                if (!monthlyData[currentPeriod]) {
                    await updatePeriodData(data);
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
                const defaultEnvelopes = await getDefaultEnvelopes();
                if (savedData?.monthlyData && Object.keys(savedData.monthlyData).length > 0) {
                    setMonthlyData(savedData.monthlyData);
                    if (savedData.currentPeriod) {
                        setCurrentPeriod(savedData.currentPeriod);
                    }
                    sessionStorage.setItem('budgetCache', JSON.stringify(savedData));
                } else {
                    // Initialize with empty period data
                    const initialData = {
                        [currentPeriod]: {
                            income: 0,
                            envelopes: defaultEnvelopes,
                            transactions: [],
                            blockedTransactions: []
                        }
                    };
                    setMonthlyData(initialData);
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

    const addEnvelope = async (category, name) => {
        if (!category || !name.trim()) {
            showNotification('error', 'Enter category and envelope name');
            return;
        }

        const defaultEnvelopes = await getDefaultEnvelopes();
        if (defaultEnvelopes[category] && defaultEnvelopes[category][name.toLowerCase()]) {
            showNotification('error', 'Envelope already exists');
            return;
        }

        await addGlobalEnvelope(category, name.toLowerCase());
        
        const updatedEnvelopes = { ...envelopes };
        if (!updatedEnvelopes[category]) updatedEnvelopes[category] = {};
        updatedEnvelopes[category][name.toLowerCase()] = { budgeted: 0 };
        
        await updatePeriodData({ envelopes: updatedEnvelopes });
        showNotification('success', `✓ ${name} added!`);
    };

    const showNotification = (type, message) => {
        setNotification({ type, message });
        // Haptic feedback simulation
        if (navigator.vibrate) {
            navigator.vibrate(type === 'success' ? [50] : [100, 50, 100]);
        }
        setTimeout(() => setNotification({ type: '', message: '' }), 3000);
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
        await removeGlobalEnvelope(category, name);
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
            {!dataLoaded || Object.keys(envelopes).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="loading-spinner"></div>
                    <p>Loading data...</p>
                </div>
            ) : null}
            
            {dataLoaded && Object.keys(envelopes).length > 0 && activeView === 'quickadd' && (
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
                    income={income}
                />
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
        </div>
    );
};

export default EnvelopeBudget;