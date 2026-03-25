// Main calendar component exports
export { Calendar } from './Calendar';
export { CalendarNavigation } from './CalendarNavigation';
export { CalendarGrid } from './CalendarGrid';

// Default export
export { Calendar as default } from './Calendar';

// Re-export types for convenience
export type {
  CalendarProps,
  CalendarNavigationProps,
  CalendarGridProps,
  CalendarDate,
  CalendarState,
  NavigationEvent,
  CalendarHookReturn,
} from '@/types/calendar';

// Re-export hooks for convenience
export { useCalendarState, useCalendarNavigation, useCalendarKeyboard } from '@/hooks/useCalendarState';

// Re-export utilities for convenience
export * from '@/utils/dateUtils';