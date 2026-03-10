import { useState, useCallback } from 'react';

export const useEnvelopeBudgetState = () => {
  const [activeTab, setActiveTab] = useState('monthly');
  const [viewMode, setViewMode] = useState('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [swipeIndicator, setSwipeIndicator] = useState({ show: false, direction: '' });

  const showSwipeIndicator = useCallback((direction) => {
    setSwipeIndicator({ show: true, direction });
    setTimeout(() => setSwipeIndicator({ show: false, direction: '' }), 500);
  }, []);

  return {
    activeTab,
    setActiveTab,
    viewMode,
    setViewMode,
    selectedYear,
    setSelectedYear,
    showUserProfile,
    setShowUserProfile,
    swipeIndicator,
    showSwipeIndicator
  };
};
