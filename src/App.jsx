import React from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import AppLayout from './components/AppLayout';
import QuickTrackTab from './components/QuickTrack/QuickTrackTab';
import BalanceSummaryTab from './components/BalanceSummary/BalanceSummaryTab';
import TodayTransactionsTab from './components/TodayTransactions/TodayTransactionsTab';
import TransactionReviewTab from './components/TransactionReview/TransactionReviewTab';
import InsightsTab from './components/Insights/InsightsTab';
import DrillDownTab from './components/DrillDown/DrillDownTab';
import HabitsTab from './components/Habits/HabitsTab';
import NWSTab from './components/NWS/NWSTab';
import './App.css';

const AppContent = () => {
  const { activeTab } = useApp();

  const renderTab = () => {
    switch (activeTab) {
      case 'quick-track': return <QuickTrackTab />;
      case 'balance': return <BalanceSummaryTab />;
      case 'today': return <TodayTransactionsTab />;
      case 'review': return <TransactionReviewTab />;
      case 'insights': return <InsightsTab />;
      case 'drill-down': return <DrillDownTab />;
      case 'habits': return <HabitsTab />;
      case 'nws': return <NWSTab />;
      default: return <QuickTrackTab />;
    }
  };

  return (
    <AppLayout>
      {renderTab()}
    </AppLayout>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
