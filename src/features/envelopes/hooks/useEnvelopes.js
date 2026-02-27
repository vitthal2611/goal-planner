import { useCallback, useMemo } from 'react';
import { useApp } from '../../../core/context/AppContext';
import { addGlobalEnvelope, removeGlobalEnvelope } from '../../../utils/globalEnvelopes';

export const useEnvelopes = () => {
  const { state, dispatch, services } = useApp();
  const { envelopeService } = services;
  const { currentPeriod, monthlyData } = state;

  const getBalance = useCallback((category, name) => {
    return envelopeService.getAvailableBalance(monthlyData, category, name, currentPeriod);
  }, [envelopeService, monthlyData, currentPeriod]);

  const getRollover = useCallback((category, name) => {
    return envelopeService.getRolloverAmount(monthlyData, category, name, currentPeriod);
  }, [envelopeService, monthlyData, currentPeriod]);

  const getSpent = useCallback((category, name) => {
    return envelopeService.getSpentAmount(monthlyData, category, name, currentPeriod);
  }, [envelopeService, monthlyData, currentPeriod]);

  const getStatusColor = useCallback((category, name) => {
    return envelopeService.getStatusColor(monthlyData, category, name, currentPeriod);
  }, [envelopeService, monthlyData, currentPeriod]);

  const create = useCallback(async (category, name) => {
    dispatch({ type: 'ENVELOPE_CREATED', payload: { category, name } });
    await addGlobalEnvelope(category, name);
  }, [dispatch]);

  const remove = useCallback(async (category, name) => {
    dispatch({ type: 'ENVELOPE_DELETED', payload: { category, name } });
    await removeGlobalEnvelope(category, name);
  }, [dispatch]);

  const envelopes = useMemo(() => {
    return monthlyData[currentPeriod]?.envelopes || {};
  }, [monthlyData, currentPeriod]);

  return {
    envelopes,
    getBalance,
    getRollover,
    getSpent,
    getStatusColor,
    create,
    remove
  };
};
