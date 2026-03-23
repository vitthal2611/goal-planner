import React from 'react';
import { useApp } from '../contexts/AppContext';
import AppHeader from './AppHeader';
import DateNavigation from './DateNavigation';
import './AppLayout.css';

const AppLayout = ({ children }) => {
  return (
    <div className="app-container">
      <div className="app-header-row">
        <AppHeader />
        <DateNavigation />
      </div>
      <main className="app-content">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
