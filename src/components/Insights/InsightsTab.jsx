import React, { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import SpendingChart from './SpendingChart';
import CategoryPieChart from './CategoryPieChart';
import TrendAnalysis from './TrendAnalysis';
import './InsightsTab.css';

const InsightsTab = () => {
  const { transactions, selectedYear, selectedMonth, envelopes } = useApp();

  const insights = useMemo(() => {
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

    // Category breakdown
    const categoryData = {};
    filtered
      .filter(t => t.type === 'expense' && t.envelope)
      .forEach(t => {
        const env = t.envelope;
        if (!categoryData[env]) {
          categoryData[env] = 0;
        }
        categoryData[env] += parseFloat(t.amount || 0);
      });

    // Daily spending data
    const dailyData = {};
    filtered
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const date = new Date(t.date).toISOString().split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = 0;
        }
        dailyData[date] += parseFloat(t.amount || 0);
      });

    return {
      income,
      expense,
      categoryData,
      dailyData,
      transactionCount: filtered.length,
    };
  }, [transactions, selectedYear, selectedMonth]);

  if (insights.transactionCount === 0) {
    return (
      <div className="insights-tab">
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No data to analyze</h3>
          <p>Add some transactions to see insights and analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="insights-tab">
      <TrendAnalysis insights={insights} />
      <SpendingChart dailyData={insights.dailyData} />
      <CategoryPieChart categoryData={insights.categoryData} envelopes={envelopes} />
    </div>
  );
};

export default InsightsTab;
