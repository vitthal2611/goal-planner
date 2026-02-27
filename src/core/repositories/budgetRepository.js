export class BudgetRepository {
  constructor(firebaseRepo, localStorageRepo) {
    this.firebase = firebaseRepo;
    this.localStorage = localStorageRepo;
  }

  async save(userId, data) {
    this.localStorage.save('budget', data);
    this.firebase.save(`users/${userId}/budget`, data).catch(err => 
      console.error('Firebase save failed:', err)
    );
  }

  async load(userId) {
    const cached = this.localStorage.load('budget');
    if (cached) {
      this.firebase.load(`users/${userId}/budget`).then(data => {
        if (data) this.localStorage.save('budget', data);
      }).catch(err => console.error('Background sync failed:', err));
      return cached;
    }
    return await this.firebase.load(`users/${userId}/budget`);
  }

  async savePaymentMethods(userId, methods) {
    this.localStorage.save('paymentMethods', methods);
    this.firebase.save(`users/${userId}/paymentMethods`, methods).catch(err => 
      console.error('Firebase save failed:', err)
    );
  }

  async loadPaymentMethods(userId) {
    const cached = this.localStorage.load('paymentMethods');
    if (cached) return cached;
    return await this.firebase.load(`users/${userId}/paymentMethods`);
  }
}
