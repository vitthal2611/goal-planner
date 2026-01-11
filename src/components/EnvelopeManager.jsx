import React from 'react';

const EnvelopeManager = ({ envelopes, getStatus, onDeleteEnvelope }) => {
    return (
        <div className="card">
            <div className="card-header">
                <h3>📊 Envelope Status</h3>
            </div>
            <div className="table-container">
                <table className="envelope-table">
                    <thead>
                        <tr>
                            <th>Envelope</th>
                            <th>Category</th>
                            <th>Budgeted</th>
                            <th>Spent</th>
                            <th>Remaining</th>
                            <th>Rollover</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(envelopes).map(category =>
                            Object.keys(envelopes[category]).map(name => {
                                const env = envelopes[category][name];
                                const remaining = env.budgeted + env.rollover - env.spent;
                                const status = getStatus(env);
                                return (
                                    <tr key={`${category}.${name}`}>
                                        <td style={{textTransform: 'uppercase'}}>{name}</td>
                                        <td style={{textTransform: 'uppercase'}}>{category}</td>
                                        <td>₹{env.budgeted.toLocaleString()}</td>
                                        <td>₹{env.spent.toLocaleString()}</td>
                                        <td>₹{remaining.toLocaleString()}</td>
                                        <td>₹{env.rollover.toLocaleString()}</td>
                                        <td>
                                            <span className={`status ${status}`}>
                                                {status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
                <div className="mobile-card-view">
                    {Object.keys(envelopes).map(category =>
                        Object.keys(envelopes[category]).map(name => {
                            const env = envelopes[category][name];
                            const remaining = env.budgeted + env.rollover - env.spent;
                            const status = getStatus(env);
                            return (
                                <div key={`${category}.${name}`} className="mobile-envelope-card">
                                    <div className="mobile-card-header">
                                        <span style={{textTransform: 'uppercase'}}>{name}</span>
                                        <span className={`status ${status}`}>{status}</span>
                                    </div>
                                    <div className="mobile-card-content">
                                        <div className="mobile-card-field">
                                            <span className="mobile-card-label">Category</span>
                                            <span className="mobile-card-value" style={{textTransform: 'uppercase'}}>{category}</span>
                                        </div>
                                        <div className="mobile-card-field">
                                            <span className="mobile-card-label">Budgeted</span>
                                            <span className="mobile-card-value">₹{env.budgeted.toLocaleString()}</span>
                                        </div>
                                        <div className="mobile-card-field">
                                            <span className="mobile-card-label">Spent</span>
                                            <span className="mobile-card-value">₹{env.spent.toLocaleString()}</span>
                                        </div>
                                        <div className="mobile-card-field">
                                            <span className="mobile-card-label">Remaining</span>
                                            <span className="mobile-card-value">₹{remaining.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default EnvelopeManager;