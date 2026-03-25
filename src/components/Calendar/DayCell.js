import { jsx as _jsx } from "react/jsx-runtime";
import { isToday } from "@/lib/dateUtils";
import styles from "./Calendar.module.css";
export function DayCell({ date, isCurrentMonth, isSelected, onDateClick, }) {
    if (!date) {
        return _jsx("div", { className: styles.dayCell + " " + styles.empty });
    }
    const isCurrentDay = isToday(date);
    const cellClassName = [
        styles.dayCell,
        !isCurrentMonth && styles.otherMonth,
        isSelected && styles.selected,
        isCurrentDay && styles.today,
    ]
        .filter(Boolean)
        .join(" ");
    const handleClick = () => {
        if (isCurrentMonth) {
            onDateClick(date);
        }
    };
    return (_jsx("button", { className: cellClassName, onClick: handleClick, disabled: !isCurrentMonth, "aria-label": `${date.toLocaleDateString()}`, "aria-pressed": isSelected, "data-testid": `calendar-day-${date.getDate()}`, "data-selected": isSelected, children: date.getDate() }));
}
