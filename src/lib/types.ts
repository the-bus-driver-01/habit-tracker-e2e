// Core enums
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

// Core data types
export type HabitId = string;
export type CheckInId = string;
export type DateString = string; // ISO date string (YYYY-MM-DD)
export type TimestampString = string; // ISO timestamp string

// Habit interface
export interface Habit {
  id: HabitId;
  name: string;
  description?: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  targetCount: number; // How many times per frequency period
  color?: string; // Hex color for visual representation
  icon?: string; // Icon identifier/emoji
  isActive: boolean;
  createdAt: TimestampString;
  updatedAt: TimestampString;

  // Custom frequency settings
  customFrequency?: {
    days: number; // Every N days
    weekdays?: number[]; // 0=Sunday, 1=Monday, etc.
  };

  // Goal and motivation
  goal?: string;
  motivation?: string;

  // Scheduling
  reminderTime?: string; // HH:MM format
  timezone?: string;
}

// Check-in interface
export interface CheckIn {
  id: CheckInId;
  habitId: HabitId;
  date: DateString;
  status: CompletionStatus;
  count: number; // How many times completed on this date
  notes?: string;
  timestamp: TimestampString; // When the check-in was recorded
}

// Streak interface
export interface Streak {
  habitId: HabitId;
  currentStreak: number; // Days in current streak
  longestStreak: number; // Best streak ever
  lastCompletedDate?: DateString;
  streakStartDate?: DateString;
  totalCompletions: number;

  // Streak metadata
  streakType: 'current' | 'broken' | 'new';
  lastCalculated: TimestampString;
}

// Progress summary interface
export interface HabitProgress {
  habitId: HabitId;
  completionRate: number; // 0-1, percentage of targets met
  streak: Streak;
  recentCheckIns: CheckIn[];
  nextDueDate?: DateString;

  // Weekly/monthly summaries
  weeklyStats: {
    week: DateString; // Start of week
    completed: number;
    target: number;
    rate: number;
  }[];

  monthlyStats: {
    month: string; // YYYY-MM format
    completed: number;
    target: number;
    rate: number;
  }[];
}

// Storage interfaces
export interface StorageData {
  version: number;
  habits: Record<HabitId, Habit>;
  checkIns: Record<CheckInId, CheckIn>;
  streaks: Record<HabitId, Streak>;
  metadata: StorageMetadata;
}

export interface StorageMetadata {
  lastBackup?: TimestampString;
  dataVersion: number;
  createdAt: TimestampString;
  updatedAt: TimestampString;
  totalHabits: number;
  totalCheckIns: number;
}

// API response interfaces
export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: StorageError;
}

export interface StorageError {
  code: StorageErrorCode;
  message: string;
  details?: any;
  timestamp: TimestampString;
}

export enum StorageErrorCode {
  STORAGE_UNAVAILABLE = 'STORAGE_UNAVAILABLE',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  DATA_CORRUPTED = 'DATA_CORRUPTED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE_ID = 'DUPLICATE_ID',
  MIGRATION_ERROR = 'MIGRATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Hook state interfaces
export interface HabitsState {
  habits: Habit[];
  checkIns: Record<HabitId, CheckIn[]>;
  streaks: Record<HabitId, Streak>;
  isLoading: boolean;
  error: StorageError | null;
  lastUpdated: TimestampString | null;
}

export interface HabitsActions {
  // Habit CRUD
  createHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => Promise<StorageResult<Habit>>;
  updateHabit: (id: HabitId, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>) => Promise<StorageResult<Habit>>;
  deleteHabit: (id: HabitId) => Promise<StorageResult<boolean>>;

  // Check-in management
  recordCheckIn: (habitId: HabitId, date: DateString, status: CompletionStatus, count?: number, notes?: string) => Promise<StorageResult<CheckIn>>;
  updateCheckIn: (checkInId: CheckInId, updates: Partial<Omit<CheckIn, 'id' | 'habitId' | 'timestamp'>>) => Promise<StorageResult<CheckIn>>;
  deleteCheckIn: (checkInId: CheckInId) => Promise<StorageResult<boolean>>;

  // Data utilities
  refreshData: () => Promise<void>;
  getHabitProgress: (habitId: HabitId, days?: number) => HabitProgress | null;
  exportData: () => StorageData;
  importData: (data: Partial<StorageData>) => Promise<StorageResult<boolean>>;
  clearAllData: () => Promise<StorageResult<boolean>>;
}

// Validation schemas (for runtime validation)
export interface ValidationSchema<T> {
  validate: (data: unknown) => data is T;
  sanitize?: (data: T) => T;
}

// Date utility types
export interface DateRange {
  start: DateString;
  end: DateString;
}

export interface TimeZoneInfo {
  timezone: string;
  offset: number; // UTC offset in minutes
  abbreviation: string;
}

// Storage configuration
export interface StorageConfig {
  storageKey: string;
  version: number;
  maxBackups?: number;
  compressionEnabled?: boolean;
  encryptionEnabled?: boolean;
  migrationStrategies?: Record<number, (data: any) => any>;
}

// Chart/visualization data types
export interface ChartDataPoint {
  date: DateString;
  value: number;
  label?: string;
  color?: string;
}

export interface HabitAnalytics {
  habitId: HabitId;
  totalDays: number;
  completedDays: number;
  completionRate: number;
  averageDaily: number;
  bestStreak: number;
  currentStreak: number;
  trends: {
    weekly: ChartDataPoint[];
    monthly: ChartDataPoint[];
    yearly: ChartDataPoint[];
  };
  patterns: {
    bestDayOfWeek: number;
    bestTimeOfDay?: number;
    seasonalTrends: Record<string, number>;
  };
}

// Enhanced validation and error handling types
export interface ValidationRule<T> {
  field: keyof T;
  validate: (value: any) => boolean;
  message: string;
  required?: boolean;
}

export interface SanitizationRule<T> {
  field: keyof T;
  sanitize: (value: any) => any;
}

export interface DataIntegrityCheck {
  name: string;
  check: (data: StorageData) => boolean;
  fix?: (data: StorageData) => StorageData;
  severity: 'error' | 'warning' | 'info';
}

export interface RecoveryStrategy {
  name: string;
  condition: (error: StorageError) => boolean;
  recover: (data?: any) => Promise<StorageData | null>;
  description: string;
}

export interface ErrorContext {
  operation: string;
  timestamp: TimestampString;
  data?: any;
  stackTrace?: string;
  userAgent?: string;
  sessionId?: string;
}

// Enhanced error tracking
export interface DetailedStorageError extends StorageError {
  context?: ErrorContext;
  recoverable: boolean;
  retryable: boolean;
  userMessage: string;
  technicalDetails?: any;
}

// Data corruption detection and repair
export interface CorruptionReport {
  corruptedHabits: HabitId[];
  corruptedCheckIns: CheckInId[];
  orphanedCheckIns: CheckInId[];
  invalidStreaks: HabitId[];
  missingReferences: {
    checkInsWithoutHabits: CheckInId[];
    streaksWithoutHabits: HabitId[];
  };
  recommendedActions: string[];
}

// Backup and recovery
export interface BackupInfo {
  id: string;
  timestamp: TimestampString;
  size: number;
  version: number;
  checksum?: string;
  compressed?: boolean;
  encrypted?: boolean;
}

// Performance monitoring
export interface PerformanceMetrics {
  operationName: string;
  duration: number;
  dataSize: number;
  recordCount: number;
  timestamp: TimestampString;
  success: boolean;
  error?: string;
}