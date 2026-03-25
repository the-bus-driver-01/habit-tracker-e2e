import { Habit, CheckIn, HabitStatus, CheckInStatus, DayCellData } from '@/types/habit';

/**
 * Get the status of a habit for a specific date
 */
export function getHabitStatusForDate(
  habit: Habit,
  date: string,
  checkIns: CheckIn[]
): HabitStatus {
  // Find check-in for this habit on this date
  const checkIn = checkIns.find(
    ci => ci.habitId === habit.id && ci.date === date
  );

  // If habit wasn't active on this date, return no data
  const habitCreatedDate = new Date(habit.createdAt).toISOString().split('T')[0];
  if (!habit.isActive || date < habitCreatedDate) {
    return {
      habit,
      status: CheckInStatus.NO_DATA
    };
  }

  // If there's a check-in, use its status
  if (checkIn) {
    return {
      habit,
      status: checkIn.completed ? CheckInStatus.COMPLETED : CheckInStatus.INCOMPLETE,
      checkIn
    };
  }

  // If no check-in exists and the date is in the past, it's incomplete
  const today = new Date().toISOString().split('T')[0];
  if (date < today) {
    return {
      habit,
      status: CheckInStatus.INCOMPLETE
    };
  }

  // For today or future dates with no check-in, show no data
  return {
    habit,
    status: CheckInStatus.NO_DATA
  };
}

/**
 * Build day cell data for a specific date
 */
export function buildDayCellData(
  date: string,
  habits: Habit[],
  checkIns: CheckIn[]
): DayCellData {
  const habitStatuses = habits.map(habit =>
    getHabitStatusForDate(habit, date, checkIns)
  );

  return {
    date,
    habitStatuses
  };
}

/**
 * Generate date range for calendar view
 */
export function generateDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Get month calendar data (including leading/trailing days for complete weeks)
 */
export function getMonthCalendarData(
  year: number,
  month: number, // 0-based month
  habits: Habit[],
  checkIns: CheckIn[]
): DayCellData[] {
  // Get first day of month and last day of month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Get start of calendar (Sunday of the week containing first day)
  const calendarStart = new Date(firstDay);
  calendarStart.setDate(firstDay.getDate() - firstDay.getDay());

  // Get end of calendar (Saturday of the week containing last day)
  const calendarEnd = new Date(lastDay);
  calendarEnd.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

  // Generate all dates in the calendar view
  const startDateStr = calendarStart.toISOString().split('T')[0];
  const endDateStr = calendarEnd.toISOString().split('T')[0];
  const dates = generateDateRange(startDateStr, endDateStr);

  // Build day cell data for each date
  return dates.map(date => buildDayCellData(date, habits, checkIns));
}