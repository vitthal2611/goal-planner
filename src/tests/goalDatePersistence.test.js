// Test for goal date persistence
import { ensureGoalDates, parseGoalDates, toFirebaseDate, fromFirebaseDate } from '../utils/dateUtils';

export const testGoalDatePersistence = () => {
  console.log('🧪 Testing Goal Date Persistence...');
  
  // Test 1: Date conversion to Firebase format
  const testDate = new Date('2025-06-15T10:30:00.000Z');
  const firebaseDate = toFirebaseDate(testDate);
  console.log('✅ Date to Firebase:', firebaseDate);
  
  // Test 2: Date conversion from Firebase format
  const parsedDate = fromFirebaseDate(firebaseDate);
  console.log('✅ Date from Firebase:', parsedDate);
  
  // Test 3: Goal with dates
  const testGoal = {
    id: 'test-goal',
    title: 'Test Goal',
    yearlyTarget: 100,
    actualProgress: 25,
    unit: 'items',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31'),
    createdAt: new Date()
  };
  
  // Test 4: Prepare for Firebase
  const firebaseGoal = ensureGoalDates(testGoal);
  console.log('✅ Goal for Firebase:', {
    startDate: firebaseGoal.startDate,
    endDate: firebaseGoal.endDate,
    createdAt: firebaseGoal.createdAt
  });
  
  // Test 5: Parse from Firebase
  const parsedGoal = parseGoalDates(firebaseGoal);
  console.log('✅ Goal from Firebase:', {
    startDate: parsedGoal.startDate,
    endDate: parsedGoal.endDate,
    createdAt: parsedGoal.createdAt
  });
  
  // Test 6: Verify dates are Date objects
  const isStartDateValid = parsedGoal.startDate instanceof Date;
  const isEndDateValid = parsedGoal.endDate instanceof Date;
  const isCreatedAtValid = parsedGoal.createdAt instanceof Date;
  
  console.log('✅ Date validation:', {
    startDate: isStartDateValid,
    endDate: isEndDateValid,
    createdAt: isCreatedAtValid
  });
  
  if (isStartDateValid && isEndDateValid && isCreatedAtValid) {
    console.log('🎉 All date persistence tests passed!');
    return true;
  } else {
    console.error('❌ Date persistence tests failed!');
    return false;
  }
};

// Run test if in development
if (process.env.NODE_ENV === 'development') {
  testGoalDatePersistence();
}