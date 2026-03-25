# Habit Tracker - Day Cell Components

A React/Next.js implementation of day cell components for habit tracking with check-in states.

## Features

The `DayCell` component provides visual representation of habit completion status for individual days:

- ✅ **Completed habits**: Filled circles with habit colors
- ⭕ **Incomplete habits**: Empty circles with habit color borders
- ⚪ **No data**: Gray circles for habits without check-in data
- 📊 **Completion summary**: Shows completion ratio (e.g., "3/4")
- 🎨 **Visual states**: Different background colors based on overall completion
  - Green: All habits completed
  - Yellow: Partial completion
  - Red: No habits completed (all incomplete)
  - Gray: No data available

## Component API

### DayCell

```tsx
<DayCell
  data={dayCellData}
  onClick={(date) => console.log(`Clicked: ${date}`)}
  className="custom-class"
/>
```

**Props:**
- `data: DayCellData` - Contains date and habit statuses
- `onClick?: (date: string) => void` - Optional click handler
- `className?: string` - Additional CSS classes

### HabitIndicator

```tsx
<HabitIndicator
  habitStatus={habitStatus}
  size="medium"
/>
```

**Props:**
- `habitStatus: HabitStatus` - Habit and its completion status
- `size?: 'small' | 'medium' | 'large'` - Indicator size

## Data Types

```typescript
interface DayCellData {
  date: string; // ISO date string (YYYY-MM-DD)
  habitStatuses: HabitStatus[];
}

interface HabitStatus {
  habit: Habit;
  status: CheckInStatus;
  checkIn?: CheckIn;
}

enum CheckInStatus {
  COMPLETED = 'completed',
  INCOMPLETE = 'incomplete',
  NO_DATA = 'no_data'
}
```

## Usage Example

```typescript
import DayCell from '@/components/DayCell';
import { buildDayCellData } from '@/utils/habitUtils';

const habits: Habit[] = [...]; // Your habits
const checkIns: CheckIn[] = [...]; // Your check-ins

const dayCellData = buildDayCellData('2026-03-25', habits, checkIns);

<DayCell
  data={dayCellData}
  onClick={(date) => handleDayClick(date)}
/>
```

## Acceptance Criteria ✅

1. **Individual day cell rendering**: ✅ Day cells show appropriate visual states (completed, incomplete, no data) for each habit
2. **Multiple habits support**: ✅ Day cells display completion status for all active habits on the given date

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check
```

## Demo Pages

- `/` - Basic demo with sample data
- `/demo` - Comprehensive component demonstration

## File Structure

```
├── components/
│   ├── DayCell.tsx          # Main day cell component
│   └── DayCellDemo.tsx      # Demo component
├── types/
│   └── habit.ts             # TypeScript interfaces
├── utils/
│   └── habitUtils.ts        # Helper functions
├── data/
│   └── sampleData.ts        # Sample data for testing
└── pages/
    ├── index.tsx            # Basic demo page
    └── demo.tsx             # Comprehensive demo page
```