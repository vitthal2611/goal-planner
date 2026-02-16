import React, { useState, useEffect, useCallback } from 'react';
import { useHapticFeedback, usePullToRefresh, useGestureNavigation } from '../hooks/useMobileEnhancements';

const MobileUIOptimized = ({ children, activeView, setActiveView, onRefresh }) => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [isLoading, setIsLoading] = useState(false);
  
  const { lightTap, success, error } = useHapticFeedback();
  
  // Enhanced keyboard detection
  useEffect(() => {
    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = viewportHeight - currentHeight;
      
      // More accurate keyboard detection
      const isKeyboard = heightDifference > 150 && window.innerWidth === window.screen.width;
      setIsKeyboardOpen(isKeyboard);
      
      if (!isKeyboard) {
        setViewportHeight(currentHeight);
      }
    };

    const handleVisualViewport = () => {
      if (window.visualViewport) {
        const isKeyboard = window.visualViewport.height < window.innerHeight * 0.75;
        setIsKeyboardOpen(isKeyboard);
      }
    };

    window.addEventListener('resize', handleResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewport);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewport);
      }
    };
  }, [viewportHeight]);

  // Pull to refresh
  const pullToRefresh = usePullToRefresh(
    useCallback(async () => {
      setIsLoading(true);
      success();
      await onRefresh?.();
      setIsLoading(false);
    }, [onRefresh, success])
  );

  // Enhanced tab navigation with better UX
  const tabs = [
    { id: 'quickadd', icon: '⚡', label: 'Quick', color: '#10b981', description: 'Add expenses fast' },
    { id: 'daily', icon: '📋', label: 'Daily', color: '#3b82f6', description: 'Recent activity' },
    { id: 'transactions', icon: '📝', label: 'History', color: '#8b5cf6', description: 'All transactions' },
    { id: 'budget', icon: '📊', label: 'Budget', color: '#f59e0b', description: 'Manage budget' },
    { id: 'analytics', icon: '📈', label: 'Charts', color: '#ef4444', description: 'View insights' }
  ];

  const handleTabChange = useCallback((tabId) => {
    lightTap();
    setActiveView(tabId);
    
    // Smooth scroll to top on tab change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [lightTap, setActiveView]);

  return (
    <div 
      className={`mobile-ui-optimized ${isKeyboardOpen ? 'keyboard-open' : ''}`}
      onTouchStart={pullToRefresh.onTouchStart}
      onTouchMove={pullToRefresh.onTouchMove}
      onTouchEnd={pullToRefresh.onTouchEnd}
    >
      {/* Pull to refresh indicator */}
      {pullToRefresh.isPulling && (
        <div 
          className="pull-refresh-indicator"
          style={{
            transform: `translateY(${Math.min(pullToRefresh.pullDistance, 80)}px)`,
            opacity: Math.min(pullToRefresh.pullDistance / 80, 1)
          }}
        >
          <div className="refresh-icon">
            {pullToRefresh.pullDistance > 80 ? '🔄' : '↓'}
          </div>
          <span className="refresh-text">
            {pullToRefresh.pullDistance > 80 ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <span>Refreshing...</span>
        </div>
      )}

      {/* Enhanced mobile navigation */}
      <nav className="mobile-nav-optimized" role="tablist">
        <div className="nav-scroll-container">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeView === tab.id}
              aria-label={`${tab.label} - ${tab.description}`}
              className={`nav-tab ${activeView === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
              style={{ '--tab-color': tab.color }}
            >
              <span className="tab-icon" aria-hidden="true">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
              {activeView === tab.id && (
                <div className="tab-indicator" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Main content with optimized scrolling */}
      <main 
        className="mobile-content-optimized"
        role="main"
        aria-live="polite"
      >
        {children}
      </main>

      <style>{`
        .mobile-ui-optimized {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow-x: hidden;
        }

        .mobile-ui-optimized.keyboard-open {
          height: 100vh;
          overflow: hidden;
        }

        .pull-refresh-indicator {
          position: absolute;
          top: -80px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          backdrop-filter: blur(8px);
        }

        .refresh-icon {
          font-size: 24px;
          animation: ${pullToRefresh.pullDistance > 80 ? 'spin 1s linear infinite' : 'none'};
        }

        .refresh-text {
          font-size: 12px;
          font-weight: 600;
          color: #374151;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.9);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          z-index: 9999;
          backdrop-filter: blur(4px);
        }

        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #e5e7eb;
          border-top: 3px solid #10b981;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .mobile-nav-optimized {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #e5e7eb;
          padding: 8px 0;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        }

        .nav-scroll-container {
          display: flex;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding: 0 16px;
          gap: 8px;
          scroll-behavior: smooth;
        }

        .nav-scroll-container::-webkit-scrollbar {
          display: none;
        }

        .nav-tab {
          flex: 0 0 auto;
          min-width: 72px;
          min-height: 56px;
          padding: 8px 12px;
          border: none;
          background: transparent;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        .nav-tab:focus {
          outline: 2px solid var(--tab-color);
          outline-offset: 2px;
        }

        .nav-tab.active {
          background: var(--tab-color);
          color: white;
          transform: scale(1.05);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }

        .nav-tab:not(.active):hover {
          background: #f3f4f6;
          transform: translateY(-2px);
        }

        .nav-tab:active {
          transform: scale(0.95);
        }

        .tab-icon {
          font-size: 20px;
          line-height: 1;
        }

        .tab-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          line-height: 1;
        }

        .tab-indicator {
          position: absolute;
          bottom: -12px;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 6px;
          background: currentColor;
          border-radius: 50%;
          animation: bounce 0.3s ease;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
          40% { transform: translateX(-50%) translateY(-4px); }
          60% { transform: translateX(-50%) translateY(-2px); }
        }

        .mobile-content-optimized {
          flex: 1;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
          padding-bottom: env(safe-area-inset-bottom);
        }

        /* Responsive adjustments */
        @media (max-width: 480px) {
          .nav-tab {
            min-width: 64px;
            min-height: 52px;
            padding: 6px 8px;
          }

          .tab-icon {
            font-size: 18px;
          }

          .tab-label {
            font-size: 9px;
          }
        }

        @media (min-width: 769px) {
          .mobile-nav-optimized {
            display: none;
          }
        }

        /* Accessibility improvements */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        @media (prefers-contrast: high) {
          .nav-tab {
            border: 2px solid currentColor;
          }
        }
      `}</style>
    </div>
  );
};

export default MobileUIOptimized;