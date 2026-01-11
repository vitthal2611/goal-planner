import React, { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { saveData, getData } from '../services/database';

const SchedulePlanner = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [schedules, setSchedules] = useState({});
  const [user, setUser] = useState(null);
  const [showCopyModal, setShowCopyModal] = useState(false);

  const timeSlots = [
    '7:00 AM - 7:45 AM',
    '8:00 AM - 8:45 AM',
    '9:00 AM - 9:45 AM',
    '10:00 AM - 10:45 AM',
    '11:00 AM - 11:45 AM',
    '12:00 PM - 12:45 PM',
    '1:00 PM - 1:45 PM',
    '2:00 PM - 2:45 PM',
    '3:00 PM - 3:45 PM',
    '4:00 PM - 4:45 PM',
    '5:00 PM - 5:45 PM',
    '6:00 PM - 6:45 PM',
    '7:00 PM - 7:45 PM',
    '8:00 PM - 8:45 PM',
    '9:00 PM - 9:45 PM',
    '10:00 PM - 10:45 PM'
  ];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const result = await getData(`users/${currentUser.uid}/schedules`);
        if (result.success && result.data) {
          setSchedules(result.data);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const updateActivity = async (timeSlot, activity) => {
    const newSchedules = {
      ...schedules,
      [selectedDate]: {
        ...schedules[selectedDate],
        [timeSlot]: activity
      }
    };
    setSchedules(newSchedules);
    
    if (user) {
      await saveData(`users/${user.uid}/schedules`, newSchedules);
    }
  };

  const navigateDay = (direction) => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + direction);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const copyFromDate = async (fromDate) => {
    if (schedules[fromDate]) {
      const newSchedules = {
        ...schedules,
        [selectedDate]: { ...schedules[fromDate] }
      };
      setSchedules(newSchedules);
      if (user) {
        await saveData(`users/${user.uid}/schedules`, newSchedules);
      }
      setShowCopyModal(false);
    }
  };

  const getAvailableDates = () => {
    return Object.keys(schedules).filter(date => 
      date !== selectedDate && 
      Object.values(schedules[date]).some(activity => activity.trim())
    ).sort().reverse();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: 'white', 
        padding: '30px', 
        borderRadius: '16px', 
        marginBottom: '30px',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: '0 0 10px', fontSize: '28px', fontWeight: '700' }}>📅 Daily Schedule</h1>
        <p style={{ margin: '0', opacity: '0.9', fontSize: '16px' }}>Plan your perfect day</p>
      </div>
      
      <div style={{ 
        background: 'white', 
        padding: '25px', 
        borderRadius: '16px', 
        marginBottom: '25px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #f0f0f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
          <button 
            onClick={() => navigateDay(-1)} 
            style={{ 
              padding: '12px 20px', 
              background: '#f8f9fa', 
              border: '2px solid #e9ecef', 
              borderRadius: '12px', 
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              color: '#495057',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.background = '#e9ecef'}
            onMouseOut={(e) => e.target.style.background = '#f8f9fa'}
          >
            ← Previous Day
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: '1', justifyContent: 'center' }}>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ 
                padding: '12px 16px', 
                fontSize: '16px', 
                border: '2px solid #e9ecef',
                borderRadius: '12px',
                background: 'white',
                fontWeight: '500'
              }}
            />
            <div style={{ 
              background: 'linear-gradient(135deg, #667eea, #764ba2)', 
              color: 'white', 
              padding: '12px 20px', 
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              {getDayName(selectedDate)}
            </div>
          </div>
          
          <button 
            onClick={() => navigateDay(1)} 
            style={{ 
              padding: '12px 20px', 
              background: '#f8f9fa', 
              border: '2px solid #e9ecef', 
              borderRadius: '12px', 
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              color: '#495057',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.background = '#e9ecef'}
            onMouseOut={(e) => e.target.style.background = '#f8f9fa'}
          >
            Next Day →
          </button>
          
          <button 
            onClick={() => setShowCopyModal(true)} 
            style={{ 
              padding: '12px 20px', 
              background: 'linear-gradient(135deg, #28a745, #20c997)', 
              border: 'none', 
              borderRadius: '12px', 
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              color: 'white',
              transition: 'all 0.2s ease'
            }}
          >
            📋 Copy Day
          </button>
        </div>
      </div>

      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #f0f0f0'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '180px 1fr', 
          background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
          padding: '20px',
          fontWeight: '700',
          fontSize: '16px',
          color: '#495057',
          borderBottom: '2px solid #dee2e6'
        }}>
          <div>⏰ Time</div>
          <div>📝 Activity</div>
        </div>
        
        {timeSlots.map((timeSlot, index) => (
          <div key={timeSlot} style={{
            display: 'grid',
            gridTemplateColumns: '180px 1fr',
            borderBottom: index < timeSlots.length - 1 ? '1px solid #f0f0f0' : 'none',
            transition: 'background-color 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            <div style={{ 
              padding: '20px', 
              background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
              borderRight: '1px solid #f0f0f0',
              fontWeight: '600',
              fontSize: '14px',
              color: '#6c757d',
              display: 'flex',
              alignItems: 'center'
            }}>
              {timeSlot}
            </div>
            <div style={{ padding: '15px' }}>
              <input
                type="text"
                placeholder="What's planned for this time?"
                value={schedules[selectedDate]?.[timeSlot] || ''}
                onChange={(e) => updateActivity(timeSlot, e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e9ecef',
                  borderRadius: '12px',
                  fontSize: '15px',
                  background: 'white',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e9ecef';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ 
        marginTop: '25px', 
        padding: '20px', 
        background: 'linear-gradient(135deg, #667eea, #764ba2)', 
        borderRadius: '16px', 
        textAlign: 'center',
        color: 'white'
      }}>
        <p style={{ margin: '0', fontSize: '14px', opacity: '0.9' }}>✨ Your schedule is automatically saved</p>
      </div>
      
      {/* Copy Modal */}
      {showCopyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowCopyModal(false)}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '16px',
            maxWidth: '400px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px', fontSize: '20px', fontWeight: '700' }}>📋 Copy Schedule</h3>
            <p style={{ margin: '0 0 20px', color: '#666' }}>Select a day to copy its schedule to {selectedDate}:</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {getAvailableDates().length > 0 ? (
                getAvailableDates().map(date => (
                  <button
                    key={date}
                    onClick={() => copyFromDate(date)}
                    style={{
                      padding: '12px 16px',
                      background: '#f8f9fa',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#e9ecef'}
                    onMouseOut={(e) => e.target.style.background = '#f8f9fa'}
                  >
                    {date} ({getDayName(date)})
                  </button>
                ))
              ) : (
                <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>No previous schedules found</p>
              )}
            </div>
            
            <button
              onClick={() => setShowCopyModal(false)}
              style={{
                padding: '10px 20px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePlanner;