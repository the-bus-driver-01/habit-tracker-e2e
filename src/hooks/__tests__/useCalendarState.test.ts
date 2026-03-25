import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCalendarState, useCalendarNavigation } from '../useCalendarState';

describe('useCalendarState', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useCalendarState());

    expect(result.current.currentDate).toBeInstanceOf(Date);
    expect(result.current.selectedDate).toBeUndefined();
    expect(result.current.calendarDates).toHaveLength(42); // 6 weeks * 7 days
  });

  it('should initialize with provided initial date', () => {
    const initialDate = new Date(2024, 2, 15); // March 15, 2024
    const { result } = renderHook(() =>
      useCalendarState({ initialDate })
    );

    expect(result.current.currentDate).toEqual(initialDate);
  });

  it('should initialize with provided selected date', () => {
    const selectedDate = new Date(2024, 2, 20);
    const { result } = renderHook(() =>
      useCalendarState({ initialSelectedDate: selectedDate })
    );

    expect(result.current.selectedDate).toEqual(selectedDate);
  });

  it('should navigate to previous month', () => {
    const initialDate = new Date(2024, 2, 15); // March 15, 2024
    const { result } = renderHook(() =>
      useCalendarState({ initialDate })
    );

    act(() => {
      result.current.navigateToMonth('previous');
    });

    expect(result.current.currentDate.getMonth()).toBe(1); // February
    expect(result.current.currentDate.getFullYear()).toBe(2024);
  });

  it('should navigate to next month', () => {
    const initialDate = new Date(2024, 2, 15); // March 15, 2024
    const { result } = renderHook(() =>
      useCalendarState({ initialDate })
    );

    act(() => {
      result.current.navigateToMonth('next');
    });

    expect(result.current.currentDate.getMonth()).toBe(3); // April
    expect(result.current.currentDate.getFullYear()).toBe(2024);
  });

  it('should respect min date constraint when navigating', () => {
    const initialDate = new Date(2024, 1, 15); // February 15, 2024
    const minDate = new Date(2024, 1, 1); // February 1, 2024
    const { result } = renderHook(() =>
      useCalendarState({ initialDate, minDate })
    );

    act(() => {
      result.current.navigateToMonth('previous');
    });

    // Should not navigate before min date
    expect(result.current.currentDate.getMonth()).toBe(1); // Still February
  });

  it('should respect max date constraint when navigating', () => {
    const initialDate = new Date(2024, 11, 15); // December 15, 2024
    const maxDate = new Date(2024, 11, 31); // December 31, 2024
    const { result } = renderHook(() =>
      useCalendarState({ initialDate, maxDate })
    );

    act(() => {
      result.current.navigateToMonth('next');
    });

    // Should not navigate after max date
    expect(result.current.currentDate.getMonth()).toBe(11); // Still December
  });

  it('should navigate to specific date', () => {
    const { result } = renderHook(() => useCalendarState());
    const targetDate = new Date(2025, 5, 15); // June 15, 2025

    act(() => {
      result.current.navigateToDate(targetDate);
    });

    expect(result.current.currentDate).toEqual(targetDate);
  });

  it('should select a date', () => {
    const { result } = renderHook(() => useCalendarState());
    const dateToSelect = new Date(2024, 2, 20);

    act(() => {
      result.current.selectDate(dateToSelect);
    });

    expect(result.current.selectedDate).toEqual(dateToSelect);
  });

  it('should not select disabled dates', () => {
    const disabledDate = new Date(2024, 2, 15);
    const { result } = renderHook(() =>
      useCalendarState({ disabledDates: [disabledDate] })
    );

    act(() => {
      result.current.selectDate(disabledDate);
    });

    expect(result.current.selectedDate).toBeUndefined();
  });

  it('should call onDateSelect callback when date is selected', () => {
    const onDateSelect = vi.fn();
    const { result } = renderHook(() =>
      useCalendarState({ onDateSelect })
    );
    const dateToSelect = new Date(2024, 2, 20);

    act(() => {
      result.current.selectDate(dateToSelect);
    });

    expect(onDateSelect).toHaveBeenCalledWith(dateToSelect);
  });

  it('should call onMonthChange callback when month changes', () => {
    const onMonthChange = vi.fn();
    const initialDate = new Date(2024, 2, 15);
    const { result } = renderHook(() =>
      useCalendarState({ initialDate, onMonthChange })
    );

    act(() => {
      result.current.navigateToMonth('next');
    });

    expect(onMonthChange).toHaveBeenCalled();
  });

  it('should reset to today', () => {
    const initialDate = new Date(2020, 0, 1); // January 1, 2020
    const { result } = renderHook(() =>
      useCalendarState({ initialDate })
    );

    act(() => {
      result.current.resetToToday();
    });

    const today = new Date();
    expect(result.current.currentDate.getDate()).toBe(today.getDate());
    expect(result.current.currentDate.getMonth()).toBe(today.getMonth());
    expect(result.current.currentDate.getFullYear()).toBe(today.getFullYear());
  });

  it('should generate calendar dates correctly', () => {
    const initialDate = new Date(2024, 2, 15); // March 15, 2024
    const { result } = renderHook(() =>
      useCalendarState({ initialDate })
    );

    const { calendarDates } = result.current;
    expect(calendarDates).toHaveLength(42); // 6 weeks * 7 days

    // Should have dates from current month
    const currentMonthDates = calendarDates.filter(cd => cd.isCurrentMonth);
    expect(currentMonthDates).toHaveLength(31); // March has 31 days
  });
});

describe('useCalendarNavigation', () => {
  const mockOnNavigate = vi.fn();

  beforeEach(() => {
    mockOnNavigate.mockClear();
  });

  it('should determine navigation availability correctly', () => {
    const currentDate = new Date(2024, 5, 15); // June 15, 2024
    const minDate = new Date(2024, 0, 1); // January 1, 2024
    const maxDate = new Date(2024, 11, 31); // December 31, 2024

    const { result } = renderHook(() =>
      useCalendarNavigation({ currentDate, minDate, maxDate, onNavigate: mockOnNavigate })
    );

    expect(result.current.canGoToPrevious).toBe(true);
    expect(result.current.canGoToNext).toBe(true);
  });

  it('should disable previous navigation when at min date', () => {
    const currentDate = new Date(2024, 0, 15); // January 15, 2024
    const minDate = new Date(2024, 0, 1); // January 1, 2024

    const { result } = renderHook(() =>
      useCalendarNavigation({ currentDate, minDate, onNavigate: mockOnNavigate })
    );

    expect(result.current.canGoToPrevious).toBe(false);
  });

  it('should disable next navigation when at max date', () => {
    const currentDate = new Date(2024, 11, 15); // December 15, 2024
    const maxDate = new Date(2024, 11, 31); // December 31, 2024

    const { result } = renderHook(() =>
      useCalendarNavigation({ currentDate, maxDate, onNavigate: mockOnNavigate })
    );

    expect(result.current.canGoToNext).toBe(false);
  });

  it('should navigate to previous month', () => {
    const currentDate = new Date(2024, 5, 15); // June 15, 2024
    const { result } = renderHook(() =>
      useCalendarNavigation({ currentDate, onNavigate: mockOnNavigate })
    );

    act(() => {
      result.current.goToPrevious();
    });

    expect(mockOnNavigate).toHaveBeenCalled();
    const calledDate = mockOnNavigate.mock.calls[0][0];
    expect(calledDate.getMonth()).toBe(4); // May
  });

  it('should navigate to next month', () => {
    const currentDate = new Date(2024, 5, 15); // June 15, 2024
    const { result } = renderHook(() =>
      useCalendarNavigation({ currentDate, onNavigate: mockOnNavigate })
    );

    act(() => {
      result.current.goToNext();
    });

    expect(mockOnNavigate).toHaveBeenCalled();
    const calledDate = mockOnNavigate.mock.calls[0][0];
    expect(calledDate.getMonth()).toBe(6); // July
  });

  it('should navigate to specific month', () => {
    const currentDate = new Date(2024, 5, 15); // June 15, 2024
    const { result } = renderHook(() =>
      useCalendarNavigation({ currentDate, onNavigate: mockOnNavigate })
    );

    act(() => {
      result.current.goToMonth(8); // September (0-indexed)
    });

    expect(mockOnNavigate).toHaveBeenCalled();
    const calledDate = mockOnNavigate.mock.calls[0][0];
    expect(calledDate.getMonth()).toBe(8); // September
  });

  it('should navigate to specific year', () => {
    const currentDate = new Date(2024, 5, 15); // June 15, 2024
    const { result } = renderHook(() =>
      useCalendarNavigation({ currentDate, onNavigate: mockOnNavigate })
    );

    act(() => {
      result.current.goToYear(2025);
    });

    expect(mockOnNavigate).toHaveBeenCalled();
    const calledDate = mockOnNavigate.mock.calls[0][0];
    expect(calledDate.getFullYear()).toBe(2025);
  });
});