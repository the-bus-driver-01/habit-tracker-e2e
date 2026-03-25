export interface Habit {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: Date;
  isActive: boolean;
}

export interface CheckIn {
  id: string;
  habitId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum CheckInStatus {
  COMPLETED = 'completed',
  INCOMPLETE = 'incomplete',
  NO_DATA = 'no_data'
}

export interface HabitStatus {
  habit: Habit;
  status: CheckInStatus;
  checkIn?: CheckIn;
}

export interface DayCellData {
  date: string; // ISO date string (YYYY-MM-DD)
  habitStatuses: HabitStatus[];
}