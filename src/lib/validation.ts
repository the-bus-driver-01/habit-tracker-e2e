import {
  Habit,
  CheckIn,
  Streak,
  StorageData,
  ValidationRule,
  SanitizationRule,
  DataIntegrityCheck,
  RecoveryStrategy,
  DetailedStorageError,
  StorageError,
  StorageErrorCode,
  CorruptionReport,
  HabitId,
  CheckInId,
  DateString,
  TimestampString,
  HabitFrequency,
  CompletionStatus,
  HabitCategory,
  ErrorContext,
  PerformanceMetrics
} from './types';
import { validators, dateUtils } from './storage';

// Enhanced validation system
export class DataValidator {
  private habitRules: ValidationRule<Habit>[] = [
    {
      field: 'name',
      validate: (value) => typeof value === 'string' && value.trim().length > 0 && value.length <= 100,
      message: 'Habit name is required and must be 1-100 characters',
      required: true
    },
    {
      field: 'description',
      validate: (value) => value === undefined || (typeof value === 'string' && value.length <= 500),
      message: 'Habit description must be less than 500 characters',
      required: false
    },
    {
      field: 'category',
      validate: (value) => validators.isValidHabitCategory(value),
      message: 'Invalid habit category',
      required: true
    },
    {
      field: 'frequency',
      validate: (value) => validators.isValidHabitFrequency(value),
      message: 'Invalid habit frequency',
      required: true
    },
    {
      field: 'targetCount',
      validate: (value) => typeof value === 'number' && value > 0 && value <= 100,
      message: 'Target count must be a positive number (max 100)',
      required: true
    },
    {
      field: 'color',
      validate: (value) => value === undefined || /^#[0-9A-Fa-f]{6}$/.test(value),
      message: 'Color must be a valid hex color',
      required: false
    },
    {
      field: 'reminderTime',
      validate: (value) => value === undefined || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value),
      message: 'Reminder time must be in HH:MM format',
      required: false
    },
    {
      field: 'isActive',
      validate: (value) => typeof value === 'boolean',
      message: 'isActive must be a boolean',
      required: true
    },
    {
      field: 'createdAt',
      validate: (value) => validators.isValidTimestamp(value),
      message: 'Invalid createdAt timestamp',
      required: true
    },
    {
      field: 'updatedAt',
      validate: (value) => validators.isValidTimestamp(value),
      message: 'Invalid updatedAt timestamp',
      required: true
    }
  ];

  private checkInRules: ValidationRule<CheckIn>[] = [
    {
      field: 'habitId',
      validate: (value) => validators.isValidId(value),
      message: 'Valid habit ID is required',
      required: true
    },
    {
      field: 'date',
      validate: (value) => validators.isValidDateString(value),
      message: 'Valid date is required (YYYY-MM-DD format)',
      required: true
    },
    {
      field: 'status',
      validate: (value) => validators.isValidCompletionStatus(value),
      message: 'Invalid completion status',
      required: true
    },
    {
      field: 'count',
      validate: (value) => typeof value === 'number' && value >= 0 && value <= 1000,
      message: 'Count must be a non-negative number (max 1000)',
      required: true
    },
    {
      field: 'notes',
      validate: (value) => value === undefined || (typeof value === 'string' && value.length <= 500),
      message: 'Notes must be less than 500 characters',
      required: false
    },
    {
      field: 'timestamp',
      validate: (value) => validators.isValidTimestamp(value),
      message: 'Invalid timestamp',
      required: true
    }
  ];

  private streakRules: ValidationRule<Streak>[] = [
    {
      field: 'habitId',
      validate: (value) => validators.isValidId(value),
      message: 'Valid habit ID is required',
      required: true
    },
    {
      field: 'currentStreak',
      validate: (value) => typeof value === 'number' && value >= 0,
      message: 'Current streak must be a non-negative number',
      required: true
    },
    {
      field: 'longestStreak',
      validate: (value) => typeof value === 'number' && value >= 0,
      message: 'Longest streak must be a non-negative number',
      required: true
    },
    {
      field: 'totalCompletions',
      validate: (value) => typeof value === 'number' && value >= 0,
      message: 'Total completions must be a non-negative number',
      required: true
    },
    {
      field: 'lastCalculated',
      validate: (value) => validators.isValidTimestamp(value),
      message: 'Invalid lastCalculated timestamp',
      required: true
    }
  ];

  // Validate individual objects
  public validateHabit(habit: Partial<Habit>): { isValid: boolean; errors: string[] } {
    return this.validateObject(habit, this.habitRules);
  }

  public validateCheckIn(checkIn: Partial<CheckIn>): { isValid: boolean; errors: string[] } {
    return this.validateObject(checkIn, this.checkInRules);
  }

  public validateStreak(streak: Partial<Streak>): { isValid: boolean; errors: string[] } {
    return this.validateObject(streak, this.streakRules);
  }

  private validateObject<T>(obj: Partial<T>, rules: ValidationRule<T>[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const rule of rules) {
      const value = obj[rule.field];

      // Check required fields
      if (rule.required && (value === undefined || value === null)) {
        errors.push(`${String(rule.field)} is required`);
        continue;
      }

      // Skip validation for optional undefined fields
      if (!rule.required && (value === undefined || value === null)) {
        continue;
      }

      // Run validation
      if (!rule.validate(value)) {
        errors.push(rule.message);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Sanitization
  public sanitizeHabit(habit: Partial<Habit>): Partial<Habit> {
    const sanitized: Partial<Habit> = { ...habit };

    if (sanitized.name) {
      sanitized.name = sanitized.name.toString().trim().substring(0, 100);
    }

    if (sanitized.description) {
      sanitized.description = sanitized.description.toString().trim().substring(0, 500);
    }

    if (sanitized.targetCount !== undefined) {
      sanitized.targetCount = Math.max(1, Math.min(100, Math.floor(Number(sanitized.targetCount) || 1)));
    }

    if (sanitized.color && typeof sanitized.color === 'string') {
      sanitized.color = sanitized.color.toLowerCase().trim();
      if (!/^#[0-9a-f]{6}$/.test(sanitized.color)) {
        delete sanitized.color;
      }
    }

    if (sanitized.reminderTime && typeof sanitized.reminderTime === 'string') {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
      const match = sanitized.reminderTime.match(timeRegex);
      if (match) {
        const hours = match[1].padStart(2, '0');
        const minutes = match[2];
        sanitized.reminderTime = `${hours}:${minutes}`;
      } else {
        delete sanitized.reminderTime;
      }
    }

    if (sanitized.goal) {
      sanitized.goal = sanitized.goal.toString().trim().substring(0, 200);
    }

    if (sanitized.motivation) {
      sanitized.motivation = sanitized.motivation.toString().trim().substring(0, 300);
    }

    if (sanitized.notes) {
      sanitized.notes = sanitized.notes.toString().trim().substring(0, 500);
    }

    return sanitized;
  }

  public sanitizeCheckIn(checkIn: Partial<CheckIn>): Partial<CheckIn> {
    const sanitized: Partial<CheckIn> = { ...checkIn };

    if (sanitized.count !== undefined) {
      sanitized.count = Math.max(0, Math.min(1000, Math.floor(Number(sanitized.count) || 0)));
    }

    if (sanitized.notes) {
      sanitized.notes = sanitized.notes.toString().trim().substring(0, 500);
    }

    return sanitized;
  }
}

// Data integrity checker
export class DataIntegrityChecker {
  private checks: DataIntegrityCheck[] = [
    {
      name: 'orphaned_checkins',
      check: (data) => {
        const habitIds = new Set(Object.keys(data.habits));
        return Object.values(data.checkIns).every(checkIn => habitIds.has(checkIn.habitId));
      },
      fix: (data) => {
        const habitIds = new Set(Object.keys(data.habits));
        const validCheckIns: Record<string, CheckIn> = {};

        Object.entries(data.checkIns).forEach(([id, checkIn]) => {
          if (habitIds.has(checkIn.habitId)) {
            validCheckIns[id] = checkIn;
          }
        });

        return { ...data, checkIns: validCheckIns };
      },
      severity: 'warning'
    },
    {
      name: 'orphaned_streaks',
      check: (data) => {
        const habitIds = new Set(Object.keys(data.habits));
        return Object.keys(data.streaks).every(habitId => habitIds.has(habitId));
      },
      fix: (data) => {
        const habitIds = new Set(Object.keys(data.habits));
        const validStreaks: Record<string, Streak> = {};

        Object.entries(data.streaks).forEach(([habitId, streak]) => {
          if (habitIds.has(habitId)) {
            validStreaks[habitId] = streak;
          }
        });

        return { ...data, streaks: validStreaks };
      },
      severity: 'warning'
    },
    {
      name: 'missing_streaks',
      check: (data) => {
        const habitIds = Object.keys(data.habits);
        return habitIds.every(habitId => data.streaks[habitId]);
      },
      fix: (data) => {
        const streaks = { ...data.streaks };
        const now = dateUtils.getCurrentTimestamp();

        Object.keys(data.habits).forEach(habitId => {
          if (!streaks[habitId]) {
            streaks[habitId] = {
              habitId,
              currentStreak: 0,
              longestStreak: 0,
              totalCompletions: 0,
              streakType: 'new',
              lastCalculated: now
            };
          }
        });

        return { ...data, streaks };
      },
      severity: 'info'
    },
    {
      name: 'invalid_dates',
      check: (data) => {
        return Object.values(data.checkIns).every(checkIn => validators.isValidDateString(checkIn.date));
      },
      fix: (data) => {
        const validCheckIns: Record<string, CheckIn> = {};

        Object.entries(data.checkIns).forEach(([id, checkIn]) => {
          if (validators.isValidDateString(checkIn.date)) {
            validCheckIns[id] = checkIn;
          }
        });

        return { ...data, checkIns: validCheckIns };
      },
      severity: 'error'
    },
    {
      name: 'duplicate_checkins',
      check: (data) => {
        const seen = new Set<string>();
        return Object.values(data.checkIns).every(checkIn => {
          const key = `${checkIn.habitId}_${checkIn.date}`;
          if (seen.has(key)) {
            return false;
          }
          seen.add(key);
          return true;
        });
      },
      fix: (data) => {
        const seen = new Map<string, CheckIn>();
        const validCheckIns: Record<string, CheckIn> = {};

        Object.entries(data.checkIns).forEach(([id, checkIn]) => {
          const key = `${checkIn.habitId}_${checkIn.date}`;
          const existing = seen.get(key);

          if (!existing || checkIn.timestamp > existing.timestamp) {
            // Keep the most recent check-in
            seen.set(key, checkIn);
            validCheckIns[id] = checkIn;
          }
        });

        return { ...data, checkIns: validCheckIns };
      },
      severity: 'warning'
    }
  ];

  public checkDataIntegrity(data: StorageData): CorruptionReport {
    const validator = new DataValidator();
    const corruptedHabits: HabitId[] = [];
    const corruptedCheckIns: CheckInId[] = [];
    const orphanedCheckIns: CheckInId[] = [];
    const invalidStreaks: HabitId[] = [];
    const checkInsWithoutHabits: CheckInId[] = [];
    const streaksWithoutHabits: HabitId[] = [];
    const recommendedActions: string[] = [];

    // Check habits
    Object.entries(data.habits).forEach(([id, habit]) => {
      const validation = validator.validateHabit(habit);
      if (!validation.isValid) {
        corruptedHabits.push(id);
      }
    });

    // Check check-ins
    const habitIds = new Set(Object.keys(data.habits));
    Object.entries(data.checkIns).forEach(([id, checkIn]) => {
      const validation = validator.validateCheckIn(checkIn);
      if (!validation.isValid) {
        corruptedCheckIns.push(id);
      }

      if (!habitIds.has(checkIn.habitId)) {
        orphanedCheckIns.push(id);
        checkInsWithoutHabits.push(id);
      }
    });

    // Check streaks
    Object.entries(data.streaks).forEach(([habitId, streak]) => {
      const validation = validator.validateStreak(streak);
      if (!validation.isValid) {
        invalidStreaks.push(habitId);
      }

      if (!habitIds.has(habitId)) {
        streaksWithoutHabits.push(habitId);
      }
    });

    // Generate recommendations
    if (corruptedHabits.length > 0) {
      recommendedActions.push(`Fix or remove ${corruptedHabits.length} corrupted habit(s)`);
    }
    if (orphanedCheckIns.length > 0) {
      recommendedActions.push(`Remove ${orphanedCheckIns.length} orphaned check-in(s)`);
    }
    if (invalidStreaks.length > 0) {
      recommendedActions.push(`Recalculate ${invalidStreaks.length} invalid streak(s)`);
    }

    return {
      corruptedHabits,
      corruptedCheckIns,
      orphanedCheckIns,
      invalidStreaks,
      missingReferences: {
        checkInsWithoutHabits,
        streaksWithoutHabits
      },
      recommendedActions
    };
  }

  public repairData(data: StorageData): StorageData {
    let repairedData = { ...data };

    // Apply all integrity checks and fixes
    for (const check of this.checks) {
      if (!check.check(repairedData) && check.fix) {
        repairedData = check.fix(repairedData);
      }
    }

    return repairedData;
  }
}

// Error recovery system
export class ErrorRecoveryManager {
  private recoveryStrategies: RecoveryStrategy[] = [
    {
      name: 'corrupted_data_recovery',
      condition: (error) => error.code === StorageErrorCode.DATA_CORRUPTED,
      recover: async () => {
        // Try to recover from any backup or return minimal default data
        return {
          version: 1,
          habits: {},
          checkIns: {},
          streaks: {},
          metadata: {
            dataVersion: 1,
            createdAt: dateUtils.getCurrentTimestamp(),
            updatedAt: dateUtils.getCurrentTimestamp(),
            totalHabits: 0,
            totalCheckIns: 0
          }
        };
      },
      description: 'Initialize with empty data structure'
    },
    {
      name: 'quota_exceeded_recovery',
      condition: (error) => error.code === StorageErrorCode.QUOTA_EXCEEDED,
      recover: async (data: StorageData) => {
        if (!data) return null;

        // Remove old check-ins to free up space
        const oneMonthAgo = dateUtils.addDays(dateUtils.getCurrentDate(), -30);
        const filteredCheckIns: Record<string, CheckIn> = {};

        Object.entries(data.checkIns).forEach(([id, checkIn]) => {
          if (checkIn.date >= oneMonthAgo) {
            filteredCheckIns[id] = checkIn;
          }
        });

        return {
          ...data,
          checkIns: filteredCheckIns
        };
      },
      description: 'Remove old check-ins to free up storage space'
    },
    {
      name: 'storage_unavailable_recovery',
      condition: (error) => error.code === StorageErrorCode.STORAGE_UNAVAILABLE,
      recover: async () => {
        // Return in-memory fallback data
        return {
          version: 1,
          habits: {},
          checkIns: {},
          streaks: {},
          metadata: {
            dataVersion: 1,
            createdAt: dateUtils.getCurrentTimestamp(),
            updatedAt: dateUtils.getCurrentTimestamp(),
            totalHabits: 0,
            totalCheckIns: 0
          }
        };
      },
      description: 'Use in-memory storage as fallback'
    }
  ];

  public async attemptRecovery(error: StorageError, data?: StorageData): Promise<StorageData | null> {
    const strategy = this.recoveryStrategies.find(s => s.condition(error));

    if (strategy) {
      try {
        console.log(`Attempting recovery using strategy: ${strategy.name}`);
        const recoveredData = await strategy.recover(data);
        console.log(`Recovery successful: ${strategy.description}`);
        return recoveredData;
      } catch (recoveryError) {
        console.error(`Recovery failed for strategy ${strategy.name}:`, recoveryError);
      }
    }

    return null;
  }

  public getRecoveryOptions(error: StorageError): RecoveryStrategy[] {
    return this.recoveryStrategies.filter(s => s.condition(error));
  }
}

// Enhanced error creation with context
export function createDetailedError(
  code: StorageErrorCode,
  message: string,
  context?: Partial<ErrorContext>,
  recoverable: boolean = true,
  retryable: boolean = false
): DetailedStorageError {
  const userMessages: Record<StorageErrorCode, string> = {
    [StorageErrorCode.STORAGE_UNAVAILABLE]: 'Storage is temporarily unavailable. Your changes may not be saved.',
    [StorageErrorCode.QUOTA_EXCEEDED]: 'Storage is full. Consider removing old data.',
    [StorageErrorCode.DATA_CORRUPTED]: 'Some data appears to be corrupted. We\'ll try to recover what we can.',
    [StorageErrorCode.VALIDATION_ERROR]: 'Please check your input and try again.',
    [StorageErrorCode.NOT_FOUND]: 'The requested item was not found.',
    [StorageErrorCode.DUPLICATE_ID]: 'This item already exists.',
    [StorageErrorCode.MIGRATION_ERROR]: 'There was an issue updating your data format.',
    [StorageErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.'
  };

  return {
    code,
    message,
    details: context?.data,
    timestamp: dateUtils.getCurrentTimestamp(),
    context: {
      operation: 'unknown',
      timestamp: dateUtils.getCurrentTimestamp(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      sessionId: `session_${Date.now()}`,
      ...context
    },
    recoverable,
    retryable,
    userMessage: userMessages[code] || userMessages[StorageErrorCode.UNKNOWN_ERROR],
    technicalDetails: {
      code,
      originalMessage: message,
      context
    }
  };
}

// Performance monitoring
export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 100;

  public startOperation(operationName: string, dataSize: number = 0, recordCount: number = 0): () => void {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric({
        operationName,
        duration,
        dataSize,
        recordCount,
        timestamp: dateUtils.getCurrentTimestamp(),
        success: true
      });
    };
  }

  public recordError(operationName: string, error: string, duration?: number): void {
    this.recordMetric({
      operationName,
      duration: duration || 0,
      dataSize: 0,
      recordCount: 0,
      timestamp: dateUtils.getCurrentTimestamp(),
      success: false,
      error
    });
  }

  private recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  public getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  public getAveragePerformance(operationName?: string): {
    averageDuration: number;
    successRate: number;
    totalOperations: number;
  } {
    const relevantMetrics = operationName
      ? this.metrics.filter(m => m.operationName === operationName)
      : this.metrics;

    if (relevantMetrics.length === 0) {
      return { averageDuration: 0, successRate: 0, totalOperations: 0 };
    }

    const totalDuration = relevantMetrics.reduce((sum, m) => sum + m.duration, 0);
    const successCount = relevantMetrics.filter(m => m.success).length;

    return {
      averageDuration: totalDuration / relevantMetrics.length,
      successRate: successCount / relevantMetrics.length,
      totalOperations: relevantMetrics.length
    };
  }
}

// Global instances
export const dataValidator = new DataValidator();
export const integrityChecker = new DataIntegrityChecker();
export const errorRecoveryManager = new ErrorRecoveryManager();
export const performanceMonitor = new PerformanceMonitor();