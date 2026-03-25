import React from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  isSameDay,
  isBefore,
  isAfter
} from 'date-fns';
import { CalendarGridProps, CalendarDate } from '@/types/calendar';
import styles from './CalendarGrid.module.css';

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  selectedDate,
  onDateSelect,
  minDate,
  maxDate,
  disabledDates = [],
  highlightedDates = [],
}) => {
  // Generate calendar grid data
  const generateCalendarDates = (): CalendarDate[] => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    });

    return days.map((date): CalendarDate => {
      const isCurrentMonth = isSameMonth(date, currentDate);
      const isDateToday = isToday(date);
      const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;

      // Check if date is disabled
      const isBeforeMin = minDate ? isBefore(date, minDate) : false;
      const isAfterMax = maxDate ? isAfter(date, maxDate) : false;
      const isExplicitlyDisabled = disabledDates.some(disabledDate =>
        isSameDay(date, disabledDate)
      );

      const isEnabled = !isBeforeMin && !isAfterMax && !isExplicitlyDisabled;

      return {
        date,
        isCurrentMonth,
        isToday: isDateToday,
        isSelected,
        isEnabled,
      };
    });
  };

  const calendarDates = generateCalendarDates();

  const handleDateClick = (date: Date, isEnabled: boolean) => {
    if (isEnabled) {
      onDateSelect(date);
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent,
    date: Date,
    isEnabled: boolean
  ) => {
    if ((event.key === 'Enter' || event.key === ' ') && isEnabled) {
      event.preventDefault();
      onDateSelect(date);
    }
  };

  const isHighlighted = (date: Date): boolean => {
    return highlightedDates.some(highlightedDate =>
      isSameDay(date, highlightedDate)
    );
  };

  const getDayClasses = (calendarDate: CalendarDate): string => {
    const classes = [styles.day];

    if (!calendarDate.isCurrentMonth) {
      classes.push(styles.otherMonth);
    }

    if (calendarDate.isToday) {
      classes.push(styles.today);
    }

    if (calendarDate.isSelected) {
      classes.push(styles.selected);
    }

    if (!calendarDate.isEnabled) {
      classes.push(styles.disabled);
    }

    if (isHighlighted(calendarDate.date)) {
      classes.push(styles.highlighted);
    }

    return classes.join(' ');
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={styles.grid} role="grid" aria-label="Calendar grid">
      {/* Week day headers */}
      <div className={styles.weekHeader} role="row">
        {weekDays.map((day) => (
          <div
            key={day}
            className={styles.weekDay}
            role="columnheader"
            aria-label={day}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar dates */}
      <div className={styles.datesContainer}>
        {calendarDates.map((calendarDate, index) => {
          const { date, isEnabled, isSelected } = calendarDate;
          const dayNumber = format(date, 'd');
          const fullDate = format(date, 'yyyy-MM-dd');

          return (
            <button
              key={fullDate}
              type="button"
              className={getDayClasses(calendarDate)}
              onClick={() => handleDateClick(date, isEnabled)}
              onKeyDown={(e) => handleKeyDown(e, date, isEnabled)}
              disabled={!isEnabled}
              role="gridcell"
              aria-label={format(date, 'EEEE, MMMM do, yyyy')}
              aria-selected={isSelected}
              aria-current={calendarDate.isToday ? 'date' : undefined}
              tabIndex={isSelected ? 0 : -1}
            >
              <span className={styles.dayNumber} aria-hidden="true">
                {dayNumber}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};