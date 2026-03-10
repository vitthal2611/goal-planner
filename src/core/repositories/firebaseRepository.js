import { GoogleSheetsRepository } from './googleSheetsRepository';

export class FirebaseRepository {
  constructor() {
    this.googleSheets = new GoogleSheetsRepository();
  }

  async save(path, data) {
    try {
      await this.googleSheets.saveData(path, data);
    } catch (error) {
      console.error('Google Sheets save error:', error);
    }
  }

  async load(path) {
    try {
      const result = await this.googleSheets.loadData(path);
      return result.success ? result.data : null;
    } catch (error) {
      console.error('Google Sheets load error:', error);
      return null;
    }
  }
}
