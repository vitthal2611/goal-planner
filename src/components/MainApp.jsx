import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useFinanceStore } from '../store/financeStore';
import { useHabitStore } from '../store/habitStore';
import FinanceTab from './Finance/FinanceTab';
import HabitsTab from './Habits/HabitsTab';
import ProfileModal from './Profile/ProfileModal';
import './MainApp.css';

export default function MainApp() {
  const [activeTab, setActiveTab] = useState('finance');
  const [showProfile, setShowProfile] = useState(false);
  const { user } = useAuthStore();
  const loadFinanceData = useFinanceStore(state => state.loadUserData);
  const loadHabitData = useHabitStore(state => state.loadUserData);

  useEffect(() => {
    if (user) {
      loadFinanceData(user.uid);
      loadHabitData(user.uid);
    }
  }, [user, loadFinanceData, loadHabitData]);

  const getInitials = () => {
    if (!user?.email) return '?';
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <div className="main-app">
      <div className="app-container">
        <div className="top-bar">
          <button className="profile-btn" onClick={() => setShowProfile(true)}>
            {getInitials()}
          </button>
          <h1 className="app-header">Life Tracker</h1>
        </div>

        <div className="app-tabs">
          <button
            className={`app-tab ${activeTab === 'finance' ? 'active' : ''}`}
            onClick={() => setActiveTab('finance')}
          >
            💰 Finance
          </button>
          <button
            className={`app-tab ${activeTab === 'habits' ? 'active' : ''}`}
            onClick={() => setActiveTab('habits')}
          >
            ✅ Habits
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'finance' && <FinanceTab />}
          {activeTab === 'habits' && <HabitsTab />}
        </div>
      </div>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </div>
  );
}
