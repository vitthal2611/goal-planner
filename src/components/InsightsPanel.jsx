import React from 'react';

const InsightsPanel = ({ envelopes }) => {
  const insights = {
    need: envelopes.filter(e => e.type === 'need').reduce((sum, e) => sum + e.spent, 0),
    want: envelopes.filter(e => e.type === 'want').reduce((sum, e) => sum + e.spent, 0),
    saving: envelopes.filter(e => e.type === 'saving').reduce((sum, e) => sum + e.spent, 0)
  };
  
  const total = insights.need + insights.want + insights.saving;
  const needPercent = total > 0 ? (insights.need / total) * 100 : 0;
  const wantPercent = total > 0 ? (insights.want / total) * 100 : 0;
  const savingPercent = total > 0 ? (insights.saving / total) * 100 : 0;

  const getRecommendation = () => {
    if (savingPercent < 20) return "💡 Try to save at least 20% of your spending";
    if (wantPercent > 30) return "⚠️ Consider reducing wants spending";
    if (needPercent > 60) return "📊 Good balance! Needs are prioritized";
    return "✅ Great spending balance!";
  };

  return (
    <div style={{
      background: 'white',
      padding: '16px',
      borderRadius: '12px',
      marginBottom: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#374151' }}>
        💰 Spending Insights
      </h3>
      
      {/* Progress Bar */}
      <div style={{
        display: 'flex',
        height: '8px',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '12px',
        background: '#f3f4f6'
      }}>
        <div style={{ width: `${needPercent}%`, background: '#ef4444' }} />
        <div style={{ width: `${wantPercent}%`, background: '#f59e0b' }} />
        <div style={{ width: `${savingPercent}%`, background: '#10b981' }} />
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '12px' }}>
        <span>🔴 Needs {needPercent.toFixed(0)}%</span>
        <span>🟡 Wants {wantPercent.toFixed(0)}%</span>
        <span>🟢 Savings {savingPercent.toFixed(0)}%</span>
      </div>

      {/* Recommendation */}
      <div style={{
        background: '#f8fafc',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '13px',
        color: '#374151',
        fontWeight: '500'
      }}>
        {getRecommendation()}
      </div>
    </div>
  );
};

export default InsightsPanel;