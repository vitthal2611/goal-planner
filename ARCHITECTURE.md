# New Architecture Documentation

## Overview

The application now follows a **Layered Architecture** pattern with clear separation of concerns.

## Architecture Layers

### 1. Infrastructure Layer (`core/repositories/`)
**Responsibility**: Data access and persistence

```javascript
// Example: FirebaseRepository
class FirebaseRepository {
  async save(path, data) { /* Firebase logic */ }
  async load(path) { /* Firebase logic */ }
}
```

**Key Files**:
- `firebaseRepository.js` - Firebase database operations
- `localStorageRepository.js` - Browser storage operations
- `budgetRepository.js` - Unified budget data access

### 2. Domain Layer (`features/*/services/`)
**Responsibility**: Business logic and rules

```javascript
// Example: BudgetService
class BudgetService {
  allocateBudget(envelopes, category, name, amount, totalIncome) {
    // Validation and business rules
    if (amount > totalIncome) throw new Error('Insufficient income');
    // Return updated state
  }
}
```

**Key Services**:
- `budgetService.js` - Budget allocation logic
- `envelopeService.js` - Envelope calculations (rollover, balance, status)
- `transactionService.js` - Transaction creation and validation
- `paymentMethodService.js` - Payment method management

### 3. Application Layer (`features/*/hooks/`)
**Responsibility**: Application state and orchestration

```javascript
// Example: useBudget hook
export const useBudget = () => {
  const { state, dispatch, services } = useApp();
  
  const allocate = useCallback((category, name, amount) => {
    const updated = services.budgetService.allocateBudget(...);
    dispatch({ type: 'BUDGET_ALLOCATED', payload: updated });
  }, []);
  
  return { allocate, income, envelopes };
};
```

**Key Hooks**:
- `useBudget.js` - Budget operations
- `useEnvelopes.js` - Envelope operations
- `useTransactions.js` - Transaction operations
- `usePaymentMethods.js` - Payment method operations

### 4. Presentation Layer (`components/`)
**Responsibility**: UI rendering only

```javascript
// Example: Component
const BudgetView = () => {
  const { allocate, income } = useBudget();
  
  return (
    <div>
      <input onChange={(e) => allocate(cat, name, e.target.value)} />
    </div>
  );
};
```

## Data Flow

```
User Action (Component)
    ↓
Hook (useBudget)
    ↓
Service (BudgetService)
    ↓
Repository (BudgetRepository)
    ↓
Data Source (Firebase/LocalStorage)
```

## State Management

### Centralized State (`AppContext`)

```javascript
const state = {
  currentPeriod: '2024-01',
  monthlyData: {
    '2024-01': {
      income: 50000,
      envelopes: { needs: { rent: { budgeted: 15000 } } },
      transactions: []
    }
  },
  customPaymentMethods: ['Cash', 'UPI'],
  dataLoaded: true,
  notification: { type: '', message: '' }
};
```

### Actions

```javascript
// Budget actions
{ type: 'BUDGET_ALLOCATED', payload: updatedEnvelopes }
{ type: 'INCOME_UPDATED', payload: newIncome }

// Transaction actions
{ type: 'TRANSACTION_ADDED', payload: transaction }
{ type: 'TRANSACTION_DELETED', payload: transactionId }

// Envelope actions
{ type: 'ENVELOPE_CREATED', payload: { category, name } }
{ type: 'ENVELOPE_DELETED', payload: { category, name } }

// System actions
{ type: 'SET_CURRENT_PERIOD', payload: '2024-02' }
{ type: 'SET_MONTHLY_DATA', payload: monthlyData }
{ type: 'SET_PAYMENT_METHODS', payload: methods }
{ type: 'SET_NOTIFICATION', payload: { type, message } }
```

## Dependency Injection

Services are injected at the root level:

```javascript
// App.jsx
const firebaseRepo = new FirebaseRepository();
const localStorageRepo = new LocalStorageRepository();
const budgetRepo = new BudgetRepository(firebaseRepo, localStorageRepo);

const budgetService = new BudgetService(budgetRepo);
const envelopeService = new EnvelopeService();
const transactionService = new TransactionService(envelopeService);

const services = { budgetService, envelopeService, transactionService };

<AppProvider services={services}>
  <App />
</AppProvider>
```

## Benefits

### 1. Testability
```javascript
// Easy to test services in isolation
const mockRepo = { save: jest.fn(), load: jest.fn() };
const service = new BudgetService(mockRepo);
expect(service.allocateBudget(...)).toThrow('Insufficient income');
```

### 2. Maintainability
- Small, focused files (50-200 lines)
- Single Responsibility Principle
- Easy to locate and fix bugs

### 3. Reusability
```javascript
// Services can be reused across features
const envelopeService = new EnvelopeService();
// Used by both TransactionService and EnvelopeHook
```

### 4. Scalability
```javascript
// Easy to add new features
features/
├── reports/          // New feature
│   ├── hooks/
│   ├── services/
│   └── components/
```

### 5. Performance
```javascript
// Better memoization
const value = useMemo(() => ({ state, dispatch, services }), [state, services]);
```

## Design Patterns Used

1. **Repository Pattern**: Abstracts data access
2. **Service Layer Pattern**: Encapsulates business logic
3. **Facade Pattern**: Hooks provide simple interface to complex services
4. **Dependency Injection**: Services injected at root
5. **Observer Pattern**: React Context for state management

## Code Organization

### Feature-Based Structure
```
features/
├── budget/
│   ├── components/    # Budget-specific UI
│   ├── hooks/         # Budget state management
│   └── services/      # Budget business logic
├── envelopes/
├── transactions/
└── payments/
```

### Shared Resources
```
shared/
├── components/        # Reusable UI components
├── hooks/            # Reusable hooks
└── utils/            # Utility functions
```

### Core Infrastructure
```
core/
├── repositories/     # Data access layer
├── context/         # Global state
└── config/          # Configuration
```

## Best Practices

1. **Components**: Only UI logic, no business logic
2. **Hooks**: Orchestrate services, manage local state
3. **Services**: Pure functions, no React dependencies
4. **Repositories**: Only data access, no business logic

## Migration Path

1. ✅ Phase 1: Foundation (Repositories, Context)
2. ✅ Phase 2: Features (Services, Hooks)
3. ✅ Phase 3: Components (Refactored UI)
4. ⏳ Phase 4: Cleanup (Remove old code)
5. ⏳ Phase 5: Testing (Unit & Integration tests)

## Future Enhancements

1. Add TypeScript for type safety
2. Implement unit tests for services
3. Add integration tests for hooks
4. Create component library
5. Add E2E tests with Playwright
