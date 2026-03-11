# Budget Planner - Visual Guide

## 🎨 User Interface Layout

### Desktop View (>768px)
```
┌─────────────────────────────────────────────────────────┐
│  💰 Budget Planner                          [Logout]    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Month: [2026-01 ▼]                                     │
│                                                          │
│  [📊 Overview] [💰 Income] [💸 Expense] [🔄 Transfer]  │
│  [📋 Budget] [⚙️ Profile]                              │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │  Tab Content (Forms, Summary, Lists)           │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Mobile View (<480px)
```
┌──────────────────────────┐
│ 💰 Budget Planner [Logout]│
├──────────────────────────┤
│ Month: [2026-01 ▼]       │
├──────────────────────────┤
│ [📊][💰][💸][🔄][📋][⚙️] │
├──────────────────────────┤
│                          │
│  Tab Content            │
│  (Full Width)           │
│                          │
└──────────────────────────┘
```

## 📊 Overview Tab

```
┌─────────────────────────────────────────────────────────┐
│                    Summary Cards                         │
├──────────────┬──────────────┬──────────────┬────────────┤
│ 💰 Income    │ 💸 Expense   │ 📋 Budget    │ Balance    │
│ ₹100,000     │ ₹25,000      │ ₹100,000     │ ₹75,000    │
└──────────────┴──────────────┴──────────────┴────────────┘

┌─────────────────────────────────────────────────────────┐
│              Envelope Status                             │
├─────────────────────────────────────────────────────────┤
│ EMI                                                      │
│ ₹5,000 / ₹85,000  [████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] │
│ ₹80,000 left                                      6%    │
│                                                          │
│ DMART                                                    │
│ ₹8,000 / ₹10,000  [████████░░░░░░░░░░░░░░░░░░░░░░░░░░] │
│ ₹2,000 left                                      80%    │
│                                                          │
│ EATOUT                                                   │
│ ₹5,500 / ₹5,000   [██████████████░░░░░░░░░░░░░░░░░░░░░] │
│ Over by ₹500                                    110%    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              Recent Transactions                         │
├─────────────────────────────────────────────────────────┤
│ 💸 Groceries                                            │
│    [DMART] HDFC                          -₹500 Jan 15  │
│                                                          │
│ 💰 Salary                                               │
│    HDFC                                  +₹100,000 Jan 1│
│                                                          │
│ 💸 EMI                                                  │
│    [EMI] HDFC                            -₹5,000 Jan 5 │
└─────────────────────────────────────────────────────────┘
```

## 💰 Income Form

```
┌─────────────────────────────────────────────────────────┐
│ 💰 Add Income                                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Description                                             │
│ [Salary                                    ]            │
│                                                          │
│ Amount                                                  │
│ [100000                                    ]            │
│                                                          │
│ Payment Method                                          │
│ [HDFC                                    ▼]            │
│                                                          │
│ [Add Income]                                            │
│                                                          │
│ ✓ Income added successfully!                            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 💸 Expense Form

```
┌─────────────────────────────────────────────────────────┐
│ 💸 Add Expense                                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Description                                             │
│ [Groceries                                 ]            │
│                                                          │
│ Category (Envelope)                                     │
│ [DMART                                   ▼]            │
│                                                          │
│ Amount                                                  │
│ [500                                       ]            │
│                                                          │
│ Payment Method                                          │
│ [HDFC                                    ▼]            │
│                                                          │
│ [Add Expense]                                           │
│                                                          │
│ ✓ Expense added successfully!                           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 🔄 Transfer Form

```
┌─────────────────────────────────────────────────────────┐
│ 🔄 Transfer Funds                                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ From Payment Method                                     │
│ [HDFC                                    ▼]            │
│                                                          │
│ To Payment Method                                       │
│ [SBI Credit Card                         ▼]            │
│                                                          │
│ Amount                                                  │
│ [20000                                     ]            │
│                                                          │
│ Description (Optional)                                  │
│ [Monthly transfer                          ]            │
│                                                          │
│ [Transfer Funds]                                        │
│                                                          │
│ ✓ Transfer completed successfully!                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 📋 Budget Form

```
┌──────────────────────────┬──────────────────────────┐
│                          │                          │
│ 📋 Allocate Budget       │ Current Budgets          │
│                          │                          │
│ Category (Envelope)      │ EMI                      │
│ [DMART            ▼]     │ ₹85,000                  │
│                          │                          │
│ Budget Amount            │ DMART                    │
│ [10000            ]      │ ₹10,000                  │
│                          │                          │
│ [Allocate Budget]        │ EATOUT                   │
│                          │ ₹5,000                   │
│ ✓ Budget allocated!      │                          │
│                          │                          │
└──────────────────────────┴──────────────────────────┘
```

## ⚙️ Profile Settings

```
┌─────────────────────────────────────────────────────────┐
│ 📁 Manage Envelopes (Categories)                         │
├─────────────────────────────────────────────────────────┤
│ [New Envelope Name        ] [Add Envelope]              │
│                                                          │
│ Current Envelopes:                                      │
│ [📁 EMI] [📁 DMART] [📁 EATOUT] [📁 Groceries]         │
│                                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 💳 Manage Payment Methods                                │
├─────────────────────────────────────────────────────────┤
│ [New Method Name    ] [Type ▼] [Add Method]             │
│                                                          │
│ Current Payment Methods:                                │
│ ┌──────────────────┐ ┌──────────────────┐              │
│ │ 💳 HDFC          │ │ 💳 SBI Credit    │              │
│ │ Bank             │ │ Credit Card      │              │
│ └──────────────────┘ └──────────────────┘              │
│                                                          │
│ ┌──────────────────┐ ┌──────────────────┐              │
│ │ 💳 Wallet        │ │ 💳 Cash          │              │
│ │ Wallet           │ │ Cash             │              │
│ └──────────────────┘ └──────────────────┘              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│  (Dashboard, Forms, Summary, Transactions)              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  BudgetContext                           │
│  (State Management, Data Loading, Calculations)         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   SheetsAPI Service                      │
│  (CRUD Operations, Caching, Sheet Management)           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  GoogleAuth Service                      │
│  (OAuth2 Token Management)                              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Google Sheets API (v4)                      │
│  (Spreadsheet CRUD, Range Operations)                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Google Drive Storage                        │
│  (Budget Tracker Spreadsheet)                           │
└─────────────────────────────────────────────────────────┘
```

## 📱 Responsive Breakpoints

```
Mobile (<480px)          Tablet (481-768px)       Desktop (>768px)
┌──────────────┐        ┌──────────────────┐     ┌─────────────────────┐
│ 💰 Budget    │        │ 💰 Budget Planner│     │ 💰 Budget Planner   │
│ [Logout]     │        │ [Logout]         │     │ [Logout]            │
├──────────────┤        ├──────────────────┤     ├─────────────────────┤
│ Month: [▼]   │        │ Month: [▼]       │     │ Month: [▼]          │
├──────────────┤        ├──────────────────┤     ├─────────────────────┤
│ [📊][💰]     │        │ [📊 Overview]    │     │ [📊 Overview]       │
│ [💸][🔄]     │        │ [💰 Income]      │     │ [💰 Income]         │
│ [📋][⚙️]     │        │ [💸 Expense]     │     │ [💸 Expense]        │
├──────────────┤        │ [🔄 Transfer]    │     │ [🔄 Transfer]       │
│              │        │ [📋 Budget]      │     │ [📋 Budget]         │
│ Content      │        │ [⚙️ Profile]     │     │ [⚙️ Profile]        │
│              │        ├──────────────────┤     ├─────────────────────┤
│              │        │                  │     │                     │
│              │        │ Content          │     │ Content             │
│              │        │                  │     │                     │
└──────────────┘        └──────────────────┘     └─────────────────────┘
```

## 🎯 User Journey

```
1. AUTHENTICATION
   ┌─────────────────────────────────────────┐
   │ User Opens App                          │
   │ ↓                                       │
   │ Click "Authorize Google Sheets"         │
   │ ↓                                       │
   │ Google Login & Permission Grant         │
   │ ↓                                       │
   │ Spreadsheet Created/Found               │
   │ ↓                                       │
   │ Sheets Initialized                      │
   │ ↓                                       │
   │ Dashboard Loaded                        │
   └─────────────────────────────────────────┘

2. SETUP PHASE
   ┌─────────────────────────────────────────┐
   │ Go to Profile Tab                       │
   │ ↓                                       │
   │ Add Payment Methods                     │
   │ ↓                                       │
   │ Add Envelopes/Categories                │
   │ ↓                                       │
   │ Setup Complete                          │
   └─────────────────────────────────────────┘

3. BUDGET PHASE
   ┌─────────────────────────────────────────┐
   │ Go to Budget Tab                        │
   │ ↓                                       │
   │ Select Envelope                         │
   │ ↓                                       │
   │ Enter Budget Amount                     │
   │ ↓                                       │
   │ Allocate Budget                         │
   │ ↓                                       │
   │ Repeat for All Envelopes                │
   └─────────────────────────────────────────┘

4. TRANSACTION PHASE
   ┌─────────────────────────────────────────┐
   │ Add Income (Income Tab)                 │
   │ ↓                                       │
   │ Add Expenses (Expense Tab)              │
   │ ↓                                       │
   │ Transfer Funds (Transfer Tab)           │
   │ ↓                                       │
   │ View Summary (Overview Tab)             │
   └─────────────────────────────────────────┘

5. REVIEW PHASE
   ┌─────────────────────────────────────────┐
   │ View Overview Tab                       │
   │ ↓                                       │
   │ Check Summary Cards                     │
   │ ↓                                       │
   │ Review Envelope Status                  │
   │ ↓                                       │
   │ Check Recent Transactions               │
   │ ↓                                       │
   │ Adjust Budget if Needed                 │
   └─────────────────────────────────────────┘
```

## 💾 Data Storage

```
Google Drive
    │
    └── Budget Tracker (Spreadsheet)
        │
        ├── Transactions Sheet
        │   ├── Month
        │   ├── Type
        │   ├── Description
        │   ├── Envelope
        │   ├── Amount
        │   ├── Payment Method
        │   ├── Date
        │   └── ID
        │
        ├── Budgets Sheet
        │   ├── Month
        │   ├── Envelope
        │   ├── Budgeted
        │   └── Spent
        │
        ├── Envelopes Sheet
        │   ├── Name
        │   └── Active
        │
        └── PaymentMethods Sheet
            ├── Name
            ├── Type
            └── Active
```

## 🎨 Color Scheme

```
Primary Colors:
- Blue (#007bff) - Primary actions, links
- Green (#28a745) - Income, positive
- Red (#dc3545) - Expense, negative
- Orange (#fd7e14) - Transfer-Out
- Cyan (#0dcaf0) - Transfer-In

Background:
- Light Gray (#f8f9fa) - Main background
- White (#ffffff) - Cards, forms
- Dark Gray (#333333) - Text

Status:
- Green (#28a745) - Under budget
- Red (#dc3545) - Over budget
- Gray (#999999) - Neutral
```

## 📊 Summary Cards

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ 💰 Income        │  │ 💸 Expense       │  │ 📋 Budget        │  │ Balance          │
│ ₹100,000         │  │ ₹25,000          │  │ ₹100,000         │  │ ₹75,000          │
│ (Green)          │  │ (Red)            │  │ (Blue)           │  │ (Green/Red)      │
└──────────────────┘  └──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

This visual guide helps understand the app structure, layout, and user flow.
