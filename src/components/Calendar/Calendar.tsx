import React from 'react';
import { CalendarProps } from '@/types/calendar';
import { useCalendarState } from '@/hooks/useCalendarState';
import { CalendarNavigation } from './CalendarNavigation';
import { CalendarGrid } from './CalendarGrid';
import styles from './Calendar.module.css';

export const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateSelect,
  minDate,
  maxDate,
  disabledDates = [],
  highlightedDates = [],
  showNavigation = true,
  showYearSelector = false,
  showMonthSelector = false,
}) => {
  const {
    currentDate,
    selectedDate: internalSelectedDate,
    navigateToDate,
    selectDate,
    calendarDates,
  } = useCalendarState({
    initialSelectedDate: selectedDate,
    minDate,
    maxDate,
    disabledDates,
    highlightedDates,
    onDateSelect: (date) => {
      onDateSelect(date);
    },
  });

  // Use external selectedDate if provided, otherwise use internal state
  const effectiveSelectedDate = selectedDate || internalSelectedDate;

  const handleDateSelect = (date: Date) => {
    selectDate(date);
  };

  const handleNavigate = (date: Date) => {
    navigateToDate(date);
  };

  return (
    <div className={styles.calendar} role="application" aria-label="Calendar">
      {showNavigation && (
        <CalendarNavigation
          currentDate={currentDate}
          onNavigate={handleNavigate}
          showYearSelector={showYearSelector}
          showMonthSelector={showMonthSelector}
          minDate={minDate}
          maxDate={maxDate}
        />
      )}
      <CalendarGrid
        currentDate={currentDate}
        selectedDate={effectiveSelectedDate}
        onDateSelect={handleDateSelect}
        minDate={minDate}
        maxDate={maxDate}
        disabledDates={disabledDates}
        highlightedDates={highlightedDates}
      />
    </div>
  );
};

export default Calendar;