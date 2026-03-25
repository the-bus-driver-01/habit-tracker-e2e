// Core types for the habit tracker application

export type HabitId = string;
export type TimestampString = string;

export enum HabitCategory {
  HEALTH = 'health',
  PRODUCTIVITY = 'productivity',
  LEARNING = 'learning',
  LIFESTYLE = 'lifestyle',
  FITNESS = 'fitness',
  MINDFULNESS = 'mindfulness',
  SOCIAL = 'social',
  OTHER = 'other'
}

export enum HabitFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom'
}

export enum CompletionStatus {
  COMPLETED = 'completed',
  MISSED = 'missed',
  SKIPPED = 'skipped'
}

export interface Habit {
  id: HabitId;
  name: string;
  description?: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  targetCount: number;
  color?: string;
  icon?: string;
  isActive: boolean;
  createdAt: TimestampString;
  updatedAt: TimestampString;

  // Custom frequency settings
  customFrequency?: {
    days: number;
    weekdays?: number[];
  };

  // Goal and motivation
  goal?: string;
  motivation?: string;

  // Scheduling
  reminderTime?: string;
  timezone?: string;
}

export interface CheckIn {
  id: string;
  habitId: HabitId;
  date: TimestampString;
  status: CompletionStatus;
  count: number;
  notes?: string;
  timestamp: TimestampString;
}

export interface Streak {
  current: number;
  longest: number;
  lastUpdated: TimestampString;
}

export interface StorageError {
  code: string;
  message: string;
  details?: any;
  timestamp: TimestampString;
}

export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: StorageError;
}

export interface HabitProgress {
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  recentCheckIns: CheckIn[];
}

export interface HabitsState {
  habits: Habit[];
  checkIns: Record<HabitId, CheckIn[]>;
  streaks: Record<HabitId, Streak>;
  isLoading: boolean;
  error: StorageError | null;
  lastUpdated: TimestampString | null;
}

export interface HabitsActions {
  createHabit: (data: Partial<Habit>) => Promise<StorageResult<Habit>>;
  updateHabit: (id: HabitId, updates: Partial<Habit>) => Promise<StorageResult<Habit>>;
  deleteHabit: (id: HabitId) => Promise<StorageResult<boolean>>;
  recordCheckIn: (habitId: HabitId, status: CompletionStatus, count?: number, notes?: string) => Promise<StorageResult<CheckIn>>;
  refreshData: () => Promise<void>;
  getHabitProgress: (id: HabitId, days?: number) => HabitProgress | null;
}

// Form-specific types
export interface HabitFormData {
  name: string;
  description?: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  targetCount: number;
  color?: string;
  reminderTime?: string;
  goal?: string;
  motivation?: string;
  customFrequency?: {
    days: number;
    weekdays?: number[];
  };
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}