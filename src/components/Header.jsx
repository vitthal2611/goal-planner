import React from 'react';
import './Header.css';

const Header = ({ title = "💰 Budget Planner", children }) => {
  return (
    <header className="app-header">
      <h1 className="app-title">{title}</h1>
      {children && <div className="header-actions">{children}</div>}
    </header>
  );
};

export default Header;