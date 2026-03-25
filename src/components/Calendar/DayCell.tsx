import { isToday } from "@/lib/dateUtils";
import styles from "./Calendar.module.css";

interface DayCellProps {
  date: Date | null;
  isCurrentMonth: boolean;
  isSelected: boolean;
  onDateClick: (date: Date) => void;
}

export function DayCell({
  date,
  isCurrentMonth,
  isSelected,
  onDateClick,
}: DayCellProps) {
  if (!date) {
    return <div className={styles.dayCell + " " + styles.empty}></div>;
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

  return (
    <button
      className={cellClassName}
      onClick={handleClick}
      disabled={!isCurrentMonth}
      aria-label={`${date.toLocaleDateString()}`}
      aria-pressed={isSelected}
      data-testid={`calendar-day-${date.getDate()}`}
      data-selected={isSelected}
    >
      {date.getDate()}
    </button>
  );
}
