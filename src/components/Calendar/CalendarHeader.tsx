import { getMonthYearString, getPreviousMonth, getNextMonth } from "@/lib/dateUtils";
import styles from "./Calendar.module.css";

interface CalendarHeaderProps {
  currentDate: Date;
  onMonthChange: (date: Date) => void;
}

export function CalendarHeader({ currentDate, onMonthChange }: CalendarHeaderProps) {
  const handlePrevious = () => {
    onMonthChange(getPreviousMonth(currentDate));
  };

  const handleNext = () => {
    onMonthChange(getNextMonth(currentDate));
  };

  return (
    <div className={styles.header}>
      <button
        className={styles.navButton}
        onClick={handlePrevious}
        aria-label="Previous month"
      >
        ←
      </button>
      <h2 className={styles.monthYear}>{getMonthYearString(currentDate)}</h2>
      <button
        className={styles.navButton}
        onClick={handleNext}
        aria-label="Next month"
      >
        →
      </button>
    </div>
  );
}
