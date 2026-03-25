import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import { getWeeksForMonth, isSameDay } from "@/lib/dateUtils";
import { CalendarHeader } from "./CalendarHeader";
import { WeekDayLabels } from "./WeekDayLabels";
import { DayCell } from "./DayCell";
import styles from "./Calendar.module.css";
export default function CalendarGrid({ selectedDate = new Date(), onDateChange = () => { }, onMonthChange = () => { }, }) {
    // Current month being displayed
    const displayMonth = useMemo(() => {
        const month = new Date(selectedDate);
        month.setDate(1);
        return month;
    }, [selectedDate]);
    // Get all weeks for the current month
    const weeks = useMemo(() => {
        return getWeeksForMonth(displayMonth);
    }, [displayMonth]);
    const handleMonthChange = (newDate) => {
        onMonthChange(newDate);
    };
    const handleDateChange = (date) => {
        onDateChange(date);
    };
    return (_jsxs("div", { className: styles.calendarContainer, children: [_jsx(CalendarHeader, { currentDate: displayMonth, onMonthChange: handleMonthChange }), _jsx(WeekDayLabels, {}), _jsx("div", { className: styles.grid, "data-testid": "calendar-grid", children: weeks.map((week, weekIndex) => (_jsx("div", { className: styles.week, "data-testid": `calendar-week-${weekIndex}`, children: week.map((date, dayIndex) => {
                        const isCurrentMonth = date !== null &&
                            date.getMonth() === displayMonth.getMonth() &&
                            date.getFullYear() === displayMonth.getFullYear();
                        const isSelected = date !== null && isSameDay(date, selectedDate);
                        return (_jsx(DayCell, { date: date, isCurrentMonth: isCurrentMonth, isSelected: isSelected, onDateClick: handleDateChange }, `${weekIndex}-${dayIndex}`));
                    }) }, weekIndex))) })] }));
}
