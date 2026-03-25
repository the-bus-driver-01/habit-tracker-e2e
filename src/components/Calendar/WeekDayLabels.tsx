import { getDayLabels } from "@/lib/dateUtils";
import styles from "./Calendar.module.css";

export function WeekDayLabels() {
  const dayLabels = getDayLabels();

  return (
    <div className={styles.weekDayLabels}>
      {dayLabels.map((day) => (
        <div key={day} className={styles.weekDayLabel}>
          {day}
        </div>
      ))}
    </div>
  );
}
