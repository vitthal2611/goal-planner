import React, { useState, useEffect, useMemo } from 'react';
import { useBudget } from '../contexts/BudgetContext.jsx';
import PaymentMethodsModal from './PaymentMethodsModal.jsx';
import IncomeForm from './IncomeForm.jsx';
import ExpenseForm from './ExpenseForm.jsx';
import TransferForm from './TransferForm.jsx';
import BudgetForm from './BudgetForm.jsx';
import TransactionsList from './TransactionsList.jsx';
import BudgetSummary from './BudgetSummary.jsx';

const Dashboard = () => {
  const { currentMonth, setCurrentMonth, dashboardData, loading, notification, loadDashboard } = useBudget();
  const [activeTab, setActiveTab] = useState('overview');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMonthChange = (newMonth) => {
    setCurrentMonth(newMonth);
    loadDashboard(newMonth);
  };

  const getPreviousMonth = () => {
    const [year, month] = currentMonth.split('-');
    const date = new Date(year, parseInt(month) - 2);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const getNextMonth = () => {
    const [year, month] = currentMonth.split('-');
    const date = new Date(year, parseInt(month));
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  if (loading) {
    return <div style={styles.loadingCenter}>Loading...</div>;
  }

  if (!dashboardData) {
    return <div style={styles.loadingCenter}>No data available</div>;
  }

  const { income, expenses, balance, transactions, budgets, paymentMethods } = dashboardData;

  return (
    <div style={styles.container}>
      {/* Notification */}
      {notification.message && (
        <div style={{
          ...styles.notification,
          backgroundColor: notification.type === 'error' ? '#fee' : '#efe',
          color: notification.type === 'error' ? '#c33' : '#363',
          borderColor: notification.type === 'error' ? '#fcc' : '#cfc',
        }}>
          {notification.message}
        </div>
      )}

      {/* Month Navigation */}
      <div style={styles.monthNav}>
        <button onClick={() => handleMonthChange(getPreviousMonth())} style={styles.navButton}>
          ← Prev
        </button>
        <div style={styles.monthDisplay}>{currentMonth}</div>
        <button onClick={() => handleMonthChange(getNextMonth())} style={styles.navButton}>
          Next →
        </button>
      </div>

      {/* Summary Cards */}
      <div style={isMobile ? styles.summaryGridMobile : styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Income</div>
          <div style={{ ...styles.summaryValue, color: '#28a745' }}>₹{income.toLocaleString()}</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Expenses</div>
          <div style={{ ...styles.summaryValue, color: '#dc3545' }}>₹{expenses.toLocaleString()}</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Balance</div>
          <div style={{ ...styles.summaryValue, color: balance >= 0 ? '#28a745' : '#dc3545' }}>
            ₹{balance.toLocaleString()}
          </div>
        </div>
        <div style={styles.summaryCard}>
          <button onClick={() => setShowPaymentModal(true)} style={styles.configButton}>
            💳 Payment Methods
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={styles.tabNav}>
        {[
          { key: 'overview', label: '📊 Overview' },
          { key: 'income', label: '💰 Income' },
          { key: 'expense', label: '💸 Expense' },
          { key: 'transfer', label: '🔄 Transfer' },
          { key: 'budget', label: '📋 Budget' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              ...styles.tabButton,
              borderBottomColor: activeTab === tab.key ? '#007bff' : 'transparent',
              color: activeTab === tab.key ? '#007bff' : '#666',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={styles.tabContent}>
        {activeTab === 'overview' && (
          <div>
            <h3 style={styles.sectionTitle}>Recent Transactions</h3>
            <TransactionsList transactions={transactions.slice(0, 10)} />
          </div>
        )}

        {activeTab === 'income' && <IncomeForm paymentMethods={paymentMethods} />}

        {activeTab === 'expense' && (
          <ExpenseForm paymentMethods={paymentMethods} envelopes={budgets.map(b => b.envelope)} />
        )}

        {activeTab === 'transfer' && <TransferForm paymentMethods={paymentMethods} />}

        {activeTab === 'budget' && <BudgetForm budgets={budgets} />}
      </div>

      {/* Budget Summary */}
      {budgets.length > 0 && (
        <div style={styles.budgetSummarySection}>
          <h3 style={styles.sectionTitle}>Budget Status</h3>
          <BudgetSummary budgets={budgets} />
        </div>
      )}

      {/* Payment Methods Modal */}
      {showPaymentModal && (
        <PaymentMethodsModal
          paymentMethods={paymentMethods}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '16px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  loadingCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    color: '#666',
  },
  notification: {
    padding: '12px',
    marginBottom: '16px',
    borderRadius: '8px',
    border: '1px solid',
    fontSize: '14px',
  },
  monthNav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    gap: '12px',
  },
  navButton: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  monthDisplay: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
    marginBottom: '24px',
  },
  summaryGridMobile: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginBottom: '24px',
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  summaryLabel: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '8px',
  },
  summaryValue: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
  configButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#6f42c1',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  tabNav: {
    display: 'flex',
    overflowX: 'auto',
    borderBottom: '1px solid #ddd',
    marginBottom: '24px',
    gap: '0',
  },
  tabButton: {
    padding: '12px 16px',
    border: 'none',
    backgroundColor: 'transparent',
    borderBottom: '2px solid',
    color: '#666',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    fontSize: '14px',
    transition: 'color 0.2s',
  },
  tabContent: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '24px',
  },
  sectionTitle: {
    margin: '0 0 16px 0',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
  },
  budgetSummarySection: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
};

export default Dashboard;
