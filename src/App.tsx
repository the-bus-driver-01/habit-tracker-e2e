import { useState } from "react";
import CalendarGrid from "@/components/Calendar";

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleMonthChange = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className="app">
      <h1>Habit Tracker</h1>
      <CalendarGrid
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        onMonthChange={handleMonthChange}
      />
    </div>
  );
}

export default App;
