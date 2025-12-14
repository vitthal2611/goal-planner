/**
 * Firebase Persistence Test
 * Tests all data operations to ensure proper persistence in Firebase Realtime Database
 */

import { ref, set, get, push, update, remove } from 'firebase/database';
import { database } from '../firebase/config';

const TEST_USER_ID = 'test-user-' + Date.now();

// Test data
const testGoal = {
  title: 'Test Goal',
  yearlyTarget: 100,
  actualProgress: 25,
  unit: 'pages',
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString()
};

const testHabit = {
  name: 'Test Habit',
  goalIds: [],
  trigger: 'After coffee',
  time: '08:00',
  location: 'Home',
  frequency: 'daily',
  isActive: true,
  createdAt: new Date().toISOString()
};

const testLog = {
  habitId: '',
  date: new Date().toISOString().split('T')[0],
  status: 'done',
  notes: 'Test note',
  loggedAt: new Date().toISOString()
};

const testReview = {
  type: 'weekly',
  date: new Date().toISOString(),
  goalProgress: {},
  habitStreaks: {},
  reflections: 'Test reflection',
  insights: [],
  createdAt: new Date().toISOString()
};

// Test functions
async function testGoalPersistence() {
  console.log('🧪 Testing Goal Persistence...');
  
  try {
    // CREATE
    const goalRef = push(ref(database, `users/${TEST_USER_ID}/goals`));
    await set(goalRef, testGoal);
    console.log('✅ Goal created:', goalRef.key);
    
    // READ
    const snapshot = await get(goalRef);
    if (!snapshot.exists()) throw new Error('Goal not found after creation');
    console.log('✅ Goal read successfully');
    
    // UPDATE
    await update(goalRef, { actualProgress: 50 });
    const updatedSnapshot = await get(goalRef);
    if (updatedSnapshot.val().actualProgress !== 50) throw new Error('Goal update failed');
    console.log('✅ Goal updated successfully');
    
    // DELETE
    await remove(goalRef);
    const deletedSnapshot = await get(goalRef);
    if (deletedSnapshot.exists()) throw new Error('Goal deletion failed');
    console.log('✅ Goal deleted successfully');
    
    return { success: true, message: 'Goal persistence test passed' };
  } catch (error) {
    return { success: false, message: `Goal test failed: ${error.message}` };
  }
}

async function testHabitPersistence() {
  console.log('🧪 Testing Habit Persistence...');
  
  try {
    // CREATE
    const habitRef = push(ref(database, `users/${TEST_USER_ID}/habits`));
    await set(habitRef, testHabit);
    console.log('✅ Habit created:', habitRef.key);
    
    // READ
    const snapshot = await get(habitRef);
    if (!snapshot.exists()) throw new Error('Habit not found after creation');
    console.log('✅ Habit read successfully');
    
    // UPDATE
    await update(habitRef, { isActive: false });
    const updatedSnapshot = await get(habitRef);
    if (updatedSnapshot.val().isActive !== false) throw new Error('Habit update failed');
    console.log('✅ Habit updated successfully');
    
    // DELETE
    await remove(habitRef);
    const deletedSnapshot = await get(habitRef);
    if (deletedSnapshot.exists()) throw new Error('Habit deletion failed');
    console.log('✅ Habit deleted successfully');
    
    return { success: true, message: 'Habit persistence test passed' };
  } catch (error) {
    return { success: false, message: `Habit test failed: ${error.message}` };
  }
}

async function testLogPersistence() {
  console.log('🧪 Testing Daily Log Persistence...');
  
  try {
    // CREATE
    const logRef = push(ref(database, `users/${TEST_USER_ID}/logs`));
    await set(logRef, { ...testLog, habitId: 'test-habit-id' });
    console.log('✅ Log created:', logRef.key);
    
    // READ
    const snapshot = await get(logRef);
    if (!snapshot.exists()) throw new Error('Log not found after creation');
    console.log('✅ Log read successfully');
    
    // UPDATE
    await update(logRef, { status: 'skipped' });
    const updatedSnapshot = await get(logRef);
    if (updatedSnapshot.val().status !== 'skipped') throw new Error('Log update failed');
    console.log('✅ Log updated successfully');
    
    // DELETE
    await remove(logRef);
    const deletedSnapshot = await get(logRef);
    if (deletedSnapshot.exists()) throw new Error('Log deletion failed');
    console.log('✅ Log deleted successfully');
    
    return { success: true, message: 'Log persistence test passed' };
  } catch (error) {
    return { success: false, message: `Log test failed: ${error.message}` };
  }
}

async function testReviewPersistence() {
  console.log('🧪 Testing Review Persistence...');
  
  try {
    // CREATE
    const reviewRef = push(ref(database, `users/${TEST_USER_ID}/reviews`));
    await set(reviewRef, testReview);
    console.log('✅ Review created:', reviewRef.key);
    
    // READ
    const snapshot = await get(reviewRef);
    if (!snapshot.exists()) throw new Error('Review not found after creation');
    console.log('✅ Review read successfully');
    
    // UPDATE
    await update(reviewRef, { reflections: 'Updated reflection' });
    const updatedSnapshot = await get(reviewRef);
    if (updatedSnapshot.val().reflections !== 'Updated reflection') throw new Error('Review update failed');
    console.log('✅ Review updated successfully');
    
    // DELETE
    await remove(reviewRef);
    const deletedSnapshot = await get(reviewRef);
    if (deletedSnapshot.exists()) throw new Error('Review deletion failed');
    console.log('✅ Review deleted successfully');
    
    return { success: true, message: 'Review persistence test passed' };
  } catch (error) {
    return { success: false, message: `Review test failed: ${error.message}` };
  }
}

async function testBulkOperations() {
  console.log('🧪 Testing Bulk Operations...');
  
  try {
    // Create multiple goals
    const goalsRef = ref(database, `users/${TEST_USER_ID}/goals`);
    const bulkGoals = {};
    for (let i = 0; i < 5; i++) {
      const key = push(goalsRef).key;
      bulkGoals[key] = { ...testGoal, title: `Goal ${i + 1}` };
    }
    await set(goalsRef, bulkGoals);
    console.log('✅ Bulk goals created');
    
    // Read all goals
    const snapshot = await get(goalsRef);
    const count = Object.keys(snapshot.val() || {}).length;
    if (count !== 5) throw new Error(`Expected 5 goals, found ${count}`);
    console.log('✅ Bulk goals read successfully');
    
    // Clean up
    await remove(goalsRef);
    console.log('✅ Bulk goals deleted');
    
    return { success: true, message: 'Bulk operations test passed' };
  } catch (error) {
    return { success: false, message: `Bulk operations test failed: ${error.message}` };
  }
}

async function testDataIntegrity() {
  console.log('🧪 Testing Data Integrity...');
  
  try {
    // Create goal
    const goalRef = push(ref(database, `users/${TEST_USER_ID}/goals`));
    await set(goalRef, testGoal);
    
    // Create habit linked to goal
    const habitRef = push(ref(database, `users/${TEST_USER_ID}/habits`));
    await set(habitRef, { ...testHabit, goalIds: [goalRef.key] });
    
    // Create log for habit
    const logRef = push(ref(database, `users/${TEST_USER_ID}/logs`));
    await set(logRef, { ...testLog, habitId: habitRef.key });
    
    // Verify relationships
    const habitSnapshot = await get(habitRef);
    const logSnapshot = await get(logRef);
    
    if (!habitSnapshot.val().goalIds.includes(goalRef.key)) {
      throw new Error('Habit-Goal relationship broken');
    }
    if (logSnapshot.val().habitId !== habitRef.key) {
      throw new Error('Log-Habit relationship broken');
    }
    
    console.log('✅ Data relationships verified');
    
    // Clean up
    await remove(ref(database, `users/${TEST_USER_ID}`));
    console.log('✅ Test data cleaned up');
    
    return { success: true, message: 'Data integrity test passed' };
  } catch (error) {
    return { success: false, message: `Data integrity test failed: ${error.message}` };
  }
}

// Run all tests
export async function runAllPersistenceTests() {
  console.log('🚀 Starting Firebase Persistence Tests...\n');
  
  const results = [];
  
  results.push(await testGoalPersistence());
  console.log('');
  
  results.push(await testHabitPersistence());
  console.log('');
  
  results.push(await testLogPersistence());
  console.log('');
  
  results.push(await testReviewPersistence());
  console.log('');
  
  results.push(await testBulkOperations());
  console.log('');
  
  results.push(await testDataIntegrity());
  console.log('');
  
  // Summary
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log('📊 Test Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => !r.success).forEach(r => console.log(`  - ${r.message}`));
  }
  
  return {
    passed,
    failed,
    total: results.length,
    results
  };
}
