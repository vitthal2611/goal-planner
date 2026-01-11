import { auth } from '../config/firebase';
import { saveData, getData } from './database';
import { saveToLocalStorage, loadFromLocalStorage } from '../utils/localStorage';

export class BudgetService {
  static async saveCustomPaymentMethods(methods) {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    try {
      await saveData(`users/${user.uid}/customPaymentMethods`, methods);
      return { success: true };
    } catch (error) {
      console.error('Failed to save payment methods:', error);
      throw new Error('Failed to save payment method');
    }
  }

  static async loadCustomPaymentMethods() {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    try {
      const result = await getData(`users/${user.uid}/customPaymentMethods`);
      return result.success ? result.data : [];
    } catch (error) {
      console.error('Failed to load payment methods:', error);
      return [];
    }
  }

  static async saveBudgetData(monthlyData, currentPeriod) {
    try {
      if (Object.keys(monthlyData).length > 0) {
        await saveToLocalStorage({ monthlyData, currentPeriod });
        return { success: true };
      }
      return { success: false, error: 'No data to save' };
    } catch (error) {
      console.error('Failed to save budget data:', error);
      throw new Error('Failed to save budget data');
    }
  }

  static async loadBudgetData() {
    try {
      const savedData = await loadFromLocalStorage();
      return savedData || { monthlyData: {}, currentPeriod: null };
    } catch (error) {
      console.error('Failed to load budget data:', error);
      return { monthlyData: {}, currentPeriod: null };
    }
  }

  static async exportBudgetData(monthlyData, currentPeriod) {
    try {
      const data = { monthlyData, currentPeriod };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `budget-${currentPeriod}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return { success: true };
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error('Failed to export data');
    }
  }
}

export const budgetService = BudgetService;