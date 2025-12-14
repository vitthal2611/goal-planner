# Multi-Year Features Usage Examples

## 1️⃣ Year-over-Year Comparison Cards

### Basic Usage in Dashboard
```jsx
import { YearComparisonSection } from './components/dashboard/YearComparisonSection';

// In your Dashboard component
<YearComparisonSection 
  currentYearData={{ goals, habits, habitLogs }}
  previousYearData={yearData[selectedYear - 1]}
/>
```

### Individual Comparison Card
```jsx
import { YearComparisonCard } from './components/dashboard/YearComparisonCard';

<YearComparisonCard
  title="Goal Completion Rate"
  currentValue={85}
  previousValue={72}
  unit="%"
  format="percentage"
/>
```

## 2️⃣ Archive Year Feature

### Archive Dialog Usage
```jsx
import { ArchiveYearDialog } from './components/common/ArchiveYearDialog';

const [showArchiveDialog, setShowArchiveDialog] = useState(false);

<ArchiveYearDialog
  open={showArchiveDialog}
  onClose={() => setShowArchiveDialog(false)}
  onConfirm={() => archiveYear(selectedYear)}
  year={selectedYear}
/>
```

### Updated Year Context Usage
```jsx
import { useYear } from './context/YearContext';

const { 
  isArchived, 
  showArchivedYears, 
  setShowArchivedYears,
  availableYears,
  archiveYear 
} = useYear();
```

## 3️⃣ Goal Rollover Feature

### Rollover Dialog Usage
```jsx
import { GoalRolloverDialog } from './components/goals/GoalRolloverDialog';

<GoalRolloverDialog
  open={showRolloverDialog}
  onClose={() => setShowRolloverDialog(false)}
  onConfirm={(rolledOverGoals) => {
    // Add rolled over goals to new year
    addGoals(rolledOverGoals);
  }}
  goals={previousYearGoals}
  newYear={2024}
/>
```

### Rollover Utilities
```jsx
import { categorizeGoalsForRollover, processGoalRollover } from './utils/rolloverUtils';

const { completed, incomplete } = categorizeGoalsForRollover(goals);
const rolledOverGoals = processGoalRollover(selectedGoals, newYear);
```

## 4️⃣ AI Suggestions Feature

### Suggestions Dialog Usage
```jsx
import { NextYearSuggestionCard } from './components/goals/NextYearSuggestionCard';
import { generateNextYearSuggestions } from './utils/suggestionUtils';

const suggestions = generateNextYearSuggestions({ goals, habits, habitLogs });

{suggestions.map(suggestion => (
  <NextYearSuggestionCard
    key={suggestion.id}
    suggestion={suggestion}
    onApply={(suggestion) => {
      // Handle applying suggestion
      if (suggestion.actionable) {
        // Create new goal with suggested target
      }
    }}
  />
))}
```

## Complete Integration Example

```jsx
// Enhanced Dashboard with all features
import { EnhancedDashboard } from './components/dashboard/EnhancedDashboard';

// Replace your existing Dashboard with:
<EnhancedDashboard />
```

## Key Features Summary

✅ **Year Comparison Cards** - Compare metrics between years
✅ **Archive Year** - Archive completed years with confirmation
✅ **Goal Rollover** - Preview and select goals to roll over
✅ **AI Suggestions** - Rule-based suggestions for next year planning
✅ **Enhanced Year Context** - Support for archived years and metadata
✅ **Card-based UI** - Consistent with existing design system