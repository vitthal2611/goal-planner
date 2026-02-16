import React, { useState, useEffect } from 'react';
import { 
  useHapticFeedback, 
  usePullToRefresh, 
  useGestureNavigation,
  useKeyboardHandler,
  useNetworkStatus,
  useDeviceOrientation,
  usePerformanceMonitor
} from '../hooks/useEnhancedMobile';

const MobileTestingPanel = ({ isVisible, onClose }) => {
  const [testResults, setTestResults] = useState({});
  const [activeTest, setActiveTest] = useState(null);
  
  const haptic = useHapticFeedback();
  const keyboard = useKeyboardHandler();
  const network = useNetworkStatus();
  const orientation = useDeviceOrientation();
  const performance = usePerformanceMonitor();
  
  const pullToRefresh = usePullToRefresh(() => {
    console.log('Pull to refresh triggered');
    return new Promise(resolve => setTimeout(resolve, 1000));
  });
  
  const gesture = useGestureNavigation({
    onSwipeLeft: () => console.log('Swipe left detected'),
    onSwipeRight: () => console.log('Swipe right detected'),
    onTap: () => console.log('Tap detected'),
    onLongPress: () => console.log('Long press detected')
  });

  const runTouchTargetTest = () => {
    const elements = document.querySelectorAll('button, input, select, [role="button"]');
    const results = [];
    
    elements.forEach((el, index) => {
      const rect = el.getBoundingClientRect();
      const isValidSize = rect.width >= 48 && rect.height >= 48;
      results.push({
        element: el.tagName.toLowerCase(),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        isValid: isValidSize,
        id: el.id || `element-${index}`
      });
    });
    
    setTestResults(prev => ({ ...prev, touchTargets: results }));
  };

  const runAccessibilityTest = () => {
    const results = {
      missingAltText: document.querySelectorAll('img:not([alt])').length,
      missingLabels: document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])').length,
      missingHeadings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length === 0,
      focusableElements: document.querySelectorAll('[tabindex]:not([tabindex="-1"])').length,
      ariaElements: document.querySelectorAll('[aria-label], [aria-labelledby], [role]').length
    };
    
    setTestResults(prev => ({ ...prev, accessibility: results }));
  };

  const runPerformanceTest = () => {
    performance.startRender();
    
    // Simulate heavy operation
    setTimeout(() => {
      performance.endRender();
      
      const results = {
        renderTime: performance.metrics.renderTime,
        memoryUsage: performance.metrics.memoryUsage,
        fps: performance.metrics.fps,
        connectionType: network.effectiveType,
        isSlowConnection: network.isSlowConnection
      };
      
      setTestResults(prev => ({ ...prev, performance: results }));
    }, 100);
  };

  const testHapticFeedback = (type) => {
    haptic[type]();
    setTestResults(prev => ({
      ...prev,
      haptic: { ...prev.haptic, [type]: 'tested' }
    }));
  };

  if (!isVisible) return null;

  return (
    <div className="mobile-testing-panel">
      <div className="testing-header">
        <h2>Mobile UI Testing Panel</h2>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="testing-content">
        {/* Device Information */}
        <div className="test-section">
          <h3>Device Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Screen Size:</span>
              <span className="value">{window.innerWidth} × {window.innerHeight}</span>
            </div>
            <div className="info-item">
              <span className="label">Orientation:</span>
              <span className="value">{orientation.type} ({orientation.angle}°)</span>
            </div>
            <div className="info-item">
              <span className="label">Network:</span>
              <span className="value">
                {network.isOnline ? 'Online' : 'Offline'} 
                ({network.effectiveType})
              </span>
            </div>
            <div className="info-item">
              <span className="label">Keyboard:</span>
              <span className="value">
                {keyboard.isKeyboardOpen ? `Open (${keyboard.keyboardHeight}px)` : 'Closed'}
              </span>
            </div>
          </div>
        </div>

        {/* Touch Target Tests */}
        <div className="test-section">
          <h3>Touch Target Tests</h3>
          <button 
            className="test-btn"
            onClick={runTouchTargetTest}
          >
            Run Touch Target Test
          </button>
          
          {testResults.touchTargets && (
            <div className="test-results">
              <p>
                Valid targets: {testResults.touchTargets.filter(t => t.isValid).length} / {testResults.touchTargets.length}
              </p>
              <div className="results-list">
                {testResults.touchTargets.filter(t => !t.isValid).map((target, index) => (
                  <div key={index} className="result-item error">
                    {target.element}#{target.id}: {target.width}×{target.height}px (too small)
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Haptic Feedback Tests */}
        <div className="test-section">
          <h3>Haptic Feedback Tests</h3>
          <div className="haptic-buttons">
            {Object.keys(haptic).filter(key => typeof haptic[key] === 'function' && key !== 'vibrate').map(type => (
              <button
                key={type}
                className="haptic-btn"
                onClick={() => testHapticFeedback(type)}
              >
                {type}
              </button>
            ))}
          </div>
          <p className="haptic-support">
            Haptic Support: {haptic.isSupported ? '✅ Supported' : '❌ Not Supported'}
          </p>
        </div>

        {/* Accessibility Tests */}
        <div className="test-section">
          <h3>Accessibility Tests</h3>
          <button 
            className="test-btn"
            onClick={runAccessibilityTest}
          >
            Run Accessibility Test
          </button>
          
          {testResults.accessibility && (
            <div className="test-results">
              <div className="result-item">
                Missing alt text: {testResults.accessibility.missingAltText}
              </div>
              <div className="result-item">
                Missing labels: {testResults.accessibility.missingLabels}
              </div>
              <div className="result-item">
                Focusable elements: {testResults.accessibility.focusableElements}
              </div>
              <div className="result-item">
                ARIA elements: {testResults.accessibility.ariaElements}
              </div>
            </div>
          )}
        </div>

        {/* Performance Tests */}
        <div className="test-section">
          <h3>Performance Tests</h3>
          <button 
            className="test-btn"
            onClick={runPerformanceTest}
          >
            Run Performance Test
          </button>
          
          {testResults.performance && (
            <div className="test-results">
              <div className="result-item">
                Render Time: {testResults.performance.renderTime.toFixed(2)}ms
              </div>
              <div className="result-item">
                Memory Usage: {testResults.performance.memoryUsage}MB
              </div>
              <div className="result-item">
                FPS: {testResults.performance.fps}
              </div>
              <div className="result-item">
                Connection: {testResults.performance.connectionType}
                {testResults.performance.isSlowConnection && ' (Slow)'}
              </div>
            </div>
          )}
        </div>

        {/* Gesture Tests */}
        <div className="test-section">
          <h3>Gesture Tests</h3>
          <div 
            className="gesture-test-area"
            {...gesture}
          >
            <p>Try gestures here:</p>
            <ul>
              <li>Swipe left/right</li>
              <li>Tap</li>
              <li>Long press</li>
            </ul>
            <p className="gesture-hint">Check console for gesture events</p>
          </div>
        </div>

        {/* Pull to Refresh Test */}
        <div className="test-section">
          <h3>Pull to Refresh Test</h3>
          <div 
            className="pull-test-area"
            {...pullToRefresh}
          >
            <p>Pull down to test refresh</p>
            {pullToRefresh.isPulling && (
              <div className="pull-indicator">
                Pulling... {Math.round(pullToRefresh.pullDistance)}px
                {pullToRefresh.canRefresh && ' (Release to refresh)'}
              </div>
            )}
            {pullToRefresh.isRefreshing && (
              <div className="refresh-indicator">Refreshing...</div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .mobile-testing-panel {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: white;
          z-index: 10000;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        .testing-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: #f3f4f6;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .testing-header h2 {
          margin: 0;
          font-size: 18px;
          color: #1f2937;
        }

        .close-btn {
          background: #ef4444;
          color: white;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .testing-content {
          padding: 16px;
        }

        .test-section {
          margin-bottom: 24px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .test-section h3 {
          margin: 0 0 12px 0;
          font-size: 16px;
          color: #374151;
        }

        .info-grid {
          display: grid;
          gap: 8px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 8px;
          background: white;
          border-radius: 4px;
          font-size: 14px;
        }

        .label {
          font-weight: 600;
          color: #6b7280;
        }

        .value {
          color: #1f2937;
        }

        .test-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 12px;
        }

        .test-btn:active {
          transform: scale(0.95);
        }

        .test-results {
          background: white;
          border-radius: 6px;
          padding: 12px;
          border: 1px solid #d1d5db;
        }

        .result-item {
          padding: 6px 0;
          font-size: 14px;
          border-bottom: 1px solid #f3f4f6;
        }

        .result-item:last-child {
          border-bottom: none;
        }

        .result-item.error {
          color: #dc2626;
          font-weight: 600;
        }

        .haptic-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 8px;
          margin-bottom: 12px;
        }

        .haptic-btn {
          background: #10b981;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          text-transform: capitalize;
        }

        .haptic-btn:active {
          transform: scale(0.95);
        }

        .haptic-support {
          font-size: 14px;
          font-weight: 600;
          margin: 0;
        }

        .gesture-test-area,
        .pull-test-area {
          background: white;
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          min-height: 120px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .gesture-test-area ul {
          list-style: none;
          padding: 0;
          margin: 8px 0;
        }

        .gesture-test-area li {
          padding: 4px 0;
          font-size: 14px;
          color: #6b7280;
        }

        .gesture-hint {
          font-size: 12px;
          color: #9ca3af;
          margin: 8px 0 0 0;
        }

        .pull-indicator,
        .refresh-indicator {
          background: #3b82f6;
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          margin-top: 8px;
        }

        .refresh-indicator {
          background: #10b981;
        }

        .results-list {
          max-height: 200px;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
};

// Testing trigger component
const MobileTestingTrigger = () => {
  const [showPanel, setShowPanel] = useState(false);

  // Show testing panel in development mode
  useEffect(() => {
    const showTesting = localStorage.getItem('mobile-testing') === 'true' || 
                       window.location.search.includes('testing=true');
    
    if (showTesting) {
      const trigger = document.createElement('div');
      trigger.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        background: #ef4444;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        user-select: none;
      `;
      trigger.innerHTML = '🔧';
      trigger.onclick = () => setShowPanel(true);
      
      document.body.appendChild(trigger);
      
      return () => {
        if (document.body.contains(trigger)) {
          document.body.removeChild(trigger);
        }
      };
    }
  }, []);

  return (
    <MobileTestingPanel 
      isVisible={showPanel} 
      onClose={() => setShowPanel(false)} 
    />
  );
};

export { MobileTestingPanel, MobileTestingTrigger };