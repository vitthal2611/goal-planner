import React, { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import NWSCard from './NWSCard';
import './NWSTab.css';

const NWSTab = () => {
  const { transactions, envelopes, selectedYear, selectedMonth } = useApp();

  const nwsData = useMemo(() => {
    // Filter transactions by selected date
    const filtered = transactions.filter(t => {
      if (!t.date || t.type !== 'expense') return false;
      try {
        const d = new Date(t.date);
        const year = d.getFullYear();
        const month = d.getMonth() + 1;

        if (selectedMonth === 0) {
          return year === selectedYear;
        } else {
          return year === selectedYear && month === selectedMonth;
        }
      } catch {
        return false;
      }
    });

    // Calculate totals by expense type
    const need = filtered
      .filter(t => t.expenseType === 'need')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const want = filtered
      .filter(t => t.expenseType === 'want')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const save = filtered
      .filter(t => t.expenseType === 'save')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const total = need + want + save;

    // Get transactions by type
    const needTransactions = filtered.filter(t => t.expenseType === 'need');
    const wantTransactions = filtered.filter(t => t.expenseType === 'want');
    const saveTransactions = filtered.filter(t => t.expenseType === 'save');

    return {
      need: { amount: need, percent: total > 0 ? (need / total * 100).toFixed(1) : 0, transactions: needTransactions },
      want: { amount: want, percent: total > 0 ? (want / total * 100).toFixed(1) : 0, transactions: wantTransactions },
      save: { amount: save, percent: total > 0 ? (save / total * 100).toFixed(1) : 0, transactions: saveTransactions },
      total,
    };
  }, [transactions, selectedYear, selectedMonth]);

  if (nwsData.total === 0) {
    return (
      <div className="nws-tab">
        <div className="empty-state">
          <div className="empty-icon">💰</div>
          <h3>No expense data</h3>
          <p>Add some expense transactions to see your Need/Want/Save breakdown.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="nws-tab">
      <div className="nws-header">
        <h2 className="nws-title">Need / Want / Save</h2>
        <p className="nws-subtitle">
          Track your spending by category
        </p>
      </div>

      <div className="nws-summary">
        <div className="nws-total">
          <div className="nws-total-label">Total Expenses</div>
          <div className="nws-total-amount">
            ₹{nwsData.total.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="nws-bar">
          <div
            className="nws-bar-segment need"
            style={{ width: `${nwsData.need.percent}%` }}
            title={`Need: ${nwsData.need.percent}%`}
          ></div>
          <div
            className="nws-bar-segment want"
            style={{ width: `${nwsData.want.percent}%` }}
            title={`Want: ${nwsData.want.percent}%`}
          ></div>
          <div
            className="nws-bar-segment save"
            style={{ width: `${nwsData.save.percent}%` }}
            title={`Save: ${nwsData.save.percent}%`}
          ></div>
        </div>
      </div>

      <div className="nws-cards">
        <NWSCard
          type="need"
          icon="🎯"
          label="Needs"
          amount={nwsData.need.amount}
          percent={nwsData.need.percent}
          transactions={nwsData.need.transactions}
        />
        <NWSCard
          type="want"
          icon="🎉"
          label="Wants"
          amount={nwsData.want.amount}
          percent={nwsData.want.percent}
          transactions={nwsData.want.transactions}
        />
        <NWSCard
          type="save"
          icon="💰"
          label="Savings"
          amount={nwsData.save.amount}
          percent={nwsData.save.percent}
          transactions={nwsData.save.transactions}
        />
      </div>
    </div>
  );
};

export default NWSTab;
