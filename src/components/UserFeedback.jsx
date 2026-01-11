import React from 'react';

export const NotificationContainer = ({ notifications, onRemove }) => {
  if (!notifications.length) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxWidth: '400px'
      }}
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

const Notification = ({ notification, onRemove }) => {
  const getStyles = (type) => {
    const baseStyles = {
      padding: '16px',
      borderRadius: '8px',
      color: 'white',
      fontSize: '14px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      minHeight: '48px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      animation: 'slideIn 0.3s ease-out',
      border: '2px solid transparent',
      outline: 'none'
    };

    const typeStyles = {
      success: { 
        backgroundColor: '#38a169',
        borderColor: '#2f855a'
      },
      error: { 
        backgroundColor: '#e53e3e',
        borderColor: '#c53030'
      },
      warning: { 
        backgroundColor: '#d69e2e',
        borderColor: '#b7791f'
      },
      info: { 
        backgroundColor: '#3182ce',
        borderColor: '#2c5aa0'
      }
    };

    return { ...baseStyles, ...typeStyles[type] };
  };

  const getIcon = (type) => {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || 'ℹ';
  };

  const getAriaLabel = (type, message) => {
    const typeLabels = {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Information'
    };
    return `${typeLabels[type]}: ${message}`;
  };

  return (
    <div 
      style={getStyles(notification.type)}
      role="alert"
      aria-label={getAriaLabel(notification.type, notification.message)}
      tabIndex={0}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '16px' }} aria-hidden="true">
          {getIcon(notification.type)}
        </span>
        <span>{notification.message}</span>
      </div>
      <button
        onClick={() => onRemove(notification.id)}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '18px',
          padding: '4px',
          minWidth: '24px',
          minHeight: '24px',
          borderRadius: '4px'
        }}
        aria-label="Close notification"
        onFocus={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
        onBlur={(e) => e.target.style.backgroundColor = 'transparent'}
      >
        ×
      </button>
    </div>
  );
};

export const LoadingOverlay = ({ isVisible, message = 'Loading...' }) => {
  if (!isVisible) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(4px)'
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Loading"
    >
      <div style={{
        textAlign: 'center',
        padding: '24px',
        borderRadius: '12px',
        backgroundColor: 'white',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        minWidth: '200px'
      }}>
        <div 
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e2e8f0',
            borderTop: '3px solid #3182ce',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}
          role="progressbar"
          aria-label="Loading progress"
        />
        <div style={{
          color: '#4a5568',
          fontSize: '16px',
          fontWeight: '500'
        }}>
          {message}
        </div>
      </div>
    </div>
  );
};

export const ErrorBoundaryFallback = ({ error, resetError }) => {
  return (
    <div 
      style={{
        padding: '40px',
        textAlign: 'center',
        backgroundColor: '#fed7d7',
        border: '1px solid #feb2b2',
        borderRadius: '8px',
        margin: '20px'
      }}
      role="alert"
      aria-live="assertive"
    >
      <h2 style={{ color: '#c53030', marginBottom: '16px' }}>
        Something went wrong
      </h2>
      <p style={{ color: '#742a2a', marginBottom: '20px' }}>
        {error.message || 'An unexpected error occurred'}
      </p>
      <button
        onClick={resetError}
        style={{
          backgroundColor: '#3182ce',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600'
        }}
        onFocus={(e) => e.target.style.backgroundColor = '#2c5aa0'}
        onBlur={(e) => e.target.style.backgroundColor = '#3182ce'}
      >
        Try Again
      </button>
    </div>
  );
};

export const PullToRefreshIndicator = ({ isPulling, pullDistance, threshold = 80 }) => {
  if (!isPulling) return null;

  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 360;

  return (
    <div 
      style={{
        position: 'fixed',
        top: `${Math.min(pullDistance * 0.5, 60)}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        transition: 'opacity 0.2s ease'
      }}
      role="status"
      aria-label="Pull to refresh"
    >
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: 'white',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `rotate(${rotation}deg)`,
        transition: 'transform 0.1s ease'
      }}>
        <span style={{ fontSize: '20px' }} aria-hidden="true">↻</span>
      </div>
    </div>
  );
};

export const UndoRedoBar = ({ canUndo, canRedo, onUndo, onRedo, lastAction }) => {
  if (!canUndo && !canRedo) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#2d3748',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        animation: 'slideUp 0.3s ease-out'
      }}
      role="toolbar"
      aria-label="Undo and redo actions"
    >
      {lastAction && (
        <span style={{ fontSize: '14px', opacity: 0.8 }}>
          {lastAction}
        </span>
      )}
      
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          style={{
            background: canUndo ? '#3182ce' : '#4a5568',
            border: 'none',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            cursor: canUndo ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            minHeight: '36px',
            opacity: canUndo ? 1 : 0.6
          }}
          aria-label={`Undo ${lastAction || 'last action'}`}
          onFocus={(e) => canUndo && (e.target.style.backgroundColor = '#2c5aa0')}
          onBlur={(e) => canUndo && (e.target.style.backgroundColor = '#3182ce')}
        >
          ↶ Undo
        </button>
        
        <button
          onClick={onRedo}
          disabled={!canRedo}
          style={{
            background: canRedo ? '#3182ce' : '#4a5568',
            border: 'none',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            cursor: canRedo ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            minHeight: '36px',
            opacity: canRedo ? 1 : 0.6
          }}
          aria-label="Redo next action"
          onFocus={(e) => canRedo && (e.target.style.backgroundColor = '#2c5aa0')}
          onBlur={(e) => canRedo && (e.target.style.backgroundColor = '#3182ce')}
        >
          ↷ Redo
        </button>
      </div>
    </div>
  );
};

// Connection status indicator
export const ConnectionStatus = ({ isOnline }) => {
  if (isOnline) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '60px',
        right: '16px',
        background: '#e53e3e',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
      }}
      role="status"
      aria-live="polite"
      aria-label="Connection status"
    >
      <span aria-hidden="true">📡</span>
      <span>Offline - Changes will sync when online</span>
    </div>
  );
};