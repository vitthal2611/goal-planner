import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import ProfileModal from './ProfileModal';
import './AppHeader.css';

const TABS = [
  { id: 'quick-track', label: 'Quick Track', icon: '⚡' },
  { id: 'balance', label: 'Balance', icon: '💰' },
  { id: 'today', label: 'Today', icon: '📅' },
  { id: 'review', label: 'Review', icon: '📊' },
  { id: 'insights', label: 'Insights', icon: '📈' },
  { id: 'drill-down', label: 'Drill Down', icon: '🔍' },
  { id: 'habits', label: 'Habits', icon: '✅' },
  { id: 'nws', label: 'NWS', icon: '💎' },
];

const AppHeader = () => {
  const { activeTab, setActiveTab } = useApp();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <>
      <div className="app-header-container">
        <h1 className="app-header">Life Tracker</h1>
        
        <div className="app-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`app-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <button 
          className="profile-btn" 
          onClick={() => setShowProfile(true)}
          title="Settings"
        >
          ⚙️
        </button>
      </div>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
};

export default AppHeader;
