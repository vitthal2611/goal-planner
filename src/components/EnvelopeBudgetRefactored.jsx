import React, { useState, useEffect, lazy, Suspense } from 'react';
import { auth } from '../config/firebase';
import { useBudget } from '../features/budget/hooks/useBudget';
import { useEnvelopes } from '../features/envelopes/hooks/useEnvelopes';
import { useTransactions } from '../features/transactions/hooks/useTransactions';
import { usePaymentMethods } from '../features/payments/hooks/usePaymentMethods';
import { useNotification } from '../shared/hooks/useNotification';
import { useDataLoader } from '../shared/hooks/useDataLoader';
import { useApp } from '../core/context/AppContext';
import { useEnvelopeBudgetState } from '../hooks/useEnvelopeBudgetState';
import { usePeriodNavigation } from '../hooks/usePeriodNavigation';
import { useModalState } from '../hooks/useModalState';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { EnvelopeBudgetHeader } from './EnvelopeBudgetHeader';
import { EnvelopeBudgetModals } from './EnvelopeBudgetModals';
import QuickAdd from './QuickAdd';
import YearlyBudgetView from './yearview/YearlyBudgetView';
import './EnvelopeBudget.css';

const EnvelopeBudget = () => {
  const { state, dispatch } = useApp();
  const { currentPeriod, monthlyData } = state;
  const dataLoaded = useDataLoader(auth.currentUser?.uid);
  
  const { income, envelopes, allocate, increment, copyFromLastMonth } = useBudget();
  const { getBalance, create: createEnvelope, remove: removeEnvelope } = useEnvelopes();
  const { transactions, add: addTransaction, addIncome, transfer, remove: removeTransaction } = useTransactions();
  const { paymentMethods, add: addPaymentMethod, remove: removePaymentMethod } = usePaymentMethods();
  const { notification, show: showNotification } = useNotification();

  const budgetState = useEnvelopeBudgetState();
  const periodNav = usePeriodNavigation(currentPeriod, dispatch);
  const modals = useModalState();
  const [swipeIndicator, setSwipeIndicator] = useState({ show: false, direction: '' });

  useEffect(() => {
    const handleOpenProfile = () => budgetState.setShowUserProfile(true);
    window.addEventListener('openProfile', handleOpenProfile);
    return () => window.removeEventListener('openProfile', handleOpenProfile);
  }, []);

  useEffect(() => {
    budgetState.setSelectedYear(periodNav.currentYear);
  }, [currentPeriod]);

  const swipeGesture = useSwipeGesture(
    () => {
      budgetState.showSwipeIndicator('left');
      periodNav.handleChangePeriod('next');
    },
    () => {
      budgetState.showSwipeIndicator('right');
      periodNav.handleChangePeriod('prev');
    }
  );

  const handleTransfer = () => {
    try {
      const { from, to, amount } = modals.transferModal;
      transfer(from, to, amount);
      modals.closeTransferModal();
      showNotification('success', `₹${parseFloat(amount).toLocaleString()} transferred`);
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

  const handleDeleteTransaction = (id) => {
    const transaction = transactions.find(t => t.id === id);
    removeTransaction(id, transaction);
    showNotification('success', 'Transaction deleted');
  };

  const handleDeleteEnvelope = (category, name) => {
    removeEnvelope(category, name);
    showNotification('success', 'Envelope deleted');
  };

  const handleAddEnvelope = (category, name) => {
    try {
      createEnvelope(category, name);
      showNotification('success', `✓ ${name} added!`);
    } catch (error) {
      showNotification('error', error.message);
    }
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
      {budgetState.swipeIndicator.show && (
        <div className={`swipe-indicator ${budgetState.swipeIndicator.direction} show`}>
          {budgetState.swipeIndicator.direction === 'left' ? '← Next Period' : '→ Previous Period'}
        </div>
      )}

      <EnvelopeBudgetHeader
        currentPeriod={currentPeriod}
        selectedYear={budgetState.selectedYear}
        viewMode={budgetState.viewMode}
        onViewModeChange={budgetState.setViewMode}
        onYearChange={periodNav.handleChangeYear}
        onPeriodChange={periodNav.handleChangePeriod}
      />

      {notification.message && <div className={`notification ${notification.type}`}>{notification.message}</div>}

      {budgetState.viewMode === 'monthly' ? (
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
          onTransfer={() => modals.openTransferModal()}
          onAddEnvelope={handleAddEnvelope}
          onAllocateBudget={handleAllocate}
          onIncrementBudget={handleIncrement}
          onDeleteEnvelope={(cat, name) => modals.openDeleteConfirm('envelope', `${cat}.${name}`, name)}
          onCopyFromLastMonth={() => {
            try {
              copyFromLastMonth();
              showNotification('success', 'Budget copied from last month');
            } catch (error) {
              showNotification('error', error.message);
            }
          }}
          income={income}
        />
      ) : (
        <YearlyBudgetView selectedYear={budgetState.selectedYear} />
      )}

      <EnvelopeBudgetModals
        transferModal={modals.transferModal}
        onTransferModalClose={modals.closeTransferModal}
        onTransferModalUpdate={modals.updateTransferModal}
        onTransfer={handleTransfer}
        paymentMethods={paymentMethods}
        deleteConfirm={modals.deleteConfirm}
        onDeleteConfirmClose={modals.closeDeleteConfirm}
        onDeleteEnvelope={handleDeleteEnvelope}
        showUserProfile={budgetState.showUserProfile}
        onUserProfileClose={() => budgetState.setShowUserProfile(false)}
        user={auth.currentUser}
        paymentMethodsData={paymentMethods}
        envelopes={envelopes}
        transactions={transactions}
        onAddPaymentMethod={handleAddPaymentMethod}
        onDeletePaymentMethod={handleDeletePaymentMethod}
        onAddEnvelope={handleAddEnvelope}
        onShowNotification={showNotification}
      />
    </div>
  );
};

export default EnvelopeBudget;
