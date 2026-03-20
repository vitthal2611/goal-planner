import { create } from 'zustand';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const useFinanceStore = create((set, get) => ({
  paymentMethods: [],
  envelopes: [],
  transactions: [],
  budgets: [],
  defaultBudgets: {},
  selectedMonth: new Date().toISOString().slice(0, 7),
  selectedYear: new Date().getFullYear().toString(),
  selectedEnvelopeFilter: 'ALL',
  showPaymentBalances: true,
  recentTxVisibleCount: 10,

  loadUserData: async (userId) => {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        set({
          paymentMethods: data.paymentMethods || [],
          envelopes: data.envelopes || [],
          transactions: data.transactions || [],
          budgets: data.budgets || [],
          defaultBudgets: data.defaultBudgets || {}
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  },

  saveUserData: async (userId) => {
    try {
      const { paymentMethods, envelopes, transactions, budgets, defaultBudgets } = get();
      const docRef = doc(db, 'users', userId);
      await setDoc(docRef, {
        paymentMethods,
        envelopes,
        transactions,
        budgets,
        defaultBudgets,
        lastUpdated: new Date()
      }, { merge: true });
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  },

  addPaymentMethod: (method, userId) => {
    set((state) => ({
      paymentMethods: [...new Set([...state.paymentMethods, method])]
    }));
    get().saveUserData(userId);
  },

  deletePaymentMethod: (method, userId) => {
    set((state) => ({
      paymentMethods: state.paymentMethods.filter(m => m !== method),
      transactions: state.transactions.filter(t => 
        t.payment !== method && t.from !== method && t.to !== method
      )
    }));
    get().saveUserData(userId);
  },

  addEnvelope: (envelope, userId) => {
    set((state) => ({
      envelopes: [...new Set([...state.envelopes, envelope])]
    }));
    get().saveUserData(userId);
  },

  deleteEnvelope: (envelope, userId) => {
    set((state) => ({
      envelopes: state.envelopes.filter(e => e !== envelope),
      transactions: state.transactions.filter(t => t.envelope !== envelope),
      budgets: state.budgets.filter(b => b.envelope !== envelope)
    }));
    get().saveUserData(userId);
  },

  addTransaction: (transaction, userId) => {
    set((state) => ({
      transactions: [...state.transactions, { ...transaction, id: Date.now() }]
    }));
    get().saveUserData(userId);
  },

  addMultipleTransactions: (transactionsArray, userId) => {
    set((state) => ({
      transactions: [...state.transactions, ...transactionsArray.map(t => ({ ...t, id: Date.now() + Math.random() }))]
    }));
    get().saveUserData(userId);
  },

  deleteTransaction: (id, userId) => {
    set((state) => ({
      transactions: state.transactions.filter(t => t.id !== id)
    }));
    get().saveUserData(userId);
  },

  addBudget: (budget, userId) => {
    set((state) => ({
      budgets: [...state.budgets.filter(b => !(b.envelope === budget.envelope && b.month === budget.month)), budget]
    }));
    get().saveUserData(userId);
  },

  deleteBudget: (envelope, month, userId) => {
    set((state) => ({
      budgets: state.budgets.filter(b => !(b.envelope === envelope && b.month === month))
    }));
    get().saveUserData(userId);
  },

  setDefaultBudget: (envelope, amount, userId) => {
    set((state) => ({
      defaultBudgets: { ...state.defaultBudgets, [envelope]: amount }
    }));
    get().saveUserData(userId);
  },

  setSelectedMonth: (month) => set({ selectedMonth: month }),
  setSelectedYear: (year) => set({ selectedYear: year }),
  setSelectedEnvelopeFilter: (filter) => set({ selectedEnvelopeFilter: filter }),
  togglePaymentBalances: () => set((state) => ({ showPaymentBalances: !state.showPaymentBalances })),
  setRecentTxVisibleCount: (count) => set({ recentTxVisibleCount: count }),
  loadMoreTransactions: () => set((state) => ({ recentTxVisibleCount: state.recentTxVisibleCount + 10 })),
  loadAllTransactions: () => set({ recentTxVisibleCount: Infinity }),
  loadFewerTransactions: () => set({ recentTxVisibleCount: 10 }),

  getFilteredTransactions: () => {
    const { transactions, selectedMonth, selectedYear, selectedEnvelopeFilter } = get();
    
    let filtered = transactions.filter(t => {
      if (!t.date) return false;
      const date = new Date(t.date);
      const year = date.getFullYear().toString();
      const month = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (selectedMonth === 'ALL') {
        return year === selectedYear;
      }
      return month === selectedMonth;
    });

    if (selectedEnvelopeFilter !== 'ALL') {
      filtered = filtered.filter(t => t.envelope === selectedEnvelopeFilter);
    }

    return filtered;
  },

  getPaymentBalance: (method) => {
    const transactions = get().getFilteredTransactions();
    let balance = 0;
    
    transactions.forEach(t => {
      if (t.type === 'income' && t.payment === method) {
        balance += parseFloat(t.amount);
      } else if (t.type === 'expense' && t.payment === method) {
        balance -= parseFloat(t.amount);
      } else if (t.type === 'transfer') {
        if (t.from === method) balance -= parseFloat(t.amount);
        if (t.to === method) balance += parseFloat(t.amount);
      }
    });
    
    return balance;
  },

  getEnvelopeBudgetData: () => {
    const { envelopes, budgets, defaultBudgets, transactions, selectedMonth } = get();
    
    return envelopes.map(envelope => {
      // Get budget for this envelope and month
      const budget = budgets.find(b => b.envelope === envelope && b.month === selectedMonth);
      const budgetAmount = budget ? parseFloat(budget.amount) : (defaultBudgets[envelope] || 0);
      
      // Calculate spent amount
      const spent = transactions
        .filter(t => t.type === 'expense' && t.envelope === envelope)
        .filter(t => {
          if (!t.date) return false;
          const date = new Date(t.date);
          const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          return month === selectedMonth;
        })
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      // Calculate by expense type
      const needSpent = transactions
        .filter(t => t.type === 'expense' && t.envelope === envelope && t.expenseType === 'need')
        .filter(t => {
          if (!t.date) return false;
          const date = new Date(t.date);
          const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          return month === selectedMonth;
        })
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const wantSpent = transactions
        .filter(t => t.type === 'expense' && t.envelope === envelope && t.expenseType === 'want')
        .filter(t => {
          if (!t.date) return false;
          const date = new Date(t.date);
          const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          return month === selectedMonth;
        })
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const saveSpent = transactions
        .filter(t => t.type === 'expense' && t.envelope === envelope && t.expenseType === 'save')
        .filter(t => {
          if (!t.date) return false;
          const date = new Date(t.date);
          const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          return month === selectedMonth;
        })
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      return {
        envelope,
        budgetAmount,
        spent,
        needSpent,
        wantSpent,
        saveSpent,
        remaining: budgetAmount - spent,
        percentage: budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0
      };
    });
  },

  exportToJSON: () => {
    const { paymentMethods, envelopes, transactions, budgets, defaultBudgets } = get();
    return {
      paymentMethods,
      envelopes,
      transactions,
      budgets,
      defaultBudgets,
      exportedAt: new Date().toISOString()
    };
  },

  importFromJSON: (data, userId) => {
    set({
      paymentMethods: [...new Set([...get().paymentMethods, ...(data.paymentMethods || [])])],
      envelopes: [...new Set([...get().envelopes, ...(data.envelopes || [])])],
      transactions: [...get().transactions, ...(data.transactions || [])],
      budgets: [...get().budgets, ...(data.budgets || [])],
      defaultBudgets: { ...get().defaultBudgets, ...(data.defaultBudgets || {}) }
    });
    get().saveUserData(userId);
  },

  downloadCSVReport: () => {
    const { transactions, selectedMonth, selectedYear, selectedEnvelopeFilter, paymentMethods, envelopes } = get();
    
    let filtered = transactions.filter(t => {
      if (!t.date) return false;
      const date = new Date(t.date);
      const year = date.getFullYear().toString();
      const month = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (selectedMonth === 'ALL') {
        return year === selectedYear;
      }
      return month === selectedMonth;
    });

    if (selectedEnvelopeFilter !== 'ALL') {
      filtered = filtered.filter(t => t.envelope === selectedEnvelopeFilter);
    }

    if (filtered.length === 0) return null;

    const income = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const expense = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const net = income - expense;

    const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

    let csv = 'Financial Report\n';
    csv += `Period,${selectedMonth === 'ALL' ? `Year ${selectedYear}` : selectedMonth}\n`;
    csv += `Category,${selectedEnvelopeFilter === 'ALL' ? 'All Categories' : selectedEnvelopeFilter}\n`;
    csv += `Generated,${new Date().toLocaleString('en-IN')}\n\n`;
    csv += 'SUMMARY\n';
    csv += `Total Income,${income}\n`;
    csv += `Total Expense,${expense}\n`;
    csv += `Net Balance,${net}\n\n`;

    if (selectedEnvelopeFilter === 'ALL') {
      csv += 'EXPENSE BY CATEGORY\n';
      const breakdown = {};
      filtered.filter(t => t.type === 'expense').forEach(t => {
        const env = t.envelope || 'Uncategorized';
        breakdown[env] = (breakdown[env] || 0) + parseFloat(t.amount);
      });
      Object.entries(breakdown).sort((a, b) => b[1] - a[1]).forEach(([env, amount]) => {
        csv += `${env},${amount}\n`;
      });
      csv += '\n';
    }

    csv += 'BALANCE BY PAYMENT METHOD\n';
    paymentMethods.forEach(method => {
      let balance = 0;
      filtered.forEach(t => {
        if (t.type === 'income' && t.payment === method) balance += parseFloat(t.amount);
        else if (t.type === 'expense' && t.payment === method) balance -= parseFloat(t.amount);
        else if (t.type === 'transfer') {
          if (t.from === method) balance -= parseFloat(t.amount);
          if (t.to === method) balance += parseFloat(t.amount);
        }
      });
      csv += `${method},${balance}\n`;
    });
    csv += '\n';

    csv += 'TRANSACTION DETAILS\n';
    csv += 'Date,Type,Description,Category,Payment Method,Expense Type,Amount\n';
    
    sorted.forEach(t => {
      const date = new Date(t.date).toLocaleString('en-IN');
      const type = t.type.charAt(0).toUpperCase() + t.type.slice(1);
      const description = (t.description || 'Transfer').replace(/,/g, ';');
      const category = t.envelope || (t.type === 'transfer' ? `${t.from} → ${t.to}` : '-');
      const payment = t.payment || (t.type === 'transfer' ? 'Transfer' : '-');
      const expenseType = t.expenseType ? t.expenseType.charAt(0).toUpperCase() + t.expenseType.slice(1) : '-';
      const amount = parseFloat(t.amount);
      
      csv += `${date},${type},${description},${category},${payment},${expenseType},${amount}\n`;
    });

    return csv;
  }
}));
