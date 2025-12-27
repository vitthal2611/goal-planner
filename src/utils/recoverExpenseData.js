// Run this in browser console to check for data

// Check localStorage
console.log('=== LocalStorage Data ===');
const localData = localStorage.getItem('expenseTrackerData');
if (localData) {
  console.log('Found expense data in localStorage:', JSON.parse(localData));
} else {
  console.log('No expense data in localStorage');
}

// Check old format
const oldEnvelopes = localStorage.getItem('envelopes');
const oldTransactions = localStorage.getItem('transactions');
const oldBudgets = localStorage.getItem('monthlyBudgets');

if (oldEnvelopes || oldTransactions || oldBudgets) {
  console.log('=== Old Format Data Found ===');
  console.log('Envelopes:', oldEnvelopes ? JSON.parse(oldEnvelopes) : null);
  console.log('Transactions:', oldTransactions ? JSON.parse(oldTransactions) : null);
  console.log('Monthly Budgets:', oldBudgets ? JSON.parse(oldBudgets) : null);
  
  // Migrate to new format
  const migratedData = {
    envelopes: oldEnvelopes ? JSON.parse(oldEnvelopes) : [],
    transactions: oldTransactions ? JSON.parse(oldTransactions) : [],
    monthlyBudgets: oldBudgets ? JSON.parse(oldBudgets) : {},
    selectedMonth: localStorage.getItem('selectedMonth') || ''
  };
  
  localStorage.setItem('expenseTrackerData', JSON.stringify(migratedData));
  console.log('Data migrated to new format. Please refresh the page.');
}

console.log('=== All localStorage keys ===');
console.log(Object.keys(localStorage));
