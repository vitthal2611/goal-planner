import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Budget App Error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Add error reporting service here
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  render() {
    if (this.state.hasError) {
      const { error, retryCount } = this.state;
      const canRetry = retryCount < 3;
      
      return (
        <div style={{
          padding: '24px',
          textAlign: 'center',
          backgroundColor: '#fff5f5',
          border: '2px solid #fed7d7',
          borderRadius: '12px',
          margin: '20px',
          maxWidth: '500px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ color: '#e53e3e', marginBottom: '16px', fontSize: '24px' }}>
            Oops! Something went wrong
          </h2>
          <p style={{ color: '#718096', marginBottom: '20px', lineHeight: '1.5' }}>
            {error?.message || 'The application encountered an unexpected error.'}
          </p>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {canRetry && (
              <button
                onClick={this.handleRetry}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#3182ce',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  minHeight: '48px'
                }}
              >
                Try Again
              </button>
            )}
            
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                backgroundColor: '#38a169',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                minHeight: '48px'
              }}
            >
              Refresh Page
            </button>
          </div>
          
          {retryCount >= 3 && (
            <p style={{ 
              color: '#e53e3e', 
              marginTop: '16px', 
              fontSize: '14px',
              fontStyle: 'italic'
            }}>
              Multiple retry attempts failed. Please refresh the page.
            </p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;