import React, { useState, useEffect } from 'react';

const MobileEnhancedUI = ({ children, activeView, setActiveView }) => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  // Detect virtual keyboard on mobile
  useEffect(() => {
    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = viewportHeight - currentHeight;
      
      // If height decreased by more than 150px, keyboard is likely open
      setIsKeyboardOpen(heightDifference > 150);
      
      if (heightDifference <= 150) {
        setViewportHeight(currentHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewportHeight]);

  // Enhanced mobile tab navigation
  const tabs = [
    { id: 'daily', icon: '⚡', label: 'Daily', color: 'var(--primary)' },
    { id: 'spending', icon: '💳', label: 'Spend', color: 'var(--success)' },
    { id: 'transactions', icon: '📝', label: 'History', color: 'var(--info)' },
    { id: 'budget', icon: '📊', label: 'Budget', color: 'var(--warning)' },
    { id: 'analytics', icon: '📈', label: 'Charts', color: 'var(--danger)' },
    { id: 'data', icon: '💾', label: 'Data', color: 'var(--gray-600)' }
  ];

  return (
    <div className={`mobile-enhanced-container ${isKeyboardOpen ? 'keyboard-open' : ''}`}>
      {/* Enhanced Mobile Tab Navigation */}
      <div className="mobile-tab-navigation">
        <div className="tab-scroll-container">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`mobile-tab-btn ${activeView === tab.id ? 'active' : ''}`}
              onClick={() => {
                setActiveView(tab.id);
                if (navigator.vibrate) navigator.vibrate(10);
              }}
              style={{
                '--tab-color': tab.color
              }}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
              {activeView === tab.id && <div className="tab-indicator" />}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="mobile-content-area">
        {children}
      </div>

      {/* Mobile-specific styles */}
      <style jsx>{`
        .mobile-enhanced-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .mobile-enhanced-container.keyboard-open {
          height: 100vh;
          overflow: hidden;
        }

        .mobile-tab-navigation {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--gray-200);
          padding: 8px 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .tab-scroll-container {
          display: flex;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding: 0 16px;
          gap: 4px;
        }

        .tab-scroll-container::-webkit-scrollbar {
          display: none;
        }

        .mobile-tab-btn {
          flex: 0 0 auto;
          min-width: 70px;
          padding: 8px 12px;
          border: none;
          background: transparent;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          touch-action: manipulation;
        }

        .mobile-tab-btn.active {
          background: var(--tab-color);
          color: white;
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .mobile-tab-btn:not(.active):hover {
          background: var(--gray-100);
        }

        .tab-icon {
          font-size: 20px;
          line-height: 1;
        }

        .tab-label {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .tab-indicator {
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          background: currentColor;
          border-radius: 50%;
        }

        .mobile-content-area {
          flex: 1;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        @media (max-width: 480px) {
          .mobile-tab-btn {
            min-width: 60px;
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
          .mobile-tab-navigation {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default MobileEnhancedUI;