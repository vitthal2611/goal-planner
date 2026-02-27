export class OptimizedBudgetRepository {
  constructor(firebaseRepo, localStorageRepo) {
    this.firebase = firebaseRepo;
    this.localStorage = localStorageRepo;
  }

  async save(userId, period, data) {
    const { income, envelopes } = data;
    
    // Save to localStorage immediately
    this.localStorage.save(`budget_${period}`, { income, envelopes });
    
    // Save to Firebase in background
    this.firebase.savePeriodData(userId, period, { income, envelopes })
      .catch(err => console.error('Firebase save failed:', err));
  }

  async load(userId, period) {
    const cached = this.localStorage.load(`budget_${period}`);
    
    if (cached) {
      // Background sync from Firebase
      this.firebase.loadPeriodData(userId, period)
        .then(data => {
          if (data) this.localStorage.save(`budget_${period}`, data);
        })
        .catch(err => console.error('Background sync failed:', err));
      
      return cached;
    }
    
    return await this.firebase.loadPeriodData(userId, period);
  }

  async saveIncome(userId, period, income) {
    this.localStorage.save(`income_${period}`, income);
    await this.firebase.saveIncome(userId, period, income);
  }

  async saveEnvelopes(userId, period, envelopes) {
    this.localStorage.save(`envelopes_${period}`, envelopes);
    await this.firebase.saveEnvelopes(userId, period, envelopes);
  }

  async addTransaction(userId, period, transaction) {
    const transactionId = await this.firebase.addTransaction(userId, period, transaction);
    
    // Update local cache
    const cached = this.localStorage.load(`transactions_${period}`) || [];
    cached.unshift({ ...transaction, id: transactionId });
    this.localStorage.save(`transactions_${period}`, cached.slice(0, 100)); // Keep last 100
    
    return transactionId;
  }

  async getTransactions(userId, period, limit = 50) {
    const cached = this.localStorage.load(`transactions_${period}`);
    
    if (cached && cached.length > 0) {
      return cached;
    }
    
    const transactions = await this.firebase.getRecentTransactions(userId, period, limit);
    this.localStorage.save(`transactions_${period}`, transactions);
    return transactions;
  }

  async savePaymentMethods(userId, methods) {
    this.localStorage.save('paymentMethods', methods);
    await this.firebase.savePaymentMethods(userId, methods);
  }

  async loadPaymentMethods(userId) {
    const cached = this.localStorage.load('paymentMethods');
    if (cached) return cached;
    
    const methods = await this.firebase.getPaymentMethods(userId);
    this.localStorage.save('paymentMethods', methods);
    return methods;
  }
}
