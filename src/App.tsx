import React, { useState } from 'react';
import { Calendar } from '@/components/Calendar';
import './App.css';

function App() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  // Example: Disable weekends
  const disabledDates = React.useMemo(() => {
    const dates: Date[] = [];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Disable all Saturdays and Sundays in current month
    for (let day = 1; day <= 31; day++) {
      const date = new Date(currentYear, currentMonth, day);
      if (date.getMonth() === currentMonth) { // Still in current month
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
          dates.push(date);
        }
      }
    }
    return dates;
  }, []);

  // Example: Highlight important dates
  const highlightedDates = React.useMemo(() => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    return [nextWeek];
  }, []);

  // Example: Set min and max dates
  const minDate = React.useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 2); // 2 months ago
    return date;
  }, []);

  const maxDate = React.useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 6); // 6 months from now
    return date;
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Calendar Navigation Demo</h1>
        <p>Interactive calendar with navigation and date selection</p>
      </header>

      <main className="app-main">
        <div className="calendar-section">
          <h2>✅ Calendar with Navigation Buttons</h2>
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            showNavigation={true}
          />
          <p className="calendar-note">
            📋 <strong>Acceptance Criteria #1:</strong> Previous/Next month navigation buttons implemented ✅
          </p>
        </div>

        <div className="calendar-section">
          <h2>✅ Calendar with Date Selection Controls</h2>
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            showNavigation={true}
            showMonthSelector={true}
            showYearSelector={true}
            minDate={minDate}
            maxDate={maxDate}
          />
          <p className="calendar-note">
            📋 <strong>Acceptance Criteria #2:</strong> Date selection controls for jumping to specific months/years ✅
          </p>
        </div>

        <div className="calendar-section">
          <h2>Calendar with Custom Constraints</h2>
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            showNavigation={true}
            showMonthSelector={true}
            minDate={minDate}
            maxDate={maxDate}
            disabledDates={disabledDates}
            highlightedDates={highlightedDates}
          />
          <p className="calendar-note">
            📝 Weekends are disabled, next week is highlighted
          </p>
        </div>

        {selectedDate && (
          <div className="selected-date-info">
            <h3>Selected Date Information</h3>
            <p>
              <strong>Selected:</strong> {selectedDate.toDateString()}
            </p>
            <p>
              <strong>ISO String:</strong> {selectedDate.toISOString().split('T')[0]}
            </p>
            <p>
              <strong>Locale String:</strong> {selectedDate.toLocaleDateString()}
            </p>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Calendar component supports keyboard navigation, accessibility features, and responsive design.</p>
      </footer>
    </div>
  );
}

export default App;