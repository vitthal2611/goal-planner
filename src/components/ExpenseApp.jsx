import React, { useState } from 'react';
import EnvelopeCard from './SimpleEnvelopeCard';
import InsightsPanel from './InsightsPanel';
import './SimpleEnvelopeCard.css';

const ExpenseApp = () => {
  const [envelopes, setEnvelopes] = useState([
    { name: 'Groceries', budget: 15000, spent: 8500, type: 'need' },
    { name: 'Dining', budget: 8000, spent: 6200, type: 'want' },
    { name: 'Transport', budget: 6000, spent: 4800, type: 'need' },
    { name: 'Entertainment', budget: 3000, spent: 1500, type: 'want' },
    { name: 'Shopping', budget: 8000, spent: 12000, type: 'want' },
    { name: 'Utilities', budget: 4000, spent: 3800, type: 'need' },
    { name: 'Emergency Fund', budget: 10000, spent: 2000, type: 'saving' },
    { name: 'Investment', budget: 15000, spent: 15000, type: 'saving' }
  ]);

  const [transactions, setTransactions] = useState([]);

  const handleAddExpense = (envelopeName, amount) => {
    // Update envelope spending
    setEnvelopes(prev => prev.map(env => 
      env.name === envelopeName 
        ? { ...env, spent: env.spent + amount }
        : env
    ));

    // Add transaction
    setTransactions(prev => [...prev, {
      id: Date.now(),
      envelope: envelopeName,
      amount,
      date: new Date().toLocaleDateString()
    }]);

    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const totalSpent = transactions
    .filter(t => t.date === new Date().toLocaleDateString())
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate insights
  const insights = {
    need: envelopes.filter(e => e.type === 'need').reduce((sum, e) => sum + e.spent, 0),
    want: envelopes.filter(e => e.type === 'want').reduce((sum, e) => sum + e.spent, 0),
    saving: envelopes.filter(e => e.type === 'saving').reduce((sum, e) => sum + e.spent, 0)
  };
  const totalInsights = insights.need + insights.want + insights.saving;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '16px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        color: 'white',
        padding: '20px',
        borderRadius: '16px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>💰 Envelope Budget</h1>
        <p style={{ margin: 0, opacity: 0.9 }}>Tap any envelope to add expense</p>
      </div>

      {/* Today's Summary */}
      <div style={{
        background: 'white',
        padding: '16px',
        borderRadius: '12px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#374151' }}>Today's Spending</h2>
        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ef4444' }}>
          ₹{totalSpent.toLocaleString()}
        </div>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          {transactions.filter(t => t.date === new Date().toLocaleDateString()).length} transactions
        </div>
      </div>

      {/* Insights */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
        marginBottom: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '12px',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderTop: '3px solid #ef4444'
        }}>
          <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>NEEDS</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ef4444' }}>
            ₹{insights.need.toLocaleString()}
          </div>
          <div style={{ fontSize: '9px', color: '#6b7280' }}>
            {totalInsights > 0 ? Math.round((insights.need / totalInsights) * 100) : 0}%
          </div>
        </div>
        <div style={{
          background: 'white',
          padding: '12px',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderTop: '3px solid #f59e0b'
        }}>
          <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>WANTS</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#f59e0b' }}>
            ₹{insights.want.toLocaleString()}
          </div>
          <div style={{ fontSize: '9px', color: '#6b7280' }}>
            {totalInsights > 0 ? Math.round((insights.want / totalInsights) * 100) : 0}%
          </div>
        </div>
        <div style={{
          background: 'white',
          padding: '12px',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderTop: '3px solid #10b981'
        }}>
          <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>SAVINGS</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#10b981' }}>
            ₹{insights.saving.toLocaleString()}
          </div>
          <div style={{ fontSize: '9px', color: '#6b7280' }}>
            {totalInsights > 0 ? Math.round((insights.saving / totalInsights) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Insights Panel */}
      <InsightsPanel envelopes={envelopes} />

      {/* Envelope Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        {envelopes.map(envelope => (
          <EnvelopeCard
            key={envelope.name}
            name={envelope.name}
            budget={envelope.budget}
            spent={envelope.spent}
            type={envelope.type}
            onAddExpense={handleAddExpense}
          />
        ))}
      </div>

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <div style={{
          background: 'white',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#374151' }}>
            Recent Transactions
          </h3>
          {transactions.slice(-5).reverse().map(transaction => (
            <div key={transaction.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: '1px solid #f3f4f6'
            }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>
                  {transaction.envelope}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {transaction.date}
                </div>
              </div>
              <div style={{ fontWeight: 'bold', color: '#ef4444' }}>
                ₹{transaction.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpenseApp;