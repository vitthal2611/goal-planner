import React, { useState, useEffect, useMemo } from 'react';
import { Box, Paper, Typography, Grid, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Alert, MenuItem, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Card, CardContent, Divider, IconButton, Tooltip, BottomNavigation, BottomNavigationAction, Fab } from '@mui/material';
import { Add, Receipt, CalendarMonth, Edit, Delete, Download, AccountBalanceWallet, TrendingUp, TrendingDown, Visibility, Upload, Today, Dashboard as DashboardIcon } from '@mui/icons-material';
import { useFirebaseSync } from '../../hooks/useFirebaseSync';

export const ExpenseTracker = () => {
  const firebaseSync = useFirebaseSync();
  const { user, loadData } = firebaseSync || {
    user: null,
    loadData: () => Promise.resolve(null)
  };
  
  const [dataLoaded, setDataLoaded] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [allocateInputs, setAllocateInputs] = useState({});
  const [updateInputs, setUpdateInputs] = useState({});
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedMonth, setSelectedMonth] = useState('');
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
  const [currentView, setCurrentView] = useState('today');

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
            if (data.selectedMonth) {
              setSelectedMonth(data.selectedMonth);
              setCurrentMonth(data.selectedMonth);
            }
            
            const existingModes = new Set(['Cash', 'Card', 'UPI', 'Net Banking', 'Cheque']);
            (data.transactions || []).forEach(t => {
              if (t.mode) existingModes.add(t.mode);
            });
            Object.values(data.monthlyBudgets || {}).forEach(budget => {
              if (budget.incomes) {
                budget.incomes.forEach(inc => {
                  if (inc.mode) existingModes.add(inc.mode);
                });
              }
            });
            setPaymentModes(Array.from(existingModes));
          }
          setDataLoaded(true);
        } catch (error) {
          console.error('Error loading data:', error);
          setDataLoaded(true);
        }
      };
      loadUserData();
    } else {
      setDataLoaded(true);
    }
  }, [user, loadData]);

  useEffect(() => {
    if (dataLoaded && user && firebaseSync?.saveData) {
      firebaseSync.saveData(null, null, null, null, envelopes, transactions, monthlyBudgets, selectedMonth);
    }
  }, [envelopes, transactions, monthlyBudgets, selectedMonth, dataLoaded, user, firebaseSync]);



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

  const modeBalances = useMemo(() => {
    const balances = {};
    transactions
      .filter(t => t.date.startsWith(currentMonth))
      .forEach(t => {
        balances[t.mode] = (balances[t.mode] || 0) + t.amount;
      });
    
    if (currentBudget.incomes) {
      currentBudget.incomes.forEach(inc => {
        balances[inc.mode] = (balances[inc.mode] || 0) - inc.amount;
      });
    }
    
    return balances;
  }, [transactions, currentBudget.incomes, currentMonth]);

  const sortedTransactions = useMemo(() => {
    return transactions
      .filter(t => t.date.startsWith(currentMonth))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 20);
  }, [transactions, currentMonth]);

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

  const downloadExcel = () => {
    const monthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
    
    const csvContent = [
      ['Date', 'Description', 'Amount', 'Envelope', 'Payment Mode'],
      ...monthTransactions.map(t => {
        const envelope = envelopes.find(e => e.id === t.envelopeId);
        return [t.date, t.narration, t.amount, envelope?.name || '', t.mode];
      })
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${currentMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadEnvelopes = () => {
    const csvContent = [
      ['Envelope Name', 'Allocated', 'Spent', 'Balance'],
      ...envelopes.map(env => {
        const allocated = currentBudget.envelopes[env.id] || 0;
        const spent = transactions
          .filter(t => t.envelopeId === env.id && t.date.startsWith(currentMonth))
          .reduce((sum, t) => sum + t.amount, 0);
        const balance = allocated - spent;
        return [env.name, allocated, spent, balance];
      })
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `envelopes-${currentMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      
      const importedTransactions = [];
      const newEnvelopes = new Set(envelopes.map(e => e.name));
      const envelopeMap = {};
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(',');
        const [date, description, amount, envelopeName, mode] = values;
        
        if (!envelopeName || !amount) continue;
        
        let envelopeId = envelopes.find(e => e.name === envelopeName)?.id;
        if (!envelopeId) {
          if (!envelopeMap[envelopeName]) {
            envelopeId = `env_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
            envelopeMap[envelopeName] = envelopeId;
          } else {
            envelopeId = envelopeMap[envelopeName];
          }
        }
        
        importedTransactions.push({
          id: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
          date: date || new Date().toISOString().split('T')[0],
          narration: description || '',
          amount: parseFloat(amount) || 0,
          envelopeId,
          mode: mode || 'Cash',
          category: ''
        });
      }
      
      const newEnvelopesList = Object.entries(envelopeMap).map(([name, id]) => ({
        id,
        name,
        createdAt: new Date().toISOString()
      }));
      
      setEnvelopes(prev => [...prev, ...newEnvelopesList]);
      setTransactions(prev => [...prev, ...importedTransactions]);
      setSuccess(`Imported ${importedTransactions.length} transactions`);
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const deleteTransaction = (transactionId) => {
    setTransactions(transactions.filter(t => t.id !== transactionId));
    setSuccess('Transaction deleted successfully');
  };

  return (
    <Box sx={{ pb: 7 }}>
      <Card sx={{ mb: 3, borderRadius: { xs: 2, sm: 3 }, boxShadow: 0, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: 'text.primary', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                Expense Tracker
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                {currentView === 'today' ? 'Today\'s Overview' : 'Monthly Dashboard'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, alignItems: 'center', flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
              <TextField
                select
                label="Month"
                value={currentMonth}
                onChange={(e) => {
                  setCurrentMonth(e.target.value);
                  setSelectedMonth(e.target.value);
                }}
                size="small"
                sx={{ minWidth: { xs: '100%', sm: 150 }, flex: { xs: 1, sm: 'none' } }}
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
              <Button 
                variant="contained" 
                startIcon={<CalendarMonth />} 
                onClick={() => setOpenBudget(true)}
                fullWidth={true}
                sx={{ display: { xs: 'flex', sm: 'inline-flex' } }}
              >
                Add Income
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

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

      {currentView === 'today' && (
        <Box>
          <Card sx={{ mb: 3, boxShadow: 0, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Today's Summary</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Today's Spending</Typography>
                  <Typography variant="h5" color="error.main">
                    ₹{transactions
                      .filter(t => t.date === new Date().toISOString().split('T')[0])
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">This Month</Typography>
                  <Typography variant="h5" color="error.main">
                    ₹{transactions
                      .filter(t => t.date.startsWith(currentMonth))
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Typography variant="h6" sx={{ mb: 2 }}>Recent Transactions</Typography>
          {sortedTransactions.slice(0, 5).map(transaction => {
            const envelope = envelopes.find(e => e.id === transaction.envelopeId);
            return (
              <Card key={transaction.id} sx={{ mb: 2, boxShadow: 0, border: '1px solid', borderColor: 'divider' }}>
                <CardContent sx={{ py: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {transaction.narration}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {envelope?.name} • {transaction.mode}
                      </Typography>
                    </Box>
                    <Typography variant="h6" color="error.main">
                      -₹{transaction.amount.toLocaleString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {currentView === 'dashboard' && (
        <Box>
        <Paper sx={{ mb: 3, borderRadius: { xs: 2, sm: 3 }, overflow: 'hidden', boxShadow: 0, border: '1px solid', borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, v) => setActiveTab(v)} 
          sx={{ 
            '& .MuiTab-root': {
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              minHeight: 56
            },
            '& .Mui-selected': {
              color: 'primary.main'
            }
          }}
        >
          <Tab label="📊 Transactions" />
          <Tab label="📁 Envelopes" />
        </Tabs>
      </Paper>

      <Grid container spacing={3}>
        {activeTab === 0 && (
          <Grid item xs={12}>
            <Card sx={{ mb: 3, borderRadius: { xs: 2, sm: 3 }, boxShadow: 0, border: '1px solid', borderColor: 'divider', mx: { xs: -2, sm: 0 } }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccountBalanceWallet sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Payment Mode Balances</Typography>
                </Box>
                <Grid container spacing={2}>
                  {Object.entries(modeBalances).map(([mode, amount]) => (
                    <Grid item xs={6} sm={4} md={3} key={mode}>
                      <Card sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        borderRadius: 2,
                        boxShadow: 0,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper'
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
                          {mode}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                          {amount > 0 ? <TrendingDown sx={{ mr: 0.5, fontSize: '1rem', color: 'error.main' }} /> : <TrendingUp sx={{ mr: 0.5, fontSize: '1rem', color: 'success.main' }} />}
                          <Typography variant="h6" sx={{ fontWeight: 700, color: amount > 0 ? 'error.main' : 'success.main' }}>
                            ₹{Math.abs(amount).toLocaleString()}
                          </Typography>
                        </Box>
                        <Chip 
                          label={amount > 0 ? 'Spent' : 'Available'} 
                          size="small"
                          color={amount > 0 ? 'error' : 'success'}
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
            
            <Paper sx={{ p: { xs: 2, sm: 3 }, boxShadow: 0, border: '1px solid', borderColor: 'divider', borderRadius: { xs: 2, sm: 2 }, mx: { xs: -2, sm: 0 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 0 } }}>
                <Typography variant="h6">Transactions</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' }, width: { xs: '100%', sm: 'auto' } }}>
                  <Button variant="outlined" startIcon={<Upload />} component="label" size="small">
                    Import CSV
                    <input type="file" accept=".csv" hidden onChange={handleImportCSV} />
                  </Button>
                  <Button variant="outlined" startIcon={<Download />} onClick={downloadExcel} size="small">
                    Download CSV
                  </Button>
                  <Button variant="contained" startIcon={<Receipt />} onClick={() => setOpenTransaction(true)} disabled={!canSpend} size="small">
                    Add Transaction
                  </Button>
                </Box>
              </Box>
              
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: { xs: 300, sm: 650 } }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 600, py: { xs: 1, sm: 2 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: { xs: 1, sm: 2 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Description</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, py: { xs: 1, sm: 2 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: { xs: 1, sm: 2 }, fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', sm: 'table-cell' } }}>Envelope</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: { xs: 1, sm: 2 }, fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }}>Payment Mode</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, py: { xs: 1, sm: 2 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedTransactions.map(transaction => {
                      const envelope = envelopes.find(e => e.id === transaction.envelopeId);
                      return (
                        <TableRow key={transaction.id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                          <TableCell sx={{ py: { xs: 1, sm: 2 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            {new Date(transaction.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}
                          </TableCell>
                          <TableCell sx={{ py: { xs: 1, sm: 2 }, maxWidth: { xs: 120, sm: 200 } }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                              {transaction.narration}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'block', sm: 'none' }, fontSize: '0.65rem' }}>
                              {envelope?.name} • {transaction.mode}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ py: { xs: 1, sm: 2 }, color: 'error.main', fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.95rem' } }}>
                            -₹{transaction.amount.toLocaleString()}
                          </TableCell>
                          <TableCell sx={{ py: { xs: 1, sm: 2 }, display: { xs: 'none', sm: 'table-cell' } }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                              {envelope?.name}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: { xs: 1, sm: 2 }, display: { xs: 'none', md: 'table-cell' } }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                              {transaction.mode}
                            </Typography>
                          </TableCell>
                          <TableCell align="center" sx={{ py: { xs: 1, sm: 2 } }}>
                            <Button 
                              size="small" 
                              onClick={() => deleteTransaction(transaction.id)} 
                              color="error"
                              sx={{ minWidth: 'auto', p: { xs: 0.5, sm: 1 } }}
                            >
                              <Delete fontSize="small" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        )}
        
        {activeTab === 1 && (
          <Grid item xs={12}>
            <Paper sx={{ p: { xs: 2, sm: 3 }, boxShadow: 0, border: '1px solid', borderColor: 'divider', borderRadius: { xs: 2, sm: 2 }, mx: { xs: -2, sm: 0 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Envelopes</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="outlined" startIcon={<Download />} onClick={downloadEnvelopes} size="small">
                    Download
                  </Button>
                  <Button variant="contained" startIcon={<Add />} onClick={() => setOpenEnvelope(true)}>
                    Add Envelope
                  </Button>
                </Box>
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
                      <Paper sx={{ p: 2, bgcolor: balance < allocated * 0.2 ? 'error.50' : 'background.paper', boxShadow: 0, border: '1px solid', borderColor: balance < allocated * 0.2 ? 'error.light' : 'divider', borderRadius: 2 }}>
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
          <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 2, boxShadow: 0, border: '1px solid', borderColor: 'divider', borderRadius: { xs: 2, sm: 2 }, mx: { xs: -2, sm: 0 } }}>
            <Typography variant="h6" gutterBottom>Payment Mode Balances</Typography>
            {Object.entries(modeBalances).map(([mode, amount]) => (
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

          <Paper sx={{ p: { xs: 2, sm: 3 }, boxShadow: 0, border: '1px solid', borderColor: 'divider', borderRadius: { xs: 2, sm: 2 }, mx: { xs: -2, sm: 0 } }}>
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
      </Box>
      )}

      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 80, right: 16 }}
        onClick={() => setOpenTransaction(true)}
      >
        <Add />
      </Fab>

      <BottomNavigation
        value={currentView}
        onChange={(e, v) => setCurrentView(v)}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: 1,
          borderColor: 'divider'
        }}
      >
        <BottomNavigationAction label="Today" value="today" icon={<Today />} />
        <BottomNavigationAction label="Dashboard" value="dashboard" icon={<DashboardIcon />} />
      </BottomNavigation>

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