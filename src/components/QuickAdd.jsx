import React, { useState, useEffect, useMemo } from 'react';
import './QuickAdd.css';
import ExpenseModal from './ExpenseModal';
import TransactionTable from './TransactionTable';
import PaymentMethodCard from './PaymentMethodCard';
import SummaryCard from './SummaryCard';
import EnvelopeGrid from './EnvelopeGrid';
import ErrorBoundary from './ErrorBoundary';
import BulkExpenseModal from './BulkExpenseModal';
import CSVImport from './CSVImport';
import { calculateDashboardData } from '../utils/envelopeUtils';
import { useTransactionFilters } from '../hooks/useTransactionFilters';
import { useQuickAddHandlers } from '../hooks/useQuickAddHandlers';

const QuickAdd = ({ 
  envelopes = {}, 
  customPaymentMethods = [], 
  onAddTransaction, 
  onShowNotification,
  transactions = [],
  monthlyData = {},
  currentPeriod,
  onAddIncome,
  onDeleteTransaction,
  onTransfer
}) => {
  const [selectedEnvelope, setSelectedEnvelope] = useState(null);
  const [transferModal, setTransferModal] = useState({ show: false, from: '', to: '', amount: '' });
  const [forms, setForms] = useState({
    income: { amount: '', description: '', paymentMethod: customPaymentMethods[0] || '' },
    expense: { amount: '', description: '', paymentMethod: customPaymentMethods[0] || 'HDFC', allowOverspend: false }
  });
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    type: 'all',
    sort: { key: 'date', direction: 'desc' }
  });
  const [uiState, setUiState] = useState({
    showPaymentMethods: false,
    showIncomeForm: false,
    expandedRows: new Set(),
    transactionLimit: 10
  });
  const [selectedTransactions, setSelectedTransactions] = useState(new Set());
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);

  useEffect(() => {
    if (customPaymentMethods.length > 0 && !forms.income.paymentMethod) {
      setForms(prev => ({
        ...prev,
        income: { ...prev.income, paymentMethod: customPaymentMethods[0] }
      }));
    }
  }, [customPaymentMethods, forms.income.paymentMethod]);

  const dashboardData = useMemo(() => 
    calculateDashboardData(transactions, envelopes, customPaymentMethods, currentPeriod, monthlyData),
    [transactions, envelopes, customPaymentMethods, currentPeriod, monthlyData]
  );

  const totalBudget = useMemo(() => {
    return Object.values(envelopes).reduce((sum, category) => 
      sum + Object.values(category).reduce((catSum, env) => catSum + env.budgeted, 0), 0
    );
  }, [envelopes]);

  const remainingBudget = useMemo(() => totalBudget - dashboardData.expenses.total, [totalBudget, dashboardData.expenses.total]);

  const filteredTransactions = useTransactionFilters(transactions, filters);
  const displayedTransactions = filteredTransactions.slice(0, uiState.transactionLimit);

  const handlers = useQuickAddHandlers({
    selectedEnvelope,
    setSelectedEnvelope,
    forms,
    setForms,
    filters,
    setFilters,
    selectedTransactions,
    setSelectedTransactions,
    expandedRows: uiState.expandedRows,
    setExpandedRows: (rows) => setUiState(prev => ({ ...prev, expandedRows: rows })),
    customPaymentMethods,
    envelopes,
    currentPeriod,
    monthlyData,
    transactions,
    onAddTransaction,
    onDeleteTransaction,
    onShowNotification,
    onAddIncome
  });

  const handleTransferClick = (fromMethod) => {
    setTransferModal({ show: true, from: fromMethod, to: '', amount: '' });
  };

  const handleTransfer = () => {
    const { from, to, amount } = transferModal;
    if (!from || !to || !amount || parseFloat(amount) <= 0) {
      onShowNotification('error', 'Please fill all fields');
      return;
    }
    if (from === to) {
      onShowNotification('error', 'Cannot transfer to same account');
      return;
    }
    onTransfer(from, to, parseFloat(amount));
    setTransferModal({ show: false, from: '', to: '', amount: '' });
  };

  const handleBulkSubmit = (expenses) => {
    expenses.forEach(exp => onAddTransaction(exp));
    onShowNotification('success', `✓ Added ${expenses.length} expenses!`);
  };

  return (
    <div className="quick-add-container">
      <ErrorBoundary fallbackMessage="Unable to load financial overview">
      <div className="financial-overview">
        <div className="overview-header">
          <h3 className="section-title">💼 Financial Overview</h3>
          <button 
            className="toggle-btn" 
            onClick={() => setUiState(prev => ({ ...prev, showPaymentMethods: !prev.showPaymentMethods }))}
          >
            {uiState.showPaymentMethods ? '📊 Summary' : '💳 Payment Methods'}
          </button>
        </div>
        
        {!uiState.showPaymentMethods ? (
          <div className="dashboard-summary">
            <SummaryCard
              icon="💰"
              label="Income"
              amount={dashboardData.income.total}
              meta={`${dashboardData.income.count} transactions`}
              className="income-card"
            />
            <SummaryCard
              icon="💸"
              label="Expenses"
              amount={dashboardData.expenses.total}
              meta={`${dashboardData.expenses.count} transactions`}
              className="expense-card"
            />
            <SummaryCard
              icon="💵"
              label="Balance"
              amount={dashboardData.income.total - dashboardData.expenses.total}
              meta={`${dashboardData.transfers.count} transfers`}
              className="balance-card"
              amountColor={dashboardData.income.total - dashboardData.expenses.total >= 0 ? '#10b981' : '#ef4444'}
            />
            <SummaryCard
              icon="📊"
              label="Total Budget"
              amount={totalBudget}
              meta={`${Object.keys(envelopes).reduce((sum, cat) => sum + Object.keys(envelopes[cat]).length, 0)} envelopes`}
              className="budget-card"
            />
            <SummaryCard
              icon="💰"
              label="Remaining"
              amount={remainingBudget}
              meta={`${totalBudget > 0 ? Math.round((dashboardData.expenses.total / totalBudget) * 100) : 0}% used`}
              className="remaining-card"
              amountColor={remainingBudget >= 0 ? '#10b981' : '#ef4444'}
            />
          </div>
        ) : (
          customPaymentMethods.length > 0 && (
            <div className="payment-methods-grid">
              {customPaymentMethods.map(method => (
                <PaymentMethodCard
                  key={method}
                  method={method}
                  balance={dashboardData.paymentMethodBalances[method]}
                  onTransferClick={handleTransferClick}
                />
              ))}
            </div>
          )
        )}
      </div>
      </ErrorBoundary>

      <ErrorBoundary fallbackMessage="Unable to load envelopes">
      <div className="compact-envelope-grid">
        <EnvelopeGrid
          envelopes={envelopes}
          dashboardData={dashboardData}
          onEnvelopeClick={(cat, name) => handlers.handleEnvelopeClick(cat, name, dashboardData)}
          onCreateEnvelope={() => window.location.href = '#budget'}
        />
      </div>
      </ErrorBoundary>

      <div className="income-section">
        <div className="income-header">
          <h3 className="section-title">💰 Add Monthly Income</h3>
          <button 
            className="toggle-income-btn" 
            onClick={() => setUiState(prev => ({ ...prev, showIncomeForm: !prev.showIncomeForm }))}
          >
            {uiState.showIncomeForm ? '▲ Hide' : '▼ Show'}
          </button>
        </div>
        {uiState.showIncomeForm && (
        <div className="income-form-grid">
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="₹ Amount"
            value={forms.income.amount}
            onChange={(e) => setForms(prev => ({ ...prev, income: { ...prev.income, amount: e.target.value } }))}
            className="income-input-field"
          />
          <input
            type="text"
            placeholder="Description"
            value={forms.income.description}
            onChange={(e) => setForms(prev => ({ ...prev, income: { ...prev.income, description: e.target.value } }))}
            className="income-input-field"
          />
          <select
            value={forms.income.paymentMethod}
            onChange={(e) => setForms(prev => ({ ...prev, income: { ...prev.income, paymentMethod: e.target.value } }))}
            className="income-input-field"
          >
            {!forms.income.paymentMethod && <option value="">Select Payment Method</option>}
            {customPaymentMethods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
          <button
            className="btn-add-income"
            onClick={handlers.handleAddIncome}
          >
            ➕ Add Income
          </button>
        </div>
        )}
      </div>

      <ErrorBoundary fallbackMessage="Unable to load transactions">
      <div className="transactions-section">
        <div className="transactions-header">
          <h3 className="section-title">📋 Recent Transaction Details</h3>
          <div className="transactions-actions">
            {selectedTransactions.size > 0 && (
              <button className="btn-bulk-delete" onClick={handlers.handleBulkDelete}>
                🗑️ Delete ({selectedTransactions.size})
              </button>
            )}
            <button className="btn-secondary" onClick={() => setShowBulkModal(true)}>📝 Bulk</button>
            <button className="btn-secondary" onClick={() => setShowCSVImport(true)}>📥 CSV</button>
            <button className="btn-export" onClick={handlers.handleExport}>📤 Export</button>
            <label className="btn-import">
              📥 Import
              <input type="file" accept=".json" onChange={handlers.handleImport} style={{ display: 'none' }} />
            </label>
          </div>
        </div>
        
        <div className="transactions-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Search transactions..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="search-input"
            />
          </div>
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="type-filter"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="transfer">Transfer</option>
          </select>
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="category-filter"
          >
            {dashboardData.categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-title">No transactions yet</div>
            <div className="empty-text">Add income or expenses to get started</div>
            <button className="btn-empty-action" onClick={() => setUiState(prev => ({ ...prev, showIncomeForm: true }))}>
              ➕ Add Income
            </button>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <div className="empty-title">No results found</div>
            <div className="empty-text">Try adjusting your search or filters</div>
          </div>
        ) : (
          <>
            <TransactionTable
              transactions={displayedTransactions}
              selectedTransactions={selectedTransactions}
              sortConfig={filters.sort}
              expandedRows={uiState.expandedRows}
              onSort={handlers.handleSort}
              onSelectAll={handlers.handleSelectAll}
              onSelectTransaction={handlers.handleSelectTransaction}
              onToggleExpand={handlers.toggleRowExpand}
              onDelete={onDeleteTransaction}
            />
            {filteredTransactions.length > uiState.transactionLimit && (
              <div className="load-more">
                <button className="btn-load-more" onClick={() => setUiState(prev => ({ ...prev, transactionLimit: prev.transactionLimit + 10 }))}>
                  Show More ({filteredTransactions.length - uiState.transactionLimit} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
      </ErrorBoundary>

      {selectedEnvelope && (
        <ExpenseModal
          envelope={selectedEnvelope}
          balance={dashboardData.envelopeBalances[selectedEnvelope.category]?.[selectedEnvelope.name]?.balance || 0}
          form={forms.expense}
          paymentMethods={customPaymentMethods}
          paymentBalances={dashboardData.paymentMethodBalances}
          onClose={() => {
            setSelectedEnvelope(null);
            setForms(prev => ({ ...prev, expense: { ...prev.expense, allowOverspend: false } }));
          }}
          onFormChange={(newForm) => setForms(prev => ({ ...prev, expense: newForm }))}
          onSubmit={handlers.handleAddExpense}
        />
      )}

      {transferModal.show && (
        <div className="modal-overlay" onClick={() => setTransferModal({ show: false, from: '', to: '', amount: '' })}>
          <div className="expense-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <span className="modal-icon">🔄</span>
                <h3>Transfer Funds</h3>
              </div>
              <button className="close-btn" onClick={() => setTransferModal({ show: false, from: '', to: '', amount: '' })}>×</button>
            </div>

            <div className="modal-form">
              <div className="form-group">
                <label>From</label>
                <select
                  value={transferModal.from}
                  onChange={(e) => setTransferModal({ ...transferModal, from: e.target.value })}
                  className="description-input"
                >
                  <option value="">Select source</option>
                  {customPaymentMethods.map(method => (
                    <option key={method} value={method}>
                      {method} (₹{dashboardData.paymentMethodBalances[method]?.toLocaleString() || '0'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>To</label>
                <select
                  value={transferModal.to}
                  onChange={(e) => setTransferModal({ ...transferModal, to: e.target.value })}
                  className="description-input"
                >
                  <option value="">Select destination</option>
                  {customPaymentMethods.filter(m => m !== transferModal.from).map(method => (
                    <option key={method} value={method}>
                      {method} (₹{dashboardData.paymentMethodBalances[method]?.toLocaleString() || '0'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="₹ 0"
                  value={transferModal.amount}
                  onChange={(e) => setTransferModal({ ...transferModal, amount: e.target.value })}
                  className="amount-input"
                  inputMode="decimal"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-cancel" onClick={() => setTransferModal({ show: false, from: '', to: '', amount: '' })}>
                Cancel
              </button>
              <button 
                className="btn btn-add" 
                onClick={handleTransfer}
                disabled={!transferModal.from || !transferModal.to || !transferModal.amount}
              >
                Transfer ₹{transferModal.amount || '0'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showBulkModal && (
        <BulkExpenseModal
          envelopes={envelopes}
          paymentMethods={customPaymentMethods}
          dateRange={{ min: `${currentPeriod}-01`, max: `${currentPeriod}-31` }}
          onClose={() => setShowBulkModal(false)}
          onSubmit={handleBulkSubmit}
        />
      )}

      {showCSVImport && (
        <CSVImport
          envelopes={envelopes}
          paymentMethods={customPaymentMethods}
          dateRange={{ min: `${currentPeriod}-01`, max: `${currentPeriod}-31` }}
          onClose={() => setShowCSVImport(false)}
          onSubmit={handleBulkSubmit}
        />
      )}
    </div>
  );
};

export default QuickAdd;
