import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Alert, MenuItem, Tabs, Tab } from '@mui/material';
import { Add, Receipt, CalendarMonth, Edit, Delete } from '@mui/icons-material';
import { useFirebaseSync } from '../../hooks/useFirebaseSync';

export const ExpenseTracker = () => {
  const firebaseSync = useFirebaseSync();
  const { user, saveData, loadData, subscribeToData } = firebaseSync || {
    user: null,
    saveData: () => Promise.resolve(),
    loadData: () => Promise.resolve(null),
    subscribeToData: () => () => {}
  };
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [allocateInputs, setAllocateInputs] = useState({});
  const [updateInputs, setUpdateInputs] = useState({});
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [monthlyBudgets, setMonthlyBudgets] = useState({});
  const [envelopes, setEnvelopes] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [openEnvelope, setOpenEnvelope] = useState(false);
  const [openTransaction, setOpenTransaction] = useState(false);
  const [openBudget, setOpenBudget] = useState(false);
  const [editingEnvelope, setEditingEnvelope] = useState(null);
  const [newEnvelope, setNewEnvelope] = useState({ name: '' });
  const [newTransaction, setNewTransaction] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    narration: '', 
    category: '', 
    amount: '', 
    mode: '', 
    envelopeId: '' 
  });
  const [paymentModes, setPaymentModes] = useState(['Cash', 'Card', 'UPI', 'Net Banking', 'Cheque']);
  const [customMode, setCustomMode] = useState('');
  const [newIncome, setNewIncome] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    description: '', 
    amount: '', 
    mode: '' 
  });
  const [customIncomeMode, setCustomIncomeMode] = useState('');
  const [incomes, setIncomes] = useState([]);
  const [openReset, setOpenReset] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const currentBudget = monthlyBudgets[currentMonth] || { incomes: [], allocated: 0, envelopes: {} };
  const totalIncome = currentBudget.incomes?.reduce((sum, inc) => sum + inc.amount, 0) || 0;
  const totalAllocated = Object.values(currentBudget.envelopes).reduce((sum, amt) => sum + amt, 0);
  const canSpend = totalAllocated === totalIncome && totalIncome > 0;

  useEffect(() => {
    if (user) {
      const loadUserData = async () => {
        try {
          const data = await loadData();
          if (data) {
            setEnvelopes(data.envelopes || []);
            setTransactions(data.transactions || []);
            setMonthlyBudgets(data.monthlyBudgets || {});
            
            // Extract all unique payment modes from existing data
            const existingModes = new Set(['Cash', 'Card', 'UPI', 'Net Banking', 'Cheque']);
            
            // Add modes from transactions
            (data.transactions || []).forEach(t => {
              if (t.mode) existingModes.add(t.mode);
            });
            
            // Add modes from all income entries
            Object.values(data.monthlyBudgets || {}).forEach(budget => {
              if (budget.incomes) {
                budget.incomes.forEach(inc => {
                  if (inc.mode) existingModes.add(inc.mode);
                });
              }
            });
            
            setPaymentModes(Array.from(existingModes));
          }
        } catch (error) {
          console.error('Error loading data:', error);
        }
      };
      
      loadUserData();
    }
  }, [user, loadData]);

  useEffect(() => {
    if (user && (envelopes.length > 0 || transactions.length > 0 || Object.keys(monthlyBudgets).length > 0)) {
      saveData([], [], [], [], envelopes, transactions, monthlyBudgets);
    }
  }, [envelopes, transactions, monthlyBudgets, user, saveData]);

  useEffect(() => {
    // Carry forward balances when month changes
    const prevMonth = getPreviousMonth(currentMonth);
    const prevBudget = monthlyBudgets[prevMonth];
    
    if (prevBudget && !monthlyBudgets[currentMonth]) {
      const carriedBalances = {};
      envelopes.forEach(env => {
        const prevBalance = getEnvelopeBalance(env.id, prevMonth);
        if (prevBalance > 0) {
          carriedBalances[env.id] = prevBalance;
        }
      });
      
      if (Object.keys(carriedBalances).length > 0) {
        setMonthlyBudgets(prev => ({
          ...prev,
          [currentMonth]: {
            income: 0,
            allocated: 0,
            envelopes: carriedBalances
          }
        }));
      }
    }
  }, [currentMonth, monthlyBudgets, envelopes]);

  const getPreviousMonth = (month) => {
    const [year, mon] = month.split('-').map(Number);
    const prevDate = new Date(year, mon - 2, 1);
    return `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
  };

  const getEnvelopeBalance = (envelopeId, month = currentMonth) => {
    const budget = monthlyBudgets[month];
    if (!budget) return 0;
    
    const allocated = budget.envelopes[envelopeId] || 0;
    const spent = transactions
      .filter(t => t.envelopeId === envelopeId && t.date.startsWith(month))
      .reduce((sum, t) => sum + t.amount, 0);
    
    return allocated - spent;
  };

  const setIncomeForMonth = () => {
    if (!newIncome.amount || !newIncome.mode || !newIncome.description) return;
    const finalMode = newIncome.mode === 'custom' ? customIncomeMode : newIncome.mode;
    
    if (newIncome.mode === 'custom' && customIncomeMode && !paymentModes.includes(customIncomeMode)) {
      setPaymentModes(prev => [...prev, customIncomeMode]);
    }
    
    const income = {
      id: `inc_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      ...newIncome,
      mode: finalMode,
      amount: parseFloat(newIncome.amount),
      date: newIncome.date || new Date().toISOString().split('T')[0]
    };
    
    setMonthlyBudgets(prev => ({
      ...prev,
      [currentMonth]: {
        ...currentBudget,
        incomes: [...(currentBudget.incomes || []), income]
      }
    }));
    
    setNewIncome({ 
      date: new Date().toISOString().split('T')[0], 
      description: '', 
      amount: '', 
      mode: '' 
    });
    setCustomIncomeMode('');
    setOpenBudget(false);
  };

  const addEnvelope = () => {
    if (!newEnvelope.name.trim()) return;
    
    if (editingEnvelope) {
      setEnvelopes(prev => prev.map(e => 
        e.id === editingEnvelope.id ? {...e, name: newEnvelope.name.trim()} : e
      ));
      setEditingEnvelope(null);
    } else {
      const envelope = {
        id: `env_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        name: newEnvelope.name.trim(),
        createdAt: new Date().toISOString()
      };
      setEnvelopes(prev => [...prev, envelope]);
    }
    
    setNewEnvelope({ name: '' });
    setOpenEnvelope(false);
  };

  const editEnvelope = (envelope) => {
    setEditingEnvelope(envelope);
    setNewEnvelope({ name: envelope.name });
    setOpenEnvelope(true);
  };

  const deleteEnvelope = (envelopeId) => {
    setConfirmDelete(envelopeId);
  };

  const confirmDeleteEnvelope = () => {
    if (confirmDelete) {
      setEnvelopes(envelopes.filter(e => e.id !== confirmDelete));
      setTransactions(transactions.filter(t => t.envelopeId !== confirmDelete));
      setMonthlyBudgets(prev => {
        const updated = {...prev};
        Object.keys(updated).forEach(month => {
          if (updated[month].envelopes[confirmDelete]) {
            delete updated[month].envelopes[confirmDelete];
          }
        });
        return updated;
      });
      setSuccess('Envelope deleted successfully');
      setConfirmDelete(null);
    }
  };

  const addTransaction = () => {
    if (!newTransaction.amount || !newTransaction.envelopeId || !canSpend) return;
    const amount = parseFloat(newTransaction.amount);
    const balance = getEnvelopeBalance(newTransaction.envelopeId);
    
    if (balance < amount) {
      setError('Insufficient balance in envelope!');
      return;
    }

    const finalMode = newTransaction.mode === 'custom' ? customMode : newTransaction.mode;
    
    // Add custom mode to payment modes list if not exists
    if (newTransaction.mode === 'custom' && customMode && !paymentModes.includes(customMode)) {
      setPaymentModes(prev => [...prev, customMode]);
    }
    const transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      ...newTransaction,
      mode: finalMode,
      amount,
      date: newTransaction.date || new Date().toISOString().split('T')[0]
    };

    setTransactions([...transactions, transaction]);
    setNewTransaction({ 
      date: new Date().toISOString().split('T')[0], 
      narration: '', 
      category: '', 
      amount: '', 
      mode: '', 
      envelopeId: '' 
    });
    setCustomMode('');
    setOpenTransaction(false);
  };

  const calculateModeBalances = () => {
    const modeBalances = {};
    transactions
      .filter(t => t.date.startsWith(currentMonth))
      .forEach(t => {
        modeBalances[t.mode] = (modeBalances[t.mode] || 0) + t.amount;
      });
    
    if (currentBudget.incomes) {
      currentBudget.incomes.forEach(inc => {
        modeBalances[inc.mode] = (modeBalances[inc.mode] || 0) - inc.amount;
      });
    }
    
    return modeBalances;
  };

  const handleAllocateFunds = (envelopeId) => {
    const amount = parseFloat(allocateInputs[envelopeId]) || 0;
    if (amount > 0) {
      allocateFunds(envelopeId, amount);
      setAllocateInputs(prev => ({ ...prev, [envelopeId]: '' }));
    }
  };

  const handleUpdateAllocation = (envelopeId) => {
    const newAmount = parseFloat(updateInputs[envelopeId]) || 0;
    if (newAmount >= 0) {
      setMonthlyBudgets(prev => ({
        ...prev,
        [currentMonth]: {
          ...currentBudget,
          envelopes: {
            ...currentBudget.envelopes,
            [envelopeId]: newAmount
          }
        }
      }));
      setUpdateInputs(prev => ({ ...prev, [envelopeId]: '' }));
    }
  };

  const deleteIncome = (incomeId) => {
    setMonthlyBudgets(prev => ({
      ...prev,
      [currentMonth]: {
        ...currentBudget,
        incomes: currentBudget.incomes.filter(inc => inc.id !== incomeId)
      }
    }));
  };

  const allocateFunds = (envelopeId, amount) => {
    const newTotal = totalAllocated + amount - (currentBudget.envelopes[envelopeId] || 0);
    if (newTotal > totalIncome) {
      setError('Cannot allocate more than total income!');
      return;
    }
    
    setMonthlyBudgets(prev => ({
      ...prev,
      [currentMonth]: {
        ...currentBudget,
        envelopes: {
          ...currentBudget.envelopes,
          [envelopeId]: (currentBudget.envelopes[envelopeId] || 0) + amount
        }
      }
    }));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Expense Tracker
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            select
            label="Month"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          >
            {Array.from({length: 24}, (_, i) => {
              const year = Math.floor(i / 12) + 2025;
              const month = (i % 12) + 1;
              const value = `${year}-${String(month).padStart(2, '0')}`;
              const date = new Date(year, month - 1, 1);
              return (
                <MenuItem key={value} value={value}>
                  {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </MenuItem>
              );
            })}
          </TextField>
          <Button variant="outlined" startIcon={<CalendarMonth />} onClick={() => setOpenBudget(true)}>
            Add Income
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {!canSpend && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {totalIncome === 0 
            ? 'Add income first, then allocate full amount to envelopes before spending.'
            : `Allocate remaining ₹${(totalIncome - totalAllocated).toLocaleString()} to complete budget allocation.`
          }
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Transactions" />
          <Tab label="Envelopes" />
        </Tabs>
      </Paper>

      <Grid container spacing={3}>
        {activeTab === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Transactions</Typography>
                <Button variant="contained" startIcon={<Receipt />} onClick={() => setOpenTransaction(true)} disabled={!canSpend}>
                  Add Transaction
                </Button>
              </Box>
              
              {transactions
                .filter(t => t.date.startsWith(currentMonth))
                .slice(-10).reverse().map(transaction => {
                const envelope = envelopes.find(e => e.id === transaction.envelopeId);
                return (
                  <Box key={transaction.id} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle2">{transaction.narration}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {transaction.date} • {envelope?.name} • {transaction.mode}
                        </Typography>
                      </Box>
                      <Typography variant="h6" color="error">-₹{transaction.amount.toLocaleString()}</Typography>
                    </Box>
                  </Box>
                );
              })}
            </Paper>
          </Grid>
        )}
        
        {activeTab === 1 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Envelopes</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => setOpenEnvelope(true)}>
                  Add Envelope
                </Button>
              </Box>
              
              <Grid container spacing={2}>
                {envelopes.map(envelope => {
                  const balance = getEnvelopeBalance(envelope.id);
                  const allocated = currentBudget.envelopes[envelope.id] || 0;
                  const spent = transactions
                    .filter(t => t.envelopeId === envelope.id && t.date.startsWith(currentMonth))
                    .reduce((sum, t) => sum + t.amount, 0);
                  
                  return (
                    <Grid item xs={12} sm={6} key={envelope.id}>
                      <Paper sx={{ p: 2, bgcolor: balance < allocated * 0.2 ? 'error.light' : 'background.paper' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600}>{envelope.name}</Typography>
                            <Typography variant="h6" color="primary">₹{balance.toLocaleString()}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Allocated: ₹{allocated.toLocaleString()} | Spent: ₹{spent.toLocaleString()}
                            </Typography>
                          </Box>
                          <Box>
                            <Button size="small" onClick={() => editEnvelope(envelope)}><Edit fontSize="small" /></Button>
                            <Button size="small" onClick={() => deleteEnvelope(envelope.id)} color="error"><Delete fontSize="small" /></Button>
                          </Box>
                        </Box>
                        <Box sx={{ mt: 1 }}>
                          <TextField
                            size="small"
                            placeholder="Allocate funds"
                            type="number"
                            value={allocateInputs[envelope.id] || ''}
                            onChange={(e) => setAllocateInputs(prev => ({ ...prev, [envelope.id]: e.target.value }))}
                            inputProps={{ step: "any" }}
                            disabled={canSpend}
                            sx={{ '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': { display: 'none' }, '& input[type=number]': { MozAppearance: 'textfield' } }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleAllocateFunds(envelope.id);
                              }
                            }}
                          />
                          {allocated > 0 && (
                            <TextField
                              size="small"
                              placeholder="Update allocation"
                              type="number"
                              value={updateInputs[envelope.id] || ''}
                              onChange={(e) => setUpdateInputs(prev => ({ ...prev, [envelope.id]: e.target.value }))}
                              inputProps={{ step: "any" }}
                              disabled={canSpend}
                              sx={{ mt: 1, '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': { display: 'none' }, '& input[type=number]': { MozAppearance: 'textfield' } }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleUpdateAllocation(envelope.id);
                                }
                              }}
                            />
                          )}
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Paper>
          </Grid>
        )}

        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>Payment Mode Balances</Typography>
            {Object.entries(calculateModeBalances()).map(([mode, amount]) => (
              <Box key={mode} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2">{mode}</Typography>
                <Typography variant="h6" color={amount > 0 ? 'error.main' : 'success.main'}>
                  ₹{Math.abs(amount).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {amount > 0 ? 'Spent' : 'Available'}
                </Typography>
              </Box>
            ))}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Monthly Budget - {new Date(currentMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Income Sources</Typography>
              {currentBudget.incomes?.length > 0 ? (
                currentBudget.incomes.map(income => (
                  <Box key={income.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, bgcolor: 'grey.50', borderRadius: 1, mb: 1 }}>
                    <Box>
                      <Typography variant="subtitle2">{income.description}</Typography>
                      <Typography variant="caption" color="text.secondary">{income.mode}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6">₹{income.amount.toLocaleString()}</Typography>
                      <Button size="small" onClick={() => deleteIncome(income.id)} color="error"><Delete fontSize="small" /></Button>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">No income added</Typography>
              )}
              <Typography variant="h5" sx={{ mt: 1 }}>Total: ₹{totalIncome.toLocaleString()}</Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Total Allocated</Typography>
              <Typography variant="h5" color={totalAllocated === totalIncome ? 'success.main' : 'warning.main'}>
                ₹{totalAllocated.toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Remaining</Typography>
              <Typography variant="h5" color="primary">₹{(totalIncome - totalAllocated).toLocaleString()}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Total Spent</Typography>
              <Typography variant="h5" color="error">
                ₹{transactions
                  .filter(t => t.date.startsWith(currentMonth))
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toLocaleString()}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openEnvelope} onClose={() => { setOpenEnvelope(false); setEditingEnvelope(null); setNewEnvelope({ name: '' }); }}>
        <DialogTitle>{editingEnvelope ? 'Edit Envelope' : 'Add New Envelope'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Envelope Name"
            value={newEnvelope.name}
            onChange={(e) => setNewEnvelope({...newEnvelope, name: e.target.value})}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenEnvelope(false); setEditingEnvelope(null); setNewEnvelope({ name: '' }); }}>Cancel</Button>
          <Button onClick={addEnvelope} variant="contained">{editingEnvelope ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openTransaction} onClose={() => setOpenTransaction(false)}>
        <DialogTitle>Add Transaction</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Date"
            type="date"
            value={newTransaction.date}
            onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
            sx={{ mb: 2, mt: 1 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Description"
            value={newTransaction.narration}
            onChange={(e) => setNewTransaction({...newTransaction, narration: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={newTransaction.amount}
            onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
            sx={{ mb: 2, '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': { display: 'none' }, '& input[type=number]': { MozAppearance: 'textfield' } }}
            inputProps={{ step: "any" }}
          />
          <TextField
            fullWidth
            select
            label="Envelope"
            value={newTransaction.envelopeId}
            onChange={(e) => setNewTransaction({...newTransaction, envelopeId: e.target.value})}
            sx={{ mb: 2 }}
          >
            <MenuItem value="">Select Envelope</MenuItem>
            {envelopes.map(envelope => {
              const balance = getEnvelopeBalance(envelope.id);
              return (
                <MenuItem key={envelope.id} value={envelope.id}>
                  {envelope.name} (₹{balance.toLocaleString()})
                </MenuItem>
              );
            })}
          </TextField>
          <TextField
            fullWidth
            select
            label="Payment Mode"
            value={newTransaction.mode}
            onChange={(e) => setNewTransaction({...newTransaction, mode: e.target.value})}
            sx={{ mb: 2 }}
          >
            {paymentModes.map(mode => (
              <MenuItem key={mode} value={mode}>{mode}</MenuItem>
            ))}
            <MenuItem value="custom">Add Custom Mode</MenuItem>
          </TextField>
          {newTransaction.mode === 'custom' && (
            <TextField
              fullWidth
              label="Custom Payment Mode"
              value={customMode}
              onChange={(e) => setCustomMode(e.target.value)}
              sx={{ mb: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTransaction(false)}>Cancel</Button>
          <Button onClick={addTransaction} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openBudget} onClose={() => setOpenBudget(false)}>
        <DialogTitle>Add Income</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Date"
            type="date"
            value={newIncome.date}
            onChange={(e) => setNewIncome({...newIncome, date: e.target.value})}
            sx={{ mb: 2, mt: 1 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Description"
            value={newIncome.description}
            onChange={(e) => setNewIncome({...newIncome, description: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={newIncome.amount}
            onChange={(e) => setNewIncome({...newIncome, amount: e.target.value})}
            sx={{ mb: 2, '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': { display: 'none' }, '& input[type=number]': { MozAppearance: 'textfield' } }}
            inputProps={{ step: "any" }}
          />
          <TextField
            fullWidth
            select
            label="Payment Mode"
            value={newIncome.mode}
            onChange={(e) => setNewIncome({...newIncome, mode: e.target.value})}
            sx={{ mb: 2 }}
          >
            <MenuItem value="">Select Payment Mode</MenuItem>
            {paymentModes.map(mode => (
              <MenuItem key={mode} value={mode}>{mode}</MenuItem>
            ))}
            <MenuItem value="custom">Add Custom Mode</MenuItem>
          </TextField>
          {newIncome.mode === 'custom' && (
            <TextField
              fullWidth
              label="Custom Payment Mode"
              value={customIncomeMode}
              onChange={(e) => setCustomIncomeMode(e.target.value)}
              sx={{ mb: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBudget(false)}>Cancel</Button>
          <Button onClick={setIncomeForMonth} variant="contained">Add Income</Button>
        </DialogActions>
      </Dialog>
      {/* Confirmation Dialog */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Delete this envelope? All transactions will be removed.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button onClick={confirmDeleteEnvelope} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};