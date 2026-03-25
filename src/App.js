import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import CalendarGrid from "@/components/Calendar";
function App() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const handleDateChange = (date) => {
        setSelectedDate(date);
    };
    const handleMonthChange = (date) => {
        setSelectedDate(date);
    };
    return (_jsxs("div", { className: "app", children: [_jsx("h1", { children: "Habit Tracker" }), _jsx(CalendarGrid, { selectedDate: selectedDate, onDateChange: handleDateChange, onMonthChange: handleMonthChange })] }));
}
export default App;
