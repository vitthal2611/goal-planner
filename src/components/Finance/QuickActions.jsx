import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useFinanceStore } from '../../store/financeStore';
import toast from 'react-hot-toast';

export default function QuickActions() {
  const { user } = useAuthStore();
  const { addTransaction, paymentMethods, envelopes } = useFinanceStore();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [payment, setPayment] = useState('');
  const [envelope, setEnvelope] = useState('');
  const [expenseType, setExpenseType] = useState('need');

  const handleIncome = () => {
    if (!amount || !payment) {
      toast.error('Please fill amount and payment method');
      return;
    }

    addTransaction({
      type: 'income',
      amount: parseFloat(amount),
      description: description || 'Income',
      payment,
      date: new Date().toISOString()
    }, user.uid);

    setAmount('');
    setDescription('');
    toast.success('Income added! 💰');
  };

  const handleExpense = () => {
    if (!amount || !payment || !envelope) {
      toast.error('Please fill all fields');
      return;
    }

    addTransaction({
      type: 'expense',
      amount: parseFloat(amount),
      description: description || 'Expense',
      payment,
      envelope,
      expenseType,
      date: new Date().toISOString()
    }, user.uid);

    setAmount('');
    setDescription('');
    toast.success('Expense added! 💸');
  };

  return (
    <div className="quick-actions">
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="quick-input"
      />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="quick-input"
      />
      <select
        value={payment}
        onChange={(e) => setPayment(e.target.value)}
        className="quick-select"
      >
        <option value="">Payment Method</option>
        {paymentMethods.map(m => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
      <select
        value={envelope}
        onChange={(e) => setEnvelope(e.target.value)}
        className="quick-select"
      >
        <option value="">Category</option>
        {envelopes.map(e => (
          <option key={e} value={e}>{e}</option>
        ))}
      </select>
      <select
        value={expenseType}
        onChange={(e) => setExpenseType(e.target.value)}
        className="quick-select"
      >
        <option value="need">Need 🎯</option>
        <option value="want">Want 🎉</option>
        <option value="save">Save 💰</option>
      </select>
      <div className="quick-buttons">
        <button onClick={handleIncome} className="quick-btn income-btn">
          + Income
        </button>
        <button onClick={handleExpense} className="quick-btn expense-btn">
          - Expense
        </button>
      </div>
    </div>
  );
}
