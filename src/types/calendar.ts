export interface CalendarDate {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isEnabled: boolean;
}

export interface CalendarNavigationProps {
  currentDate: Date;
  onNavigate: (date: Date) => void;
  showYearSelector?: boolean;
  showMonthSelector?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export interface CalendarGridProps {
  currentDate: Date;
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  highlightedDates?: Date[];
}

export interface CalendarProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  highlightedDates?: Date[];
  showNavigation?: boolean;
  showYearSelector?: boolean;
  showMonthSelector?: boolean;
}

export interface CalendarState {
  currentDate: Date;
  selectedDate?: Date;
}

export interface NavigationEvent {
  type: 'previous' | 'next' | 'month' | 'year';
  value?: number;
}

export interface CalendarHookReturn {
  currentDate: Date;
  selectedDate?: Date;
  navigateToMonth: (direction: 'previous' | 'next') => void;
  navigateToDate: (date: Date) => void;
  selectDate: (date: Date) => void;
  resetToToday: () => void;
  calendarDates: CalendarDate[];
}