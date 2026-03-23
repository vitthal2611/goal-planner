import React, { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import './PaymentBalances.css';

const PaymentBalances = () => {
  const { transactions, paymentMethods, selectedYear, selectedMonth } = useApp();

  const balances = useMemo(() => {
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

    // Calculate balance for each payment method
    const balanceMap = {};
    paymentMethods.forEach(method => {
      let balance = 0;
      filtered.forEach(t => {
        if (t.type === 'income' && t.payment === method) {
          balance += parseFloat(t.amount);
        } else if (t.type === 'expense' && t.payment === method) {
          balance -= parseFloat(t.amount);
        } else if (t.type === 'transfer') {
          if (t.from === method) balance -= parseFloat(t.amount);
          if (t.to === method) balance += parseFloat(t.amount);
        }
      });
      balanceMap[method] = balance;
    });

    return balanceMap;
  }, [transactions, paymentMethods, selectedYear, selectedMonth]);

  const totalBalance = Object.values(balances).reduce((sum, bal) => sum + bal, 0);

  if (paymentMethods.length === 0) {
    return (
      <div className="payment-balances-wrapper">
        <div className="empty-state">
          <p>No payment methods yet. Add one in Settings ⚙️</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-balances-wrapper">
      <div className="payment-header">
        <h3 className="payment-title">Payment Balances</h3>
        <span className="payment-summary">
          Total: ₹{totalBalance.toLocaleString('en-IN')}
        </span>
      </div>

      <div className="payment-balances">
        {paymentMethods.map(method => {
          const balance = balances[method] || 0;
          const balanceClass = balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'zero';

          return (
            <div key={method} className="payment-item">
              <div className="pm-icon">💳</div>
              <div className="pm-info">
                <div className="payment-label">{method}</div>
                <div className={`payment-value ${balanceClass}`}>
                  ₹{Math.abs(balance).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentBalances;
