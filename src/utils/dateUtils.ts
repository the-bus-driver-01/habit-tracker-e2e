import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  isBefore,
  isAfter,
  addMonths,
  subMonths,
  format,
  parseISO,
  isValid,
  differenceInMonths,
  differenceInYears,
  getYear,
  getMonth,
  getDaysInMonth,
} from 'date-fns';
import { CalendarDate } from '@/types/calendar';

/**
 * Generates an array of CalendarDate objects for a given month
 */
export const generateCalendarDates = (
  currentDate: Date,
  selectedDate?: Date,
  minDate?: Date,
  maxDate?: Date,
  disabledDates: Date[] = [],
  highlightedDates: Date[] = []
): CalendarDate[] => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  return days.map((date): CalendarDate => {
    const isCurrentMonth = isSameMonth(date, currentDate);
    const isDateToday = isToday(date);
    const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;

    // Check if date is disabled
    const isBeforeMin = minDate ? isBefore(date, minDate) : false;
    const isAfterMax = maxDate ? isAfter(date, maxDate) : false;
    const isExplicitlyDisabled = disabledDates.some(disabledDate =>
      isSameDay(date, disabledDate)
    );

    const isEnabled = !isBeforeMin && !isAfterMax && !isExplicitlyDisabled;

    return {
      date,
      isCurrentMonth,
      isToday: isDateToday,
      isSelected,
      isEnabled,
    };
  });
};

/**
 * Navigates to the previous month
 */
export const navigateToPreviousMonth = (currentDate: Date, minDate?: Date): Date => {
  const newDate = subMonths(currentDate, 1);
  if (minDate && isBefore(newDate, minDate)) {
    return minDate;
  }
  return newDate;
};

/**
 * Navigates to the next month
 */
export const navigateToNextMonth = (currentDate: Date, maxDate?: Date): Date => {
  const newDate = addMonths(currentDate, 1);
  if (maxDate && isAfter(newDate, maxDate)) {
    return maxDate;
  }
  return newDate;
};

/**
 * Checks if navigation to previous month is allowed
 */
export const canNavigateToPrevious = (currentDate: Date, minDate?: Date): boolean => {
  if (!minDate) return true;
  const previousMonth = subMonths(currentDate, 1);
  return !isBefore(previousMonth, minDate);
};

/**
 * Checks if navigation to next month is allowed
 */
export const canNavigateToNext = (currentDate: Date, maxDate?: Date): boolean => {
  if (!maxDate) return true;
  const nextMonth = addMonths(currentDate, 1);
  return !isAfter(nextMonth, maxDate);
};

/**
 * Checks if two dates are in the same month and year
 */
export const isSameMonthAndYear = (date1: Date, date2: Date): boolean => {
  return isSameMonth(date1, date2);
};

/**
 * Formats a date for display in the calendar header
 */
export const formatCalendarHeader = (date: Date): string => {
  return format(date, 'MMMM yyyy');
};

/**
 * Formats a date for accessibility labels
 */
export const formatDateForScreenReader = (date: Date): string => {
  return format(date, 'EEEE, MMMM do, yyyy');
};

/**
 * Parses a date string and returns a valid Date object or null
 */
export const parseDate = (dateString: string): Date | null => {
  try {
    const date = parseISO(dateString);
    return isValid(date) ? date : null;
  } catch {
    return null;
  }
};

/**
 * Gets the number of weeks to display for a given month
 */
export const getWeeksInMonth = (date: Date): number => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const totalDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  }).length;

  return Math.ceil(totalDays / 7);
};

/**
 * Calculates the difference in months between two dates
 */
export const getMonthDifference = (startDate: Date, endDate: Date): number => {
  return differenceInMonths(endDate, startDate);
};

/**
 * Calculates the difference in years between two dates
 */
export const getYearDifference = (startDate: Date, endDate: Date): number => {
  return differenceInYears(endDate, startDate);
};

/**
 * Checks if a date is within a given range (inclusive)
 */
export const isDateInRange = (
  date: Date,
  startDate: Date,
  endDate: Date
): boolean => {
  return (isSameDay(date, startDate) || isAfter(date, startDate)) &&
         (isSameDay(date, endDate) || isBefore(date, endDate));
};

/**
 * Gets the first day of the week for a given date
 */
export const getWeekStart = (date: Date): Date => {
  return startOfWeek(date);
};

/**
 * Gets the last day of the week for a given date
 */
export const getWeekEnd = (date: Date): Date => {
  return endOfWeek(date);
};

/**
 * Validates if a date is selectable based on constraints
 */
export const isDateSelectable = (
  date: Date,
  minDate?: Date,
  maxDate?: Date,
  disabledDates: Date[] = []
): boolean => {
  // Check min/max constraints
  if (minDate && isBefore(date, minDate)) return false;
  if (maxDate && isAfter(date, maxDate)) return false;

  // Check explicitly disabled dates
  if (disabledDates.some(disabledDate => isSameDay(date, disabledDate))) {
    return false;
  }

  return true;
};

/**
 * Gets today's date with time set to midnight
 */
export const getToday = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

/**
 * Creates a date object with time set to midnight
 */
export const createDateAtMidnight = (year: number, month: number, day: number): Date => {
  const date = new Date(year, month, day);
  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * Clones a date object
 */
export const cloneDate = (date: Date): Date => {
  return new Date(date.getTime());
};