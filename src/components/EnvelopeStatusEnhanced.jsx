import React, { useState } from 'react';
import './EnvelopeStatusEnhanced.css';

const EnvelopeStatusEnhanced = ({ envelopes, onAddExpense, onAllocateBudget, getRolloverAmount }) => {
    const [viewMode, setViewMode] = useState('detailed'); // 'detailed' or 'compact'

    const getStatus = (envelope, category, name) => {
        // Calculate rollover dynamically - not stored
        const rollover = getRolloverAmount ? getRolloverAmount(category, name) : 0;
        const available = envelope.budgeted + rollover - envelope.spent;
        const percentage = envelope.budgeted > 0 ? (envelope.spent / envelope.budgeted) * 100 : 0;
        
        if (available <= 0) return { status: 'blocked', icon: '🚫', color: 'var(--danger)' };
        if (percentage >= 90) return { status: 'critical', icon: '⚠️', color: '#dc2626' };
        if (percentage >= 75) return { status: 'warning', icon: '⚡', color: 'var(--warning)' };
        if (percentage >= 50) return { status: 'moderate', icon: '📊', color: '#3b82f6' };
        return { status: 'healthy', icon: '✅', color: 'var(--success)' };
    };

    const getCircularProgress = (percentage) => {
        const radius = 36;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;
        return { circumference, offset };
    };

    const renderDetailedView = () => {
        return (
            <div className="envelope-grid-detailed">
                {Object.keys(envelopes).map(category =>
                    Object.keys(envelopes[category]).map(name => {
                        const env = envelopes[category][name];
                        const remaining = env.budgeted + env.rollover - env.spent;
                        const statusInfo = getStatus(env);
                        const percentage = env.budgeted > 0 ? (env.spent / env.budgeted) * 100 : 0;
                        const { circumference, offset } = getCircularProgress(percentage);

                        return (
                            <div 
                                key={`${category}.${name}`} 
                                className={`envelope-card-enhanced ${statusInfo.status}`}
                            >
                                {/* Tooltip */}
                                <div className="envelope-tooltip">
                                    {percentage.toFixed(0)}% spent • ₹{remaining.toLocaleString()} left
                                </div>

                                <div className="envelope-card-header">
                                    <div className="envelope-card-title">
                                        <div className="envelope-name">{name}</div>
                                        <div className="envelope-category">{category}</div>
                                    </div>
                                    
                                    {/* Circular Progress */}
                                    <div className="circular-progress">
                                        <svg width="80" height="80">
                                            <defs>
                                                <linearGradient id="gradient-healthy" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#10b981" />
                                                    <stop offset="100%" stopColor="#059669" />
                                                </linearGradient>
                                                <linearGradient id="gradient-moderate" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#3b82f6" />
                                                    <stop offset="100%" stopColor="#2563eb" />
                                                </linearGradient>
                                                <linearGradient id="gradient-warning" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#f59e0b" />
                                                    <stop offset="100%" stopColor="#d97706" />
                                                </linearGradient>
                                                <linearGradient id="gradient-critical" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#dc2626" />
                                                    <stop offset="100%" stopColor="#991b1b" />
                                                </linearGradient>
                                                <linearGradient id="gradient-blocked" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#ef4444" />
                                                    <stop offset="100%" stopColor="#7f1d1d" />
                                                </linearGradient>
                                            </defs>
                                            <circle
                                                className="circular-progress-bg"
                                                cx="40"
                                                cy="40"
                                                r="36"
                                            />
                                            <circle
                                                className={`circular-progress-fill ${statusInfo.status}`}
                                                cx="40"
                                                cy="40"
                                                r="36"
                                                strokeDasharray={circumference}
                                                strokeDashoffset={offset}
                                            />
                                        </svg>
                                        <div className="circular-progress-text">
                                            {percentage.toFixed(0)}%
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="envelope-card-stats">
                                    <div className="stat-item">
                                        <div className="stat-label">Budgeted</div>
                                        <div className="stat-value">₹{env.budgeted.toLocaleString()}</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-label">Spent</div>
                                        <div className="stat-value">₹{env.spent.toLocaleString()}</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-label">Remaining</div>
                                        <div className={`stat-value ${remaining <= 0 ? 'negative' : 'remaining'}`}>
                                            ₹{remaining.toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Visual Envelope */}
                                <div className="envelope-visual">
                                    <div className="envelope-icon">
                                        <div className="envelope-flap"></div>
                                        <div 
                                            className={`envelope-fill ${statusInfo.status}`}
                                            style={{ height: `${Math.min(percentage, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="envelope-quick-actions">
                                    <button 
                                        className="quick-action-btn"
                                        onClick={() => onAddExpense && onAddExpense(category, name)}
                                        title="Add expense"
                                    >
                                        <span>💸</span>
                                        <span>Add</span>
                                    </button>
                                    <button 
                                        className="quick-action-btn"
                                        onClick={() => onAllocateBudget && onAllocateBudget(category, name)}
                                        title="Allocate budget"
                                    >
                                        <span>💰</span>
                                        <span>Budget</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        );
    };

    const renderCompactView = () => {
        return (
            <div className="envelope-grid-compact">
                {Object.keys(envelopes).map(category =>
                    Object.keys(envelopes[category]).map(name => {
                        const env = envelopes[category][name];
                        const remaining = env.budgeted + env.rollover - env.spent;
                        const statusInfo = getStatus(env);
                        const percentage = env.budgeted > 0 ? (env.spent / env.budgeted) * 100 : 0;

                        return (
                            <div 
                                key={`${category}.${name}`} 
                                className={`envelope-card-compact ${statusInfo.status}`}
                            >
                                {/* Tooltip */}
                                <div className="envelope-tooltip">
                                    {category} • {percentage.toFixed(0)}% spent
                                </div>

                                <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                                    {statusInfo.icon}
                                </div>
                                <div style={{ 
                                    fontSize: '14px', 
                                    fontWeight: '700', 
                                    textTransform: 'uppercase',
                                    marginBottom: '8px',
                                    color: 'var(--gray-900)'
                                }}>
                                    {name}
                                </div>
                                <div style={{ 
                                    fontSize: '18px', 
                                    fontWeight: '800',
                                    color: remaining <= 0 ? 'var(--danger)' : 'var(--success)',
                                    marginBottom: '4px'
                                }}>
                                    ₹{remaining.toLocaleString()}
                                </div>
                                <div style={{ 
                                    fontSize: '11px', 
                                    color: 'var(--gray-600)',
                                    fontWeight: '600'
                                }}>
                                    of ₹{env.budgeted.toLocaleString()}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        );
    };

    return (
        <div className="envelope-status-enhanced">
            {/* View Toggle */}
            <div className="view-toggle">
                <button 
                    className={`view-toggle-btn ${viewMode === 'detailed' ? 'active' : ''}`}
                    onClick={() => setViewMode('detailed')}
                >
                    📊 Detailed View
                </button>
                <button 
                    className={`view-toggle-btn ${viewMode === 'compact' ? 'active' : ''}`}
                    onClick={() => setViewMode('compact')}
                >
                    📋 Compact View
                </button>
            </div>

            {/* Render View */}
            {viewMode === 'detailed' ? renderDetailedView() : renderCompactView()}
        </div>
    );
};

export default EnvelopeStatusEnhanced;
