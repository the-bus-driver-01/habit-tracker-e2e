import { useState, useCallback, useMemo } from 'react';
import { addMonths, subMonths } from 'date-fns';
import { CalendarHookReturn, CalendarDate } from '@/types/calendar';
import {
  generateCalendarDates,
  navigateToPreviousMonth,
  navigateToNextMonth,
  canNavigateToPrevious,
  canNavigateToNext,
  getToday,
  isDateSelectable,
} from '@/utils/dateUtils';

interface UseCalendarStateOptions {
  initialDate?: Date;
  initialSelectedDate?: Date;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  highlightedDates?: Date[];
  onDateSelect?: (date: Date) => void;
  onMonthChange?: (date: Date) => void;
}

export const useCalendarState = (options: UseCalendarStateOptions = {}): CalendarHookReturn => {
  const {
    initialDate = getToday(),
    initialSelectedDate,
    minDate,
    maxDate,
    disabledDates = [],
    highlightedDates = [],
    onDateSelect,
    onMonthChange,
  } = options;

  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialSelectedDate);

  // Navigate to previous month
  const navigateToMonth = useCallback((direction: 'previous' | 'next') => {
    setCurrentDate(prevDate => {
      let newDate: Date;

      if (direction === 'previous') {
        if (!canNavigateToPrevious(prevDate, minDate)) {
          return prevDate;
        }
        newDate = navigateToPreviousMonth(prevDate, minDate);
      } else {
        if (!canNavigateToNext(prevDate, maxDate)) {
          return prevDate;
        }
        newDate = navigateToNextMonth(prevDate, maxDate);
      }

      // Call onMonthChange callback if provided
      onMonthChange?.(newDate);

      return newDate;
    });
  }, [minDate, maxDate, onMonthChange]);

  // Navigate to a specific date (changes the viewed month)
  const navigateToDate = useCallback((date: Date) => {
    setCurrentDate(date);
    onMonthChange?.(date);
  }, [onMonthChange]);

  // Select a date
  const selectDate = useCallback((date: Date) => {
    // Check if the date is selectable
    if (!isDateSelectable(date, minDate, maxDate, disabledDates)) {
      return;
    }

    setSelectedDate(date);
    onDateSelect?.(date);
  }, [minDate, maxDate, disabledDates, onDateSelect]);

  // Reset to today
  const resetToToday = useCallback(() => {
    const today = getToday();
    setCurrentDate(today);
    onMonthChange?.(today);
  }, [onMonthChange]);

  // Generate calendar dates for the current month
  const calendarDates = useMemo((): CalendarDate[] => {
    return generateCalendarDates(
      currentDate,
      selectedDate,
      minDate,
      maxDate,
      disabledDates,
      highlightedDates
    );
  }, [currentDate, selectedDate, minDate, maxDate, disabledDates, highlightedDates]);

  return {
    currentDate,
    selectedDate,
    navigateToMonth,
    navigateToDate,
    selectDate,
    resetToToday,
    calendarDates,
  };
};

// Additional hook for managing calendar navigation state
interface UseCalendarNavigationOptions {
  currentDate: Date;
  minDate?: Date;
  maxDate?: Date;
  onNavigate: (date: Date) => void;
}

export const useCalendarNavigation = (options: UseCalendarNavigationOptions) => {
  const { currentDate, minDate, maxDate, onNavigate } = options;

  const canGoToPrevious = useMemo(() => {
    return canNavigateToPrevious(currentDate, minDate);
  }, [currentDate, minDate]);

  const canGoToNext = useMemo(() => {
    return canNavigateToNext(currentDate, maxDate);
  }, [currentDate, maxDate]);

  const goToPrevious = useCallback(() => {
    if (canGoToPrevious) {
      const newDate = navigateToPreviousMonth(currentDate, minDate);
      onNavigate(newDate);
    }
  }, [currentDate, minDate, canGoToPrevious, onNavigate]);

  const goToNext = useCallback(() => {
    if (canGoToNext) {
      const newDate = navigateToNextMonth(currentDate, maxDate);
      onNavigate(newDate);
    }
  }, [currentDate, maxDate, canGoToNext, onNavigate]);

  const goToMonth = useCallback((monthIndex: number) => {
    const newDate = new Date(currentDate.getFullYear(), monthIndex, 1);
    onNavigate(newDate);
  }, [currentDate, onNavigate]);

  const goToYear = useCallback((year: number) => {
    const newDate = new Date(year, currentDate.getMonth(), 1);
    onNavigate(newDate);
  }, [currentDate, onNavigate]);

  return {
    canGoToPrevious,
    canGoToNext,
    goToPrevious,
    goToNext,
    goToMonth,
    goToYear,
  };
};

// Hook for keyboard navigation within the calendar
export const useCalendarKeyboard = (
  calendarDates: CalendarDate[],
  selectedDate: Date | undefined,
  onDateSelect: (date: Date) => void
) => {
  const handleKeyNavigation = useCallback((event: KeyboardEvent) => {
    if (!selectedDate) return;

    const currentIndex = calendarDates.findIndex(calendarDate =>
      calendarDate.date.getTime() === selectedDate.getTime()
    );

    if (currentIndex === -1) return;

    let newIndex: number;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        newIndex = Math.max(0, currentIndex - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        newIndex = Math.min(calendarDates.length - 1, currentIndex + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        newIndex = Math.max(0, currentIndex - 7);
        break;
      case 'ArrowDown':
        event.preventDefault();
        newIndex = Math.min(calendarDates.length - 1, currentIndex + 7);
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = calendarDates.length - 1;
        break;
      default:
        return;
    }

    const newDate = calendarDates[newIndex];
    if (newDate && newDate.isEnabled) {
      onDateSelect(newDate.date);
    }
  }, [calendarDates, selectedDate, onDateSelect]);

  return { handleKeyNavigation };
};