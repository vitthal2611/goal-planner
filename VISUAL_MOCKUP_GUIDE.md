# 📸 Visual Mockup Guide - New UI

## 🎨 Complete Dashboard View

```
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║  ┌─────────────────────────────────────────────────────────────┐ ║
║  │ 💰 Budget Planner          [2026-01 ▼]  [⚙️]               │ ║
║  └─────────────────────────────────────────────────────────────┘ ║
║                                                                   ║
║  ┌─────────────────────────────────────────────────────────────┐ ║
║  │ 📊 INSIGHTS DASHBOARD                                       │ ║
║  │                                                             │ ║
║  │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │ ║
║  │ │ 💚       │ │ 💰       │ │ 💸       │ │ 🎯       │      │ ║
║  │ │ Financial│ │ Total    │ │ Total    │ │ Net      │      │ ║
║  │ │ Health   │ │ Income   │ │ Expenses │ │ Savings  │      │ ║
║  │ │          │ │          │ │          │ │          │      │ ║
║  │ │   ┌──┐   │ │ ₹50,000  │ │ ₹35,000  │ │ ₹15,000  │      │ ║
║  │ │   │70│   │ │          │ │          │ │ 30% rate │      │ ║
║  │ │   └──┘   │ │          │ │          │ │          │      │ ║
║  │ │ Excellent│ │          │ │          │ │          │      │ ║
║  │ └──────────┘ └──────────┘ └──────────┘ └──────────┘      │ ║
║  │                                                             │ ║
║  │ ⚠️ BUDGET ALERTS                                            │ ║
║  │ ┌─────────────────────────────────────────────────────────┐│ ║
║  │ │ 🚨  2 Over Budget                                       ││ ║
║  │ │     Some envelopes exceeded their limits                ││ ║
║  │ └─────────────────────────────────────────────────────────┘│ ║
║  │ ┌─────────────────────────────────────────────────────────┐│ ║
║  │ │ ⚡  1 Near Limit                                        ││ ║
║  │ │     Watch your spending in these categories             ││ ║
║  │ └─────────────────────────────────────────────────────────┘│ ║
║  │                                                             │ ║
║  │ 📊 TOP SPENDING CATEGORIES                                  │ ║
║  │ ┌─────────────────────────────────────────────────────────┐│ ║
║  │ │ #1  Food                    ₹12,000  34%               ││ ║
║  │ │     ████████████████████                                ││ ║
║  │ │                                                         ││ ║
║  │ │ #2  Transport               ₹8,000   23%               ││ ║
║  │ │     ████████████                                        ││ ║
║  │ │                                                         ││ ║
║  │ │ #3  Shopping                ₹5,000   14%               ││ ║
║  │ │     ████████                                            ││ ║
║  │ └─────────────────────────────────────────────────────────┘│ ║
║  └─────────────────────────────────────────────────────────────┘ ║
║                                                                   ║
║  ┌─────────────────────────────────────────────────────────────┐ ║
║  │ 📋 BUDGET ENVELOPES                          3 active       │ ║
║  │                                                             │ ║
║  │ ┌──────────┐ ┌──────────┐ ┌──────────┐                   │ ║
║  │ │ EMI   ✅ │ │ Food  ⚠️ │ │ Rent  🚨 │                   │ ║
║  │ │          │ │          │ │          │                   │ ║
║  │ │ ₹85,000  │ │ ₹12,000  │ │ ₹21,000  │                   │ ║
║  │ │ / ₹85,000│ │ / ₹15,000│ │ / ₹20,000│                   │ ║
║  │ │          │ │          │ │          │                   │ ║
║  │ │ ████████ │ │ ████████ │ │ ████████ │                   │ ║
║  │ │          │ │          │ │          │                   │ ║
║  │ │ ₹0 left  │ │ ₹3,000   │ │ ₹1,000   │                   │ ║
║  │ │ 100%     │ │ left 80% │ │ over 105%│                   │ ║
║  │ └──────────┘ └──────────┘ └──────────┘                   │ ║
║  └─────────────────────────────────────────────────────────────┘ ║
║                                                                   ║
║  ┌─────────────────────────────────────────────────────────────┐ ║
║  │ [💰 Income] [💸 Expense] [🔄 Transfer] [📋 Budget]         │ ║
║  └─────────────────────────────────────────────────────────────┘ ║
║                                                                   ║
║  ┌─────────────────────────────────────────────────────────────┐ ║
║  │ Add Transaction / Budget                                    │ ║
║  │ [Form fields here...]                                       │ ║
║  └─────────────────────────────────────────────────────────────┘ ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

## 🎨 Component Details

### 1. Financial Health Card

```
┌─────────────────────────┐
│ 💚 Financial Health     │ ← Green gradient top border
│                         │
│        ┌─────┐          │
│       ╱       ╲         │ ← Circular progress
│      │   70    │        │   (conic gradient)
│       ╲       ╱         │
│        └─────┘          │
│                         │
│      Excellent          │ ← Color-coded label
│                         │
└─────────────────────────┘
  ↑ Hover: Lifts up 4px
```

**Colors by Score:**
- 70-100: Green (#10b981)
- 40-69: Orange (#f59e0b)
- 0-39: Red (#ef4444)

---

### 2. Quick Stats Cards

```
┌─────────────────────────┐
│ 💰 Total Income         │ ← Blue gradient border
│                         │
│      ₹50,000            │ ← Large number (32px)
│                         │
└─────────────────────────┘

┌─────────────────────────┐
│ 💸 Total Expenses       │ ← Orange gradient border
│                         │
│      ₹35,000            │
│                         │
└─────────────────────────┘

┌─────────────────────────┐
│ 🎯 Net Savings          │ ← Purple gradient border
│                         │
│      ₹15,000            │ ← Green if positive
│      30% savings rate   │ ← Subtitle (13px)
│                         │
└─────────────────────────┘
```

---

### 3. Alert Cards

```
┌─────────────────────────────────────┐
│ 🚨  2 Over Budget                   │ ← Red background
│     Some envelopes exceeded limits  │   (#fef2f2)
└─────────────────────────────────────┘
  ↑ Red left border (4px)

┌─────────────────────────────────────┐
│ ⚡  1 Near Limit                    │ ← Yellow background
│     Watch spending in these areas   │   (#fffbeb)
└─────────────────────────────────────┘
  ↑ Orange left border (4px)
```

**Animation:** Slides in from left (0.3s)

---

### 4. Top Spending Item

```
┌───────────────────────────────────────────┐
│ #1  Food                    ₹12,000  34% │
│     ████████████████████                  │
└───────────────────────────────────────────┘
 ↑   ↑                        ↑       ↑
 │   │                        │       └─ Percentage
 │   │                        └───────── Amount
 │   └──────────────────────────────────── Category
 └──────────────────────────────────────── Gradient badge
```

**Badge Colors:** Blue-purple gradient (#3b82f6 → #8b5cf6)
**Progress Bar:** Animated fill (0.6s cubic-bezier)

---

### 5. Enhanced Budget Card

```
┌─────────────────────────┐ ← Gradient top border
│ Food              ⚠️    │   (changes with status)
│                         │
│ ₹12,000 / ₹15,000       │ ← Large spent / total
│                         │
│ ████████                │ ← Thick progress bar (10px)
│                         │   Color matches status
│                         │
│ ₹3,000 left        80%  │ ← Footer with badge
└─────────────────────────┘
  ↑ Hover: Lifts 4px + shadow
```

**Status Colors:**
- ✅ Healthy (<80%): Green gradient
- ⚠️ Warning (80-100%): Orange gradient
- 🚨 Over (>100%): Red gradient

---

### 6. Modern Tab Navigation

```
┌─────────────────────────────────────────┐
│ [💰 Income] [💸 Expense] [🔄 Transfer] │
│     ↑                                   │
│  Active: Gradient background + shadow   │
└─────────────────────────────────────────┘
```

**Active State:**
- Background: Blue-purple gradient
- Shadow: 0 4px 12px rgba(59, 130, 246, 0.3)
- Transform: translateY(-1px)

**Inactive State:**
- Background: Transparent
- Color: Gray (#6b7280)
- Hover: Light gray background

---

## 🎨 Color System

### Gradients

```
Primary:   ████████████ #3b82f6 → #8b5cf6
Success:   ████████████ #10b981 → #059669
Warning:   ████████████ #f59e0b → #d97706
Danger:    ████████████ #ef4444 → #dc2626
```

### Solid Colors

```
Text:      ████ #1f2937 (Dark gray)
Muted:     ████ #6b7280 (Medium gray)
Border:    ████ #e5e7eb (Light gray)
Background:████ #f9fafb (Very light gray)
White:     ████ #ffffff
```

---

## 📐 Spacing System

```
4px   ▪
8px   ▪▪
12px  ▪▪▪
16px  ▪▪▪▪
20px  ▪▪▪▪▪
24px  ▪▪▪▪▪▪
32px  ▪▪▪▪▪▪▪▪
```

**Usage:**
- Card padding: 20px
- Grid gap: 16px
- Section margin: 24px
- Header padding: 24px

---

## 🎭 Animation Showcase

### 1. Health Score Reveal
```
Frame 1: ○ (0deg, opacity 0)
Frame 2: ◔ (45deg, opacity 0.5)
Frame 3: ◑ (90deg, opacity 0.75)
Frame 4: ◕ (180deg, opacity 1)
Frame 5: ● (360deg, opacity 1)
Duration: 1s ease-out
```

### 2. Card Hover
```
Rest:  ┌─────┐
       │     │
       └─────┘

Hover: ┌─────┐  ← Lifts 4px
       │     │  ← Shadow grows
       └─────┘
       
Duration: 0.3s ease
```

### 3. Progress Bar Fill
```
Start: [          ]  0%
Mid:   [█████     ]  50%
End:   [██████████] 100%

Duration: 0.6s cubic-bezier(0.4, 0, 0.2, 1)
```

### 4. Alert Slide-In
```
Start: ←─┌─────┐  (translateX(-20px), opacity 0)
End:     ┌─────┐  (translateX(0), opacity 1)

Duration: 0.3s ease-out
```

---

## 📱 Responsive Layouts

### Desktop (>768px)
```
┌─────────────────────────────────┐
│ [Health] [Income] [Expense] [Savings] │ ← 4 columns
├─────────────────────────────────┤
│ [Alerts - Full Width]           │
├─────────────────────────────────┤
│ [Top Spending - Full Width]     │
├─────────────────────────────────┤
│ [Budget] [Budget] [Budget]      │ ← 3 columns
└─────────────────────────────────┘
```

### Tablet (768px)
```
┌───────────────────┐
│ [Health] [Income] │ ← 2 columns
│ [Expense][Savings]│
├───────────────────┤
│ [Alerts]          │
├───────────────────┤
│ [Top Spending]    │
├───────────────────┤
│ [Budget] [Budget] │ ← 2 columns
│ [Budget]          │
└───────────────────┘
```

### Mobile (<768px)
```
┌─────────┐
│ [Health]│ ← 1 column
│ [Income]│
│ [Expense]│
│ [Savings]│
│ [Alerts]│
│ [Spending]│
│ [Budget]│
│ [Budget]│
│ [Budget]│
└─────────┘
```

---

## 🎯 Interactive States

### Button States
```
Rest:    [  Button  ]
Hover:   [  Button  ] ← Slightly lifted
Active:  [  Button  ] ← Pressed down
Focus:   [  Button  ] ← Blue ring shadow
         └──────────┘
```

### Input States
```
Rest:    [          ]  ← Gray border
Focus:   [          ]  ← Blue border + ring
         └──────────┘
Error:   [          ]  ← Red border
         └──────────┘
```

### Card States
```
Rest:    ┌─────┐  ← Subtle shadow
         │     │
         └─────┘

Hover:   ┌─────┐  ← Lifted + larger shadow
         │     │
         └─────┘
```

---

## 💡 Visual Hierarchy

### Size Scale
```
Hero:     48px  ████████
Title:    32px  ██████
Heading:  24px  ████
Body:     16px  ██
Caption:  13px  █
```

### Weight Scale
```
Bold:     700  ████████
Semibold: 600  ██████
Medium:   500  ████
Regular:  400  ██
```

### Color Hierarchy
```
Primary:   ████████  (Most important)
Secondary: ██████    (Important)
Tertiary:  ████      (Supporting)
Muted:     ██        (Least important)
```

---

## 🎨 Design Tokens Reference

```css
/* Colors */
--primary: #3b82f6;
--success: #10b981;
--warning: #f59e0b;
--danger: #ef4444;

/* Spacing */
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;

/* Radius */
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;

/* Shadows */
--shadow-sm: 0 2px 8px rgba(0,0,0,0.06);
--shadow-md: 0 4px 16px rgba(0,0,0,0.12);
--shadow-lg: 0 8px 20px rgba(0,0,0,0.12);

/* Transitions */
--transition-fast: 0.2s ease;
--transition-base: 0.3s ease;
--transition-slow: 0.6s cubic-bezier(0.4, 0, 0.2, 1);
```

---

**Visual Guide Complete** ✅
**Ready for Implementation** 🚀
**Fully Responsive** 📱
