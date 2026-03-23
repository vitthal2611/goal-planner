import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import CategorySelector from './CategorySelector';
import CategoryDetails from './CategoryDetails';
import './DrillDownTab.css';

const DrillDownTab = () => {
  const { transactions, envelopes, selectedYear, selectedMonth } = useApp();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewMode, setViewMode] = useState('category'); // 'category' or 'payment'

  const categoryData = useMemo(() => {
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

    // Group by envelope/category
    const grouped = {};
    filtered
      .filter(t => t.type === 'expense' && t.envelope)
      .forEach(t => {
        const env = t.envelope;
        if (!grouped[env]) {
          grouped[env] = {
            name: env,
            total: 0,
            count: 0,
            transactions: [],
          };
        }
        grouped[env].total += parseFloat(t.amount || 0);
        grouped[env].count += 1;
        grouped[env].transactions.push(t);
      });

    return Object.values(grouped).sort((a, b) => b.total - a.total);
  }, [transactions, selectedYear, selectedMonth]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleBack = () => {
    setSelectedCategory(null);
  };

  if (selectedCategory) {
    return (
      <CategoryDetails
        category={selectedCategory}
        envelopes={envelopes}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="drill-down-tab">
      <div className="drill-down-header">
        <h2 className="drill-down-title">Drill Down Analysis</h2>
        <p className="drill-down-subtitle">
          Detailed breakdown by category
        </p>
      </div>

      {categoryData.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No expense data</h3>
          <p>Add some expense transactions to see category analysis.</p>
        </div>
      ) : (
        <CategorySelector
          categories={categoryData}
          envelopes={envelopes}
          onSelect={handleCategorySelect}
        />
      )}
    </div>
  );
};

export default DrillDownTab;
