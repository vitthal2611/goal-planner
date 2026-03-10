import { GoogleSheetsRepository } from './googleSheetsRepository';
import { LocalStorageRepository } from './localStorageRepository';

export class GoogleSheetsBudgetRepository {
  constructor() {
    this.googleSheets = new GoogleSheetsRepository();
    this.localStorage = new LocalStorageRepository();
  }

  async save(data) {
    this.localStorage.save('budget', data);
    try {
      await this.googleSheets.saveData('BudgetData', data);
    } catch (err) {
      console.error('Google Sheets save failed:', err);
    }
  }

  async load() {
    const cached = this.localStorage.load('budget');
    if (cached) {
      try {
        const result = await this.googleSheets.loadData('BudgetData');
        if (result.success) {
          this.localStorage.save('budget', result.data);
          return result.data;
        }
      } catch (err) {
        console.error('Google Sheets load failed:', err);
      }
      return cached;
    }
    
    try {
      const result = await this.googleSheets.loadData('BudgetData');
      if (result.success) {
        this.localStorage.save('budget', result.data);
        return result.data;
      }
    } catch (err) {
      console.error('Google Sheets load failed:', err);
    }
    return null;
  }

  async savePaymentMethods(methods) {
    this.localStorage.save('paymentMethods', methods);
    try {
      await this.googleSheets.saveData('PaymentMethods', methods);
    } catch (err) {
      console.error('Google Sheets save failed:', err);
    }
  }

  async loadPaymentMethods() {
    const cached = this.localStorage.load('paymentMethods');
    if (cached) return cached;
    
    try {
      const result = await this.googleSheets.loadData('PaymentMethods');
      if (result.success) {
        this.localStorage.save('paymentMethods', result.data);
        return result.data;
      }
    } catch (err) {
      console.error('Google Sheets load failed:', err);
    }
    return null;
  }
}
