import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { getMonthYearString, getPreviousMonth, getNextMonth } from "@/lib/dateUtils";
import styles from "./Calendar.module.css";
export function CalendarHeader({ currentDate, onMonthChange }) {
    const handlePrevious = () => {
        onMonthChange(getPreviousMonth(currentDate));
    };
    const handleNext = () => {
        onMonthChange(getNextMonth(currentDate));
    };
    return (_jsxs("div", { className: styles.header, children: [_jsx("button", { className: styles.navButton, onClick: handlePrevious, "aria-label": "Previous month", children: "\u2190" }), _jsx("h2", { className: styles.monthYear, children: getMonthYearString(currentDate) }), _jsx("button", { className: styles.navButton, onClick: handleNext, "aria-label": "Next month", children: "\u2192" })] }));
}
