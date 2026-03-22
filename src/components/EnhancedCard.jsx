import React from 'react';
import './EnhancedCard.css';

const EnhancedCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  color = 'primary',
  onClick,
  loading = false
}) => (
  <div className={`enhanced-card ${color} ${onClick ? 'clickable' : ''}`} onClick={onClick}>
    {loading ? (
      <div className="card-skeleton">
        <div className="skeleton-icon" />
        <div className="skeleton-content">
          <div className="skeleton-line" />
          <div className="skeleton-line short" />
        </div>
      </div>
    ) : (
      <>
        {icon && <div className="card-icon">{icon}</div>}
        <div className="card-content">
          <div className="card-title">{title}</div>
          <div className="card-value">{value}</div>
          {subtitle && <div className="card-subtitle">{subtitle}</div>}
          {trend && (
            <div className={`card-trend ${trend > 0 ? 'up' : 'down'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </div>
          )}
        </div>
      </>
    )}
  </div>
);

export const StatCard = ({ label, value, icon, color }) => (
  <div className={`stat-card ${color}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-content">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

export const CompactCard = ({ children, className = '' }) => (
  <div className={`compact-card ${className}`}>
    {children}
  </div>
);

export default EnhancedCard;
