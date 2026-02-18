import React from 'react';
import { useBudget } from '../contexts/BudgetContext';
import { calculateSpent, calculateRollover, calculateAvailable, getPaymentMethodBalances, getCategorySpending } from '../utils/budgetCalculations';

const Dashboard = () => {
  const { state } = useBudget();
  const { currentPeriod, monthlyData, currentData } = state;
  const { envelopes, transactions } = currentData;

  const stats = React.useMemo(() => {
    const totalBudgeted = Object.values(envelopes).reduce((sum, cat) => 
      sum + Object.values(cat).reduce((s, env) => s + env.budgeted, 0), 0);
    
    const totalSpent = transactions.filter(t => !t.type || t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalAvailable = Object.keys(envelopes).reduce((sum, cat) => 
      sum + Object.keys(envelopes[cat]).reduce((s, name) => {
        const env = envelopes[cat][name];
        const rollover = calculateRollover(monthlyData, cat, name, currentPeriod);
        const spent = calculateSpent(monthlyData, cat, name, currentPeriod);
        return s + calculateAvailable(env, rollover, spent);
      }, 0), 0);
    
    const paymentBalances = getPaymentMethodBalances(monthlyData, currentPeriod);
    const categorySpending = getCategorySpending(envelopes, monthlyData, currentPeriod);
    
    const monthlyBreakdown = Object.keys(monthlyData)
      .sort()
      .map(period => {
        const data = monthlyData[period];
        const txns = data?.transactions || [];
        
        const income = txns.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = txns.filter(t => !t.type || t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const transferIn = txns.filter(t => t.type === 'transfer-in').reduce((sum, t) => sum + t.amount, 0);
        const transferOut = txns.filter(t => t.type === 'transfer-out').reduce((sum, t) => sum + t.amount, 0);
        
        return { period, income, expense, transferIn, transferOut, net: income + transferIn - expense - transferOut };
      });
    
    return { totalBudgeted, totalSpent, totalAvailable, paymentBalances, categorySpending, monthlyBreakdown };
  }, [envelopes, transactions, monthlyData, currentPeriod]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>
      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Total Budgeted</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>₹{stats.totalBudgeted.toLocaleString()}</p>
        </div>
        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Total Spent</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>₹{stats.totalSpent.toLocaleString()}</p>
        </div>
        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Available</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>₹{stats.totalAvailable.toLocaleString()}</p>
        </div>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <h2>Category Spending</h2>
        <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {Object.entries(stats.categorySpending).map(([cat, amount]) => (
            <div key={cat} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}>
              <h4>{cat.toUpperCase()}</h4>
              <p>₹{amount.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <h2>Payment Method Balances</h2>
        <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {Object.entries(stats.paymentBalances).map(([method, balance]) => (
            <div key={method} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}>
              <h4>{method}</h4>
              <p style={{ color: balance >= 0 ? 'green' : 'red' }}>₹{balance.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <h2>Monthly Breakdown</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Month</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right' }}>Income</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right' }}>Expense</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right' }}>Transfer In</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right' }}>Transfer Out</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right' }}>Net</th>
              </tr>
            </thead>
            <tbody>
              {stats.monthlyBreakdown.map(row => (
                <tr key={row.period}>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{row.period}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', color: 'green' }}>₹{row.income.toLocaleString()}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', color: 'red' }}>₹{row.expense.toLocaleString()}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', color: 'blue' }}>₹{row.transferIn.toLocaleString()}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', color: 'orange' }}>₹{row.transferOut.toLocaleString()}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontWeight: 'bold', color: row.net >= 0 ? 'green' : 'red' }}>₹{row.net.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;