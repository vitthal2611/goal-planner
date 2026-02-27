import React, { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { useBudget } from '../features/budget/hooks/useBudget';
import { useEnvelopes } from '../features/envelopes/hooks/useEnvelopes';
import { useTransactions } from '../features/transactions/hooks/useTransactions';
import { usePaymentMethods } from '../features/payments/hooks/usePaymentMethods';
import { useNotification } from '../shared/hooks/useNotification';
import { useDataLoader } from '../shared/hooks/useDataLoader';
import { useApp } from '../core/context/AppContext';
import QuickAdd from './QuickAdd';
import YearlyBudgetView from './yearview/YearlyBudgetView';
import UserProfile from './UserProfile';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import './EnvelopeBudget.css';

const EnvelopeBudget = () => {
  const { state, dispatch } = useApp();
  const { currentPeriod, monthlyData } = state;
  const dataLoaded = useDataLoader(auth.currentUser?.uid);
  
  const { income, envelopes, allocate, increment, copyFromLastMonth, updateIncome } = useBudget();
  const { getBalance, create: createEnvelope, remove: removeEnvelope } = useEnvelopes();
  const { transactions, add: addTransaction, addIncome, transfer, remove: removeTransaction } = useTransactions();
  const { paymentMethods, add: addPaymentMethod, remove: removePaymentMethod } = usePaymentMethods();
  const { notification, show: showNotification } = useNotification();

  const [activeTab, setActiveTab] = useState('monthly');
  const [viewMode, setViewMode] = useState('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [transferModal, setTransferModal] = useState({ show: false, from: '', to: '', amount: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ type: '', id: '', name: '' });
  const [swipeIndicator, setSwipeIndicator] = useState({ show: false, direction: '' });

  useEffect(() => {
    const handleOpenProfile = () => setShowUserProfile(true);
    window.addEventListener('openProfile', handleOpenProfile);
    return () => window.removeEventListener('openProfile', handleOpenProfile);
  }, []);

  useEffect(() => {
    const [year] = currentPeriod.split('-').map(Number);
    setSelectedYear(year);
  }, [currentPeriod]);

  const handleAllocate = (category, name, amount) => {
    try {
      allocate(category, name, amount);
    } catch (error) {
      showNotification('error', error.message);
    }
  };

  const handleIncrement = (category, name, amount) => {
    try {
      increment(category, name, amount);
      showNotification('success', `✓ ${name.toUpperCase()} budget increased by ₹${parseFloat(amount).toLocaleString()}`);
    } catch (error) {
      showNotification('error', error.message);
    }
  };

  const handleAddTransaction = (data) => {
    try {
      addTransaction(data);
      showNotification('success', '✓ Added!');
    } catch (error) {
      showNotification('error', error.message);
    }
  };

  const handleAddIncome = (data) => {
    try {
      addIncome(data, income);
      showNotification('success', '✓ Income Added!');
    } catch (error) {
      showNotification('error', error.message);
    }
  };

  const handleTransfer = () => {
    try {
      const { from, to, amount } = transferModal;
      transfer(from, to, amount);
      setTransferModal({ show: false, from: '', to: '', amount: '' });
      showNotification('success', `₹${parseFloat(amount).toLocaleString()} transferred from ${from} to ${to}`);
    } catch (error) {
      showNotification('error', error.message);
    }
  };

  const handleAddEnvelope = (category, name) => {
    try {
      createEnvelope(category, name);
      showNotification('success', `✓ ${name} added!`);
    } catch (error) {
      showNotification('error', error.message);
    }
  };

  const handleDeleteTransaction = (id) => {
    const transaction = transactions.find(t => t.id === id);
    removeTransaction(id, transaction);
    showNotification('success', 'Transaction deleted');
  };

  const handleDeleteEnvelope = (category, name) => {
    removeEnvelope(category, name);
    showNotification('success', 'Envelope deleted');
  };

  const handleAddPaymentMethod = async (method) => {
    try {
      await addPaymentMethod(method, auth.currentUser.uid);
      showNotification('success', `${method} added`);
    } catch (error) {
      showNotification('error', error.message);
    }
  };

  const handleDeletePaymentMethod = async (method) => {
    try {
      await removePaymentMethod(method, auth.currentUser.uid);
      showNotification('success', `${method} deleted`);
    } catch (error) {
      showNotification('error', error.message);
    }
  };

  const handleCopyFromLastMonth = () => {
    try {
      copyFromLastMonth();
      showNotification('success', 'Budget copied from last month');
    } catch (error) {
      showNotification('error', error.message);
    }
  };

  const changePeriod = (direction) => {
    const [year, month] = currentPeriod.split('-').map(Number);
    const newMonth = direction === 'next' ? (month === 12 ? 1 : month + 1) : (month === 1 ? 12 : month - 1);
    const newYear = direction === 'next' ? (month === 12 ? year + 1 : year) : (month === 1 ? year - 1 : year);
    
    // Don't go before January 2026
    if (newYear < 2026) return;
    
    setSelectedYear(newYear);
    dispatch({ type: 'SET_CURRENT_PERIOD', payload: `${newYear}-${String(newMonth).padStart(2, '0')}` });
  };

  const swipeGesture = useSwipeGesture(
    () => {
      setSwipeIndicator({ show: true, direction: 'left' });
      setTimeout(() => setSwipeIndicator({ show: false, direction: '' }), 500);
      changePeriod('next');
    },
    () => {
      setSwipeIndicator({ show: true, direction: 'right' });
      setTimeout(() => setSwipeIndicator({ show: false, direction: '' }), 500);
      changePeriod('prev');
    }
  );

  const generatePeriodOptions = () => {
    const periods = [];
    const startYear = new Date().getFullYear();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 0; i <= 36; i++) {
      const date = new Date(startYear, i, 1);
      const year = date.getFullYear();
      const month = date.getMonth();
      periods.push({
        key: `${year}-${String(month + 1).padStart(2, '0')}`,
        label: `${monthNames[month]} ${year}`
      });
    }
    return periods;
  };

  if (!dataLoaded) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div className="loading-spinner"></div>
        <p>Loading data...</p>
      </div>
    );
  }

  return (
    <div className="envelope-budget" {...swipeGesture}>
      {swipeIndicator.show && (
        <div className={`swipe-indicator ${swipeIndicator.direction} show`}>
          {swipeIndicator.direction === 'left' ? '← Next Period' : '→ Previous Period'}
        </div>
      )}

      <div className="header">
        <h1>💰 Envelope Budget Tracker - {currentPeriod.split('-')[1] === '01' ? 'January' : currentPeriod.split('-')[1] === '02' ? 'February' : currentPeriod.split('-')[1] === '03' ? 'March' : currentPeriod.split('-')[1] === '04' ? 'April' : currentPeriod.split('-')[1] === '05' ? 'May' : currentPeriod.split('-')[1] === '06' ? 'June' : currentPeriod.split('-')[1] === '07' ? 'July' : currentPeriod.split('-')[1] === '08' ? 'August' : currentPeriod.split('-')[1] === '09' ? 'September' : currentPeriod.split('-')[1] === '10' ? 'October' : currentPeriod.split('-')[1] === '11' ? 'November' : 'December'} {currentPeriod.split('-')[0]}</h1>
        <div className="period-controls">
          <div className="year-selector-group">
            <label>Year:</label>
            <select 
              value={selectedYear}
              onChange={(e) => {
                const year = parseInt(e.target.value);
                setSelectedYear(year);
                if (viewMode === 'monthly') {
                  const [, month] = currentPeriod.split('-');
                  dispatch({ type: 'SET_CURRENT_PERIOD', payload: `${year}-${month}` });
                }
              }}
              className="period-selector"
            >
              {Array.from({ length: 5 }, (_, i) => 2026 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div className="view-toggle">
            <button 
              className={`toggle-option ${viewMode === 'monthly' ? 'active' : ''}`}
              onClick={() => setViewMode('monthly')}
            >
              📅 Monthly
            </button>
            <button 
              className={`toggle-option ${viewMode === 'annual' ? 'active' : ''}`}
              onClick={() => setViewMode('annual')}
            >
              📊 Annual
            </button>
          </div>

          {viewMode === 'monthly' && (
            <div className="month-selector-group">
              <label>Month:</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button onClick={() => changePeriod('prev')} className="btn btn-secondary" style={{ padding: '8px 12px', minWidth: 'auto' }}>←</button>
                <div style={{ minWidth: '150px', textAlign: 'center', fontWeight: 'bold' }}>
                  {currentPeriod.split('-')[1] === '01' ? 'January' : currentPeriod.split('-')[1] === '02' ? 'February' : currentPeriod.split('-')[1] === '03' ? 'March' : currentPeriod.split('-')[1] === '04' ? 'April' : currentPeriod.split('-')[1] === '05' ? 'May' : currentPeriod.split('-')[1] === '06' ? 'June' : currentPeriod.split('-')[1] === '07' ? 'July' : currentPeriod.split('-')[1] === '08' ? 'August' : currentPeriod.split('-')[1] === '09' ? 'September' : currentPeriod.split('-')[1] === '10' ? 'October' : currentPeriod.split('-')[1] === '11' ? 'November' : 'December'} {currentPeriod.split('-')[0]}
                </div>
                <button onClick={() => changePeriod('next')} className="btn btn-secondary" style={{ padding: '8px 12px', minWidth: 'auto' }}>→</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {notification.message && <div className={`notification ${notification.type}`}>{notification.message}</div>}

      {viewMode === 'monthly' ? (
        <QuickAdd
        envelopes={envelopes}
        customPaymentMethods={paymentMethods}
        dateRange={{ min: `${currentPeriod}-01`, max: `${currentPeriod}-31` }}
        onAddTransaction={handleAddTransaction}
        onShowNotification={showNotification}
        transactions={transactions}
        monthlyData={monthlyData}
        currentPeriod={currentPeriod}
        onAddIncome={handleAddIncome}
        onAddCustomPaymentMethod={handleAddPaymentMethod}
        onDeleteTransaction={handleDeleteTransaction}
        onTransfer={() => setTransferModal({ show: true, from: '', to: '', amount: '' })}
        onAddEnvelope={handleAddEnvelope}
        onAllocateBudget={handleAllocate}
        onIncrementBudget={handleIncrement}
        onDeleteEnvelope={(cat, name) => setDeleteConfirm({ type: 'envelope', id: `${cat}.${name}`, name })}
        onCopyFromLastMonth={handleCopyFromLastMonth}
        income={income}
      />
      ) : (
        <YearlyBudgetView selectedYear={selectedYear} />
      )}

      {transferModal.show && (
        <div className="modal-overlay" onClick={() => setTransferModal({ show: false, from: '', to: '', amount: '' })}>
          <div className="modal mobile-optimized" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setTransferModal({ show: false, from: '', to: '', amount: '' })}>×</button>
            <h3>🔄 Transfer Between Payment Methods</h3>
            <div style={{ margin: '20px 0' }}>
              <div style={{ marginBottom: '15px' }}>
                <label>From:</label>
                <select value={transferModal.from} onChange={(e) => setTransferModal({ ...transferModal, from: e.target.value })} style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
                  <option value="">Select source</option>
                  {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>To:</label>
                <select value={transferModal.to} onChange={(e) => setTransferModal({ ...transferModal, to: e.target.value })} style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
                  <option value="">Select destination</option>
                  {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Amount:</label>
                <input type="number" step="0.01" min="0" placeholder="₹ Amount" value={transferModal.amount} onChange={(e) => setTransferModal({ ...transferModal, amount: e.target.value })} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setTransferModal({ show: false, from: '', to: '', amount: '' })}>Cancel</button>
              <button className="btn btn-success" onClick={handleTransfer}>Transfer</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm.type && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm({ type: '', id: '', name: '' })}>
          <div className="modal mobile-optimized" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setDeleteConfirm({ type: '', id: '', name: '' })}>×</button>
            <h3>Confirm Delete</h3>
            <p>Delete {deleteConfirm.type} "{deleteConfirm.name}"?</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm({ type: '', id: '', name: '' })}>Cancel</button>
              <button className="btn btn-danger" onClick={() => {
                const [cat, name] = deleteConfirm.id.split('.');
                handleDeleteEnvelope(cat, name);
                setDeleteConfirm({ type: '', id: '', name: '' });
              }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showUserProfile && (
        <div className="modal-overlay" onClick={() => setShowUserProfile(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <UserProfile
              user={auth.currentUser}
              paymentMethods={paymentMethods}
              envelopes={envelopes}
              transactions={transactions}
              onAddPaymentMethod={handleAddPaymentMethod}
              onDeletePaymentMethod={handleDeletePaymentMethod}
              onAddEnvelope={handleAddEnvelope}
              onDeleteEnvelope={handleDeleteEnvelope}
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
