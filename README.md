# Habit Tracker Calendar Component

A React calendar component for the Habit Tracker application.

## Features

### Calendar Grid Layout
- Professional calendar grid displaying the current month
- Each week is displayed as a row with 7 columns (Monday-Sunday)
- Responsive grid layout built with CSS Grid
- Located in: `src/components/Calendar/CalendarGrid.tsx`

### Day Labels
- Clear day-of-week labels (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
- Consistent formatting and styling
- Located in: `src/components/Calendar/WeekDayLabels.tsx`

### Current Month Display
- Displays the current month and year in the header
- Automatically updates when navigating between months
- Format: "Month Year" (e.g., "March 2026")
- Located in: `src/components/Calendar/CalendarHeader.tsx`

### Month Navigation
- Previous month button (←) and Next month button (→)
- Click handlers to navigate between months
- Updates the entire calendar grid when a month is selected
- Callback functions for parent component integration (`onMonthChange`)
- Located in: `src/components/Calendar/CalendarHeader.tsx` (lines 10-34)

## Component Structure

- **CalendarGrid**: Main component that orchestrates the calendar
- **CalendarHeader**: Displays month/year and provides navigation controls
- **WeekDayLabels**: Renders the day-of-week labels
- **DayCell**: Individual day cell component
- **Calendar.module.css**: Modular styles for all calendar elements
- **dateUtils.ts**: Utility functions for date calculations and formatting

## Date Utilities

Helper functions for calendar calculations:
- `getWeeksForMonth()`: Returns all weeks for a given month
- `getMonthYearString()`: Formats date as "Month Year"
- `getPreviousMonth()`: Gets the previous month
- `getNextMonth()`: Gets the next month
- And many more utility functions for date manipulation

## Testing

Comprehensive test suite covering:
- Grid layout and structure
- Day labels rendering
- Month display and navigation
- Date selection
- Accessibility features
- Edge cases and month boundaries

Run tests with: `npm test`

## Building

Build the project with: `npm run build`