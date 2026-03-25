/**
 * Date utility functions for calendar calculations.
 * Week starts on Monday (ISO 8601 standard).
 */
/**
 * Get the first day of a given month
 */
export function getFirstDayOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}
/**
 * Get the last day of a given month
 */
export function getLastDayOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
/**
 * Get the day of week (0-6, where 0 is Sunday in JavaScript)
 */
function getDayOfWeek(date) {
    return date.getDay();
}
/**
 * Convert JavaScript day of week (0-6, Sunday-Saturday) to ISO day (1-7, Monday-Sunday)
 */
function jsToIsoDay(jsDay) {
    return jsDay === 0 ? 7 : jsDay;
}
/**
 * Get the ISO day of week (1-7, where 1 is Monday)
 */
export function getIsoDay(date) {
    return jsToIsoDay(getDayOfWeek(date));
}
/**
 * Add days to a date
 */
export function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}
/**
 * Get the start of the week (Monday) for a given date
 */
export function getWeekStart(date) {
    const isoDay = getIsoDay(date);
    return addDays(date, -(isoDay - 1));
}
/**
 * Get the end of the week (Sunday) for a given date
 */
export function getWeekEnd(date) {
    const isoDay = getIsoDay(date);
    return addDays(date, 7 - isoDay);
}
/**
 * Get all weeks (as array of dates) for a given month.
 * Each week is represented as an array of 7 dates.
 * Dates from adjacent months are included for padding.
 * Returns a 2D array: Week[] where each Week is Date[]
 */
export function getWeeksForMonth(date) {
    const firstDay = getFirstDayOfMonth(date);
    const lastDay = getLastDayOfMonth(date);
    const weekStart = getWeekStart(firstDay);
    const weeks = [];
    let currentDate = new Date(weekStart);
    // Continue until we've covered all days of the month and completed the last week
    while (currentDate <= getWeekEnd(lastDay)) {
        const week = [];
        for (let i = 0; i < 7; i++) {
            const isCurrentMonth = currentDate.getMonth() === date.getMonth() &&
                currentDate.getFullYear() === date.getFullYear();
            week.push(isCurrentMonth ? new Date(currentDate) : null);
            currentDate.setDate(currentDate.getDate() + 1);
        }
        weeks.push(week);
    }
    return weeks;
}
/**
 * Check if two dates are the same day
 */
export function isSameDay(date1, date2) {
    return (date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate());
}
/**
 * Check if a date is today
 */
export function isToday(date) {
    return isSameDay(date, new Date());
}
/**
 * Get a human-readable month and year string
 */
export function getMonthYearString(date) {
    const monthNames = [
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
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}
/**
 * Get day names (starting with Monday)
 */
export function getDayLabels() {
    return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
}
/**
 * Get the previous month
 */
export function getPreviousMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}
/**
 * Get the next month
 */
export function getNextMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}
