import { useFinanceStore } from '../../store/financeStore';

export default function PaymentBalances() {
  const paymentMethods = useFinanceStore(state => state.paymentMethods);
  const getPaymentBalance = useFinanceStore(state => state.getPaymentBalance);

  if (paymentMethods.length === 0) return null;

  const colors = ['hdfc', 'sbi', 'cash', 'transfer'];

  return (
    <div className="payment-balances-wrapper">
      <div className="payment-header">
        <div className="payment-title">Payment Balances</div>
      </div>
      <div className="payment-balances">
        {paymentMethods.map((method, index) => {
          const balance = getPaymentBalance(method);
          const colorClass = colors[index % colors.length];
          
          return (
            <div key={method} className={`payment-item ${colorClass}`}>
              <div className="payment-label">{method}</div>
              <div className="payment-value">₹{balance.toLocaleString('en-IN')}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
