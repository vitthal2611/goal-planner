import React from 'react';

const ChartsComponent = ({ transactions, envelopes }) => {
  const getCategoryData = () => {
    const categories = {};
    const expenses = transactions.filter(t => t.type !== 'income');
    
    expenses.forEach(t => {
      categories[t.envelope] = (categories[t.envelope] || 0) + t.amount;
    });
    
    const total = Object.values(categories).reduce((sum, amount) => sum + amount, 0);
    return Object.entries(categories)
      .map(([name, amount]) => ({
        name: envelopes[name]?.name || name,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8);
  };

  const getMonthlyTrend = () => {
    const monthlyData = {};
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 };
      }
      
      if (t.type === 'income') {
        monthlyData[monthKey].income += t.amount;
      } else {
        monthlyData[monthKey].expenses += t.amount;
      }
    });
    
    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, data]) => ({ month, ...data }));
  };

  const categoryData = getCategoryData();
  const monthlyTrend = getMonthlyTrend();
  const maxMonthlyAmount = Math.max(...monthlyTrend.flatMap(m => [m.income, m.expenses]));

  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];

  return (
    <div className="card">
      <div className="card-header">
        <h3>📊 Visual Charts</h3>
      </div>
      <div className="card-content">
        
        {/* Category Pie Chart */}
        <div style={{ marginBottom: '40px' }}>
          <h4>🥧 Spending by Category</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '200px', height: '200px' }}>
              <svg width="200" height="200" viewBox="0 0 200 200">
                {categoryData.map((category, index) => {
                  const startAngle = categoryData.slice(0, index).reduce((sum, cat) => sum + (cat.percentage * 3.6), 0);
                  const endAngle = startAngle + (category.percentage * 3.6);
                  const largeArcFlag = category.percentage > 50 ? 1 : 0;
                  
                  const x1 = 100 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
                  const y1 = 100 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
                  const x2 = 100 + 80 * Math.cos((endAngle - 90) * Math.PI / 180);
                  const y2 = 100 + 80 * Math.sin((endAngle - 90) * Math.PI / 180);
                  
                  return (
                    <path
                      key={category.name}
                      d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                      fill={colors[index % colors.length]}
                      stroke="white"
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              {categoryData.map((category, index) => (
                <div key={category.name} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '8px',
                  fontSize: '14px'
                }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    backgroundColor: colors[index % colors.length],
                    marginRight: '8px',
                    borderRadius: '2px'
                  }}></div>
                  <span style={{ flex: 1 }}>{category.name}</span>
                  <span style={{ fontWeight: '600' }}>
                    ₹{category.amount.toLocaleString()} ({Math.round(category.percentage)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Trend Bar Chart */}
        <div>
          <h4>📈 Monthly Income vs Expenses</h4>
          <div style={{ display: 'flex', alignItems: 'end', gap: '20px', height: '200px', padding: '20px 0' }}>
            {monthlyTrend.map((month, index) => (
              <div key={month.month} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                flex: 1,
                minWidth: '80px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'end', 
                  gap: '4px',
                  height: '150px',
                  marginBottom: '10px'
                }}>
                  <div style={{
                    width: '20px',
                    height: `${(month.income / maxMonthlyAmount) * 150}px`,
                    backgroundColor: '#4ECDC4',
                    borderRadius: '2px 2px 0 0',
                    minHeight: '2px'
                  }}></div>
                  <div style={{
                    width: '20px',
                    height: `${(month.expenses / maxMonthlyAmount) * 150}px`,
                    backgroundColor: '#FF6B6B',
                    borderRadius: '2px 2px 0 0',
                    minHeight: '2px'
                  }}></div>
                </div>
                <div style={{ fontSize: '12px', textAlign: 'center' }}>
                  {month.month}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#4ECDC4' }}></div>
              <span style={{ fontSize: '14px' }}>Income</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#FF6B6B' }}></div>
              <span style={{ fontSize: '14px' }}>Expenses</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChartsComponent;