import { useState, useEffect, useCallback } from 'react';
import { auth } from '../config/firebase';
import { saveData, getData } from '../services/database';

export const usePaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load payment methods from Firebase
  useEffect(() => {
    const loadPaymentMethods = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const result = await getData(`users/${user.uid}/paymentMethods`);
        if (result.success && result.data) {
          setPaymentMethods(Array.isArray(result.data) ? result.data : []);
        } else {
          // Initialize with default payment methods if none exist
          const defaultMethods = ['Cash', 'UPI', 'Credit Card', 'Debit Card'];
          setPaymentMethods(defaultMethods);
          await saveData(`users/${user.uid}/paymentMethods`, defaultMethods);
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

  // Add a new payment method
  const addPaymentMethod = useCallback(async (method) => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const trimmed = method.trim();
    
    if (!trimmed) {
      throw new Error('Payment method name cannot be empty');
    }

    if (paymentMethods.includes(trimmed)) {
      throw new Error('Payment method already exists');
    }

    const updatedMethods = [...paymentMethods, trimmed].sort((a, b) => a.localeCompare(b));
    
    try {
      await saveData(`users/${user.uid}/paymentMethods`, updatedMethods);
      setPaymentMethods(updatedMethods);
      return { success: true };
    } catch (err) {
      console.error('Error adding payment method:', err);
      throw new Error('Failed to add payment method');
    }
  }, [paymentMethods]);

  // Delete a payment method
  const deletePaymentMethod = useCallback(async (method) => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const updatedMethods = paymentMethods.filter(m => m !== method);
    
    try {
      await saveData(`users/${user.uid}/paymentMethods`, updatedMethods);
      setPaymentMethods(updatedMethods);
      return { success: true };
    } catch (err) {
      console.error('Error deleting payment method:', err);
      throw new Error('Failed to delete payment method');
    }
  }, [paymentMethods]);

  // Update payment methods (for bulk operations)
  const updatePaymentMethods = useCallback(async (methods) => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      await saveData(`users/${user.uid}/paymentMethods`, methods);
      setPaymentMethods(methods);
      return { success: true };
    } catch (err) {
      console.error('Error updating payment methods:', err);
      throw new Error('Failed to update payment methods');
    }
  }, []);

  return {
    paymentMethods,
    loading,
    error,
    addPaymentMethod,
    deletePaymentMethod,
    updatePaymentMethods
  };
};
