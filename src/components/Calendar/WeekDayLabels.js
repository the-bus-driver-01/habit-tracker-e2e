import { jsx as _jsx } from "react/jsx-runtime";
import { getDayLabels } from "@/lib/dateUtils";
import styles from "./Calendar.module.css";
export function WeekDayLabels() {
    const dayLabels = getDayLabels();
    return (_jsx("div", { className: styles.weekDayLabels, children: dayLabels.map((day) => (_jsx("div", { className: styles.weekDayLabel, children: day }, day))) }));
}
