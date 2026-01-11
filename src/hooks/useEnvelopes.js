import { useCallback } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import { addGlobalEnvelope, removeGlobalEnvelope } from '../utils/globalEnvelopes';
import { getDefaultEnvelopes } from '../utils/localStorage';

export const useEnvelopes = () => {
  const { state, dispatch } = useBudget();
  const { currentData } = state;

  const allocateBudget = useCallback((category, name, amount) => {
    const budgetAmount = parseFloat(amount) || 0;

    if (budgetAmount > 0 && currentData.income <= 0) {
      throw new Error('Add income first before allocating budget');
    }

    const totalAllocated = Object.values(currentData.envelopes).reduce((sum, cat) =>
      sum + Object.values(cat).reduce((catSum, env) => catSum + env.budgeted, 0), 0);

    const currentEnvelopeBudget = currentData.envelopes[category][name].budgeted;
    const newTotalAllocated = totalAllocated - currentEnvelopeBudget + budgetAmount;

    if (newTotalAllocated > currentData.income) {
      throw new Error(`Cannot allocate ₹${budgetAmount.toLocaleString()}. Only ₹${(currentData.income - totalAllocated + currentEnvelopeBudget).toLocaleString()} available`);
    }

    const updatedEnvelopes = {
      ...currentData.envelopes,
      [category]: {
        ...currentData.envelopes[category],
        [name]: {
          ...currentData.envelopes[category][name],
          budgeted: budgetAmount
        }
      }
    };
    
    dispatch({
      type: 'UPDATE_PERIOD_DATA',
      payload: { envelopes: updatedEnvelopes }
    });
  }, [currentData, dispatch]);

  const addEnvelope = useCallback(async (category, name) => {
    if (!category || !name.trim()) {
      throw new Error('Enter category and envelope name');
    }

    const defaultEnvelopes = await getDefaultEnvelopes();
    if (defaultEnvelopes[category] && defaultEnvelopes[category][name.toLowerCase()]) {
      throw new Error('Envelope already exists');
    }

    await addGlobalEnvelope(category, name.toLowerCase());
    
    // Refresh current data would need to be handled by parent component
    return { category, name: name.toLowerCase() };
  }, []);

  const deleteEnvelope = useCallback(async (category, name) => {
    await removeGlobalEnvelope(category, name);
    
    const updatedEnvelopes = { ...currentData.envelopes };
    delete updatedEnvelopes[category][name];
    
    const updatedTransactions = currentData.transactions.filter(
      t => t.envelope !== `${category}.${name}`
    );
    
    dispatch({
      type: 'UPDATE_PERIOD_DATA',
      payload: {
        envelopes: updatedEnvelopes,
        transactions: updatedTransactions
      }
    });
  }, [currentData, dispatch]);

  const getStatus = useCallback((envelope) => {
    const available = envelope.budgeted + envelope.rollover - envelope.spent;
    if (available <= 0) return 'blocked';
    if (available < envelope.budgeted * 0.2) return 'warning';
    return 'healthy';
  }, []);

  const getInsights = useCallback(() => {
    const healthy = [];
    const blocked = [];
    const warnings = [];

    Object.keys(currentData.envelopes).forEach(category => {
      Object.keys(currentData.envelopes[category]).forEach(name => {
        const env = currentData.envelopes[category][name];
        const status = getStatus(env);
        if (status === 'healthy') healthy.push(name);
        else if (status === 'blocked') blocked.push(name);
        else warnings.push(name);
      });
    });

    return { healthy, blocked, warnings };
  }, [currentData.envelopes, getStatus]);

  return {
    allocateBudget,
    addEnvelope,
    deleteEnvelope,
    getStatus,
    getInsights,
    envelopes: currentData.envelopes
  };
};