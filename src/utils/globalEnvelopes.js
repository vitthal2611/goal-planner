import { saveData, getData } from '../services/database.js';

const ENVELOPES_SHEET = 'globalEnvelopes';

const defaultEnvelopes = {
  needs: {
    emi: { budgeted: 0, spent: 0, rollover: 0 },
    grocery: { budgeted: 0, spent: 0, rollover: 0 },
    milk: { budgeted: 0, spent: 0, rollover: 0 },
    gas: { budgeted: 0, spent: 0, rollover: 0 },
    water: { budgeted: 0, spent: 0, rollover: 0 },
    electricity: { budgeted: 0, spent: 0, rollover: 0 },
    petrol: { budgeted: 0, spent: 0, rollover: 0 },
    school: { budgeted: 0, spent: 0, rollover: 0 },
    vegetable: { budgeted: 0, spent: 0, rollover: 0 },
    medical: { budgeted: 0, spent: 0, rollover: 0 },
    insurance: { budgeted: 0, spent: 0, rollover: 0 }
  },
  savings: {
    'wife sip': { budgeted: 0, spent: 0, rollover: 0 },
    'my sip': { budgeted: 0, spent: 0, rollover: 0 },
    ssy: { budgeted: 0, spent: 0, rollover: 0 }
  },
  wants: {
    'salary-bai': { budgeted: 0, spent: 0, rollover: 0 },
    vacation: { budgeted: 0, spent: 0, rollover: 0 },
    misc: { budgeted: 0, spent: 0, rollover: 0 }
  }
};

export const getGlobalEnvelopes = async () => {
  try {
    const result = await getData(ENVELOPES_SHEET);
    if (result.success && result.data && Object.keys(result.data).length > 0) {
      return result.data;
    } else {
      return defaultEnvelopes;
    }
  } catch (error) {
    console.error('Failed to load envelopes:', error);
    return defaultEnvelopes;
  }
};

export const addGlobalEnvelope = async (category, name) => {
  try {
    const envelopes = await getGlobalEnvelopes();
    if (!envelopes[category]) {
      envelopes[category] = {};
    }
    envelopes[category][name] = { budgeted: 0, spent: 0, rollover: 0 };
    await saveData(ENVELOPES_SHEET, envelopes);
  } catch (error) {
    console.error('Failed to add envelope:', error);
  }
};

export const removeGlobalEnvelope = async (category, name) => {
  try {
    const envelopes = await getGlobalEnvelopes();
    if (envelopes[category] && envelopes[category][name]) {
      delete envelopes[category][name];
      await saveData(ENVELOPES_SHEET, envelopes);
    }
  } catch (error) {
    console.error('Failed to remove envelope:', error);
  }
};
