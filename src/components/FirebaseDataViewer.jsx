import React, { useState, useEffect } from 'react';
import { ref, get, remove } from 'firebase/database';
import { database, auth } from '../config/firebase';

export const FirebaseDataViewer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPath, setSelectedPath] = useState('');

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('openDataViewer', handleOpen);
    return () => window.removeEventListener('openDataViewer', handleOpen);
  }, []);

  const loadData = async () => {
    if (!auth.currentUser) return;
    
    setLoading(true);
    try {
      const userId = auth.currentUser.uid;
      const userRef = ref(database, `users/${userId}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        setData(snapshot.val());
      } else {
        setData(null);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Failed to load data: ' + error.message);
    }
    setLoading(false);
  };

  const deleteData = async (path) => {
    if (!confirm(`Delete data at: ${path}?`)) return;
    
    try {
      const userId = auth.currentUser.uid;
      const dataRef = ref(database, `users/${userId}/${path}`);
      await remove(dataRef);
      alert('Data deleted successfully');
      loadData();
    } catch (error) {
      alert('Failed to delete: ' + error.message);
    }
  };

  const renderData = (obj, path = '') => {
    if (!obj || typeof obj !== 'object') {
      return <span style={{ color: '#059669' }}>{JSON.stringify(obj)}</span>;
    }

    return (
      <div style={{ marginLeft: '20px' }}>
        {Object.entries(obj).map(([key, value]) => {
          const currentPath = path ? `${path}/${key}` : key;
          const isObject = value && typeof value === 'object';
          
          return (
            <div key={currentPath} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ color: '#667eea' }}>{key}:</strong>
                {!isObject && renderData(value)}
                <button
                  onClick={() => deleteData(currentPath)}
                  style={{
                    padding: '2px 8px',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                >
                  🗑️
                </button>
              </div>
              {isObject && renderData(value, currentPath)}
            </div>
          );
        })}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      zIndex: 10001,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }} onClick={() => setIsOpen(false)}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0 }}>🔍 Firebase Data Viewer</h3>
          <button onClick={() => setIsOpen(false)} style={{
            border: 'none',
            background: 'none',
            fontSize: '24px',
            cursor: 'pointer'
          }}>×</button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={loadData}
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            {loading ? 'Loading...' : '🔄 Load Data'}
          </button>
        </div>

        {data ? (
          <div style={{
            background: '#f9fafb',
            padding: '16px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '13px',
            overflow: 'auto',
            maxHeight: '60vh'
          }}>
            <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#374151' }}>
              Path: users/{auth.currentUser?.uid}
            </div>
            {renderData(data)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            {loading ? 'Loading...' : 'Click "Load Data" to view Firebase data'}
          </div>
        )}

        <div style={{
          marginTop: '20px',
          padding: '12px',
          background: '#fff3cd',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#856404'
        }}>
          ⚠️ <strong>Warning:</strong> Deleting data is permanent and cannot be undone!
        </div>
      </div>
    </div>
  );
};
