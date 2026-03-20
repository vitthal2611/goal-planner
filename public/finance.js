    // Firebase is already initialized in the head section

    let currentUser = null;
    let isAuthMode = true; // true = login, false = signup

    // Auth UI Elements
    const authOverlay = document.getElementById('authOverlay');
    const mainApp = document.getElementById('mainApp');
    const authForm = document.getElementById('authForm');
    const authEmail = document.getElementById('authEmail');
    const authPassword = document.getElementById('authPassword');
    const authError = document.getElementById('authError');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const authToggleBtn = document.getElementById('authToggleBtn');
    const authToggleText = document.getElementById('authToggleText');
    const logoutBtn = document.getElementById('logoutBtn');
    const userEmailDisplay = document.getElementById('userEmailModal');

    // Show/Hide Auth
    function showAuth() {
      authOverlay.classList.add('show');
      mainApp.style.display = 'none';
    }

    function hideAuth() {
      authOverlay.classList.remove('show');
      mainApp.style.display = 'block';
    }

    // Toggle between login and signup
    authToggleBtn.addEventListener('click', () => {
      isAuthMode = !isAuthMode;
      if (isAuthMode) {
        authSubmitBtn.textContent = 'Sign In';
        authToggleText.textContent = "Don't have an account?";
        authToggleBtn.textContent = 'Create Account';
      } else {
        authSubmitBtn.textContent = 'Create Account';
        authToggleText.textContent = 'Already have an account?';
        authToggleBtn.textContent = 'Sign In';
      }
      authError.classList.remove('show');
    });

    // Handle Auth Form Submit
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = authEmail.value.trim();
      const password = authPassword.value;

      authError.classList.remove('show');
      authSubmitBtn.disabled = true;
      authSubmitBtn.textContent = isAuthMode ? 'Signing in...' : 'Creating account...';

      try {
        if (isAuthMode) {
          await auth.signInWithEmailAndPassword(email, password);
        } else {
          await auth.createUserWithEmailAndPassword(email, password);
        }
      } catch (error) {
        const errorMessages = {
          'auth/email-already-in-use': 'Email already exists',
          'auth/weak-password': 'Password must be at least 6 characters',
          'auth/user-not-found': 'No account found with this email',
          'auth/wrong-password': 'Incorrect password',
          'auth/invalid-email': 'Invalid email address',
          'auth/invalid-credential': 'Invalid email or password'
        };
        authError.textContent = errorMessages[error.code] || error.message;
        authError.classList.add('show');
      } finally {
        authSubmitBtn.disabled = false;
        authSubmitBtn.textContent = isAuthMode ? 'Sign In' : 'Create Account';
      }
    });

    // Handle Logout
    logoutBtn.addEventListener('click', async () => {
      try {
        await auth.signOut();
        showToast('Logged out successfully', 'success');
      } catch (error) {
        showToast('Error logging out', 'error');
      }
    });

    // Auth State Observer
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        currentUser = user;
        userEmailDisplay.textContent = user.email;
        hideAuth();
        await loadUserData();
        showToast('Welcome back!', 'success');
      } else {
        currentUser = null;
        showAuth();
        // Clear local data
        paymentMethods = [];
        envelopes = [];
        defaultBudgets = {};
        budgets = [];
        transactions = [];
        habits = [];
        habitCheckins = [];
        milestones = [];
        progressions = [];
      }
    });

    // Load user data from Firestore
    async function loadUserData() {
      if (!currentUser) return;

      try {
        const docRef = db.collection('users').doc(currentUser.uid);
        const doc = await docRef.get();

        if (doc.exists) {
          const data = doc.data();
          paymentMethods = [...new Set(data.paymentMethods || [])];
          envelopes = [...new Set(data.envelopes || [])];
          defaultBudgets = data.defaultBudgets || {};
          budgets = data.budgets || [];
          transactions = data.transactions || [];
          habits = data.habits || [];
          habitCheckins = data.habitCheckins || [];
          milestones = data.milestones || [];
          progressions = data.progressions || [];

          // Update UI
          updatePaymentMethodsList();
          updatePaymentDropdowns();
          updateEnvelopesList();
          updateEnvelopeDropdowns();
          updateBalanceSummary();
          updateRecentTransactions();
          updatePaymentBalances();
          updateEnvelopeBudget();
          updateTimelineView();
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        showToast('Error loading data', 'error');
      }
    }

    // Save user data to Firestore
    async function saveUserData() {
      if (!currentUser) return;

      try {
        const docRef = db.collection('users').doc(currentUser.uid);
        await docRef.set({
          paymentMethods: [...new Set(paymentMethods)],
          envelopes: [...new Set(envelopes)],
          defaultBudgets,
          budgets,
          transactions,
          habits,
          habitCheckins,
          milestones,
          progressions,
          lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
        localStorage.setItem('lastSyncedAt', new Date().toISOString());
      } catch (error) {
        console.error('Error saving user data:', error);
        showToast('Error saving data', 'error');
      }
    }

    // Toast notification function
    function showToast(message, type = 'success') {
      const toast = document.getElementById('toast');
      if (!toast) return;
      toast.textContent = message;
      toast.className = `toast ${type}`;
      setTimeout(() => toast.classList.add('show'), 10);
      setTimeout(() => {
        toast.classList.remove('show');
      }, 3000);
    }

    // Payment methods array
    let paymentMethods = JSON.parse(localStorage.getItem('paymentMethods')) || [];

    // Selected envelope filter for recent transactions
    let selectedEnvelopeFilter = 'ALL';

    function updateEnvelopeFilterChips() {
      const container = document.getElementById('envelopeFilterChips');
      if (!container) return;
      
      if (envelopes.length === 0) {
        container.innerHTML = '';
        return;
      }
      
      const chips = ['ALL', ...envelopes].map(envelope => {
        const isActive = selectedEnvelopeFilter === envelope;
        const label = envelope === 'ALL' ? 'All' : envelope;
        return `
          <button 
            onclick="filterByEnvelope('${envelope}')" 
            style="
              padding: 6px 12px;
              border: 2px solid ${isActive ? '#3b82f6' : '#e5e7eb'};
              background: ${isActive ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'white'};
              color: ${isActive ? 'white' : '#6b7280'};
              border-radius: 20px;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
              white-space: nowrap;
            "
            onmouseover="if('${isActive}' === 'false') { this.style.borderColor='#3b82f6'; this.style.color='#3b82f6'; }"
            onmouseout="if('${isActive}' === 'false') { this.style.borderColor='#e5e7eb'; this.style.color='#6b7280'; }"
          >
            ${label}
          </button>
        `;
      }).join('');
      
      container.innerHTML = chips;
    }

    function filterByEnvelope(envelope) {
      selectedEnvelopeFilter = envelope;
      updateEnvelopeFilterChips();
      updateRecentTransactions();
    }

    function downloadReport() {
      const selectedMonth = monthSelect.value;
      const selectedYear = yearSelect.value;
      
      // Filter transactions by selected month/year
      let filteredTransactions = transactions;
      
      if (selectedMonth === 'ALL') {
        filteredTransactions = transactions.filter(t => {
          if (!t.date) return false;
          try {
            const transactionYear = new Date(t.date).getFullYear().toString();
            return transactionYear === selectedYear;
          } catch (e) {
            return false;
          }
        });
      } else {
        filteredTransactions = transactions.filter(t => {
          if (!t.date) return false;
          try {
            const date = new Date(t.date);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const transactionMonth = `${year}-${month}`;
            return transactionMonth === selectedMonth;
          } catch (e) {
            return false;
          }
        });
      }
      
      // Filter by envelope if selected
      if (selectedEnvelopeFilter !== 'ALL') {
        filteredTransactions = filteredTransactions.filter(t => {
          if (t.type === 'expense') {
            return t.envelope === selectedEnvelopeFilter;
          }
          return false;
        });
      }
      
      if (filteredTransactions.length === 0) {
        showToast('No transactions to export', 'error');
        return;
      }
      
      // Calculate summary
      const income = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const net = income - expense;
      
      // Sort by date
      const sortedTransactions = [...filteredTransactions].sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Create CSV content
      let csvContent = '';
      
      // Add header with period info
      const periodLabel = selectedMonth === 'ALL' ? `Year ${selectedYear}` : monthSelect.options[monthSelect.selectedIndex].text;
      const envelopeLabel = selectedEnvelopeFilter === 'ALL' ? 'All Categories' : selectedEnvelopeFilter;
      csvContent += `Financial Report\n`;
      csvContent += `Period,${periodLabel}\n`;
      csvContent += `Category,${envelopeLabel}\n`;
      csvContent += `Generated,${new Date().toLocaleString('en-IN')}\n\n`;
      
      // Add summary
      csvContent += `SUMMARY\n`;
      csvContent += `Total Income,${income}\n`;
      csvContent += `Total Expense,${expense}\n`;
      csvContent += `Net Balance,${net}\n\n`;
      
      // Add envelope breakdown if showing all
      if (selectedEnvelopeFilter === 'ALL') {
        csvContent += `EXPENSE BY CATEGORY\n`;
        const envelopeBreakdown = {};
        filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
          const env = t.envelope || 'Uncategorized';
          envelopeBreakdown[env] = (envelopeBreakdown[env] || 0) + parseFloat(t.amount);
        });
        Object.entries(envelopeBreakdown).sort((a, b) => b[1] - a[1]).forEach(([env, amount]) => {
          csvContent += `${env},${amount}\n`;
        });
        csvContent += `\n`;
      }
      
      // Add payment method breakdown
      csvContent += `BALANCE BY PAYMENT METHOD\n`;
      paymentMethods.forEach(method => {
        let balance = 0;
        filteredTransactions.forEach(t => {
          if (t.type === 'income' && t.payment === method) {
            balance += parseFloat(t.amount);
          } else if (t.type === 'expense' && t.payment === method) {
            balance -= parseFloat(t.amount);
          } else if (t.type === 'transfer') {
            if (t.from === method) balance -= parseFloat(t.amount);
            if (t.to === method) balance += parseFloat(t.amount);
          }
        });
        csvContent += `${method},${balance}\n`;
      });
      csvContent += `\n`;
      
      // Add transaction details header
      csvContent += `TRANSACTION DETAILS\n`;
      csvContent += `Date,Type,Description,Category,Payment Method,Expense Type,Amount\n`;
      
      // Add transactions
      sortedTransactions.forEach(t => {
        const date = new Date(t.date).toLocaleString('en-IN', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        const type = t.type.charAt(0).toUpperCase() + t.type.slice(1);
        const description = (t.description || 'Transfer').replace(/,/g, ';');
        const category = t.envelope || (t.type === 'transfer' ? `${t.from} â†’ ${t.to}` : '-');
        const payment = t.payment || (t.type === 'transfer' ? 'Transfer' : '-');
        const expenseType = t.expenseType ? (t.expenseType.charAt(0).toUpperCase() + t.expenseType.slice(1)) : '-';
        const amount = parseFloat(t.amount);
        
        csvContent += `${date},${type},${description},${category},${payment},${expenseType},${amount}\n`;
      });
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const filename = `financial-report-${periodLabel.replace(/\s+/g, '-')}-${envelopeLabel.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showToast(`Report downloaded: ${sortedTransactions.length} transactions ðŸ“Š`, 'success');
    }

    // Envelopes array
    let envelopes = JSON.parse(localStorage.getItem('envelopes')) || [];

    // Default budgets for envelopes - stores {envelope, defaultBudget}
    let defaultBudgets = JSON.parse(localStorage.getItem('defaultBudgets')) || {};

    // Budgets array - stores {envelope, month, amount}
    let budgets = JSON.parse(localStorage.getItem('budgets')) || [];

    // Transactions array - stores all transactions
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    // Save to localStorage and Firebase
    function saveToLocalStorage() {
      localStorage.setItem('paymentMethods', JSON.stringify(paymentMethods));
      localStorage.setItem('envelopes', JSON.stringify(envelopes));
      localStorage.setItem('defaultBudgets', JSON.stringify(defaultBudgets));
      localStorage.setItem('budgets', JSON.stringify(budgets));
      localStorage.setItem('transactions', JSON.stringify(transactions));
      saveUserData(); // Save to Firebase
    }

    // Alias for cloud sync
    function syncToCloud() {
      saveToLocalStorage();
    }

    function deletePaymentMethod(name) {
      const relatedTransactions = transactions.filter(t => 
        t.payment === name || t.from === name || t.to === name
      );
      
      const confirmMsg = relatedTransactions.length > 0
        ? `Delete ${name}? This will also delete ${relatedTransactions.length} associated transaction(s).`
        : `Delete ${name}?`;
      
      if (confirm(confirmMsg)) {
        transactions = transactions.filter(t => 
          t.payment !== name && t.from !== name && t.to !== name
        );
        paymentMethods = paymentMethods.filter(method => method !== name);
        updatePaymentMethodsList();
        updatePaymentDropdowns();
        updateBalanceSummary();
        updateRecentTransactions();
        updatePaymentBalances();
        updateEnvelopeBudget();
        syncToCloud();
        const msg = relatedTransactions.length > 0
          ? `${name} and ${relatedTransactions.length} transaction(s) deleted`
          : `${name} deleted`;
        showToast(msg, 'error');
      }
    }

    function deleteEnvelope(name) {
      const relatedTransactions = transactions.filter(t => t.envelope === name);
      
      const confirmMsg = relatedTransactions.length > 0
        ? `Delete ${name}? This will also delete ${relatedTransactions.length} associated transaction(s).`
        : `Delete ${name}?`;
      
      if (confirm(confirmMsg)) {
        transactions = transactions.filter(t => t.envelope !== name);
        envelopes = envelopes.filter(env => env !== name);
        delete defaultBudgets[name];
        budgets = budgets.filter(b => b.envelope !== name);
        updateEnvelopesList();
        updateEnvelopeDropdowns();
        updateBalanceSummary();
        updateRecentTransactions();
        updatePaymentBalances();
        updateEnvelopeBudget();
        syncToCloud();
        const msg = relatedTransactions.length > 0
          ? `${name} and ${relatedTransactions.length} transaction(s) deleted`
          : `${name} deleted`;
        showToast(msg, 'error');
      }
    }

    function deleteBudget(envelope, month) {
      if (confirm(`Delete budget for ${envelope} in ${month}?`)) {
        budgets = budgets.filter(b => !(b.envelope === envelope && b.month === month));
        updateBudgetList();
        syncToCloud();
        showToast(`Budget deleted`, 'error');
      }
    }

    function saveBudget(envelope) {
      const selectedMonth = budgetMonth.value;
      const input = document.querySelector(`input[data-envelope="${envelope}"]`);
      const amount = input.value.trim();
      
      if (!amount) {
        showToast('Please enter a budget amount', 'error');
        return;
      }
      
      const existingBudget = budgets.find(b => b.envelope === envelope && b.month === selectedMonth);
      if (existingBudget) {
        existingBudget.amount = amount;
        showToast(`Budget updated: ${envelope}`, 'success');
      } else {
        budgets.push({ envelope, month: selectedMonth, amount });
        showToast(`Budget saved: ${envelope}`, 'success');
      }
      updateEnvelopeBudget();
      syncToCloud();
    }

    function getPaymentMethodIcon(name) {
      const lowerName = name.toLowerCase();
      
      // Cash
      if (lowerName.includes('cash')) return 'ðŸ’µ';
      
      // Banks
      if (lowerName.includes('hdfc')) return 'ðŸ¦';
      if (lowerName.includes('sbi') || lowerName.includes('state bank')) return 'ðŸ¦';
      if (lowerName.includes('icici')) return 'ðŸ¦';
      if (lowerName.includes('axis')) return 'ðŸ¦';
      if (lowerName.includes('kotak')) return 'ðŸ¦';
      if (lowerName.includes('pnb') || lowerName.includes('punjab')) return 'ðŸ¦';
      if (lowerName.includes('bob') || lowerName.includes('baroda')) return 'ðŸ¦';
      if (lowerName.includes('canara')) return 'ðŸ¦';
      if (lowerName.includes('bank')) return 'ðŸ¦';
      
      // Cards
      if (lowerName.includes('credit')) return 'ðŸ’³';
      if (lowerName.includes('debit')) return 'ðŸ’³';
      if (lowerName.includes('card')) return 'ðŸ’³';
      if (lowerName.includes('visa')) return 'ðŸ’³';
      if (lowerName.includes('mastercard')) return 'ðŸ’³';
      if (lowerName.includes('rupay')) return 'ðŸ’³';
      
      // UPI & Digital Payments
      if (lowerName.includes('upi')) return 'ðŸ“±';
      if (lowerName.includes('phonepe') || lowerName.includes('phone pe')) return 'ðŸ’œ';
      if (lowerName.includes('gpay') || lowerName.includes('google pay')) return 'ðŸ”µ';
      if (lowerName.includes('paytm')) return 'ðŸ’™';
      if (lowerName.includes('amazon pay')) return 'ðŸŸ ';
      
      // Wallets
      if (lowerName.includes('wallet')) return 'ðŸ‘›';
      
      // Transfers
      if (lowerName.includes('transfer')) return 'ðŸ”„';
      
      // Default
      return 'ðŸ’°';
    }

    function updatePaymentMethodsList() {
      const listContainer = document.getElementById('paymentMethodList');
      if (!listContainer) return;
      if (paymentMethods.length === 0) {
        listContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #9ca3af; background: linear-gradient(135deg, #f9fafb, #ffffff); border-radius: 12px; border: 2px dashed #e5e7eb;">ðŸ’³ No payment methods yet. Add one to get started!</div>';
        return;
      }
      listContainer.innerHTML = paymentMethods.map(method => {
        const icon = getPaymentMethodIcon(method);
        return `
          <div class="payment-method-item">
            <div class="payment-method-name"><span style="font-size: 18px;">${icon}</span> ${method}</div>
            <button class="delete-btn" onclick="deletePaymentMethod('${method}')">Delete</button>
          </div>
        `;
      }).join('');
    }

    function updateEnvelopesList() {
      const listContainer = document.getElementById('envelopeList');
      if (!listContainer) return;
      if (envelopes.length === 0) {
        listContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #9ca3af; background: linear-gradient(135deg, #f9fafb, #ffffff); border-radius: 12px; border: 2px dashed #e5e7eb;">ðŸ“ No envelopes yet. Create categories for your expenses!</div>';
        return;
      }
      listContainer.innerHTML = envelopes.map(env => `
        <div class="payment-method-item">
          <div class="payment-method-name" style="&::before { content: 'ðŸ“'; }">${env}</div>
          <button class="delete-btn" onclick="deleteEnvelope('${env}')">Delete</button>
        </div>
      `).join('');
      updateEnvelopeFilterChips();
    }

    function updatePaymentDropdowns() {
      // This function is no longer needed as dropdowns are populated dynamically
      // when creating expense entries. Keeping empty function for compatibility.
    }

    function updateEnvelopeDropdowns() {
      // This function is no longer needed as dropdowns are populated dynamically
      // when creating expense entries. Keeping empty function for compatibility.
    }

    function updateBalanceSummary() {
      const totalIncomeEl = document.getElementById('totalIncome');
      const totalExpenseEl = document.getElementById('totalExpense');
      if (!totalIncomeEl || !totalExpenseEl) return;
      const selectedMonth = monthSelect.value;
      const selectedYear = yearSelect.value;
      
      let filteredTransactions = transactions;
      
      // Filter by selected month/year
      if (selectedMonth === 'ALL') {
        // Filter by year only
        filteredTransactions = transactions.filter(t => {
          if (!t.date) return false;
          try {
            const transactionYear = new Date(t.date).getFullYear().toString();
            return transactionYear === selectedYear;
          } catch (e) {
            return false;
          }
        });
      } else {
        // Filter by specific month
        filteredTransactions = transactions.filter(t => {
          if (!t.date) return false;
          try {
            const date = new Date(t.date);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const transactionMonth = `${year}-${month}`;
            return transactionMonth === selectedMonth;
          } catch (e) {
            return false;
          }
        });
      }
      
      const income = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const expense = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      totalIncomeEl.textContent = `Rs ${income.toLocaleString('en-IN')}`;
      totalExpenseEl.textContent = `Rs ${expense.toLocaleString('en-IN')}`;
    }

    function updatePaymentBalances() {
      const container = document.getElementById('paymentBalances');
      if (!container) return;
      const selectedMonth = monthSelect.value;
      const selectedYear = yearSelect.value;
      
      if (paymentMethods.length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; padding: 16px; text-align: center; color: #6b7280;">No payment methods added yet.</div>';
        return;
      }
      
      // Filter transactions by selected month/year
      let filteredTransactions = transactions;
      
      if (selectedMonth === 'ALL') {
        // Filter by year only
        filteredTransactions = transactions.filter(t => {
          if (!t.date) return false;
          try {
            const transactionYear = new Date(t.date).getFullYear().toString();
            return transactionYear === selectedYear;
          } catch (e) {
            return false;
          }
        });
      } else {
        // Filter by specific month
        filteredTransactions = transactions.filter(t => {
          if (!t.date) return false;
          try {
            const date = new Date(t.date);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const transactionMonth = `${year}-${month}`;
            return transactionMonth === selectedMonth;
          } catch (e) {
            return false;
          }
        });
      }
      
      container.innerHTML = paymentMethods.map((method, index) => {
        // Calculate balance for this payment method
        let balance = 0;
        
        filteredTransactions.forEach(t => {
          if (t.type === 'income' && t.payment === method) {
            balance += parseFloat(t.amount);
          } else if (t.type === 'expense' && t.payment === method) {
            balance -= parseFloat(t.amount);
          } else if (t.type === 'transfer') {
            if (t.from === method) balance -= parseFloat(t.amount);
            if (t.to === method) balance += parseFloat(t.amount);
          }
        });
        
        const colors = ['hdfc', 'sbi', 'cash', 'transfer'];
        const colorClass = colors[index % colors.length];
        
        return `
          <div class="payment-item ${colorClass}">
            <div class="payment-label">${method}</div>
            <div class="payment-value">Rs ${balance.toLocaleString('en-IN')}</div>
          </div>
        `;
      }).join('');
    }

    function getTimeAgo(dateString) {
      const now = new Date();
      const date = new Date(dateString);
      const seconds = Math.floor((now - date) / 1000);
      
      if (seconds < 60) return 'Just now';
      if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
      if (seconds < 172800) return 'Yesterday';
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    }

    function getTransactionIcon(type, description, expenseType) {
      if (type === 'income') return 'ðŸ’°';
      if (type === 'transfer') return 'ðŸ”„';
      
      // Expense type icons
      if (expenseType === 'need') return 'ðŸŽ¯';
      if (expenseType === 'want') return 'ðŸŽ‰';
      if (expenseType === 'save') return 'ðŸ’°';
      
      // Fallback to description-based icons
      const desc = description.toLowerCase();
      if (desc.includes('food') || desc.includes('lunch') || desc.includes('dinner') || desc.includes('breakfast')) return 'ðŸ”';
      if (desc.includes('transport') || desc.includes('uber') || desc.includes('taxi') || desc.includes('bus')) return 'ðŸš•';
      if (desc.includes('shopping') || desc.includes('clothes')) return 'ðŸ›ï¸';
      if (desc.includes('entertainment') || desc.includes('movie')) return 'ðŸŽ¬';
      if (desc.includes('grocery') || desc.includes('groceries')) return 'ðŸ›’';
      return 'ðŸ’¸';
    }

    function deleteTransaction(transactionId) {
      const transaction = transactions.find(t => t.id === transactionId);
      if (!transaction) return;
      
      showDeleteConfirmation(
        'Delete Transaction?',
        `Are you sure you want to delete "${transaction.description || 'this transaction'}"?`,
        () => {
          transactions = transactions.filter(t => t.id !== transactionId);
          saveToLocalStorage();
          updateBalanceSummary();
          updateRecentTransactions();
          updatePaymentBalances();
          updateEnvelopeBudget();
          showToast('Transaction deleted', 'error');
        }
      );
    }

    function showDeleteConfirmation(title, message, onConfirm) {
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease;
      `;
      
      modal.innerHTML = `
        <div style="
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 24px;
          padding: 32px;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        ">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 48px; margin-bottom: 16px;">âš ï¸</div>
            <h3 style="font-size: 24px; font-weight: 800; color: #1f2937; margin: 0 0 12px 0;">${title}</h3>
            <p style="font-size: 15px; color: #6b7280; margin: 0;">${message}</p>
          </div>
          <div style="display: flex; gap: 12px;">
            <button id="cancelBtn" style="
              flex: 1;
              padding: 14px 24px;
              border: 2px solid #e5e7eb;
              background: white;
              color: #6b7280;
              border-radius: 12px;
              font-size: 16px;
              font-weight: 700;
              cursor: pointer;
              transition: all 0.2s;
            ">Cancel</button>
            <button id="confirmBtn" style="
              flex: 1;
              padding: 14px 24px;
              border: none;
              background: linear-gradient(135deg, #ef4444, #dc2626);
              color: white;
              border-radius: 12px;
              font-size: 16px;
              font-weight: 700;
              cursor: pointer;
              transition: all 0.2s;
              box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
            ">Delete</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      const cancelBtn = modal.querySelector('#cancelBtn');
      const confirmBtn = modal.querySelector('#confirmBtn');
      
      cancelBtn.addEventListener('mouseover', () => {
        cancelBtn.style.borderColor = '#3b82f6';
        cancelBtn.style.color = '#3b82f6';
      });
      
      cancelBtn.addEventListener('mouseout', () => {
        cancelBtn.style.borderColor = '#e5e7eb';
        cancelBtn.style.color = '#6b7280';
      });
      
      confirmBtn.addEventListener('mouseover', () => {
        confirmBtn.style.transform = 'translateY(-2px)';
        confirmBtn.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)';
      });
      
      confirmBtn.addEventListener('mouseout', () => {
        confirmBtn.style.transform = 'translateY(0)';
        confirmBtn.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
      });
      
      cancelBtn.addEventListener('click', () => {
        modal.remove();
      });
      
      confirmBtn.addEventListener('click', () => {
        modal.remove();
        onConfirm();
      });
      
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.remove();
        }
      });
    }

    function updateRecentTransactions() {
      const listContainer = document.getElementById('recentTransactionsList');
      if (!listContainer) return;
      const selectedMonth = monthSelect.value;
      const selectedYear = yearSelect.value;
      
      if (transactions.length === 0) {
        listContainer.innerHTML = '<div style="padding: 16px; text-align: center; color: #6b7280;">No transactions yet.</div>';
        return;
      }
      
      // Filter transactions by selected month/year
      let filteredTransactions = transactions;
      
      if (selectedMonth === 'ALL') {
        // Filter by year only
        filteredTransactions = transactions.filter(t => {
          if (!t.date) return false;
          try {
            const transactionYear = new Date(t.date).getFullYear().toString();
            return transactionYear === selectedYear;
          } catch (e) {
            return false;
          }
        });
      } else {
        // Filter by specific month
        filteredTransactions = transactions.filter(t => {
          if (!t.date) return false;
          try {
            const date = new Date(t.date);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const transactionMonth = `${year}-${month}`;
            return transactionMonth === selectedMonth;
          } catch (e) {
            return false;
          }
        });
      }
      
      // Filter by envelope if selected
      if (selectedEnvelopeFilter !== 'ALL') {
        filteredTransactions = filteredTransactions.filter(t => {
          if (t.type === 'expense') {
            return t.envelope === selectedEnvelopeFilter;
          }
          return false; // Only show expenses when envelope filter is active
        });
      }
      
      if (filteredTransactions.length === 0) {
        listContainer.innerHTML = '<div style="padding: 16px; text-align: center; color: #6b7280;">No transactions for this period.</div>';
        return;
      }
      
      // Sort all filtered transactions newest first
      const sorted = [...filteredTransactions].sort((a, b) => new Date(b.date) - new Date(a.date));
      const total = sorted.length;
      const visible = sorted.slice(0, recentTxVisibleCount);

      function renderTxItem(t) {
        const icon = getTransactionIcon(t.type, t.description || '', t.expenseType);
        const timeAgo = getTimeAgo(t.date);
        const sign = t.type === 'income' ? '+' : (t.type === 'transfer' ? '' : '-');
        const amount = t.type === 'transfer'
          ? `${t.from}â†’${t.to} Rs ${parseFloat(t.amount).toLocaleString('en-IN')}`
          : `${sign}Rs ${parseFloat(t.amount).toLocaleString('en-IN')}`;
        const typeTag = t.expenseType
          ? `<span class="tx-tag ${t.expenseType}">${t.expenseType.charAt(0).toUpperCase() + t.expenseType.slice(1)}</span>`
          : '';
        const envelopeTag = t.envelope ? `<span class="tx-tag">${t.envelope}</span>` : '';
        const paymentTag = t.paymentMethod ? `<span class="tx-tag">${t.paymentMethod}</span>` : '';
        return `
          <div class="transaction-item ${t.type}">
            <div class="transaction-icon">${icon}</div>
            <div class="transaction-details">
              <div class="transaction-desc">${t.description || 'Transfer'}</div>
              <div class="transaction-meta">${timeAgo}${envelopeTag}${typeTag}${paymentTag}</div>
            </div>
            <div class="transaction-amount">${amount}</div>
            <button class="tx-delete" onclick="deleteTransaction(${t.id})" title="Delete">ðŸ—‘</button>
          </div>`;
      }

      const remaining = total - visible.length;
      const footer = remaining > 0 ? `
        <div class="tx-load-more">
          <button class="tx-load-btn" onclick="loadMoreTransactions()">Load ${Math.min(remaining, 10)} more</button>
          <button class="tx-load-btn secondary" onclick="loadAllTransactions()">Show all ${total}</button>
        </div>` : (total > 10 ? `<div class="tx-load-more"><button class="tx-load-btn secondary" onclick="loadFewerTransactions()">Show less</button></div>` : '');

      listContainer.innerHTML = visible.map(renderTxItem).join('') + footer;
    }

    let recentTxVisibleCount = 10;

    function loadMoreTransactions() {
      recentTxVisibleCount += 10;
      updateRecentTransactions();
    }

    function loadAllTransactions() {
      recentTxVisibleCount = Infinity;
      updateRecentTransactions();
    }

    function loadFewerTransactions() {
      recentTxVisibleCount = 10;
      updateRecentTransactions();
    }

    function updateEnvelopeBudget() {
      const container = document.getElementById('envelopeBudgetList');
      if (!container) return;
      const selectedMonth = monthSelect.value;
      const selectedYear = yearSelect.value;
      
      // Calculate Need, Want, Save totals
      let needTotal = 0;
      let wantTotal = 0;
      let saveTotal = 0;
      
      // Filter transactions by selected month/year
      let filteredTransactions = transactions;
      
      if (selectedMonth === 'ALL') {
        filteredTransactions = transactions.filter(t => {
          if (!t.date) return false;
          try {
            const transactionYear = new Date(t.date).getFullYear().toString();
            return transactionYear === selectedYear;
          } catch (e) {
            return false;
          }
        });
      } else {
        filteredTransactions = transactions.filter(t => {
          if (!t.date) return false;
          try {
            const date = new Date(t.date);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const transactionMonth = `${year}-${month}`;
            return transactionMonth === selectedMonth;
          } catch (e) {
            return false;
          }
        });
      }
      
      // Calculate totals by expense type
      filteredTransactions.forEach(t => {
        if (t.type === 'expense' && t.expenseType) {
          const amount = parseFloat(t.amount || 0);
          if (t.expenseType === 'need') needTotal += amount;
          else if (t.expenseType === 'want') wantTotal += amount;
          else if (t.expenseType === 'save') saveTotal += amount;
        }
      });
      
      // Update Need, Want, Save display
      const needTotalTopEl = document.getElementById('needTotalTop');
      const wantTotalTopEl = document.getElementById('wantTotalTop');
      const saveTotalTopEl = document.getElementById('saveTotalTop');
      
      if (needTotalTopEl) needTotalTopEl.textContent = `Rs ${needTotal.toLocaleString('en-IN')}`;
      if (wantTotalTopEl) wantTotalTopEl.textContent = `Rs ${wantTotal.toLocaleString('en-IN')}`;
      if (saveTotalTopEl) saveTotalTopEl.textContent = `Rs ${saveTotal.toLocaleString('en-IN')}`;
      
      if (envelopes.length === 0) {
        container.innerHTML = '<div style="padding: 16px; text-align: center; color: #6b7280;">No envelopes available.</div>';
        return;
      }
      
      container.innerHTML = envelopes.map(envelope => {
        let budgetAmount = 0;
        let actualSpent = 0;
        let needSpent = 0;
        let wantSpent = 0;
        let saveSpent = 0;
        
        if (selectedMonth === 'ALL') {
          // Calculate for all months in selected year
          budgetAmount = budgets
            .filter(b => b.envelope === envelope && b.month.startsWith(selectedYear))
            .reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);
          
          // Sum up all expenses for this envelope in the selected year
          const envelopeTransactions = transactions.filter(t => {
            if (t.type !== 'expense' || t.envelope !== envelope) return false;
            if (!t.date) return false;
            
            try {
              const transactionYear = new Date(t.date).getFullYear().toString();
              return transactionYear === selectedYear;
            } catch (e) {
              return false;
            }
          });
          
          envelopeTransactions.forEach(t => {
            const amount = parseFloat(t.amount || 0);
            actualSpent += amount;
            if (t.expenseType === 'need') needSpent += amount;
            else if (t.expenseType === 'want') wantSpent += amount;
            else if (t.expenseType === 'save') saveSpent += amount;
          });
        } else {
          // Calculate for specific month only
          const budget = budgets.find(b => b.envelope === envelope && b.month === selectedMonth);
          budgetAmount = budget ? parseFloat(budget.amount) : 0;
          
          const envelopeTransactions = transactions.filter(t => {
            if (t.type !== 'expense' || t.envelope !== envelope) return false;
            if (!t.date) return false;
            
            try {
              const date = new Date(t.date);
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const transactionMonth = `${year}-${month}`;
              return transactionMonth === selectedMonth;
            } catch (e) {
              console.error('Error parsing date:', t.date, e);
              return false;
            }
          });
          
          envelopeTransactions.forEach(t => {
            const amount = parseFloat(t.amount || 0);
            actualSpent += amount;
            if (t.expenseType === 'need') needSpent += amount;
            else if (t.expenseType === 'want') wantSpent += amount;
            else if (t.expenseType === 'save') saveSpent += amount;
          });
        }
        
        // Calculate percentage and color
        const percentage = budgetAmount > 0 ? (actualSpent / budgetAmount) * 100 : 0;
        let color = '#22c55e'; // Green
        if (percentage >= 100) color = '#ef4444'; // Red
        else if (percentage >= 90) color = '#f59e0b'; // Orange
        
        // Build breakdown text
        let breakdownParts = [];
        if (needSpent > 0) breakdownParts.push(`ðŸŽ¯ Rs ${needSpent.toLocaleString('en-IN')}`);
        if (wantSpent > 0) breakdownParts.push(`ðŸŽ‰ Rs ${wantSpent.toLocaleString('en-IN')}`);
        if (saveSpent > 0) breakdownParts.push(`ðŸ’° Rs ${saveSpent.toLocaleString('en-IN')}`);
        const breakdown = breakdownParts.length > 0 ? breakdownParts.join(' â€¢ ') : '';
        
        const remaining = budgetAmount - actualSpent;
        const remainingText = remaining >= 0
          ? `Rs ${remaining.toLocaleString('en-IN')} left`
          : `Rs ${Math.abs(remaining).toLocaleString('en-IN')} over`;

        const chips = [
          needSpent  > 0 ? `<span class="nws-chip need">ðŸŽ¯ Rs ${needSpent.toLocaleString('en-IN')}</span>`  : '',
          wantSpent  > 0 ? `<span class="nws-chip want">ðŸŽ‰ Rs ${wantSpent.toLocaleString('en-IN')}</span>`  : '',
          saveSpent  > 0 ? `<span class="nws-chip save">ðŸ’° Rs ${saveSpent.toLocaleString('en-IN')}</span>`  : '',
        ].filter(Boolean).join('');

        return `
          <div class="envelope-item">
            <div class="envelope-header">
              <span class="envelope-name" title="${envelope}">${envelope}</span>
              <span class="envelope-pct-badge" style="background:${color}">${Math.round(percentage)}%</span>
            </div>
            <div class="envelope-amounts">Rs ${actualSpent.toLocaleString('en-IN')} / Rs ${budgetAmount.toLocaleString('en-IN')} &nbsp;Â·&nbsp; ${remainingText}</div>
            <div class="envelope-bar">
              <div class="envelope-progress" style="width:${Math.min(percentage,100)}%;background:${color}"></div>
            </div>
            ${chips ? `<div class="nws-chips">${chips}</div>` : ''}
          </div>
        `;
      }).join('');
    }

    function generateMonthOptions() {
      const budgetMonth = document.getElementById('budgetMonth');
      const months = [];
      const currentYear = 2026;
      
      for (let year = currentYear; year <= currentYear + 4; year++) {
        for (let month = 1; month <= 12; month++) {
          const monthStr = `${year}-${String(month).padStart(2, '0')}`;
          const date = new Date(year, month - 1);
          const monthName = date.toLocaleString('default', { month: 'short' });
          months.push(`<option value="${monthStr}">${monthName} ${year}</option>`);
        }
      }

      budgetMonth.innerHTML = '<option value="">Select Month</option>' + months.join('');
    }

    function updateBudgetList() {
      const selectedMonth = budgetMonth.value;
      const listContainer = document.getElementById('budgetList');
      
      if (!selectedMonth) {
        listContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #9ca3af; background: linear-gradient(135deg, #f0f9ff, #ffffff); border-radius: 12px; border: 2px dashed #bfdbfe;">ðŸ“… Select a month to set budgets</div>';
        return;
      }
      
      if (envelopes.length === 0) {
        listContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #9ca3af; background: linear-gradient(135deg, #fef3c7, #ffffff); border-radius: 12px; border: 2px dashed #fbbf24;">âš ï¸ No envelopes available. Add envelopes first.</div>';
        return;
      }
      
      listContainer.innerHTML = envelopes.map(envelope => {
        const existingBudget = budgets.find(b => b.envelope === envelope && b.month === selectedMonth);
        const budgetValue = existingBudget ? existingBudget.amount : (defaultBudgets[envelope] || '');
        return `
          <div class="budget-envelope-item">
            <div class="budget-envelope-name">${envelope}</div>
            <input 
              type="number" 
              class="budget-input" 
              placeholder="Enter amount" 
              value="${budgetValue}"
              data-envelope="${envelope}"
              inputmode="decimal"
            />
            <button class="save-budget-btn" onclick="saveBudget('${envelope}')">Save</button>
          </div>
        `;
      }).join('');
    }
    const incomeBtn = document.getElementById('incomeBtn');
    const expenseBtn = document.getElementById('expenseBtn');
    const transferBtn = document.getElementById('transferBtn');
    const submitBtn = document.getElementById('submitBtn');
    const quickForm = document.getElementById('quickForm');
    const monthSelect = document.getElementById('monthSelect');
    const prevMonth = document.getElementById('prevMonth');
    const nextMonth = document.getElementById('nextMonth');
    const yearSelect = document.getElementById('yearSelect');
    const prevYear = document.getElementById('prevYear');
    const nextYear = document.getElementById('nextYear');
    const paymentHeader = document.getElementById('paymentHeader');
    const paymentBalances = document.getElementById('paymentBalances');
    const toggleIcon = document.getElementById('toggleIcon');
    const balanceHeader = document.getElementById('balanceHeader');
    const balanceSummary = document.getElementById('balanceSummary');
    const balanceToggleIcon = document.getElementById('balanceToggleIcon');
    const profileBtn = document.getElementById('profileBtn');
    const profileModal = document.getElementById('profileModal');
    const closeModal = document.getElementById('closeModal');
    const addPaymentBtn = document.getElementById('addPaymentBtn');
    const newPaymentMethod = document.getElementById('newPaymentMethod');
    const initialBalance = document.getElementById('initialBalance');
    const paymentMethodList = document.getElementById('paymentMethodList');
    const addEnvelopeBtn = document.getElementById('addEnvelopeBtn');
    const newEnvelope = document.getElementById('newEnvelope');
    const defaultBudget = document.getElementById('defaultBudget');
    const envelopeList = document.getElementById('envelopeList');
    const budgetMonth = document.getElementById('budgetMonth');
    const budgetList = document.getElementById('budgetList');
    const financeSetupTab = document.getElementById('financeSetupTab');
    const dataTab = document.getElementById('dataTab');
    const accountTab = document.getElementById('accountTab');
    const financeSetupContent = document.getElementById('financeSetupContent');
    const dataContent = document.getElementById('dataContent');
    const accountContent = document.getElementById('accountContent');

    let activeType = 'expense';

    // Profile button
    profileBtn.addEventListener('click', () => {
      profileModal.classList.add('show');
      populateAccountTab();
    });

    // Tab switching
    financeSetupTab.addEventListener('click', () => {
      financeSetupTab.classList.add('active');
      dataTab.classList.remove('active');
      accountTab.classList.remove('active');
      financeSetupContent.classList.add('active');
      dataContent.classList.remove('active');
      accountContent.classList.remove('active');
    });

    dataTab.addEventListener('click', () => {
      dataTab.classList.add('active');
      financeSetupTab.classList.remove('active');
      accountTab.classList.remove('active');
      dataContent.classList.add('active');
      financeSetupContent.classList.remove('active');
      accountContent.classList.remove('active');
    });

    accountTab.addEventListener('click', () => {
      accountTab.classList.add('active');
      financeSetupTab.classList.remove('active');
      dataTab.classList.remove('active');
      accountContent.classList.add('active');
      financeSetupContent.classList.remove('active');
      dataContent.classList.remove('active');
      populateAccountTab();
    });

    function populateAccountTab() {
      // Email + UID
      if (currentUser) {
        const emailEl = document.getElementById('userEmailModal');
        const uidEl = document.getElementById('accountUserId');
        if (emailEl) emailEl.textContent = currentUser.email || 'â€”';
        if (uidEl) uidEl.textContent = currentUser.uid || 'â€”';
      }

      // Data counts
      const txEl = document.getElementById('accountTxCount');
      const habitEl = document.getElementById('accountHabitCount');
      const pmEl = document.getElementById('accountPaymentCount');
      const envEl = document.getElementById('accountEnvelopeCount');
      if (txEl) txEl.textContent = (typeof transactions !== 'undefined' ? transactions.length : 0);
      if (habitEl) habitEl.textContent = (typeof habits !== 'undefined' ? habits.length : 0);
      if (pmEl) pmEl.textContent = (typeof paymentMethods !== 'undefined' ? paymentMethods.length : 0);
      if (envEl) envEl.textContent = (typeof envelopes !== 'undefined' ? envelopes.length : 0);

      // Last synced
      const syncEl = document.getElementById('accountLastSynced');
      if (syncEl) {
        const lastSync = localStorage.getItem('lastSyncedAt');
        if (lastSync) {
          const d = new Date(lastSync);
          syncEl.textContent = d.toLocaleString();
        } else {
          syncEl.textContent = 'Not yet synced';
        }
      }
    }

    // Close modal
    closeModal.addEventListener('click', () => {
      profileModal.classList.remove('show');
    });

    // Close modal on outside click
    profileModal.addEventListener('click', (e) => {
      if (e.target === profileModal) {
        profileModal.classList.remove('show');
      }
    });

    // Generate year options and set current year as default
    function generateYearDropdown() {
      const currentYear = new Date().getFullYear();
      const options = [];
      
      for (let year = currentYear - 2; year <= currentYear + 5; year++) {
        options.push(`<option value="${year}">${year}</option>`);
      }
      
      yearSelect.innerHTML = options.join('');
      yearSelect.value = currentYear;
    }

    // Generate month options based on selected year
    function generateMonthDropdown() {
      const selectedYear = yearSelect.value;
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const options = ['<option value="ALL">All Months</option>'];
      
      for (let i = 0; i < 12; i++) {
        const monthValue = `${selectedYear}-${String(i + 1).padStart(2, '0')}`;
        options.push(`<option value="${monthValue}">${months[i]} ${selectedYear}</option>`);
      }
      
      monthSelect.innerHTML = options.join('');
      
      // Set current month as default if viewing current year
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      if (parseInt(selectedYear) === currentYear) {
        const currentMonthValue = `${selectedYear}-${String(currentMonth).padStart(2, '0')}`;
        monthSelect.value = currentMonthValue;
      }
    }

    // Initialize payment methods list and dropdowns
    updatePaymentMethodsList();
    updatePaymentDropdowns();
    updateEnvelopesList();
    updateEnvelopeDropdowns();
    updateEnvelopeFilterChips();
    generateMonthOptions();
    generateYearDropdown();
    generateMonthDropdown();
    updateBalanceSummary();
    updateRecentTransactions();
    updatePaymentBalances();
    updateEnvelopeBudget();



    // Add payment method
    addPaymentBtn.addEventListener('click', async () => {
      const methodName = newPaymentMethod.value.trim();
      const balance = initialBalance.value.trim();
      if (methodName) {
        if (!paymentMethods.includes(methodName)) {
          try {
            // Add to local array first
            paymentMethods.push(methodName);
            
            // Use safe Firebase operation - never overrides array
            if (typeof SafeFirebaseOps !== 'undefined') {
              await SafeFirebaseOps.addPaymentMethod(methodName);
            }
            
            updatePaymentMethodsList();
            updatePaymentDropdowns();
            updatePaymentBalances();
            syncToCloud();
            const balanceMsg = balance ? ` with initial balance Rs ${balance}` : '';
            showToast(`${methodName}${balanceMsg} added!`, 'success');
            newPaymentMethod.value = '';
            initialBalance.value = '';
          } catch (error) {
            console.error('Error adding payment method:', error);
            showToast('Error adding payment method. Please try again.', 'error');
          }
        } else {
          showToast('Payment method already exists!', 'error');
        }
      }
    });

    // Add envelope
    addEnvelopeBtn.addEventListener('click', async () => {
      const envelopeName = newEnvelope.value.trim();
      const budget = defaultBudget.value.trim();
      if (envelopeName) {
        if (!envelopes.includes(envelopeName)) {
          try {
            // Add to local array first
            envelopes.push(envelopeName);
            if (budget) {
              defaultBudgets[envelopeName] = budget;
            }
            
            // Use safe Firebase operation - never overrides array
            if (typeof SafeFirebaseOps !== 'undefined') {
              await SafeFirebaseOps.addPaymentMethod(envelopeName); // Using same method for envelopes
            }
            
            updateEnvelopesList();
            updateEnvelopeDropdowns();
            syncToCloud();
            const budgetMsg = budget ? ` with default budget Rs ${budget}` : '';
            showToast(`${envelopeName}${budgetMsg} added!`, 'success');
            newEnvelope.value = '';
            defaultBudget.value = '';
          } catch (error) {
            console.error('Error adding envelope:', error);
            showToast('Error adding envelope. Please try again.', 'error');
          }
        } else {
          showToast('Envelope already exists!', 'error');
        }
      }
    });

    // Month selection change
    budgetMonth.addEventListener('change', () => {
      updateBudgetList();
    });

    // Export Data
    const exportDataBtn = document.getElementById('exportDataBtn');
    exportDataBtn.addEventListener('click', () => {
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        data: {
          paymentMethods,
          envelopes,
          defaultBudgets,
          budgets,
          transactions,
          habits,
          habitCheckins,
          milestones,
          progressions
        }
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `life-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Data exported successfully! ðŸ“¥', 'success');
    });

    // Import Data
    const importDataBtn = document.getElementById('importDataBtn');
    const importFileInput = document.getElementById('importFileInput');
    
    importDataBtn.addEventListener('click', () => {
      importFileInput.click();
    });
    
    importFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      if (!confirm('âš ï¸ This will replace ALL your current data. Are you sure you want to continue?')) {
        importFileInput.value = '';
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importData = JSON.parse(event.target.result);
          
          if (!importData.data) {
            throw new Error('Invalid backup file format');
          }
          
          paymentMethods = importData.data.paymentMethods || [];
          envelopes = importData.data.envelopes || [];
          defaultBudgets = importData.data.defaultBudgets || {};
          budgets = importData.data.budgets || [];
          transactions = importData.data.transactions || [];
          habits = importData.data.habits || [];
          habitCheckins = importData.data.habitCheckins || [];
          milestones = importData.data.milestones || [];
          progressions = importData.data.progressions || [];
          
          saveToLocalStorage();
          
          updatePaymentMethodsList();
          updatePaymentDropdowns();
          updateEnvelopesList();
          updateEnvelopeDropdowns();
          updateBalanceSummary();
          updateRecentTransactions();
          updatePaymentBalances();
          updateEnvelopeBudget();
          updateTimelineView();
          
          showToast('Data imported successfully! ðŸ“¤', 'success');
          profileModal.classList.remove('show');
        } catch (error) {
          console.error('Error importing data:', error);
          showToast('Error importing data. Please check the file format.', 'error');
        }
        importFileInput.value = '';
      };
      reader.readAsText(file);
    });

    // â”€â”€ CSV Import â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    let csvParsedRows = [];

    function parseCSV(text) {
      const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
      const results = [];
      let headerLine = -1;

      // Find the header row (look for 'date' and 'amount' columns)
      for (let i = 0; i < Math.min(lines.length, 20); i++) {
        const lower = lines[i].toLowerCase();
        if (lower.includes('date') && lower.includes('amount')) {
          headerLine = i;
          break;
        }
      }
      if (headerLine === -1) return { headers: [], rows: [], error: 'Could not find header row with Date and Amount columns.' };

      const headers = splitCSVLine(lines[headerLine]).map(h => h.trim().toLowerCase().replace(/[^a-z ]/g, ''));

      for (let i = headerLine + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = splitCSVLine(line);
        if (cols.length < 2) continue;
        const row = {};
        headers.forEach((h, idx) => { row[h] = (cols[idx] || '').trim(); });
        results.push(row);
      }
      return { headers, rows: results, error: null };
    }

    function splitCSVLine(line) {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') { inQuotes = !inQuotes; }
        else if (ch === ',' && !inQuotes) { result.push(current); current = ''; }
        else { current += ch; }
      }
      result.push(current);
      return result;
    }

    function mapCSVRow(row) {
      // Flexible column name matching
      const get = (...keys) => {
        for (const k of keys) {
          const found = Object.keys(row).find(h => h.includes(k));
          if (found && row[found]) return row[found].trim();
        }
        return '';
      };

      const rawDate = get('date');
      const type = get('type').toLowerCase();
      const description = get('description', 'desc', 'note', 'narration', 'particulars');
      const category = get('category', 'envelope', 'tag');
      const payment = get('payment method', 'payment', 'account', 'bank', 'method');
      const fromAccount = get('from account', 'from');
      const toAccount = get('to account', 'to');
      const expenseType = get('expense type', 'expensetype', 'expense type').toLowerCase();
      const rawAmount = get('amount', 'debit', 'credit').replace(/[^0-9.\-]/g, '');

      const amount = parseFloat(rawAmount);
      const errors = [];

      // Parse date â€” support DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD, DD-MM-YYYY
      let parsedDate = '';
      if (rawDate) {
        const d = rawDate.replace(/\//g, '-');
        const parts = d.split('-');
        if (parts.length === 3) {
          if (parts[0].length === 4) {
            parsedDate = `${parts[0]}-${parts[1].padStart(2,'0')}-${parts[2].padStart(2,'0')}`;
          } else if (parseInt(parts[2]) > 31) {
            parsedDate = `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
          } else {
            parsedDate = `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
          }
        }
      }

      if (!parsedDate || isNaN(new Date(parsedDate))) errors.push('Invalid date');
      if (!['income','expense','transfer','transfer-in','transfer-out'].includes(type)) errors.push('Type must be income/expense/transfer/transfer-in/transfer-out');
      if (isNaN(amount) || amount <= 0) errors.push('Invalid amount');
      if (type === 'transfer' && (!fromAccount || !toAccount)) errors.push('Transfer needs From Account and To Account columns');

      return {
        date: parsedDate || rawDate,
        type: type || 'expense',
        description,
        envelope: category,
        payment,
        fromAccount,
        toAccount,
        expenseType: ['need','want','save'].includes(expenseType) ? expenseType : '',
        amount: isNaN(amount) ? 0 : Math.abs(amount),
        errors
      };
    }

    function showCSVPreview(parsedRows) {
      const valid = parsedRows.filter(r => r.errors.length === 0);
      const invalid = parsedRows.filter(r => r.errors.length > 0);

      document.getElementById('csvPreviewStats').textContent =
        `âœ… ${valid.length} valid rows ready to import` +
        (invalid.length ? `  âš ï¸ ${invalid.length} rows will be skipped` : '');

      const errorsEl = document.getElementById('csvPreviewErrors');
      if (invalid.length) {
        errorsEl.style.display = 'block';
        errorsEl.innerHTML = '<strong>Skipped rows:</strong><br>' +
          invalid.slice(0, 5).map((r, i) => `Row ${i+1}: ${r.description || '(empty)'} â†’ ${r.errors.join(', ')}`).join('<br>') +
          (invalid.length > 5 ? `<br>...and ${invalid.length - 5} more` : '');
      } else {
        errorsEl.style.display = 'none';
      }

      const typeColor = { income: '#dcfce7', expense: '#fee2e2', transfer: '#ede9fe' };
      const typeText = { income: '#166534', expense: '#991b1b', transfer: '#5b21b6' };
      const preview = valid.slice(0, 10);
      document.getElementById('csvPreviewCards').innerHTML = preview.map(r => {
        const bg = typeColor[r.type] || '#f3f4f6';
        const tc = typeText[r.type] || '#374151';
        return `<div style="background:${bg}; border-radius:12px; padding:12px 14px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
          <div style="flex:1; min-width:0;">
            <div style="font-size:14px; font-weight:700; color:#1f2937; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${r.description || '-'}</div>
            <div style="font-size:12px; color:#6b7280; margin-top:2px;">${r.date} Â· ${r.envelope || '-'} Â· ${r.payment || '-'}</div>
          </div>
          <div style="text-align:right; flex-shrink:0;">
            <div style="font-size:15px; font-weight:800; color:${tc};">Rs ${parseFloat(r.amount).toLocaleString('en-IN')}</div>
            <div style="font-size:11px; font-weight:600; color:${tc}; text-transform:uppercase;">${r.type}${r.expenseType ? ' Â· '+r.expenseType : ''}</div>
          </div>
        </div>`;
      }).join('');

      const moreEl = document.getElementById('csvMoreRows');
      if (valid.length > 10) {
        moreEl.style.display = 'block';
        moreEl.textContent = `...and ${valid.length - 10} more rows`;
      } else {
        moreEl.style.display = 'none';
      }

      csvParsedRows = valid;
      document.getElementById('csvPreviewModal').style.display = 'flex';
    }

    document.getElementById('csvImportBtn').addEventListener('click', () => {
      document.getElementById('csvImportFileInput').click();
    });

    document.getElementById('csvImportFileInput').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const { rows, error } = parseCSV(event.target.result);
        if (error) { showToast(error, 'error'); return; }
        if (rows.length === 0) { showToast('No data rows found in file.', 'error'); return; }
        const mapped = rows.map(mapCSVRow);
        showCSVPreview(mapped);
      };
      reader.readAsText(file);
      e.target.value = '';
    });

    document.getElementById('csvConfirmImportBtn').addEventListener('click', () => {
      if (csvParsedRows.length === 0) return;
      const newTransactions = csvParsedRows.map(r => {
        let type = r.type;
        let from = '';
        let to = '';

        if (type === 'transfer') {
          from = r.fromAccount;
          to = r.toAccount;
        } else if (type === 'transfer-out') {
          type = 'transfer';
          from = r.payment;
        } else if (type === 'transfer-in') {
          type = 'transfer';
          to = r.payment;
        }

        return {
          id: Date.now() + Math.random(),
          date: new Date(r.date).toISOString(),
          type,
          description: r.description,
          envelope: r.envelope,
          payment: r.payment,
          from,
          to,
          expenseType: r.expenseType,
          amount: r.amount
        };
      });
      transactions = [...transactions, ...newTransactions];
      saveToLocalStorage();

      // Navigate to the month/year of the first imported transaction so it's visible
      const firstDate = new Date(newTransactions[0].date);
      const importedYear = firstDate.getFullYear().toString();
      const importedMonth = `${importedYear}-${String(firstDate.getMonth() + 1).padStart(2, '0')}`;
      yearSelect.value = importedYear;
      generateMonthDropdown();
      monthSelect.value = importedMonth;

      updateBalanceSummary();
      updateRecentTransactions();
      updatePaymentBalances();
      updateEnvelopeBudget();
      document.getElementById('csvPreviewModal').style.display = 'none';
      profileModal.classList.remove('show');
      showToast(`âœ… ${newTransactions.length} transactions imported!`, 'success');
      csvParsedRows = [];
    });
    // â”€â”€ End CSV Import â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    // Payment balances toggle
    paymentHeader.addEventListener('click', (e) => {
      if (e.target.id !== 'toggleViewBtn2') {
        paymentBalances.classList.toggle('collapsed');
        toggleIcon.classList.toggle('collapsed');
      }
    });

    // Balance summary toggle
    balanceHeader.addEventListener('click', (e) => {
      if (e.target.id !== 'toggleViewBtn') {
        balanceSummary.classList.toggle('collapsed');
        balanceToggleIcon.classList.toggle('collapsed');
      }
    });

    // Toggle between Income/Expense and Payment Methods view
    const toggleViewBtn = document.getElementById('toggleViewBtn');
    const toggleViewBtn2 = document.getElementById('toggleViewBtn2');
    const balanceSummaryWrapper = document.getElementById('balanceSummaryWrapper');
    const paymentBalancesWrapper = document.getElementById('paymentBalancesWrapper');

    function switchView() {
      if (balanceSummaryWrapper.style.display === 'none') {
        balanceSummaryWrapper.style.display = 'block';
        paymentBalancesWrapper.style.display = 'none';
      } else {
        balanceSummaryWrapper.style.display = 'none';
        paymentBalancesWrapper.style.display = 'block';
      }
    }

    toggleViewBtn.addEventListener('click', switchView);
    toggleViewBtn2.addEventListener('click', switchView);

    // Year navigation
    prevYear.addEventListener('click', () => {
      const currentIndex = yearSelect.selectedIndex;
      if (currentIndex > 0) {
        yearSelect.selectedIndex = currentIndex - 1;
        generateMonthDropdown();
        updateBalanceSummary();
        updatePaymentBalances();
        updateRecentTransactions();
        updateEnvelopeBudget();
      }
    });

    nextYear.addEventListener('click', () => {
      const currentIndex = yearSelect.selectedIndex;
      if (currentIndex < yearSelect.options.length - 1) {
        yearSelect.selectedIndex = currentIndex + 1;
        generateMonthDropdown();
        updateBalanceSummary();
        updatePaymentBalances();
        updateRecentTransactions();
        updateEnvelopeBudget();
      }
    });

    // Year select change
    yearSelect.addEventListener('change', () => {
      recentTxVisibleCount = 10;
      generateMonthDropdown();
      updateBalanceSummary();
      updatePaymentBalances();
      updateRecentTransactions();
      updateEnvelopeBudget();
    });

    // Month navigation
    prevMonth.addEventListener('click', () => {
      const currentIndex = monthSelect.selectedIndex;
      if (currentIndex > 0) {
        monthSelect.selectedIndex = currentIndex - 1;
        updateBalanceSummary();
        updatePaymentBalances();
        updateRecentTransactions();
        updateEnvelopeBudget();
      }
    });

    nextMonth.addEventListener('click', () => {
      const currentIndex = monthSelect.selectedIndex;
      if (currentIndex < monthSelect.options.length - 1) {
        monthSelect.selectedIndex = currentIndex + 1;
        updateBalanceSummary();
        updatePaymentBalances();
        updateRecentTransactions();
        updateEnvelopeBudget();
      }
    });

    // Month select change
    monthSelect.addEventListener('change', () => {
      recentTxVisibleCount = 10;
      updateBalanceSummary();
      updatePaymentBalances();
      updateRecentTransactions();
      updateEnvelopeBudget();
    });

    // Download Report Button
    const downloadReportBtn = document.getElementById('downloadReportBtn');
    if (downloadReportBtn) {
      downloadReportBtn.addEventListener('click', downloadReport);
    }

    const deleteAllExpensesBtn = document.getElementById('deleteAllExpensesBtn');
    if (deleteAllExpensesBtn) {
      deleteAllExpensesBtn.addEventListener('click', () => {
        const selectedMonth = monthSelect.value;
        const selectedYear = yearSelect.value;
        const isFiltered = selectedEnvelopeFilter !== 'ALL';

        // Determine which expenses will be deleted
        const toDelete = transactions.filter(t => {
          if (t.type !== 'expense') return false;
          if (isFiltered && t.envelope !== selectedEnvelopeFilter) return false;
          if (!t.date) return false;
          try {
            if (selectedMonth === 'ALL') {
              return new Date(t.date).getFullYear().toString() === selectedYear;
            } else {
              const d = new Date(t.date);
              const m = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
              return m === selectedMonth;
            }
          } catch(e) { return false; }
        });

        if (toDelete.length === 0) {
          showToast('No expenses to delete for this period', 'error');
          return;
        }

        const periodLabel = selectedMonth === 'ALL'
          ? `year ${selectedYear}`
          : monthSelect.options[monthSelect.selectedIndex].text;
        const envelopeLabel = isFiltered ? ` in "${selectedEnvelopeFilter}"` : '';

        showDeleteConfirmation(
          'Delete All Expenses?',
          `This will permanently delete ${toDelete.length} expense(s) for ${periodLabel}${envelopeLabel}.`,
          () => {
            const idsToDelete = new Set(toDelete.map(t => t.id));
            transactions = transactions.filter(t => !idsToDelete.has(t.id));
            saveToLocalStorage();
            updateBalanceSummary();
            updateRecentTransactions();
            updatePaymentBalances();
            updateEnvelopeBudget();
            showToast(`${toDelete.length} expense(s) deleted`, 'error');
          }
        );
      });
    }

    const transactionModal = document.getElementById('transactionModal');
    const closeTransactionModal = document.getElementById('closeTransactionModal');
    const transactionModalTitle = document.getElementById('transactionModalTitle');
    const expenseEntriesContainer = document.getElementById('expenseEntriesContainer');
    const addAnotherExpenseBtn = document.getElementById('addAnotherExpenseBtn');
    let expenseEntryCount = 0;

    function createExpenseEntry(index) {
      const entry = document.createElement('div');
      entry.className = 'expense-entry';
      entry.dataset.index = index;
      
      const todayStr = new Date().toISOString().split('T')[0];

      entry.innerHTML = `
        <div class="expense-entry-header">
          <div class="expense-entry-number">Expense #${index + 1}</div>
          ${index > 0 ? '<button type="button" class="remove-expense-btn" onclick="removeExpenseEntry(' + index + ')">Ã—</button>' : ''}
        </div>
        <div class="expense-entry-fields">
          <div class="amount-input-wrapper" style="margin-bottom: 16px;">
            <span class="currency">Rs </span>
            <input type="number" inputmode="decimal" class="amount-input" placeholder="0" data-field="amount" />
          </div>
          <input type="text" class="description-input" placeholder="What's this for?" data-field="description" style="margin-bottom: 16px;" />
          <div style="margin-bottom: 16px;">
            <div style="font-size: 12px; font-weight: 700; color: #6b7280; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">ï¿½ Date</div>
            <input type="date" data-field="date" value="${todayStr}" style="width:100%; padding:12px 16px; border:2px solid #e5e7eb; border-radius:12px; font-size:15px; font-weight:600; color:#1f2937; background:white; outline:none; transition:all 0.2s;" />
          </div>
          <div style="margin-bottom: 16px;">
            <div style="font-size: 12px; font-weight: 700; color: #6b7280; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">ðŸ“ Category</div>
            <div class="visual-selector" data-field="envelope" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 8px;"></div>
          </div>
          <div style="margin-bottom: 16px;">
            <div style="font-size: 12px; font-weight: 700; color: #6b7280; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">ðŸ’³ Payment</div>
            <div class="visual-selector" data-field="payment" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 8px;"></div>
          </div>
          <div>
            <div style="font-size: 12px; font-weight: 700; color: #6b7280; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">ðŸŽ¯ Type</div>
            <div class="visual-selector" data-field="expenseType" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;"></div>
          </div>
        </div>
      `;
      
      return entry;
    }

    function createSingleEntry(type) {
      const entry = document.createElement('div');
      
      // Default date = today in YYYY-MM-DD
      const todayStr = new Date().toISOString().split('T')[0];

      if (type === 'income') {
        entry.innerHTML = `
          <div class="amount-input-wrapper" style="margin-bottom: 16px;">
            <span class="currency">Rs </span>
            <input type="number" inputmode="decimal" id="amountInput" placeholder="0" class="amount-input" />
          </div>
          <input type="text" id="descriptionInput" placeholder="What's this for?" class="description-input" style="margin-bottom: 16px;" />
          <div style="margin-bottom: 16px;">
            <div style="font-size: 12px; font-weight: 700; color: #6b7280; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">ðŸ“… Date</div>
            <input type="date" id="transactionDate" value="${todayStr}" style="width:100%; padding:12px 16px; border:2px solid #e5e7eb; border-radius:12px; font-size:15px; font-weight:600; color:#1f2937; background:white; outline:none; transition:all 0.2s;" />
          </div>
          <div>
            <div style="font-size: 12px; font-weight: 700; color: #6b7280; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">ðŸ’³ Payment Method</div>
            <div class="visual-selector" id="incomePaymentSelector" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 8px;"></div>
          </div>
        `;
      } else if (type === 'transfer') {
        entry.innerHTML = `
          <div class="amount-input-wrapper" style="margin-bottom: 16px;">
            <span class="currency">Rs </span>
            <input type="number" inputmode="decimal" id="amountInput" placeholder="0" class="amount-input" />
          </div>
          <input type="text" id="descriptionInput" placeholder="What's this for? (optional)" class="description-input" style="margin-bottom: 16px;" />
          <div style="margin-bottom: 16px;">
            <div style="font-size: 12px; font-weight: 700; color: #6b7280; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">ðŸ“… Date</div>
            <input type="date" id="transactionDate" value="${todayStr}" style="width:100%; padding:12px 16px; border:2px solid #e5e7eb; border-radius:12px; font-size:15px; font-weight:600; color:#1f2937; background:white; outline:none; transition:all 0.2s;" />
          </div>
          <div style="margin-bottom: 16px;">
            <div style="font-size: 12px; font-weight: 700; color: #6b7280; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">ðŸ“¤ From Payment Method</div>
            <div class="visual-selector" id="transferFromSelector" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 8px;"></div>
          </div>
          <div>
            <div style="font-size: 12px; font-weight: 700; color: #6b7280; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">ðŸ“¥ To Payment Method</div>
            <div class="visual-selector" id="transferToSelector" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 8px;"></div>
          </div>
        `;
      } else {
        entry.innerHTML = `
          <div class="amount-input-wrapper">
            <span class="currency">Rs </span>
            <input type="number" inputmode="decimal" id="amountInput" placeholder="0" class="amount-input" />
          </div>
          <input type="text" id="descriptionInput" placeholder="What's this for?" class="description-input" />
          <select id="envelopeSelect" class="envelope-select">
            <option value="">Select Envelope</option>
          </select>
          <select id="transferFrom" class="payment-select transfer-from">
            <option value="">From Payment Method</option>
          </select>
          <select id="transferTo" class="payment-select transfer-to">
            <option value="">To Payment Method</option>
          </select>
          <select id="paymentSelect" class="payment-select">
            <option value="">Select Payment Method</option>
          </select>
        `;
      }
      return entry;
    }

    function removeExpenseEntry(index) {
      const entry = document.querySelector(`.expense-entry[data-index="${index}"]`);
      if (entry) {
        entry.remove();
        expenseEntryCount--;
        
        // Renumber remaining entries
        const entries = document.querySelectorAll('.expense-entry');
        entries.forEach((e, i) => {
          e.dataset.index = i;
          const numberEl = e.querySelector('.expense-entry-number');
          if (numberEl) numberEl.textContent = `Expense #${i + 1}`;
          
          const removeBtn = e.querySelector('.remove-expense-btn');
          if (removeBtn) {
            removeBtn.setAttribute('onclick', `removeExpenseEntry(${i})`);
          }
        });
        
        if (expenseEntryCount === 0) {
          addAnotherExpenseBtn.style.display = 'none';
        }
        
        updateSubmitButtonText();
      }
    }

    function addExpenseEntry() {
      // Get previous entry values if exists
      let previousEnvelope = '';
      let previousPayment = '';
      
      if (expenseEntryCount > 0) {
        const previousEntry = document.querySelector(`.expense-entry[data-index="${expenseEntryCount - 1}"]`);
        if (previousEntry) {
          const prevEnvelopeBtn = previousEntry.querySelector('[data-field="envelope"] .visual-option.selected');
          const prevPaymentBtn = previousEntry.querySelector('[data-field="payment"] .visual-option.selected');
          previousEnvelope = prevEnvelopeBtn ? prevEnvelopeBtn.dataset.value : '';
          previousPayment = prevPaymentBtn ? prevPaymentBtn.dataset.value : '';
        }
      }
      
      const entry = createExpenseEntry(expenseEntryCount);
      expenseEntriesContainer.appendChild(entry);
      
      // Populate visual selectors
      const envelopeContainer = entry.querySelector('[data-field="envelope"]');
      const paymentContainer = entry.querySelector('[data-field="payment"]');
      
      // Smart icon matching function
      function getEnvelopeIcon(name) {
        const lowerName = name.toLowerCase();
        
        // Food & Dining
        if (lowerName.includes('food') || lowerName.includes('meal')) return 'ðŸ½ï¸';
        if (lowerName.includes('breakfast')) return 'ðŸ¥ž';
        if (lowerName.includes('lunch')) return 'ðŸ±';
        if (lowerName.includes('dinner')) return 'ðŸ½ï¸';
        if (lowerName.includes('restaurant') || lowerName.includes('dining')) return 'ðŸ´';
        if (lowerName.includes('fastfood') || lowerName.includes('burger') || lowerName.includes('pizza')) return 'ðŸ”';
        if (lowerName.includes('coffee') || lowerName.includes('cafe')) return 'â˜•';
        if (lowerName.includes('snack')) return 'ðŸ¿';
        if (lowerName.includes('drink') || lowerName.includes('beverage')) return 'ðŸ¥¤';
        if (lowerName.includes('bar') || lowerName.includes('alcohol')) return 'ðŸº';
        if (lowerName.includes('grocer')) return 'ðŸ›’';
        
        // Transport
        if (lowerName.includes('transport') || lowerName.includes('travel')) return 'ðŸš—';
        if (lowerName.includes('taxi') || lowerName.includes('cab') || lowerName.includes('uber') || lowerName.includes('ola')) return 'ðŸš•';
        if (lowerName.includes('bus')) return 'ðŸšŒ';
        if (lowerName.includes('train') || lowerName.includes('metro') || lowerName.includes('railway')) return 'ðŸš†';
        if (lowerName.includes('flight') || lowerName.includes('air')) return 'âœˆï¸';
        if (lowerName.includes('fuel') || lowerName.includes('petrol') || lowerName.includes('gas') || lowerName.includes('diesel')) return 'â›½';
        if (lowerName.includes('parking')) return 'ðŸ…¿ï¸';
        if (lowerName.includes('toll')) return 'ðŸ›£ï¸';
        if (lowerName.includes('car')) return 'ðŸš™';
        if (lowerName.includes('bike') || lowerName.includes('motorcycle')) return 'ðŸï¸';
        if (lowerName.includes('bicycle') || lowerName.includes('cycle')) return 'ðŸš´';
        if (lowerName.includes('auto')) return 'ðŸ›º';
        
        // Shopping
        if (lowerName.includes('shop')) return 'ðŸ›ï¸';
        if (lowerName.includes('cloth') || lowerName.includes('dress') || lowerName.includes('fashion')) return 'ðŸ‘•';
        if (lowerName.includes('shoe') || lowerName.includes('footwear')) return 'ðŸ‘Ÿ';
        if (lowerName.includes('electronic') || lowerName.includes('gadget')) return 'ðŸ’»';
        if (lowerName.includes('furniture')) return 'ðŸ›‹ï¸';
        if (lowerName.includes('beauty') || lowerName.includes('cosmetic') || lowerName.includes('makeup')) return 'ðŸ’„';
        if (lowerName.includes('jewelry') || lowerName.includes('jewellery')) return 'ðŸ’Ž';
        
        // Entertainment
        if (lowerName.includes('entertainment') || lowerName.includes('fun')) return 'ðŸŽ®';
        if (lowerName.includes('movie') || lowerName.includes('cinema') || lowerName.includes('film')) return 'ðŸŽ¬';
        if (lowerName.includes('music') || lowerName.includes('concert')) return 'ðŸŽµ';
        if (lowerName.includes('game') || lowerName.includes('gaming')) return 'ðŸŽ®';
        if (lowerName.includes('sport')) return 'âš½';
        if (lowerName.includes('party') || lowerName.includes('celebration')) return 'ðŸŽ‰';
        if (lowerName.includes('hobby')) return 'ðŸŽ¨';
        
        // Health & Fitness
        if (lowerName.includes('health') || lowerName.includes('medical')) return 'âš•ï¸';
        if (lowerName.includes('doctor') || lowerName.includes('hospital') || lowerName.includes('clinic')) return 'ðŸ‘¨â€âš•ï¸';
        if (lowerName.includes('medicine') || lowerName.includes('drug')) return 'ðŸ’Š';
        if (lowerName.includes('pharmacy') || lowerName.includes('chemist')) return 'ðŸ¥';
        if (lowerName.includes('fitness') || lowerName.includes('gym') || lowerName.includes('workout')) return 'ðŸ’ª';
        if (lowerName.includes('yoga')) return 'ðŸ§˜';
        if (lowerName.includes('salon') || lowerName.includes('haircut')) return 'ðŸ’‡';
        if (lowerName.includes('spa') || lowerName.includes('massage')) return 'ðŸ§–';
        if (lowerName.includes('dental') || lowerName.includes('dentist')) return 'ðŸ¦·';
        
        // Home & Utilities
        if (lowerName.includes('rent') || lowerName.includes('house')) return 'ðŸ ';
        if (lowerName.includes('utility') || lowerName.includes('utilities')) return 'âš¡';
        if (lowerName.includes('electric')) return 'ðŸ’¡';
        if (lowerName.includes('water')) return 'ðŸ’§';
        if (lowerName.includes('gas') && !lowerName.includes('fuel')) return 'ðŸ”¥';
        if (lowerName.includes('internet') || lowerName.includes('wifi') || lowerName.includes('broadband')) return 'ðŸŒ';
        if (lowerName.includes('phone') || lowerName.includes('mobile') || lowerName.includes('recharge')) return 'ðŸ“±';
        if (lowerName.includes('maintenance') || lowerName.includes('repair')) return 'ðŸ”§';
        if (lowerName.includes('clean')) return 'ðŸ§¹';
        if (lowerName.includes('laundry')) return 'ðŸ‘”';
        if (lowerName.includes('garden')) return 'ðŸŒ±';
        
        // Education
        if (lowerName.includes('education') || lowerName.includes('school') || lowerName.includes('college') || lowerName.includes('university')) return 'ðŸŽ“';
        if (lowerName.includes('book')) return 'ðŸ“š';
        if (lowerName.includes('course') || lowerName.includes('class') || lowerName.includes('tuition')) return 'ðŸŽ¯';
        if (lowerName.includes('stationery') || lowerName.includes('stationary')) return 'âœï¸';
        
        // Bills & Finance
        if (lowerName.includes('bill')) return 'ðŸ’¡';
        if (lowerName.includes('insurance')) return 'ðŸ›¡ï¸';
        if (lowerName.includes('saving')) return 'ðŸ’°';
        if (lowerName.includes('invest')) return 'ðŸ“ˆ';
        if (lowerName.includes('loan') || lowerName.includes('emi')) return 'ðŸ¦';
        if (lowerName.includes('tax')) return 'ðŸ“‹';
        
        // Special Occasions
        if (lowerName.includes('gift')) return 'ðŸŽ';
        if (lowerName.includes('donation') || lowerName.includes('charity')) return 'â¤ï¸';
        if (lowerName.includes('wedding') || lowerName.includes('marriage')) return 'ðŸ’’';
        if (lowerName.includes('birthday')) return 'ðŸŽ‚';
        if (lowerName.includes('festival') || lowerName.includes('holiday')) return 'ðŸŽŠ';
        
        // Subscription & Services
        if (lowerName.includes('subscription') || lowerName.includes('netflix') || lowerName.includes('spotify') || lowerName.includes('prime')) return 'ðŸ“º';
        if (lowerName.includes('office') || lowerName.includes('work')) return 'ðŸ’¼';
        
        // Pets
        if (lowerName.includes('pet') || lowerName.includes('dog') || lowerName.includes('cat')) return 'ðŸ¾';
        
        // Vacation
        if (lowerName.includes('vacation') || lowerName.includes('holiday') || lowerName.includes('trip')) return 'ðŸ–ï¸';
        if (lowerName.includes('hotel') || lowerName.includes('accommodation')) return 'ðŸ¨';
        
        // Default
        return 'ðŸ“';
      }
      
      envelopes.forEach(env => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'visual-option';
        btn.dataset.value = env;
        const icon = getEnvelopeIcon(env);
        btn.innerHTML = `<div style="font-size: 28px; margin-bottom: 6px;">${icon}</div><div style="font-size: 11px; font-weight: 600; color: #374151; line-height: 1.2;">${env}</div>`;
        btn.onclick = () => selectVisualOption(envelopeContainer, env);
        if (env === previousEnvelope) btn.classList.add('selected');
        envelopeContainer.appendChild(btn);
      });
      
      // Smart icon matching function for payment methods
      function getPaymentIcon(name) {
        const lowerName = name.toLowerCase();
        
        // Cash
        if (lowerName.includes('cash')) return 'ðŸ’µ';
        
        // Banks - with specific colors/styles
        if (lowerName.includes('hdfc')) return 'ðŸ¦';
        if (lowerName.includes('sbi') || lowerName.includes('state bank')) return 'ðŸ¦';
        if (lowerName.includes('icici')) return 'ðŸ¦';
        if (lowerName.includes('axis')) return 'ðŸ¦';
        if (lowerName.includes('kotak')) return 'ðŸ¦';
        if (lowerName.includes('pnb') || lowerName.includes('punjab')) return 'ðŸ¦';
        if (lowerName.includes('bob') || lowerName.includes('baroda')) return 'ðŸ¦';
        if (lowerName.includes('canara')) return 'ðŸ¦';
        if (lowerName.includes('idbi')) return 'ðŸ¦';
        if (lowerName.includes('union bank')) return 'ðŸ¦';
        if (lowerName.includes('indian bank')) return 'ðŸ¦';
        if (lowerName.includes('yes bank')) return 'ðŸ¦';
        if (lowerName.includes('indusind')) return 'ðŸ¦';
        if (lowerName.includes('bank')) return 'ðŸ¦';
        
        // Cards
        if (lowerName.includes('credit')) return 'ðŸ’³';
        if (lowerName.includes('debit')) return 'ðŸ’³';
        if (lowerName.includes('card')) return 'ðŸ’³';
        if (lowerName.includes('visa')) return 'ðŸ’³';
        if (lowerName.includes('mastercard') || lowerName.includes('master card')) return 'ðŸ’³';
        if (lowerName.includes('rupay')) return 'ðŸ’³';
        if (lowerName.includes('amex') || lowerName.includes('american express')) return 'ðŸ’³';
        
        // UPI & Digital Payments
        if (lowerName.includes('upi')) return 'ðŸ“±';
        if (lowerName.includes('phonepe') || lowerName.includes('phone pe')) return 'ðŸ’œ';
        if (lowerName.includes('gpay') || lowerName.includes('google pay') || lowerName.includes('googlepay')) return 'ðŸ”µ';
        if (lowerName.includes('paytm')) return 'ðŸ’™';
        if (lowerName.includes('amazon pay') || lowerName.includes('amazonpay')) return 'ðŸŸ ';
        if (lowerName.includes('bhim')) return 'ðŸ“±';
        if (lowerName.includes('whatsapp pay')) return 'ðŸ’š';
        
        // Wallets
        if (lowerName.includes('wallet')) return 'ðŸ‘›';
        if (lowerName.includes('mobikwik')) return 'ðŸ‘›';
        if (lowerName.includes('freecharge')) return 'ðŸ‘›';
        if (lowerName.includes('paypal')) return 'ðŸ’°';
        
        // Bank Transfers
        if (lowerName.includes('neft')) return 'ðŸ”„';
        if (lowerName.includes('rtgs')) return 'ðŸ”„';
        if (lowerName.includes('imps')) return 'âš¡';
        if (lowerName.includes('transfer')) return 'ðŸ”„';
        if (lowerName.includes('net banking') || lowerName.includes('netbanking')) return 'ðŸŒ';
        
        // Others
        if (lowerName.includes('cheque') || lowerName.includes('check')) return 'ðŸ“';
        if (lowerName.includes('demand draft') || lowerName.includes('dd')) return 'ðŸ“„';
        
        // Default
        return 'ðŸ’°';
      }
      
      paymentMethods.forEach(method => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'visual-option';
        btn.dataset.value = method;
        const icon = getPaymentIcon(method);
        btn.innerHTML = `<div style="font-size: 28px; margin-bottom: 6px;">${icon}</div><div style="font-size: 11px; font-weight: 600; color: #374151; line-height: 1.2;">${method}</div>`;
        btn.onclick = () => selectVisualOption(paymentContainer, method);
        if (method === previousPayment) btn.classList.add('selected');
        paymentContainer.appendChild(btn);
      });
      
      // Add expense type selector (Need, Want, Save)
      const expenseTypeContainer = entry.querySelector('[data-field="expenseType"]');
      const expenseTypes = [
        { value: 'need', label: 'Need', icon: 'ðŸŽ¯' },
        { value: 'want', label: 'Want', icon: 'ðŸŽ‰' },
        { value: 'save', label: 'Save', icon: 'ðŸ’°' }
      ];
      
      expenseTypes.forEach(type => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'visual-option';
        btn.dataset.value = type.value;
        btn.innerHTML = `<div style="font-size: 28px; margin-bottom: 6px;">${type.icon}</div><div style="font-size: 11px; font-weight: 600; color: #374151; line-height: 1.2;">${type.label}</div>`;
        btn.onclick = () => selectVisualOption(expenseTypeContainer, type.value);
        expenseTypeContainer.appendChild(btn);
      });
      
      expenseEntryCount++;
      
      // Focus on amount input
      setTimeout(() => {
        const amountInput = entry.querySelector('[data-field="amount"]');
        if (amountInput) amountInput.focus();
      }, 100);
      
      updateSubmitButtonText();
    }
    
    function selectVisualOption(container, value) {
      container.querySelectorAll('.visual-option').forEach(btn => btn.classList.remove('selected'));
      const selected = container.querySelector(`[data-value="${value}"]`);
      if (selected) selected.classList.add('selected');
    }

    function updateSubmitButtonText() {
      const count = document.querySelectorAll('.expense-entry').length;
      if (activeType === 'expense' && count > 1) {
        submitBtn.textContent = `Add ${count} Expenses`;
      } else if (activeType === 'expense') {
        submitBtn.textContent = 'Add Expense';
      }
    }

    addAnotherExpenseBtn.addEventListener('click', () => {
      addExpenseEntry();
    });

    function openTransactionModal(type) {
      activeType = type;
      transactionModal.classList.add('show');
      expenseEntriesContainer.innerHTML = '';
      expenseEntryCount = 0;
      
      if (type === 'income') {
        transactionModalTitle.textContent = 'Add Income';
        submitBtn.classList.remove('expense', 'transfer');
        submitBtn.classList.add('income');
        submitBtn.textContent = 'Add Income';
        addAnotherExpenseBtn.style.display = 'none';
        
        const singleEntry = createSingleEntry('income');
        expenseEntriesContainer.appendChild(singleEntry);
        
        const paymentContainer = singleEntry.querySelector('#incomePaymentSelector');
        
        // Smart icon matching function for payment methods
        function getPaymentIcon(name) {
          const lowerName = name.toLowerCase();
          if (lowerName.includes('cash')) return 'ðŸ’µ';
          if (lowerName.includes('hdfc')) return 'ðŸ¦';
          if (lowerName.includes('sbi') || lowerName.includes('state bank')) return 'ðŸ¦';
          if (lowerName.includes('icici')) return 'ðŸ¦';
          if (lowerName.includes('axis')) return 'ðŸ¦';
          if (lowerName.includes('kotak')) return 'ðŸ¦';
          if (lowerName.includes('pnb') || lowerName.includes('punjab')) return 'ðŸ¦';
          if (lowerName.includes('bob') || lowerName.includes('baroda')) return 'ðŸ¦';
          if (lowerName.includes('canara')) return 'ðŸ¦';
          if (lowerName.includes('bank')) return 'ðŸ¦';
          if (lowerName.includes('credit')) return 'ðŸ’³';
          if (lowerName.includes('debit')) return 'ðŸ’³';
          if (lowerName.includes('card')) return 'ðŸ’³';
          if (lowerName.includes('upi')) return 'ðŸ“±';
          if (lowerName.includes('phonepe') || lowerName.includes('phone pe')) return 'ðŸ’œ';
          if (lowerName.includes('gpay') || lowerName.includes('google pay')) return 'ðŸ”µ';
          if (lowerName.includes('paytm')) return 'ðŸ’™';
          if (lowerName.includes('amazon pay')) return 'ðŸŸ ';
          if (lowerName.includes('wallet')) return 'ðŸ‘›';
          if (lowerName.includes('transfer')) return 'ðŸ”„';
          return 'ðŸ’°';
        }
        
        // Populate payment methods with visual buttons
        paymentMethods.forEach(method => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'visual-option';
          btn.dataset.value = method;
          const icon = getPaymentIcon(method);
          btn.innerHTML = `<div style="font-size: 28px; margin-bottom: 6px;">${icon}</div><div style="font-size: 11px; font-weight: 600; color: #374151; line-height: 1.2;">${method}</div>`;
          btn.onclick = () => selectVisualOption(paymentContainer, method);
          paymentContainer.appendChild(btn);
        });
        
        setTimeout(() => {
          const amountInput = singleEntry.querySelector('#amountInput');
          if (amountInput) amountInput.focus();
        }, 100);
        
      } else if (type === 'expense') {
        transactionModalTitle.textContent = 'Add Expenses';
        submitBtn.classList.remove('income', 'transfer');
        submitBtn.classList.add('expense');
        submitBtn.textContent = 'Add Expense';
        addAnotherExpenseBtn.style.display = 'flex';
        
        // Add first expense entry
        addExpenseEntry();
        
      } else if (type === 'transfer') {
        transactionModalTitle.textContent = 'Add Transfer';
        submitBtn.classList.remove('income', 'expense');
        submitBtn.classList.add('transfer');
        submitBtn.textContent = 'Add Transfer';
        addAnotherExpenseBtn.style.display = 'none';
        
        const singleEntry = createSingleEntry('transfer');
        expenseEntriesContainer.appendChild(singleEntry);
        
        const transferFromContainer = singleEntry.querySelector('#transferFromSelector');
        const transferToContainer = singleEntry.querySelector('#transferToSelector');
        
        // Smart icon matching function for payment methods
        function getPaymentIcon(name) {
          const lowerName = name.toLowerCase();
          if (lowerName.includes('cash')) return 'ðŸ’µ';
          if (lowerName.includes('hdfc')) return 'ðŸ¦';
          if (lowerName.includes('sbi') || lowerName.includes('state bank')) return 'ðŸ¦';
          if (lowerName.includes('icici')) return 'ðŸ¦';
          if (lowerName.includes('axis')) return 'ðŸ¦';
          if (lowerName.includes('kotak')) return 'ðŸ¦';
          if (lowerName.includes('pnb') || lowerName.includes('punjab')) return 'ðŸ¦';
          if (lowerName.includes('bob') || lowerName.includes('baroda')) return 'ðŸ¦';
          if (lowerName.includes('canara')) return 'ðŸ¦';
          if (lowerName.includes('bank')) return 'ðŸ¦';
          if (lowerName.includes('credit')) return 'ðŸ’³';
          if (lowerName.includes('debit')) return 'ðŸ’³';
          if (lowerName.includes('card')) return 'ðŸ’³';
          if (lowerName.includes('upi')) return 'ðŸ“±';
          if (lowerName.includes('phonepe') || lowerName.includes('phone pe')) return 'ðŸ’œ';
          if (lowerName.includes('gpay') || lowerName.includes('google pay')) return 'ðŸ”µ';
          if (lowerName.includes('paytm')) return 'ðŸ’™';
          if (lowerName.includes('amazon pay')) return 'ðŸŸ ';
          if (lowerName.includes('wallet')) return 'ðŸ‘›';
          if (lowerName.includes('transfer')) return 'ðŸ”„';
          return 'ðŸ’°';
        }
        
        // Populate FROM payment methods with visual buttons
        paymentMethods.forEach(method => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'visual-option';
          btn.dataset.value = method;
          const icon = getPaymentIcon(method);
          btn.innerHTML = `<div style="font-size: 28px; margin-bottom: 6px;">${icon}</div><div style="font-size: 11px; font-weight: 600; color: #374151; line-height: 1.2;">${method}</div>`;
          btn.onclick = () => selectVisualOption(transferFromContainer, method);
          transferFromContainer.appendChild(btn);
        });
        
        // Populate TO payment methods with visual buttons
        paymentMethods.forEach(method => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'visual-option';
          btn.dataset.value = method;
          const icon = getPaymentIcon(method);
          btn.innerHTML = `<div style="font-size: 28px; margin-bottom: 6px;">${icon}</div><div style="font-size: 11px; font-weight: 600; color: #374151; line-height: 1.2;">${method}</div>`;
          btn.onclick = () => selectVisualOption(transferToContainer, method);
          transferToContainer.appendChild(btn);
        });
        
        setTimeout(() => {
          const amountInput = singleEntry.querySelector('#amountInput');
          if (amountInput) amountInput.focus();
        }, 100);
      }
    }

    incomeBtn.addEventListener('click', () => openTransactionModal('income'));
    expenseBtn.addEventListener('click', () => openTransactionModal('expense'));
    transferBtn.addEventListener('click', () => openTransactionModal('transfer'));

    closeTransactionModal.addEventListener('click', () => {
      transactionModal.classList.remove('show');
      expenseEntriesContainer.innerHTML = '';
      expenseEntryCount = 0;
    });

    transactionModal.addEventListener('click', (e) => {
      if (e.target === transactionModal) {
        transactionModal.classList.remove('show');
        expenseEntriesContainer.innerHTML = '';
        expenseEntryCount = 0;
      }
    });

    // Main app tab switching
    const financeTab = document.getElementById('financeTab');
    const habitTab = document.getElementById('habitTab');
    const financeContent = document.getElementById('financeContent');
    const habitContent = document.getElementById('habitContent');
    const bottomFinanceTab = document.getElementById('bottomFinanceTab');
    const bottomHabitTab = document.getElementById('bottomHabitTab');

    function switchToFinance() {
      if (financeTab) financeTab.classList.add('active');
      if (habitTab) habitTab.classList.remove('active');
      if (financeContent) financeContent.classList.add('active');
      if (habitContent) habitContent.classList.remove('active');
      if (bottomFinanceTab) bottomFinanceTab.classList.add('active');
      if (bottomHabitTab) bottomHabitTab.classList.remove('active');
    }

    function switchToHabit() {
      habitTab.classList.add('active');
      financeTab.classList.remove('active');
      habitContent.classList.add('active');
      financeContent.classList.remove('active');
      bottomHabitTab.classList.add('active');
      bottomFinanceTab.classList.remove('active');
    }

    financeTab.addEventListener('click', switchToFinance);
    habitTab.addEventListener('click', switchToHabit);
    bottomFinanceTab.addEventListener('click', switchToFinance);
    bottomHabitTab.addEventListener('click', switchToHabit);

    // Habit tab switching
    const viewHabitsTab = document.getElementById('viewHabitsTab');
    const viewHabitsSection = document.getElementById('viewHabitsSection');
    const createHabitSection = document.getElementById('createHabitSection');

    const addHabitBtn = document.getElementById('addHabitBtn');
    addHabitBtn.addEventListener('click', () => {
      createHabitSection.style.display = 'block';
      viewHabitsSection.style.display = 'none';
      document.getElementById('calendarHabitsSection').style.display = 'none';
      viewHabitsTab.classList.remove('active');
      viewHabitsTab.style.color = '#6b7280';
      viewHabitsTab.style.borderBottomColor = 'transparent';
      atomicHabitForm.reset();
      document.getElementById('identity').focus();
    });

    quickForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (activeType === 'expense') {
        // Handle multiple expenses
        const entries = document.querySelectorAll('.expense-entry');
        let successCount = 0;
        let totalAmount = 0;
        
        for (const entry of entries) {
          const amount = entry.querySelector('[data-field="amount"]').value;
          const description = entry.querySelector('[data-field="description"]').value;
          const envelopeBtn = entry.querySelector('[data-field="envelope"] .visual-option.selected');
          const paymentBtn = entry.querySelector('[data-field="payment"] .visual-option.selected');
          const expenseTypeBtn = entry.querySelector('[data-field="expenseType"] .visual-option.selected');
          const envelope = envelopeBtn ? envelopeBtn.dataset.value : '';
          const payment = paymentBtn ? paymentBtn.dataset.value : '';
          const expenseType = expenseTypeBtn ? expenseTypeBtn.dataset.value : '';
          
          const dateInput = entry.querySelector('[data-field="date"]');
          const selectedDateVal = dateInput ? dateInput.value : '';
          const entryDate = selectedDateVal ? new Date(selectedDateVal).toISOString() : new Date().toISOString();

          if (amount && description && envelope && payment && expenseType) {
            const transactionData = {
              id: Date.now() + successCount,
              type: 'expense',
              amount,
              description,
              envelope,
              payment,
              expenseType,
              date: entryDate
            };
            
            try {
              transactions.push(transactionData);
              
              if (typeof SafeFirebaseOps !== 'undefined') {
                await SafeFirebaseOps.addTransaction(transactionData);
                if (envelope) {
                  await SafeFirebaseOps.updateBudget(envelope, parseFloat(amount));
                }
              }
              
              successCount++;
              totalAmount += parseFloat(amount);
            } catch (error) {
              console.error('Error adding expense:', error);
            }
          } else {
            const missing = [];
            if (!amount) missing.push('amount');
            if (!description) missing.push('description');
            if (!envelope) missing.push('category');
            if (!payment) missing.push('payment');
            if (!expenseType) missing.push('type');
            showToast(`Missing: ${missing.join(', ')}`, 'error');
          }
        } // end for loop

        if (successCount > 0) {
          saveToLocalStorage();
          updateBalanceSummary();
          updateRecentTransactions();
          updatePaymentBalances();
          updateEnvelopeBudget();
          
          const message = successCount > 1 
            ? `${successCount} expenses added: Rs ${totalAmount.toLocaleString('en-IN')}`
            : `Expense: Rs ${totalAmount.toLocaleString('en-IN')}`;
          showToast(message, 'success');
          transactionModal.classList.remove('show');
          expenseEntriesContainer.innerHTML = '';
          expenseEntryCount = 0;
        } else {
          showToast('Please fill all required fields', 'error');
        }
        
      } else if (activeType === 'transfer') {
        const amount = document.getElementById('amountInput').value;
        const description = document.getElementById('descriptionInput').value;
        const transferFromContainer = document.getElementById('transferFromSelector');
        const transferToContainer = document.getElementById('transferToSelector');
        const fromBtn = transferFromContainer ? transferFromContainer.querySelector('.visual-option.selected') : null;
        const toBtn = transferToContainer ? transferToContainer.querySelector('.visual-option.selected') : null;
        const fromPayment = fromBtn ? fromBtn.dataset.value : '';
        const toPayment = toBtn ? toBtn.dataset.value : '';
        
        const transferDateInput = document.getElementById('transactionDate');
        const transferDateVal = transferDateInput ? transferDateInput.value : '';
        const transferDate = transferDateVal ? new Date(transferDateVal).toISOString() : new Date().toISOString();

        if (amount && fromPayment && toPayment) {
          const transactionData = {
            id: Date.now(),
            type: 'transfer',
            amount,
            description,
            from: fromPayment,
            to: toPayment,
            date: transferDate
          };
          
          try {
            transactions.push(transactionData);
            
            if (typeof SafeFirebaseOps !== 'undefined') {
              await SafeFirebaseOps.addTransaction(transactionData);
            }
            
            saveToLocalStorage();
            updateBalanceSummary();
            updateRecentTransactions();
            updatePaymentBalances();
            updateEnvelopeBudget();
            const message = `Transfer: Rs ${amount} from ${fromPayment} to ${toPayment}`;
            showToast(message, 'success');
            transactionModal.classList.remove('show');
            expenseEntriesContainer.innerHTML = '';
            expenseEntryCount = 0;
          } catch (error) {
            console.error('Error adding transfer:', error);
            showToast('Error adding transfer. Please try again.', 'error');
          }
        } else {
          if (!amount) showToast('Please enter amount', 'error');
          else if (!fromPayment) showToast('Please select "From" payment method', 'error');
          else if (!toPayment) showToast('Please select "To" payment method', 'error');
        }
        
      } else if (activeType === 'income') {
        const amount = document.getElementById('amountInput').value;
        const description = document.getElementById('descriptionInput').value;
        const paymentContainer = document.getElementById('incomePaymentSelector');
        const paymentBtn = paymentContainer ? paymentContainer.querySelector('.visual-option.selected') : null;
        const payment = paymentBtn ? paymentBtn.dataset.value : '';
        
        const incomeDateInput = document.getElementById('transactionDate');
        const incomeDateVal = incomeDateInput ? incomeDateInput.value : '';
        const incomeDate = incomeDateVal ? new Date(incomeDateVal).toISOString() : new Date().toISOString();

        if (amount && description && payment) {
          const transactionData = {
            id: Date.now(),
            type: 'income',
            amount,
            description,
            payment,
            date: incomeDate
          };
          
          try {
            transactions.push(transactionData);
            
            if (typeof SafeFirebaseOps !== 'undefined') {
              await SafeFirebaseOps.addTransaction(transactionData);
            }
            
            saveToLocalStorage();
            updateBalanceSummary();
            updateRecentTransactions();
            updatePaymentBalances();
            updateEnvelopeBudget();
            const message = `Income: Rs ${amount} - ${description}`;
            showToast(message, 'success');
            transactionModal.classList.remove('show');
            expenseEntriesContainer.innerHTML = '';
            expenseEntryCount = 0;
          } catch (error) {
            console.error('Error adding income:', error);
            showToast('Error adding income. Please try again.', 'error');
          }
        } else {
          if (!amount) showToast('Please enter amount', 'error');
          else if (!description) showToast('Please enter description', 'error');
          else if (!payment) showToast('Please select payment method', 'error');
        }
      }
    });
