import { GoogleSheetsRepository } from '../core/repositories/googleSheetsRepository.js';

const repo = new GoogleSheetsRepository();

export const saveData = async (path, data) => {
  try {
    const sheetName = path.includes('paymentMethods') ? 'PaymentMethods' : 'Data';
    await repo.saveData(sheetName, Array.isArray(data) ? data : [data]);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getData = async (path, useCache = true) => {
  try {
    const sheetName = path.includes('paymentMethods') ? 'PaymentMethods' : 'Data';
    const result = await repo.loadData(sheetName, useCache);
    if (result.success && Array.isArray(result.data)) {
      return { success: true, data: result.data };
    }
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};
