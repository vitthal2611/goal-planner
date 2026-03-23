import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import './CategoryPieChart.css';

const COLORS = [
  '#4f46e5', // Primary
  '#059669', // Success
  '#d97706', // Warning
  '#dc2626', // Danger
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f59e0b', // Amber
];

const CategoryPieChart = ({ categoryData, envelopes }) => {
  const chartData = useMemo(() => {
    const data = Object.entries(categoryData).map(([name, value], index) => {
      const envelope = envelopes.find(e => e.name === name);
      return {
        name,
        value,
        icon: envelope?.icon || '📦',
        color: COLORS[index % COLORS.length],
      };
    });

    // Sort by value descending
    return data.sort((a, b) => b.value - a.value);
  }, [categoryData, envelopes]);

  const totalExpense = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  if (chartData.length === 0) {
    return null;
  }

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // Don't show label if less than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="700"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="category-pie-chart">
      <h3 className="section-title">Category Breakdown</h3>
      
      <div className="pie-chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '13px',
              }}
              formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="category-legend">
        {chartData.map((item, index) => (
          <div key={index} className="legend-item">
            <div className="legend-color" style={{ backgroundColor: item.color }}></div>
            <div className="legend-icon">{item.icon}</div>
            <div className="legend-info">
              <div className="legend-name">{item.name}</div>
              <div className="legend-value">
                ₹{item.value.toLocaleString('en-IN')}
                <span className="legend-percent">
                  ({((item.value / totalExpense) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPieChart;
