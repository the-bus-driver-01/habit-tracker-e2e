import React, { useState } from 'react';
import { format, addMonths, subMonths, getYear, getMonth, setMonth, setYear } from 'date-fns';
import { CalendarNavigationProps } from '@/types/calendar';
import styles from './CalendarNavigation.module.css';

export const CalendarNavigation: React.FC<CalendarNavigationProps> = ({
  currentDate,
  onNavigate,
  showYearSelector = false,
  showMonthSelector = false,
  minDate,
  maxDate,
}) => {
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);

  const handlePreviousMonth = () => {
    const newDate = subMonths(currentDate, 1);
    if (!minDate || newDate >= minDate) {
      onNavigate(newDate);
    }
  };

  const handleNextMonth = () => {
    const newDate = addMonths(currentDate, 1);
    if (!maxDate || newDate <= maxDate) {
      onNavigate(newDate);
    }
  };

  const handleMonthSelect = (month: number) => {
    const newDate = setMonth(currentDate, month);
    onNavigate(newDate);
    setShowMonthDropdown(false);
  };

  const handleYearSelect = (year: number) => {
    const newDate = setYear(currentDate, year);
    onNavigate(newDate);
    setShowYearDropdown(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  const currentYear = getYear(currentDate);
  const currentMonth = getMonth(currentDate);

  // Generate year range (10 years before to 10 years after current year)
  const yearRange = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const isPreviousDisabled = minDate && subMonths(currentDate, 1) < minDate;
  const isNextDisabled = maxDate && addMonths(currentDate, 1) > maxDate;

  return (
    <div className={styles.navigation} role="navigation" aria-label="Calendar navigation">
      <button
        type="button"
        className={`${styles.navButton} ${styles.previousButton}`}
        onClick={handlePreviousMonth}
        onKeyDown={(e) => handleKeyDown(e, handlePreviousMonth)}
        disabled={isPreviousDisabled}
        aria-label="Previous month"
      >
        <span aria-hidden="true">‹</span>
      </button>

      <div className={styles.dateDisplay}>
        {showMonthSelector ? (
          <div className={styles.dropdown}>
            <button
              type="button"
              className={styles.dropdownButton}
              onClick={() => setShowMonthDropdown(!showMonthDropdown)}
              onKeyDown={(e) => handleKeyDown(e, () => setShowMonthDropdown(!showMonthDropdown))}
              aria-haspopup="listbox"
              aria-expanded={showMonthDropdown}
              aria-label="Select month"
            >
              {monthNames[currentMonth]}
              <span className={styles.dropdownArrow} aria-hidden="true">▼</span>
            </button>
            {showMonthDropdown && (
              <ul
                className={styles.dropdownList}
                role="listbox"
                aria-label="Month selection"
              >
                {monthNames.map((month, index) => (
                  <li key={month}>
                    <button
                      type="button"
                      className={`${styles.dropdownOption} ${
                        index === currentMonth ? styles.selected : ''
                      }`}
                      onClick={() => handleMonthSelect(index)}
                      onKeyDown={(e) => handleKeyDown(e, () => handleMonthSelect(index))}
                      role="option"
                      aria-selected={index === currentMonth}
                    >
                      {month}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <span className={styles.monthDisplay}>
            {format(currentDate, 'MMMM')}
          </span>
        )}

        {showYearSelector ? (
          <div className={styles.dropdown}>
            <button
              type="button"
              className={styles.dropdownButton}
              onClick={() => setShowYearDropdown(!showYearDropdown)}
              onKeyDown={(e) => handleKeyDown(e, () => setShowYearDropdown(!showYearDropdown))}
              aria-haspopup="listbox"
              aria-expanded={showYearDropdown}
              aria-label="Select year"
            >
              {currentYear}
              <span className={styles.dropdownArrow} aria-hidden="true">▼</span>
            </button>
            {showYearDropdown && (
              <ul
                className={styles.dropdownList}
                role="listbox"
                aria-label="Year selection"
              >
                {yearRange.map((year) => (
                  <li key={year}>
                    <button
                      type="button"
                      className={`${styles.dropdownOption} ${
                        year === currentYear ? styles.selected : ''
                      }`}
                      onClick={() => handleYearSelect(year)}
                      onKeyDown={(e) => handleKeyDown(e, () => handleYearSelect(year))}
                      role="option"
                      aria-selected={year === currentYear}
                    >
                      {year}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <span className={styles.yearDisplay}>
            {currentYear}
          </span>
        )}
      </div>

      <button
        type="button"
        className={`${styles.navButton} ${styles.nextButton}`}
        onClick={handleNextMonth}
        onKeyDown={(e) => handleKeyDown(e, handleNextMonth)}
        disabled={isNextDisabled}
        aria-label="Next month"
      >
        <span aria-hidden="true">›</span>
      </button>
    </div>
  );
};