import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import TypeSelector from './TypeSelector';
import QuickForm from './QuickForm';
import PaymentBalances from './PaymentBalances';
import './QuickTrackTab.css';

const QuickTrackTab = () => {
  const [selectedType, setSelectedType] = useState('expense');
  const { addTransaction } = useApp();

  const handleSubmit = (transactionData) => {
    const transaction = {
      ...transactionData,
      id: generateTransactionId(transactionData.type),
      date: new Date().toISOString(),
    };
    
    addTransaction(transaction);
    return true; // Success
  };

  const generateTransactionId = (type) => {
    const timestamp = Date.now();
    const prefix = type === 'income' ? 'INC' : type === 'expense' ? 'EXP' : 'TRF';
    return `${prefix}-${timestamp}`;
  };

  return (
    <div className="quick-track-tab">
      <TypeSelector 
        selectedType={selectedType} 
        onTypeChange={setSelectedType} 
      />
      
      <PaymentBalances />
      
      <QuickForm 
        type={selectedType} 
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default QuickTrackTab;
