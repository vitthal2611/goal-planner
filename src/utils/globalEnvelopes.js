// User-specific envelope structure in Firebase
import { saveData, getData } from '../services/database.js';
import { auth } from '../config/firebase.js';

const getEnvelopePath = () => {
  const user = auth.currentUser;
  return user ? `users/${user.uid}/globalEnvelopes` : 'globalEnvelopes';
};

// Default envelope structure
const defaultEnvelopes = {
  needs: {
    housing: { budgeted: 0, spent: 0, rollover: 0 },
    groceries: { budgeted: 0, spent: 0, rollover: 0 },
    utilities: { budgeted: 0, spent: 0, rollover: 0 },
    transport: { budgeted: 0, spent: 0, rollover: 0 },
    medical: { budgeted: 0, spent: 0, rollover: 0 },
    emi: { budgeted: 0, spent: 0, rollover: 0 },
    insurance: { budgeted: 0, spent: 0, rollover: 0 }
  },
  savings: {
    emergency: { budgeted: 0, spent: 0, rollover: 0 },
    sip: { budgeted: 0, spent: 0, rollover: 0 },
    longterm: { budgeted: 0, spent: 0, rollover: 0 }
  },
  wants: {
    dining: { budgeted: 0, spent: 0, rollover: 0 },
    shopping: { budgeted: 0, spent: 0, rollover: 0 },
    entertainment: { budgeted: 0, spent: 0, rollover: 0 }
  }
};

export const getGlobalEnvelopes = async () => {
  try {
    const result = await getData(getEnvelopePath());
    if (result.success) {
      return result.data || {};
    } else {
      return {};
    }
  } catch (error) {
    console.error('Failed to load envelopes:', error);
    return {};
  }
};

export const addGlobalEnvelope = async (category, name) => {
  try {
    const envelopes = await getGlobalEnvelopes();
    if (!envelopes[category]) {
      envelopes[category] = {};
    }
    envelopes[category][name] = { budgeted: 0, spent: 0, rollover: 0 };
    await saveData(getEnvelopePath(), envelopes);
  } catch (error) {
    console.error('Failed to add envelope:', error);
  }
};

export const removeGlobalEnvelope = async (category, name) => {
  try {
    const envelopes = await getGlobalEnvelopes();
    if (envelopes[category] && envelopes[category][name]) {
      delete envelopes[category][name];
      await saveData(getEnvelopePath(), envelopes);
    }
  } catch (error) {
    console.error('Failed to remove envelope:', error);
  }
};