import { describe, it, expect } from "vitest";
import {
  getFirstDayOfMonth,
  getLastDayOfMonth,
  getIsoDay,
  addDays,
  getWeekStart,
  getWeekEnd,
  getWeeksForMonth,
  isSameDay,
  isToday,
  getMonthYearString,
  getDayLabels,
  getPreviousMonth,
  getNextMonth,
} from "./dateUtils";

describe("dateUtils", () => {
  describe("getFirstDayOfMonth", () => {
    it("should return the first day of the month", () => {
      const date = new Date(2024, 2, 15); // March 15, 2024
      const firstDay = getFirstDayOfMonth(date);
      expect(firstDay.getDate()).toBe(1);
      expect(firstDay.getMonth()).toBe(2);
      expect(firstDay.getFullYear()).toBe(2024);
    });
  });

  describe("getLastDayOfMonth", () => {
    it("should return the last day of the month", () => {
      const date = new Date(2024, 2, 15); // March 15, 2024
      const lastDay = getLastDayOfMonth(date);
      expect(lastDay.getDate()).toBe(31);
      expect(lastDay.getMonth()).toBe(2);
      expect(lastDay.getFullYear()).toBe(2024);
    });

    it("should handle February in leap years", () => {
      const date = new Date(2024, 1, 15); // Feb 15, 2024 (leap year)
      const lastDay = getLastDayOfMonth(date);
      expect(lastDay.getDate()).toBe(29);
    });

    it("should handle February in non-leap years", () => {
      const date = new Date(2023, 1, 15); // Feb 15, 2023 (non-leap year)
      const lastDay = getLastDayOfMonth(date);
      expect(lastDay.getDate()).toBe(28);
    });
  });

  describe("getIsoDay", () => {
    it("should return 1 for Monday", () => {
      // March 4, 2024 is a Monday
      const date = new Date(2024, 2, 4);
      expect(getIsoDay(date)).toBe(1);
    });

    it("should return 7 for Sunday", () => {
      // March 3, 2024 is a Sunday
      const date = new Date(2024, 2, 3);
      expect(getIsoDay(date)).toBe(7);
    });

    it("should return correct ISO day for all weekdays", () => {
      // March 4, 2024 is a Monday
      const baseDate = new Date(2024, 2, 4);
      const expectedDays = [1, 2, 3, 4, 5, 6, 7];

      for (let i = 0; i < 7; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() + i);
        expect(getIsoDay(date)).toBe(expectedDays[i]);
      }
    });
  });

  describe("addDays", () => {
    it("should add days correctly", () => {
      const date = new Date(2024, 2, 15); // March 15, 2024
      const result = addDays(date, 5);
      expect(result.getDate()).toBe(20);
      expect(result.getMonth()).toBe(2);
    });

    it("should handle month boundaries", () => {
      const date = new Date(2024, 2, 31); // March 31, 2024
      const result = addDays(date, 1);
      expect(result.getDate()).toBe(1);
      expect(result.getMonth()).toBe(3); // April
    });

    it("should handle negative days", () => {
      const date = new Date(2024, 3, 1); // April 1, 2024
      const result = addDays(date, -1);
      expect(result.getDate()).toBe(31);
      expect(result.getMonth()).toBe(2); // March
    });

    it("should not mutate the original date", () => {
      const date = new Date(2024, 2, 15);
      const original = date.getTime();
      addDays(date, 5);
      expect(date.getTime()).toBe(original);
    });
  });

  describe("getWeekStart", () => {
    it("should return Monday for any day in the week", () => {
      // March 4, 2024 is a Monday
      const monday = new Date(2024, 2, 4);
      const weekStart = getWeekStart(monday);
      expect(getIsoDay(weekStart)).toBe(1);
      expect(isSameDay(weekStart, monday)).toBe(true);

      // March 8, 2024 is a Friday
      const friday = new Date(2024, 2, 8);
      const fridayWeekStart = getWeekStart(friday);
      expect(isSameDay(fridayWeekStart, monday)).toBe(true);
    });
  });

  describe("getWeekEnd", () => {
    it("should return Sunday for any day in the week", () => {
      // March 4, 2024 is a Monday
      const monday = new Date(2024, 2, 4);
      const weekEnd = getWeekEnd(monday);
      expect(getIsoDay(weekEnd)).toBe(7);

      // March 3, 2024 is a Sunday
      const sunday = new Date(2024, 2, 3);
      const weekEndFromSunday = getWeekEnd(sunday);
      expect(isSameDay(weekEndFromSunday, sunday)).toBe(true);
    });
  });

  describe("getWeeksForMonth", () => {
    it("should return weeks for a month", () => {
      const date = new Date(2024, 2); // March 2024
      const weeks = getWeeksForMonth(date);

      // March 2024 should have 5 weeks (Mon Feb26-Sun Mar03, Mon-Sun Mar04-10, Mon-Sun Mar11-17, Mon-Sun Mar18-24, Mon-Sun Mar25-31)
      expect(weeks.length).toBe(5);

      // Each week should have 7 days
      for (const week of weeks) {
        expect(week.length).toBe(7);
      }
    });

    it("should include padding days from adjacent months", () => {
      const date = new Date(2024, 2); // March 2024
      const weeks = getWeeksForMonth(date);

      // First week should have some null values for days from previous month
      const firstWeek = weeks[0];
      const nonNullDaysInFirstWeek = firstWeek.filter((d) => d !== null);
      expect(nonNullDaysInFirstWeek.length).toBeLessThan(7);

      // March 1, 2024 is a Friday (5th day of the week)
      expect(firstWeek[0]).toBe(null); // Monday
      expect(firstWeek[1]).toBe(null); // Tuesday
      expect(firstWeek[2]).toBe(null); // Wednesday
      expect(firstWeek[3]).toBe(null); // Thursday
      expect(firstWeek[4]).not.toBe(null); // Friday (March 1)
    });

    it("should have all days of the current month", () => {
      const date = new Date(2024, 2); // March 2024
      const weeks = getWeeksForMonth(date);

      const allDates = weeks.flat().filter((d) => d !== null) as Date[];
      const marchDates = allDates.filter(
        (d) => d.getMonth() === 2 && d.getFullYear() === 2024
      );

      expect(marchDates.length).toBe(31); // March has 31 days
    });

    it("should start week on Monday", () => {
      const date = new Date(2024, 2); // March 2024
      const weeks = getWeeksForMonth(date);
      const firstNonNullDay = weeks[0].find((d) => d !== null);

      if (firstNonNullDay) {
        // The first non-null day should be on a Monday
        expect(getIsoDay(firstNonNullDay)).toBeLessThanOrEqual(7);
      }
    });
  });

  describe("isSameDay", () => {
    it("should return true for the same day", () => {
      const date1 = new Date(2024, 2, 15, 10, 30);
      const date2 = new Date(2024, 2, 15, 14, 45);
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it("should return false for different days", () => {
      const date1 = new Date(2024, 2, 15);
      const date2 = new Date(2024, 2, 16);
      expect(isSameDay(date1, date2)).toBe(false);
    });

    it("should return false for different months", () => {
      const date1 = new Date(2024, 2, 15);
      const date2 = new Date(2024, 3, 15);
      expect(isSameDay(date1, date2)).toBe(false);
    });

    it("should return false for different years", () => {
      const date1 = new Date(2024, 2, 15);
      const date2 = new Date(2025, 2, 15);
      expect(isSameDay(date1, date2)).toBe(false);
    });
  });

  describe("isToday", () => {
    it("should return true for today", () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    it("should return false for other dates", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });
  });

  describe("getMonthYearString", () => {
    it("should return formatted month and year string", () => {
      const date = new Date(2024, 2, 15); // March 15, 2024
      expect(getMonthYearString(date)).toBe("March 2024");
    });

    it("should work for all months", () => {
      const expectedMonths = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      for (let month = 0; month < 12; month++) {
        const date = new Date(2024, month, 15);
        expect(getMonthYearString(date)).toBe(`${expectedMonths[month]} 2024`);
      }
    });
  });

  describe("getDayLabels", () => {
    it("should return day labels starting with Monday", () => {
      const labels = getDayLabels();
      expect(labels).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
    });

    it("should return 7 labels", () => {
      const labels = getDayLabels();
      expect(labels.length).toBe(7);
    });
  });

  describe("getPreviousMonth", () => {
    it("should return the previous month", () => {
      const date = new Date(2024, 2, 15); // March 15, 2024
      const prevMonth = getPreviousMonth(date);
      expect(prevMonth.getMonth()).toBe(1); // February
      expect(prevMonth.getFullYear()).toBe(2024);
    });

    it("should handle year boundary", () => {
      const date = new Date(2024, 0, 15); // January 15, 2024
      const prevMonth = getPreviousMonth(date);
      expect(prevMonth.getMonth()).toBe(11); // December
      expect(prevMonth.getFullYear()).toBe(2023);
    });
  });

  describe("getNextMonth", () => {
    it("should return the next month", () => {
      const date = new Date(2024, 2, 15); // March 15, 2024
      const nextMonth = getNextMonth(date);
      expect(nextMonth.getMonth()).toBe(3); // April
      expect(nextMonth.getFullYear()).toBe(2024);
    });

    it("should handle year boundary", () => {
      const date = new Date(2024, 11, 15); // December 15, 2024
      const nextMonth = getNextMonth(date);
      expect(nextMonth.getMonth()).toBe(0); // January
      expect(nextMonth.getFullYear()).toBe(2025);
    });
  });
});
