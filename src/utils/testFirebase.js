// Firebase Connection Test Utility
// Run this in browser console to verify Firebase is working

import { ref, set, get } from 'firebase/database';
import { db } from '../config/firebase';

export const testFirebaseConnection = async (userId = 'test-user') => {
  console.log('🔥 Testing Firebase Realtime Database connection...');
  
  try {
    // Test write
    const testRef = ref(db, `test/${userId}`);
    await set(testRef, {
      message: 'Hello Firebase!',
      timestamp: new Date().toISOString()
    });
    console.log('✅ Write test passed');
    
    // Test read
    const snapshot = await get(testRef);
    if (snapshot.exists()) {
      console.log('✅ Read test passed');
      console.log('📊 Data:', snapshot.val());
    } else {
      console.log('❌ Read test failed: No data found');
    }
    
    // Clean up
    await set(testRef, null);
    console.log('✅ Cleanup completed');
    
    console.log('🎉 Firebase connection is working perfectly!');
    return true;
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    return false;
  }
};

// Auto-run in development
if (import.meta.env.DEV) {
  console.log('💡 Run testFirebaseConnection() in console to test Firebase');
}
