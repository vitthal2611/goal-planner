import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useFinanceStore } from '../../store/financeStore';
import BalanceSummary from './BalanceSummary';
import PaymentBalances from './PaymentBalances';
import TransactionList from './TransactionList';
import QuickActions from './QuickActions';
import SettingsModal from './SettingsModal';
import './FinanceTab.css';

export default function FinanceTab() {
  const [showSettings, setShowSettings] = useState(false);
  const { user } = useAuthStore();
  const { selectedMonth, selectedYear, setSelectedMonth, setSelectedYear } = useFinanceStore();

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handleYearChange = (direction) => {
    const newYear = (parseInt(selectedYear) + direction).toString();
    setSelectedYear(newYear);
  };

  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(2024, i, 1);
    return {
      value: `${selectedYear}-${String(i + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('en-US', { month: 'long' })
    };
  });

  return (
    <div className="finance-tab">
      <div className="date-selectors">
        <div className="year-selector">
          <button className="year-nav" onClick={() => handleYearChange(-1)}>‹</button>
          <span className="year-display">{selectedYear}</span>
          <button className="year-nav" onClick={() => handleYearChange(1)}>›</button>
        </div>

        <div className="month-selector">
          <select value={selectedMonth} onChange={handleMonthChange} className="month-select">
            <option value="ALL">All Year</option>
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        <button className="settings-btn" onClick={() => setShowSettings(true)}>
          ⚙️
        </button>
      </div>

      <BalanceSummary />
      <PaymentBalances />
      <QuickActions />
      <TransactionList />

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
