import { useEffect } from 'react';
import { useApp } from '../../core/context/AppContext';
import { getGlobalEnvelopes } from '../../utils/globalEnvelopes';

const defaultEnvelopes = {
  needs: {
    emi: { budgeted: 0 },
    grocery: { budgeted: 0 },
    milk: { budgeted: 0 },
    gas: { budgeted: 0 },
    water: { budgeted: 0 },
    electricity: { budgeted: 0 },
    petrol: { budgeted: 0 },
    school: { budgeted: 0 },
    vegetable: { budgeted: 0 },
    medical: { budgeted: 0 },
    insurance: { budgeted: 0 }
  },
  savings: {
    'wife sip': { budgeted: 0 },
    'my sip': { budgeted: 0 },
    ssy: { budgeted: 0 }
  },
  wants: {
    'salary-bai': { budgeted: 0 },
    vacation: { budgeted: 0 },
    misc: { budgeted: 0 }
  }
};

export const useDataLoader = (userId) => {
  const { state, dispatch, services } = useApp();
  const { budgetService, paymentMethodService } = services;

  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      try {
        const [budgetData, paymentMethods, globalEnvelopes] = await Promise.all([
          budgetService.load(userId),
          paymentMethodService.load(userId),
          getGlobalEnvelopes()
        ]);

        const currentPeriod = getCurrentPeriod();

        const monthlyData = budgetData?.monthlyData || {};
        
        // Initialize current period if not exists
        if (!monthlyData[currentPeriod]) {
          monthlyData[currentPeriod] = {
            income: 0,
            envelopes: {},
            transactions: []
          };
        }

        dispatch({ type: 'SET_MONTHLY_DATA', payload: monthlyData });
        dispatch({ type: 'SET_GLOBAL_ENVELOPES', payload: globalEnvelopes });
        dispatch({ type: 'SET_CURRENT_PERIOD', payload: budgetData?.currentPeriod || currentPeriod });
        dispatch({ type: 'SET_PAYMENT_METHODS', payload: paymentMethods });
        dispatch({ type: 'SET_DATA_LOADED', payload: true });
      } catch (error) {
        console.error('Failed to load data:', error);
        dispatch({ type: 'SET_DATA_LOADED', payload: true });
      }
    };

    loadData();
  }, [userId, budgetService, paymentMethodService, dispatch]);

  return state.dataLoaded;
};

const getCurrentPeriod = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};
