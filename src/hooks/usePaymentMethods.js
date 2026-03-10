import { useState, useEffect, useCallback } from 'react';
import { auth } from '../config/firebase';
import { googleSheetsAPI } from '../utils/googleSheetsAPI';

export const usePaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPaymentMethods = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const rows = await googleSheetsAPI.readSheet('PaymentMethods!A:C');
        
        if (rows.length <= 1) {
          // Initialize header only, no default methods
          const sheetData = [['UserID', 'PaymentMethod', 'UsageCount']];
          await googleSheetsAPI.writeSheet('PaymentMethods!A:C', sheetData);
          setPaymentMethods([]);
        } else {
          const userMethods = rows
            .slice(1)
            .filter(row => row[0] === user.uid)
            .map(row => row[1]);
          setPaymentMethods(userMethods);
        }
      } catch (err) {
        console.error('Error loading payment methods:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadPaymentMethods();
      } else {
        setPaymentMethods([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const addPaymentMethod = useCallback(async (method) => {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const trimmed = method.trim();
    if (!trimmed) throw new Error('Payment method name cannot be empty');
    if (paymentMethods.includes(trimmed)) throw new Error('Payment method already exists');

    try {
      await googleSheetsAPI.appendSheet('PaymentMethods!A:C', [[user.uid, trimmed, '0']]);
      const updatedMethods = [...paymentMethods, trimmed].sort((a, b) => a.localeCompare(b));
      setPaymentMethods(updatedMethods);
    } catch (err) {
      console.error('Error adding payment method:', err);
      throw new Error('Failed to add payment method');
    }
  }, [paymentMethods]);

  const deletePaymentMethod = useCallback(async (method) => {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    try {
      const rows = await googleSheetsAPI.readSheet('PaymentMethods!A:C');
      const updatedRows = rows.filter((row, idx) => 
        idx === 0 || !(row[0] === user.uid && row[1] === method)
      );
      await googleSheetsAPI.writeSheet('PaymentMethods!A:C', updatedRows);
      setPaymentMethods(paymentMethods.filter(m => m !== method));
    } catch (err) {
      console.error('Error deleting payment method:', err);
      throw new Error('Failed to delete payment method');
    }
  }, [paymentMethods]);

  return {
    paymentMethods,
    loading,
    error,
    addPaymentMethod,
    deletePaymentMethod
  };
};
