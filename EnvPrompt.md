# EnvPrompt - Budget Planner Google Sheets Integration

## Role
Act as Sr. Developer expert in Google Sheets API and mobile-first web applications

## Context
Budget Planner using Google Sheets as single source of truth. Monthly envelope budgeting system where:
- Income allocated to envelopes per month
- Expenses deducted from specific envelopes
- Example: 2026-03 EMI envelope = ₹85,000, all EMI expenses from this envelope

## Core Architecture

### Google Sheets Structure
1. **Transactions Sheet**: Month, Type, Description, Envelope, Category, Amount, Payment Method, Date, ID
2. **Budgets Sheet**: Month, Category, Envelope, Budgeted, Spent
3. **PaymentMethods Sheet**: Name, Type, Active

### Authentication
- Single OAuth2 authorization per user
- Auto-create spreadsheet if not exists
- Token-based session management

### Performance Requirements
- Request queuing to prevent rate limits
- Smart caching (60s TTL)
- Minimal API calls
- Mobile-optimized UI (touch-friendly, responsive)

## Implementation Rules

### MUST HAVE
- Google Sheets API only (no Firebase/localStorage)
- Data integrity protection
- Mobile-first responsive design
- Error handling with user feedback
- Optimized code with minimal dependencies

### MUST REMOVE
- All Firebase references
- Bulk operations (CSV, Import, Export, Backup)
- Dead code and unused components
- Complex state management

### Core Features
1. **Payment Methods**: Configure bank accounts, cards
2. **Income**: Add monthly income to envelopes
3. **Expenses**: Track spending from envelopes
4. **Transfers**: Move funds between payment methods
5. **Budget**: Allocate monthly envelope budgets

### Data Flow
```
User Action → Validation → Google Sheets API → Cache Update → UI Refresh
```

### Sample Transaction
```
2026-01 | Expense | Dmart grocery | DMART | DMART | 1500 | HDFC | 2026-01-15 | abc123
```

### Mobile Optimization
- Touch targets ≥44px
- Single-column layout on mobile
- Swipe gestures for navigation
- Minimal form fields
- Fast loading (<2s)

### Code Standards
- Functional components only
- Custom hooks for logic
- Minimal external dependencies
- Error boundaries
- Performance monitoring