import React, { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import BalanceCard from './BalanceCard';
import EnvelopeList from './EnvelopeList';
import './BalanceSummaryTab.css';

const BalanceSummaryTab = () => {
  const { transactions, selectedYear, selectedMonth } = useApp();

  const summary = useMemo(() => {
    // Filter transactions by selected date
    const filtered = transactions.filter(t => {
      if (!t.date) return false;
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

    // Calculate totals
    const income = filtered
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const expense = filtered
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const net = income - expense;

    // Calculate envelope breakdown
    const envelopeBreakdown = {};
    filtered
      .filter(t => t.type === 'expense' && t.envelope)
      .forEach(t => {
        const env = t.envelope;
        if (!envelopeBreakdown[env]) {
          envelopeBreakdown[env] = 0;
        }
        envelopeBreakdown[env] += parseFloat(t.amount || 0);
      });

    // Calculate expense type breakdown
    const expenseTypeBreakdown = {
      need: 0,
      want: 0,
      save: 0,
    };
    filtered
      .filter(t => t.type === 'expense' && t.expenseType)
      .forEach(t => {
        const type = t.expenseType;
        if (expenseTypeBreakdown[type] !== undefined) {
          expenseTypeBreakdown[type] += parseFloat(t.amount || 0);
        }
      });

    return {
      income,
      expense,
      net,
      envelopeBreakdown,
      expenseTypeBreakdown,
      transactionCount: filtered.length,
    };
  }, [transactions, selectedYear, selectedMonth]);

  return (
    <div className="balance-summary-tab">
      <div className="balance-cards">
        <BalanceCard
          title="Income"
          amount={summary.income}
          type="income"
          icon="💰"
        />
        <BalanceCard
          title="Expense"
          amount={summary.expense}
          type="expense"
          icon="💸"
        />
        <BalanceCard
          title="Net Balance"
          amount={summary.net}
          type={summary.net >= 0 ? 'positive' : 'negative'}
          icon={summary.net >= 0 ? '📈' : '📉'}
        />
      </div>

      {summary.expense > 0 && (
        <>
          <div className="expense-type-section">
            <h3 className="section-title">Expense Breakdown</h3>
            <div className="expense-type-cards">
              <div className="expense-type-card need">
                <div className="expense-type-icon">🏠</div>
                <div className="expense-type-info">
                  <div className="expense-type-label">Needs</div>
                  <div className="expense-type-amount">
                    ₹{summary.expenseTypeBreakdown.need.toLocaleString('en-IN')}
                  </div>
                  <div className="expense-type-percent">
                    {summary.expense > 0
                      ? ((summary.expenseTypeBreakdown.need / summary.expense) * 100).toFixed(0)
                      : 0}%
                  </div>
                </div>
              </div>
              <div className="expense-type-card want">
                <div className="expense-type-icon">🎉</div>
                <div className="expense-type-info">
                  <div className="expense-type-label">Wants</div>
                  <div className="expense-type-amount">
                    ₹{summary.expenseTypeBreakdown.want.toLocaleString('en-IN')}
                  </div>
                  <div className="expense-type-percent">
                    {summary.expense > 0
                      ? ((summary.expenseTypeBreakdown.want / summary.expense) * 100).toFixed(0)
                      : 0}%
                  </div>
                </div>
              </div>
              <div className="expense-type-card save">
                <div className="expense-type-icon">💎</div>
                <div className="expense-type-info">
                  <div className="expense-type-label">Savings</div>
                  <div className="expense-type-amount">
                    ₹{summary.expenseTypeBreakdown.save.toLocaleString('en-IN')}
                  </div>
                  <div className="expense-type-percent">
                    {summary.expense > 0
                      ? ((summary.expenseTypeBreakdown.save / summary.expense) * 100).toFixed(0)
                      : 0}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          <EnvelopeList
            envelopeBreakdown={summary.envelopeBreakdown}
            totalExpense={summary.expense}
          />
        </>
      )}

      {summary.transactionCount === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No transactions yet</h3>
          <p>Add some transactions in the Quick Track tab to see your balance summary.</p>
        </div>
      )}
    </div>
  );
};

export default BalanceSummaryTab;
