import React, { useState } from 'react';
import EnvelopeCard from './EnvelopeCard';
import EnvelopeGrid from './EnvelopeGrid';
import EnhancedDashboard from './EnhancedDashboard';
import './EnvelopeCard.css';
import './EnvelopeGrid.css';
import './EnhancedDashboard.css';

// Sample data for demonstration
const sampleEnvelopes = {
  food: {
    groceries: { budgeted: 15000, spent: 8500, rollover: 0 },
    dining: { budgeted: 8000, spent: 6200, rollover: 500 },
    snacks: { budgeted: 3000, spent: 2100, rollover: 0 }
  },
  transport: {
    fuel: { budgeted: 6000, spent: 4800, rollover: 200 },
    public: { budgeted: 2000, spent: 1200, rollover: 0 },
    maintenance: { budgeted: 5000, spent: 0, rollover: 1000 }
  },
  utilities: {
    electricity: { budgeted: 4000, spent: 3800, rollover: 0 },
    water: { budgeted: 1500, spent: 1200, rollover: 0 },
    internet: { budgeted: 2000, spent: 1999, rollover: 0 }
  },
  entertainment: {
    movies: { budgeted: 3000, spent: 1500, rollover: 0 },
    games: { budgeted: 2000, spent: 500, rollover: 0 },
    subscriptions: { budgeted: 1500, spent: 1499, rollover: 0 }
  },
  shopping: {
    clothes: { budgeted: 8000, spent: 12000, rollover: 0 }, // Over budget
    electronics: { budgeted: 10000, spent: 0, rollover: 2000 },
    books: { budgeted: 2000, spent: 800, rollover: 0 }
  },
  health: {
    medicine: { budgeted: 3000, spent: 1800, rollover: 0 },
    checkup: { budgeted: 5000, spent: 0, rollover: 0 },
    gym: { budgeted: 2500, spent: 2500, rollover: 0 }
  }
};

const sampleTransactions = [
  {
    id: 1,
    date: new Date().toISOString().split('T')[0],
    envelope: 'food.groceries',
    amount: 1200,
    description: 'Weekly grocery shopping',
    paymentMethod: 'UPI'
  },
  {
    id: 2,
    date: new Date().toISOString().split('T')[0],
    envelope: 'transport.fuel',
    amount: 800,
    description: 'Petrol fill-up',
    paymentMethod: 'Credit Card'
  },
  {
    id: 3,
    date: new Date().toISOString().split('T')[0],
    envelope: 'food.dining',
    amount: 450,
    description: 'Lunch at restaurant',
    paymentMethod: 'UPI'
  },
  {
    id: 4,
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
    envelope: 'entertainment.movies',
    amount: 600,
    description: 'Movie tickets',
    paymentMethod: 'Debit Card'
  },
  {
    id: 5,
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    envelope: 'shopping.clothes',
    amount: 2500,
    description: 'New shirt and jeans',
    paymentMethod: 'Credit Card'
  }
];

const samplePaymentMethods = ['UPI', 'Credit Card', 'Debit Card', 'Cash', 'Net Banking'];

const EnvelopeDemo = () => {
  const [envelopes, setEnvelopes] = useState(sampleEnvelopes);
  const [transactions, setTransactions] = useState(sampleTransactions);
  const [activeView, setActiveView] = useState('daily');
  const [notification, setNotification] = useState({ message: '', type: '' });

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  const handleAddExpense = (transaction) => {
    // Update envelope spending
    const [category, name] = transaction.envelope.split('.');
    const updatedEnvelopes = {
      ...envelopes,
      [category]: {
        ...envelopes[category],
        [name]: {
          ...envelopes[category][name],
          spent: envelopes[category][name].spent + transaction.amount
        }
      }
    };
    setEnvelopes(updatedEnvelopes);

    // Add transaction
    const newTransaction = {
      ...transaction,
      id: Date.now() + Math.random()
    };
    setTransactions([...transactions, newTransaction]);

    showNotification('success', `Added ₹${transaction.amount} to ${name}`);
  };

  const handleDeleteTransaction = (transactionId) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;

    // Update envelope spending
    const [category, name] = transaction.envelope.split('.');
    const updatedEnvelopes = {
      ...envelopes,
      [category]: {
        ...envelopes[category],
        [name]: {
          ...envelopes[category][name],
          spent: Math.max(0, envelopes[category][name].spent - transaction.amount)
        }
      }
    };
    setEnvelopes(updatedEnvelopes);

    // Remove transaction
    setTransactions(transactions.filter(t => t.id !== transactionId));
    showNotification('success', 'Transaction deleted');
  };

  const handleUpdatePaymentMethod = (transactionId, newPaymentMethod) => {
    setTransactions(transactions.map(t => 
      t.id === transactionId 
        ? { ...t, paymentMethod: newPaymentMethod }
        : t
    ));
    showNotification('success', 'Payment method updated');
  };

  const handleViewDetails = (category, name) => {
    setActiveView('transactions');
    showNotification('info', `Viewing ${name} transactions`);
  };

  const dateRange = {
    min: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
    max: new Date().toISOString().split('T')[0]
  };

  return (
    <div className="envelope-demo">
      <div className="demo-header">
        <h1>🎯 Enhanced Envelope Budget Demo</h1>
        <p>Experience the new Android-like UI for expense tracking</p>
      </div>

      {notification.message && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <EnhancedDashboard
        envelopes={envelopes}
        transactions={transactions}
        customPaymentMethods={samplePaymentMethods}
        dateRange={dateRange}
        onAddTransaction={handleAddExpense}
        onDeleteTransaction={handleDeleteTransaction}
        onUpdatePaymentMethod={handleUpdatePaymentMethod}
        onAddCustomPaymentMethod={() => {}}
        onShowNotification={showNotification}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      <div className="demo-footer">
        <div className="demo-features">
          <h3>✨ New Features</h3>
          <ul>
            <li>🎯 <strong>Envelope-Centric Design:</strong> Tap any envelope to add expenses instantly</li>
            <li>📱 <strong>Mobile-First UI:</strong> Optimized for Android devices with Material Design</li>
            <li>⚡ <strong>Quick Actions:</strong> One-tap expense entry with smart suggestions</li>
            <li>🎨 <strong>Visual Feedback:</strong> Color-coded status indicators and progress bars</li>
            <li>🔍 <strong>Smart Search:</strong> Find envelopes quickly with real-time filtering</li>
            <li>📊 <strong>Live Updates:</strong> See balance changes immediately after adding expenses</li>
          </ul>
        </div>
        
        <div className="demo-instructions">
          <h3>🚀 Try It Out</h3>
          <ol>
            <li>Navigate between <strong>Today</strong>, <strong>Envelopes</strong>, and <strong>History</strong> tabs</li>
            <li>Tap any envelope card to add an expense</li>
            <li>Use quick amount buttons (₹100, ₹500, ₹1000) for faster entry</li>
            <li>Search for specific envelopes using the search bar</li>
            <li>Filter envelopes by status (Healthy, Warning, Blocked)</li>
            <li>View transaction history and delete/edit entries</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default EnvelopeDemo;