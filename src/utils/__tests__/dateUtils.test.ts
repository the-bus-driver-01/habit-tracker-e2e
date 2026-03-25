import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateCalendarDates,
  navigateToPreviousMonth,
  navigateToNextMonth,
  canNavigateToPrevious,
  canNavigateToNext,
  isSameMonthAndYear,
  formatCalendarHeader,
  formatDateForScreenReader,
  parseDate,
  getWeeksInMonth,
  getMonthDifference,
  getYearDifference,
  isDateInRange,
  isDateSelectable,
  getToday,
  createDateAtMidnight,
  cloneDate,
} from '../dateUtils';

describe('dateUtils', () => {
  let testDate: Date;
  let minDate: Date;
  let maxDate: Date;

  beforeEach(() => {
    testDate = new Date(2024, 2, 15); // March 15, 2024
    minDate = new Date(2024, 1, 1); // February 1, 2024
    maxDate = new Date(2024, 11, 31); // December 31, 2024
  });

  describe('generateCalendarDates', () => {
    it('should generate calendar dates for a month', () => {
      const calendarDates = generateCalendarDates(testDate);

      expect(calendarDates.length).toBeGreaterThan(0);
      expect(calendarDates.length % 7).toBe(0); // Should be divisible by 7 (weeks)

      // Should contain dates from current month
      const currentMonthDates = calendarDates.filter(cd => cd.isCurrentMonth);
      expect(currentMonthDates.length).toBe(31); // March has 31 days
    });

    it('should mark today correctly', () => {
      const today = getToday();
      const calendarDates = generateCalendarDates(today);

      const todayDate = calendarDates.find(cd => cd.isToday);
      expect(todayDate).toBeDefined();
      expect(todayDate?.date.getDate()).toBe(today.getDate());
    });

    it('should mark selected date correctly', () => {
      const selectedDate = new Date(2024, 2, 20);
      const calendarDates = generateCalendarDates(testDate, selectedDate);

      const selected = calendarDates.find(cd => cd.isSelected);
      expect(selected).toBeDefined();
      expect(selected?.date.getDate()).toBe(20);
    });

    it('should handle disabled dates', () => {
      const disabledDate = new Date(2024, 2, 10);
      const calendarDates = generateCalendarDates(testDate, undefined, undefined, undefined, [disabledDate]);

      const disabled = calendarDates.find(cd => cd.date.getTime() === disabledDate.getTime());
      expect(disabled?.isEnabled).toBe(false);
    });
  });

  describe('navigation functions', () => {
    it('should navigate to previous month', () => {
      const result = navigateToPreviousMonth(testDate);
      expect(result.getMonth()).toBe(1); // February
      expect(result.getFullYear()).toBe(2024);
    });

    it('should navigate to next month', () => {
      const result = navigateToNextMonth(testDate);
      expect(result.getMonth()).toBe(3); // April
      expect(result.getFullYear()).toBe(2024);
    });

    it('should respect min date when navigating to previous', () => {
      const result = navigateToPreviousMonth(minDate, minDate);
      expect(result.getTime()).toBe(minDate.getTime());
    });

    it('should respect max date when navigating to next', () => {
      const result = navigateToNextMonth(maxDate, maxDate);
      expect(result.getTime()).toBe(maxDate.getTime());
    });

    it('should check if can navigate to previous', () => {
      expect(canNavigateToPrevious(testDate, minDate)).toBe(true);
      expect(canNavigateToPrevious(minDate, minDate)).toBe(false);
    });

    it('should check if can navigate to next', () => {
      expect(canNavigateToNext(testDate, maxDate)).toBe(true);
      expect(canNavigateToNext(maxDate, maxDate)).toBe(false);
    });
  });

  describe('date comparison functions', () => {
    it('should check if dates are in same month and year', () => {
      const sameMonth = new Date(2024, 2, 20);
      const differentMonth = new Date(2024, 3, 15);

      expect(isSameMonthAndYear(testDate, sameMonth)).toBe(true);
      expect(isSameMonthAndYear(testDate, differentMonth)).toBe(false);
    });

    it('should check if date is in range', () => {
      const startDate = new Date(2024, 2, 10);
      const endDate = new Date(2024, 2, 20);
      const inRange = new Date(2024, 2, 15);
      const outOfRange = new Date(2024, 2, 25);

      expect(isDateInRange(inRange, startDate, endDate)).toBe(true);
      expect(isDateInRange(outOfRange, startDate, endDate)).toBe(false);
    });
  });

  describe('formatting functions', () => {
    it('should format calendar header correctly', () => {
      const formatted = formatCalendarHeader(testDate);
      expect(formatted).toBe('March 2024');
    });

    it('should format date for screen reader', () => {
      const formatted = formatDateForScreenReader(testDate);
      expect(formatted).toMatch(/Friday, March 15th, 2024/);
    });
  });

  describe('date parsing and validation', () => {
    it('should parse valid date string', () => {
      const result = parseDate('2024-03-15');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
      expect(result?.getMonth()).toBe(2);
      expect(result?.getDate()).toBe(15);
    });

    it('should return null for invalid date string', () => {
      const result = parseDate('invalid-date');
      expect(result).toBeNull();
    });

    it('should check if date is selectable', () => {
      const validDate = new Date(2024, 5, 15);
      const tooEarly = new Date(2024, 0, 15);
      const tooLate = new Date(2025, 0, 15);
      const disabled = new Date(2024, 5, 20);

      expect(isDateSelectable(validDate, minDate, maxDate)).toBe(true);
      expect(isDateSelectable(tooEarly, minDate, maxDate)).toBe(false);
      expect(isDateSelectable(tooLate, minDate, maxDate)).toBe(false);
      expect(isDateSelectable(disabled, minDate, maxDate, [disabled])).toBe(false);
    });
  });

  describe('utility functions', () => {
    it('should get weeks in month correctly', () => {
      // March 2024 starts on Friday and has 31 days, so it spans 6 weeks
      const weeks = getWeeksInMonth(testDate);
      expect(weeks).toBe(6);
    });

    it('should calculate month difference', () => {
      const startDate = new Date(2024, 0, 1);
      const endDate = new Date(2024, 11, 1);
      const difference = getMonthDifference(startDate, endDate);
      expect(difference).toBe(11);
    });

    it('should calculate year difference', () => {
      const startDate = new Date(2020, 0, 1);
      const endDate = new Date(2024, 0, 1);
      const difference = getYearDifference(startDate, endDate);
      expect(difference).toBe(4);
    });

    it('should create date at midnight', () => {
      const date = createDateAtMidnight(2024, 2, 15);
      expect(date.getHours()).toBe(0);
      expect(date.getMinutes()).toBe(0);
      expect(date.getSeconds()).toBe(0);
      expect(date.getMilliseconds()).toBe(0);
    });

    it('should clone date correctly', () => {
      const cloned = cloneDate(testDate);
      expect(cloned.getTime()).toBe(testDate.getTime());
      expect(cloned).not.toBe(testDate); // Different objects
    });
  });
});