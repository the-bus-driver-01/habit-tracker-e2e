import { useMemo } from "react";
import { getWeeksForMonth, isSameDay } from "@/lib/dateUtils";
import { CalendarHeader } from "./CalendarHeader";
import { WeekDayLabels } from "./WeekDayLabels";
import { DayCell } from "./DayCell";
import styles from "./Calendar.module.css";

interface CalendarGridProps {
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
  onMonthChange?: (date: Date) => void;
}

export default function CalendarGrid({
  selectedDate = new Date(),
  onDateChange = () => {},
  onMonthChange = () => {},
}: CalendarGridProps) {
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

  const handleMonthChange = (newDate: Date) => {
    onMonthChange(newDate);
  };

  const handleDateChange = (date: Date) => {
    onDateChange(date);
  };

  return (
    <div className={styles.calendarContainer}>
      <CalendarHeader currentDate={displayMonth} onMonthChange={handleMonthChange} />
      <WeekDayLabels />
      <div className={styles.grid} data-testid="calendar-grid">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className={styles.week} data-testid={`calendar-week-${weekIndex}`}>
            {week.map((date, dayIndex) => {
              const isCurrentMonth =
                date !== null &&
                date.getMonth() === displayMonth.getMonth() &&
                date.getFullYear() === displayMonth.getFullYear();
              const isSelected = date !== null && isSameDay(date, selectedDate);

              return (
                <DayCell
                  key={`${weekIndex}-${dayIndex}`}
                  date={date}
                  isCurrentMonth={isCurrentMonth}
                  isSelected={isSelected}
                  onDateClick={handleDateChange}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
