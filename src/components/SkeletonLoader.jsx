import React from 'react';
import './SkeletonLoader.css';

export const CardSkeleton = () => (
  <div className="skeleton-card">
    <div className="skeleton-header">
      <div className="skeleton-circle" />
      <div className="skeleton-text-block">
        <div className="skeleton-text skeleton-title" />
        <div className="skeleton-text skeleton-subtitle" />
      </div>
    </div>
    <div className="skeleton-bar" />
    <div className="skeleton-footer">
      <div className="skeleton-text skeleton-small" />
      <div className="skeleton-text skeleton-small" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="skeleton-table">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="skeleton-row">
        <div className="skeleton-text skeleton-date" />
        <div className="skeleton-text skeleton-desc" />
        <div className="skeleton-text skeleton-tag" />
        <div className="skeleton-text skeleton-amount" />
      </div>
    ))}
  </div>
);

export const ListSkeleton = ({ items = 3 }) => (
  <div className="skeleton-list">
    {[...Array(items)].map((_, i) => (
      <div key={i} className="skeleton-list-item">
        <div className="skeleton-text skeleton-full" />
        <div className="skeleton-text skeleton-half" />
      </div>
    ))}
  </div>
);
