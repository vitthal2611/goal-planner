import React, { useState, useEffect } from 'react';
import './QuickTrackUI.css';

const QuickTrackUI = () => {
  // Finance states
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [activeType, setActiveType] = useState('expense');
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear().toString());
  const [envelope, setEnvelope] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [transferFrom, setTransferFrom] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('payment');
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [newEnvelope, setNewEnvelope] = useState('');
  const [defaultBudget, setDefaultBudget] = useState('');
  const [budgetMonth, setBudgetMonth] = useState('');
  const [paymentBalancesCollapsed, setPaymentBalancesCollapsed] = useState(false);
  const [balanceSummaryCollapsed, setBalanceSummaryCollapsed] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Data states
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [envelopes, setEnvelopes] = useState([]);
  const [defaultBudgets, setDefaultBudgets] = useState({});
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Habit tracking states
  const [mainTab, setMainTab] = useState('finance');
  const [habitTab, setHabitTab] = useState('view');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [habits, setHabits] = useState([]);
  const [habitCheckins, setHabitCheckins] = useState([]);
  const [groupByIdentity, setGroupByIdentity] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState(null);
  
  // Habit form states
  const [habitIdentity, setHabitIdentity] = useState('');
  const [habitTriggerCue, setHabitTriggerCue] = useState('');
  const [habitTriggerTime, setHabitTriggerTime] = useState('');
  const [habitRoutineAction, setHabitRoutineAction] = useState('');
  const [habitRoutineLocation, setHabitRoutineLocation] = useState('');
  const [habitImmediateReward, setHabitImmediateReward] = useState('');
  const [habitMilestones, setHabitMilestones] = useState([]);
  const [habitProgressions, setHabitProgressions] = useState([]);
  const [collapsedSections, setCollapsedSections] = useState({});

  // Generate months dynamically based on current date
  const generateMonths = () => {
    const months = [{ value: 'ALL', label: 'All Months' }];
    const currentYear = new Date().getFullYear();
    
    for (let year = currentYear - 1; year <= currentYear + 2; year++) {
      for (let month = 1; month <= 12; month++) {
        const monthStr = `${year}-${String(month).padStart(2, '0')}`;
        const date = new Date(year, month - 1);
        const monthName = date.toLocaleString('default', { month: 'short' });
        months.push({ value: monthStr, label: `${monthName} ${year}` });
      }
    }
    return months;
  };

  const months = generateMonths();

  // Generate years dynamically
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 2; year <= currentYear + 5; year++) {
      years.push(year.toString());
    }
    return years;
  };

  const years = generateYears();

  // Habit tracking functions
  const getToday = () => {
    return new Date().toISOString().split('T')[0];
  };

  const formatDateDisplay = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date(getToday() + 'T00:00:00');
    const diff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff === -1) return 'Tomorrow';
    if (diff > 1 && diff <= 7) return `${diff} days ago`;
    if (diff < -1 && diff >= -7) return `In ${Math.abs(diff)} days`;
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const getStreak = (habitId, upToDate = null) => {
    const endDate = upToDate || getToday();
    let streak = 0;
    let checkDate = new Date(endDate + 'T00:00:00');
    
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const checked = habitCheckins.some(c => c.habitId === habitId && c.date === dateStr);
      if (!checked) break;
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return streak;
  };

  const isCheckedOnDate = (habitId, date) => {
    return habitCheckins.some(c => c.habitId === habitId && c.date === date);
  };

  const toggleHabitCheckIn = (habitId, date) => {
    const index = habitCheckins.findIndex(c => c.habitId === habitId && c.date === date);
    
    if (index > -1) {
      setHabitCheckins(habitCheckins.filter((_, i) => i !== index));
    } else {
      setHabitCheckins([...habitCheckins, { habitId, date }]);
    }
  };

  const deleteHabit = (habitId) => {
    if (window.confirm('Delete this habit?')) {
      setHabits(habits.filter(h => h.id !== habitId));
      setHabitCheckins(habitCheckins.filter(c => c.habitId !== habitId));
      showToast('Habit deleted', 'error');
    }
  };

  const editHabit = (habitId) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    setEditingHabitId(habitId);
    setHabitIdentity(habit.identity ? habit.identity.replace('I am ', '') : '');
    setHabitTriggerCue(habit.triggerCue || '');
    setHabitTriggerTime(habit.triggerTime || '');
    setHabitRoutineAction(habit.routineAction || '');
    setHabitRoutineLocation(habit.routineLocation || '');
    setHabitImmediateReward(habit.immediateReward || '');
    setHabitMilestones(habit.milestones || []);
    setHabitProgressions(habit.progressions || []);
    setHabitTab('create');
  };

  const handlePrevDay = () => {
    const date = new Date(selectedDate + 'T00:00:00');
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const date = new Date(selectedDate + 'T00:00:00');
    date.setDate(date.getDate() + 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const toggleSection = (sectionName) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const addMilestone = () => {
    setHabitMilestones([...habitMilestones, { days: '', milestone: '' }]);
  };

  const removeMilestone = (index) => {
    setHabitMilestones(habitMilestones.filter((_, i) => i !== index));
  };

  const updateMilestone = (index, field, value) => {
    const updated = [...habitMilestones];
    updated[index][field] = value;
    setHabitMilestones(updated);
  };

  const addProgression = () => {
    setHabitProgressions([...habitProgressions, { days: '', progression: '' }]);
  };

  const removeProgression = (index) => {
    setHabitProgressions(habitProgressions.filter((_, i) => i !== index));
  };

  const updateProgression = (index, field, value) => {
    const updated = [...habitProgressions];
    updated[index][field] = value;
    setHabitProgressions(updated);
  };

  const resetHabitForm = () => {
    setHabitIdentity('');
    setHabitTriggerCue('');
    setHabitTriggerTime('');
    setHabitRoutineAction('');
    setHabitRoutineLocation('');
    setHabitImmediateReward('');
    setHabitMilestones([]);
    setHabitProgressions([]);
    setEditingHabitId(null);
    setCollapsedSections({});
  };

  const handleHabitSubmit = (e) => {
    e.preventDefault();

    const identity = 'I am ' + habitIdentity.trim();
    const triggerCue = habitTriggerCue.trim();
    const routineAction = habitRoutineAction.trim();
    const routineLocation = habitRoutineLocation.trim();
    const immediateReward = habitImmediateReward.trim();

    if (!habitIdentity || !triggerCue || !routineAction || !routineLocation || !immediateReward) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    const validMilestones = habitMilestones
      .filter(m => m.days && m.milestone)
      .map(m => ({ days: parseInt(m.days), milestone: m.milestone }))
      .sort((a, b) => a.days - b.days);

    const validProgressions = habitProgressions
      .filter(p => p.days && p.progression)
      .map(p => ({ days: parseInt(p.days), progression: p.progression }))
      .sort((a, b) => a.days - b.days);

    if (editingHabitId) {
      const updatedHabits = habits.map(h => 
        h.id === editingHabitId
          ? {
              ...h,
              identity,
              triggerCue,
              triggerTime: habitTriggerTime,
              routineAction,
              routineLocation,
              immediateReward,
              milestones: validMilestones,
              progressions: validProgressions
            }
          : h
      );
      setHabits(updatedHabits);
      showToast(`Habit updated: ${identity}`, 'success');
    } else {
      const newHabit = {
        id: Date.now().toString(),
        identity,
        triggerCue,
        triggerTime: habitTriggerTime,
        routineAction,
        routineLocation,
        immediateReward,
        milestones: validMilestones,
        progressions: validProgressions,
        createdAt: new Date().toISOString()
      };
      setHabits([...habits, newHabit]);
      showToast(`Atomic habit created: ${identity}`, 'success');
    }

    resetHabitForm();
    setHabitTab('view');
  };

  const getHabitStats = () => {
    const completedCount = habits.filter(h => isCheckedOnDate(h.id, selectedDate)).length;
    return { completed: completedCount, total: habits.length };
  };

  const renderHabitsList = () => {
    if (habits.length === 0) {
      return (
        <div style={{padding: '32px 16px', textAlign: 'center', color: '#9ca3af', fontSize: '15px'}}>
          ✨ No habits yet. Create one to get started!
        </div>
      );
    }

    const sortedHabits = [...habits].sort((a, b) => {
      const timeA = a.triggerTime || '23:59';
      const timeB = b.triggerTime || '23:59';
      return timeA.localeCompare(timeB);
    });

    if (groupByIdentity) {
      const habitsByIdentity = {};
      sortedHabits.forEach(habit => {
        const identity = habit.identity || 'No Identity';
        if (!habitsByIdentity[identity]) {
          habitsByIdentity[identity] = [];
        }
        habitsByIdentity[identity].push(habit);
      });

      return Object.entries(habitsByIdentity).map(([identity, groupHabits]) => {
        const identityName = identity.replace('I am ', '');
        return (
          <div key={identity} className="identity-group">
            <div className="identity-header">✨ {identityName}</div>
            <div className="identity-habits">
              {groupHabits.map(habit => renderHabitCard(habit))}
            </div>
          </div>
        );
      });
    }

    return sortedHabits.map(habit => renderHabitCard(habit, true));
  };

  const renderHabitCard = (habit, showIdentity = false) => {
    const checked = isCheckedOnDate(habit.id, selectedDate);
    const streak = getStreak(habit.id, selectedDate);
    const timeDisplay = habit.triggerTime ? ` at ${habit.triggerTime}` : '';
    const nextMilestone = habit.milestones?.find(m => m.days > streak);

    return (
      <div key={habit.id} className={`habit-card ${checked ? 'completed' : ''}`}>
        <div className="habit-card-main">
          <button 
            className={`check-btn ${checked ? 'checked' : ''}`}
            onClick={() => toggleHabitCheckIn(habit.id, selectedDate)}
          >
            {checked ? '✓' : ''}
          </button>
          <div className="habit-info">
            {showIdentity && habit.identity && (
              <div className="identity-badge">
                ✨ {habit.identity.replace('I am ', '')}
              </div>
            )}
            <div className="habit-title">{habit.routineAction}</div>
            <div className="habit-cue">
              <span>🔔 After I {habit.triggerCue}{timeDisplay}</span>
              {habit.routineLocation && <span>📍 {habit.routineLocation}</span>}
            </div>
          </div>
          <div className="habit-streak">
            <div className="streak-number">{streak}</div>
            <div className="streak-label">🔥 Streak</div>
          </div>
        </div>
        <div className="habit-card-footer">
          {habit.immediateReward && (
            <div className="habit-reward">🎁 {habit.immediateReward}</div>
          )}
          {nextMilestone && (
            <div className="habit-milestone">
              📈 Day {nextMilestone.days}: {nextMilestone.milestone}
            </div>
          )}
          <button className="habit-action-btn edit-habit-btn" onClick={() => editHabit(habit.id)}>
            ✏️ Edit
          </button>
          <button className="habit-action-btn delete-habit-btn" onClick={() => deleteHabit(habit.id)}>
            🗑️ Delete
          </button>
        </div>
      </div>
    );
  };

  // Load data from localStorage on mount
  useEffect(() => {
    const savedPaymentMethods = JSON.parse(localStorage.getItem('paymentMethods')) || [];
    const savedEnvelopes = JSON.parse(localStorage.getItem('envelopes')) || [];
    const savedDefaultBudgets = JSON.parse(localStorage.getItem('defaultBudgets')) || {};
    const savedBudgets = JSON.parse(localStorage.getItem('budgets')) || [];
    const savedTransactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const savedHabits = JSON.parse(localStorage.getItem('habits')) || [];
    const savedHabitCheckins = JSON.parse(localStorage.getItem('habitCheckins')) || [];

    setPaymentMethods(savedPaymentMethods);
    setEnvelopes(savedEnvelopes);
    setDefaultBudgets(savedDefaultBudgets);
    setBudgets(savedBudgets);
    setTransactions(savedTransactions);
    setHabits(savedHabits);
    setHabitCheckins(savedHabitCheckins);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('paymentMethods', JSON.stringify(paymentMethods));
  }, [paymentMethods]);

  useEffect(() => {
    localStorage.setItem('envelopes', JSON.stringify(envelopes));
  }, [envelopes]);

  useEffect(() => {
    localStorage.setItem('defaultBudgets', JSON.stringify(defaultBudgets));
  }, [defaultBudgets]);

  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('habitCheckins', JSON.stringify(habitCheckins));
  }, [habitCheckins]);

  // Toast functionality
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handlePrevMonth = () => {
    const currentIndex = months.findIndex(m => m.value === currentMonth);
    if (currentIndex > 0) {
      setCurrentMonth(months[currentIndex - 1].value);
    }
  };

  const handleNextMonth = () => {
    const currentIndex = months.findIndex(m => m.value === currentMonth);
    if (currentIndex < months.length - 1) {
      setCurrentMonth(months[currentIndex + 1].value);
    }
  };

  const handlePrevYear = () => {
    const currentIndex = years.findIndex(y => y === currentYear);
    if (currentIndex > 0) {
      setCurrentYear(years[currentIndex - 1]);
    }
  };

  const handleNextYear = () => {
    const currentIndex = years.findIndex(y => y === currentYear);
    if (currentIndex < years.length - 1) {
      setCurrentYear(years[currentIndex + 1]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (activeType === 'transfer') {
      if (amount && transferFrom && transferTo) {
        const transaction = {
          id: Date.now(),
          type: 'transfer',
          amount,
          description,
          from: transferFrom,
          to: transferTo,
          date: new Date().toISOString()
        };
        setTransactions([...transactions, transaction]);
        showToast(`Transfer: ₹${amount} from ${transferFrom} to ${transferTo}`, 'success');
        setAmount('');
        setDescription('');
        setTransferFrom('');
        setTransferTo('');
      } else {
        showToast('Please fill all required fields', 'error');
      }
    } else if (activeType === 'income') {
      if (amount && description && paymentMethod) {
        const transaction = {
          id: Date.now(),
          type: 'income',
          amount,
          description,
          payment: paymentMethod,
          date: new Date().toISOString()
        };
        setTransactions([...transactions, transaction]);
        showToast(`Income: ₹${amount} - ${description}`, 'success');
        setAmount('');
        setDescription('');
        setPaymentMethod('');
      } else {
        if (!amount) showToast('Please enter amount', 'error');
        else if (!description) showToast('Please enter description', 'error');
        else if (!paymentMethod) showToast('Please select payment method', 'error');
      }
    } else {
      if (amount && description && envelope && paymentMethod) {
        const transaction = {
          id: Date.now(),
          type: 'expense',
          amount,
          description,
          envelope,
          payment: paymentMethod,
          date: new Date().toISOString()
        };
        setTransactions([...transactions, transaction]);
        showToast(`Expense: ₹${amount} - ${description}`, 'success');
        setAmount('');
        setDescription('');
        setEnvelope('');
        setPaymentMethod('');
      } else {
        if (!amount) showToast('Please enter amount', 'error');
        else if (!description) showToast('Please enter description', 'error');
        else if (!envelope) showToast('Please select envelope', 'error');
        else if (!paymentMethod) showToast('Please select payment method', 'error');
      }
    }
  };

  const addPaymentMethod = () => {
    const methodName = newPaymentMethod.trim();
    if (methodName) {
      if (!paymentMethods.includes(methodName)) {
        setPaymentMethods([...paymentMethods, methodName]);
        const balanceMsg = initialBalance ? ` with initial balance ₹${initialBalance}` : '';
        showToast(`${methodName}${balanceMsg} added!`, 'success');
        setNewPaymentMethod('');
        setInitialBalance('');
      } else {
        showToast('Payment method already exists!', 'error');
      }
    }
  };

  const deletePaymentMethod = (name) => {
    if (window.confirm(`Delete ${name}?`)) {
      setPaymentMethods(paymentMethods.filter(method => method !== name));
      showToast(`${name} deleted`, 'error');
    }
  };

  const addEnvelope = () => {
    const envelopeName = newEnvelope.trim();
    if (envelopeName) {
      if (!envelopes.includes(envelopeName)) {
        setEnvelopes([...envelopes, envelopeName]);
        if (defaultBudget) {
          setDefaultBudgets({...defaultBudgets, [envelopeName]: defaultBudget});
        }
        const budgetMsg = defaultBudget ? ` with default budget ₹${defaultBudget}` : '';
        showToast(`${envelopeName}${budgetMsg} added!`, 'success');
        setNewEnvelope('');
        setDefaultBudget('');
      } else {
        showToast('Envelope already exists!', 'error');
      }
    }
  };

  const deleteEnvelope = (name) => {
    if (window.confirm(`Delete ${name}?`)) {
      setEnvelopes(envelopes.filter(env => env !== name));
      const newDefaultBudgets = {...defaultBudgets};
      delete newDefaultBudgets[name];
      setDefaultBudgets(newDefaultBudgets);
      showToast(`${name} deleted`, 'error');
    }
  };

  const saveBudget = (envelopeName) => {
    const input = document.querySelector(`input[data-envelope="${envelopeName}"]`);
    const budgetAmount = input.value.trim();
    
    if (!budgetAmount) {
      showToast('Please enter a budget amount', 'error');
      return;
    }
    
    const existingBudget = budgets.find(b => b.envelope === envelopeName && b.month === budgetMonth);
    if (existingBudget) {
      const updatedBudgets = budgets.map(b => 
        b.envelope === envelopeName && b.month === budgetMonth 
          ? {...b, amount: budgetAmount}
          : b
      );
      setBudgets(updatedBudgets);
      showToast(`Budget updated: ${envelopeName}`, 'success');
    } else {
      setBudgets([...budgets, { envelope: envelopeName, month: budgetMonth, amount: budgetAmount }]);
      showToast(`Budget saved: ${envelopeName}`, 'success');
    }
  };

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  // Calculate payment balances
  const getPaymentBalance = (method) => {
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
  };

  // Get recent transactions
  const getRecentTransactions = () => {
    return [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
  };

  // Get transaction icon
  const getTransactionIcon = (type, description) => {
    if (type === 'income') return '💰';
    if (type === 'transfer') return '🔄';
    
    const desc = description.toLowerCase();
    if (desc.includes('food') || desc.includes('lunch') || desc.includes('dinner') || desc.includes('breakfast')) return '🍔';
    if (desc.includes('transport') || desc.includes('uber') || desc.includes('taxi') || desc.includes('bus')) return '🚕';
    if (desc.includes('shopping') || desc.includes('clothes')) return '🛍️';
    if (desc.includes('entertainment') || desc.includes('movie')) return '🎬';
    if (desc.includes('grocery') || desc.includes('groceries')) return '🛒';
    return '💸';
  };

  // Get time ago
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 172800) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Generate month options for budget
  const generateMonthOptions = () => {
    const options = [];
    const currentYear = new Date().getFullYear();
    
    for (let year = currentYear - 1; year <= currentYear + 2; year++) {
      for (let month = 1; month <= 12; month++) {
        const monthStr = `${year}-${String(month).padStart(2, '0')}`;
        const date = new Date(year, month - 1);
        const monthName = date.toLocaleString('default', { month: 'short' });
        options.push({ value: monthStr, label: `${monthName} ${year}` });
      }
    }
    return options;
  };

  // Get envelope budget data
  const getEnvelopeBudgetData = () => {
    return envelopes.map(envelopeName => {
      const budget = budgets.find(b => b.envelope === envelopeName && b.month === currentMonth);
      const budgetAmount = budget ? parseFloat(budget.amount) : 0;
      
      let actualSpent = 0;
      
      if (currentMonth === 'ALL') {
        actualSpent = transactions
          .filter(t => t.type === 'expense' && t.envelope === envelopeName)
          .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      } else {
        actualSpent = transactions
          .filter(t => {
            if (t.type !== 'expense' || t.envelope !== envelopeName) return false;
            if (!t.date) return false;
            const transactionMonth = t.date.substring(0, 7);
            return transactionMonth === currentMonth;
          })
          .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      }
      
      const percentage = budgetAmount > 0 ? (actualSpent / budgetAmount) * 100 : 0;
      let color = '#22c55e';
      if (percentage >= 100) color = '#ef4444';
      else if (percentage >= 90) color = '#f59e0b';
      
      return {
        name: envelopeName,
        budgetAmount,
        actualSpent,
        percentage: Math.min(percentage, 100),
        color
      };
    });
  };

  return (
    <div className="quick-track">
      <header className="app-header">
        <h1>💰 Budget Planner</h1>
      </header>
      <div className="top-bar">
        <button className="profile-btn" onClick={() => setShowModal(true)}>⚙️</button>
        <div className="year-selector">
          <button className="year-nav" onClick={handlePrevYear}>‹</button>
          <select 
            value={currentYear} 
            onChange={(e) => setCurrentYear(e.target.value)}
            className="year-select"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button className="year-nav" onClick={handleNextYear}>›</button>
        </div>
        <div className="month-selector">
          <button className="month-nav" onClick={handlePrevMonth}>‹</button>
          <select 
            value={currentMonth} 
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="month-select"
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <button className="month-nav" onClick={handleNextMonth}>›</button>
        </div>
      </div>

      <div className="balance-summary-wrapper">
        <div className="balance-header" onClick={() => setBalanceSummaryCollapsed(!balanceSummaryCollapsed)}>
          <div className="balance-title">Income & Expense</div>
          <div className={`toggle-icon ${balanceSummaryCollapsed ? 'collapsed' : ''}`}>▼</div>
        </div>
        <div className={`balance-summary ${balanceSummaryCollapsed ? 'collapsed' : ''}`}>
          <div className="balance-item income">
            <div className="balance-label">Income</div>
            <div className="balance-value">₹{totalIncome.toLocaleString('en-IN')}</div>
          </div>
          <div className="balance-item expense">
            <div className="balance-label">Expense</div>
            <div className="balance-value">₹{totalExpense.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      <div className="payment-balances-wrapper">
        <div className="payment-header" onClick={() => setPaymentBalancesCollapsed(!paymentBalancesCollapsed)}>
          <div className="payment-title">Payment Methods</div>
          <div className={`toggle-icon ${paymentBalancesCollapsed ? 'collapsed' : ''}`}>▼</div>
        </div>
        <div className={`payment-balances ${paymentBalancesCollapsed ? 'collapsed' : ''}`}>
          {paymentMethods.length === 0 ? (
            <div style={{gridColumn: '1/-1', padding: '16px', textAlign: 'center', color: '#6b7280'}}>No payment methods added yet.</div>
          ) : (
            paymentMethods.map((method, index) => {
              const balance = getPaymentBalance(method);
              const colors = ['hdfc', 'sbi', 'cash', 'transfer'];
              const colorClass = colors[index % colors.length];
              
              return (
                <div key={method} className={`payment-item ${colorClass}`}>
                  <div className="payment-label">{method}</div>
                  <div className="payment-value">₹{balance.toLocaleString('en-IN')}</div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="quick-track-header">
        <button 
          className={`type-btn ${activeType === 'income' ? 'active income' : ''}`}
          onClick={() => setActiveType('income')}
        >
          <span className="icon">↓</span>
          <span>Income</span>
        </button>
        <button 
          className={`type-btn ${activeType === 'expense' ? 'active expense' : ''}`}
          onClick={() => setActiveType('expense')}
        >
          <span className="icon">↑</span>
          <span>Expense</span>
        </button>
        <button 
          className={`type-btn ${activeType === 'transfer' ? 'active transfer' : ''}`}
          onClick={() => setActiveType('transfer')}
        >
          <span className="icon">⇄</span>
          <span>Transfer</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="quick-form">
        <div className="amount-input-wrapper">
          <span className="currency">₹</span>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="amount-input"
            autoFocus
          />
        </div>

        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={activeType === 'transfer' ? 'Transfer description (optional)' : "What's this for?"}
          className="description-input"
        />

        {activeType === 'expense' && (
          <select 
            value={envelope} 
            onChange={(e) => setEnvelope(e.target.value)}
            className="envelope-select"
          >
            <option value="">Select Envelope</option>
            {envelopes.map(env => (
              <option key={env} value={env}>{env}</option>
            ))}
          </select>
        )}

        {activeType === 'transfer' && (
          <>
            <select 
              value={transferFrom} 
              onChange={(e) => setTransferFrom(e.target.value)}
              className="payment-select transfer-from show"
            >
              <option value="">From Payment Method</option>
              {paymentMethods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
            <select 
              value={transferTo} 
              onChange={(e) => setTransferTo(e.target.value)}
              className="payment-select transfer-to show"
            >
              <option value="">To Payment Method</option>
              {paymentMethods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </>
        )}

        {(activeType === 'income' || activeType === 'expense') && (
          <select 
            value={paymentMethod} 
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="payment-select"
          >
            <option value="">Select Payment Method</option>
            {paymentMethods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        )}

        <button type="submit" className={`submit-btn ${activeType}`}>
          Add {activeType === 'income' ? 'Income' : activeType === 'expense' ? 'Expense' : 'Transfer'}
        </button>
      </form>

      <div className="envelope-budget">
        <h3>Envelope Budget vs Actual</h3>
        {envelopes.length === 0 ? (
          <div style={{padding: '16px', textAlign: 'center', color: '#6b7280'}}>No envelopes available.</div>
        ) : (
          getEnvelopeBudgetData().map(item => (
            <div key={item.name} className="envelope-item">
              <div className="envelope-header">
                <span className="envelope-name">{item.name}</span>
                <span className="envelope-amounts">₹{item.actualSpent.toLocaleString('en-IN')} / ₹{item.budgetAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="envelope-bar">
                <div className="envelope-progress" style={{width: `${item.percentage}%`, backgroundColor: item.color}}></div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="recent-transactions">
        <h3>Recent</h3>
        {transactions.length === 0 ? (
          <div style={{padding: '16px', textAlign: 'center', color: '#6b7280'}}>No transactions yet.</div>
        ) : (
          getRecentTransactions().map(t => {
            const icon = getTransactionIcon(t.type, t.description || '');
            const timeAgo = getTimeAgo(t.date);
            const sign = t.type === 'income' ? '+' : (t.type === 'transfer' ? '' : '-');
            const amount = t.type === 'transfer' 
              ? `${t.from} → ${t.to}` 
              : `${sign}₹${parseFloat(t.amount).toLocaleString('en-IN')}`;
            
            return (
              <div key={t.id} className={`transaction-item ${t.type}`}>
                <div className="transaction-icon">{icon}</div>
                <div className="transaction-details">
                  <div className="transaction-desc">{t.description || 'Transfer'}</div>
                  <div className="transaction-time">{timeAgo}</div>
                </div>
                <div className="transaction-amount">{amount}</div>
              </div>
            );
          })
        )}
      </div>

      {/* Settings Modal */}
      {showModal && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">Settings</div>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className="modal-tabs">
              <button 
                className={`tab-btn ${activeTab === 'payment' ? 'active' : ''}`}
                onClick={() => setActiveTab('payment')}
              >
                Payment Methods
              </button>
              <button 
                className={`tab-btn ${activeTab === 'envelope' ? 'active' : ''}`}
                onClick={() => setActiveTab('envelope')}
              >
                Envelopes
              </button>
              <button 
                className={`tab-btn ${activeTab === 'budget' ? 'active' : ''}`}
                onClick={() => setActiveTab('budget')}
              >
                Budget
              </button>
            </div>

            {activeTab === 'payment' && (
              <div className="tab-content active">
                <div className="modal-section">
                  <div className="section-title">Payment Methods</div>
                  <div className="payment-method-list">
                    {paymentMethods.length === 0 ? (
                      <div style={{padding: '16px', textAlign: 'center', color: '#6b7280'}}>No payment methods added yet.</div>
                    ) : (
                      paymentMethods.map(method => (
                        <div key={method} className="payment-method-item">
                          <div className="payment-method-name">{method}</div>
                          <button className="delete-btn" onClick={() => deletePaymentMethod(method)}>Delete</button>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="add-payment-form">
                    <input 
                      type="text" 
                      value={newPaymentMethod}
                      onChange={(e) => setNewPaymentMethod(e.target.value)}
                      className="add-payment-input" 
                      placeholder="Payment method name"
                    />
                    <div className="add-payment-row">
                      <input 
                        type="number" 
                        value={initialBalance}
                        onChange={(e) => setInitialBalance(e.target.value)}
                        className="add-payment-input" 
                        placeholder="Initial balance (optional)" 
                        inputMode="decimal"
                      />
                      <button className="add-btn" onClick={addPaymentMethod}>Add</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'envelope' && (
              <div className="tab-content active">
                <div className="modal-section">
                  <div className="section-title">Envelopes</div>
                  <div className="payment-method-list">
                    {envelopes.length === 0 ? (
                      <div style={{padding: '16px', textAlign: 'center', color: '#6b7280'}}>No envelopes added yet.</div>
                    ) : (
                      envelopes.map(env => (
                        <div key={env} className="payment-method-item">
                          <div className="payment-method-name">{env}</div>
                          <button className="delete-btn" onClick={() => deleteEnvelope(env)}>Delete</button>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="add-payment-form">
                    <input 
                      type="text" 
                      value={newEnvelope}
                      onChange={(e) => setNewEnvelope(e.target.value)}
                      className="add-payment-input" 
                      placeholder="Envelope name"
                    />
                    <div className="add-payment-row">
                      <input 
                        type="number" 
                        value={defaultBudget}
                        onChange={(e) => setDefaultBudget(e.target.value)}
                        className="add-payment-input" 
                        placeholder="Default budget (optional)" 
                        inputMode="decimal"
                      />
                      <button className="add-btn" onClick={addEnvelope}>Add</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'budget' && (
              <div className="tab-content active">
                <div className="modal-section">
                  <div className="section-title">Budget Allocation</div>
                  <div className="add-payment-form" style={{marginBottom: '16px'}}>
                    <select 
                      value={budgetMonth}
                      onChange={(e) => setBudgetMonth(e.target.value)}
                      className="add-payment-input"
                    >
                      <option value="">Select Month</option>
                      {generateMonthOptions().map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="payment-method-list">
                    {!budgetMonth ? (
                      <div></div>
                    ) : envelopes.length === 0 ? (
                      <div style={{padding: '16px', textAlign: 'center', color: '#6b7280'}}>No envelopes available. Add envelopes first.</div>
                    ) : (
                      envelopes.map(envelopeName => {
                        const existingBudget = budgets.find(b => b.envelope === envelopeName && b.month === budgetMonth);
                        const budgetValue = existingBudget ? existingBudget.amount : (defaultBudgets[envelopeName] || '');
                        return (
                          <div key={envelopeName} className="budget-envelope-item">
                            <div className="budget-envelope-name">{envelopeName}</div>
                            <input 
                              type="number" 
                              className="budget-input" 
                              placeholder="Budget amount" 
                              defaultValue={budgetValue}
                              data-envelope={envelopeName}
                              inputMode="decimal"
                            />
                            <button className="save-budget-btn" onClick={() => saveBudget(envelopeName)}>Save</button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div className={`toast show ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default QuickTrackUI;
