import React, { useContext, useState } from 'react';
import { BudgetContext } from '../contexts/BudgetContext.jsx';
import IncomeForm from './IncomeForm.jsx';
import ExpenseForm from './ExpenseForm.jsx';
import TransferForm from './TransferForm.jsx';
import BudgetForm from './BudgetForm.jsx';
import TransactionsList from './TransactionsList.jsx';
import BudgetSummary from './BudgetSummary.jsx';
import ProfileSettings from './ProfileSettings.jsx';
import './Dashboard.css';

const Dashboard = () => {
  const { currentMonth, setCurrentMonth, loading, error } = useContext(BudgetContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getMonthOptions = () => {
    const months = [];
    const now = new Date();
    for (let i = -12; i <= 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push(month);
    }
    return months;
  };

  const tabs = [
    { id: 'overview', label: '📊 Overview', icon: '📊' },
    { id: 'income', label: '💰 Income', icon: '💰' },
    { id: 'expense', label: '💸 Expense', icon: '💸' },
    { id: 'transfer', label: '🔄 Transfer', icon: '🔄' },
    { id: 'budget', label: '📋 Budget', icon: '📋' },
    { id: 'profile', label: '⚙️ Profile', icon: '⚙️' }
  ];

  return (
    <div className="dashboard">
      {error && <div className="dashboard-error">{error}</div>}

      <div className="dashboard-header">
        <div className="month-selector">
          <label>Month:</label>
          <select value={currentMonth} onChange={(e) => setCurrentMonth(e.target.value)}>
            {getMonthOptions().map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={`tabs ${isMobile ? 'mobile' : 'desktop'}`}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            title={tab.label}
          >
            {isMobile ? tab.icon : tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {loading && <div className="loading">Loading...</div>}

        {!loading && activeTab === 'overview' && <BudgetSummary />}
        {!loading && activeTab === 'income' && <IncomeForm />}
        {!loading && activeTab === 'expense' && <ExpenseForm />}
        {!loading && activeTab === 'transfer' && <TransferForm />}
        {!loading && activeTab === 'budget' && <BudgetForm />}
        {!loading && activeTab === 'profile' && <ProfileSettings />}
      </div>

      {activeTab === 'overview' && !loading && <TransactionsList />}
    </div>
  );
};

export default Dashboard;
