import React from 'react';
import './EmptyState.css';

const EmptyState = ({ 
  icon = '📝', 
  title = 'No data yet', 
  message = 'Get started by adding your first item',
  action,
  actionLabel = 'Add Now'
}) => (
  <div className="empty-state-container">
    <div className="empty-state-icon">{icon}</div>
    <h3 className="empty-state-title">{title}</h3>
    <p className="empty-state-message">{message}</p>
    {action && (
      <button className="empty-state-action" onClick={action}>
        {actionLabel}
      </button>
    )}
  </div>
);

export const NoTransactions = ({ onAdd }) => (
  <EmptyState
    icon="💸"
    title="No Transactions"
    message="Start tracking your expenses to see insights"
    action={onAdd}
    actionLabel="Add Expense"
  />
);

export const NoEnvelopes = ({ onAdd }) => (
  <EmptyState
    icon="📮"
    title="No Envelopes"
    message="Create envelopes to organize your budget"
    action={onAdd}
    actionLabel="Create Envelope"
  />
);

export const NoResults = () => (
  <EmptyState
    icon="🔍"
    title="No Results Found"
    message="Try adjusting your filters or search terms"
  />
);

export const ErrorState = ({ onRetry }) => (
  <EmptyState
    icon="⚠️"
    title="Something Went Wrong"
    message="We couldn't load your data. Please try again"
    action={onRetry}
    actionLabel="Retry"
  />
);

export default EmptyState;
