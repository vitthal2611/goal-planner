import React from 'react';
import './CategorySelector.css';

const CategorySelector = ({ categories, envelopes, onSelect }) => {
  const totalExpense = categories.reduce((sum, cat) => sum + cat.total, 0);

  const getCategoryIcon = (categoryName) => {
    const envelope = envelopes.find(e => e.name === categoryName);
    return envelope?.icon || '📦';
  };

  const getCategoryType = (categoryName) => {
    const envelope = envelopes.find(e => e.name === categoryName);
    return envelope?.type || 'need';
  };

  return (
    <div className="category-selector">
      <div className="category-grid">
        {categories.map((category, index) => {
          const percentage = totalExpense > 0
            ? (category.total / totalExpense * 100).toFixed(1)
            : 0;
          const icon = getCategoryIcon(category.name);
          const type = getCategoryType(category.name);

          return (
            <div
              key={index}
              className={`category-card ${type}`}
              onClick={() => onSelect(category)}
            >
              <div className="category-icon">{icon}</div>
              <div className="category-info">
                <div className="category-name">{category.name}</div>
                <div className="category-amount">
                  ₹{category.total.toLocaleString('en-IN')}
                </div>
                <div className="category-meta">
                  <span className="category-count">
                    {category.count} transaction{category.count !== 1 ? 's' : ''}
                  </span>
                  <span className="category-percent">{percentage}%</span>
                </div>
              </div>
              <div className="category-arrow">→</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySelector;
