import {
  StorageData,
  StorageResult,
  StorageError,
  StorageErrorCode,
  StorageConfig,
  StorageMetadata,
  Habit,
  CheckIn,
  Streak,
  HabitId,
  CheckInId,
  DateString,
  TimestampString,
  ValidationSchema,
  HabitFrequency,
  CompletionStatus,
  HabitCategory
} from './types';
import {
  dataValidator,
  integrityChecker,
  errorRecoveryManager,
  performanceMonitor,
  createDetailedError
} from './validation';
import { migrationManager, SchemaVersionDetector } from './migration';

// Default storage configuration
const DEFAULT_CONFIG: StorageConfig = {
  storageKey: 'habitTracker',
  version: 1,
  maxBackups: 5,
  compressionEnabled: false,
  encryptionEnabled: false,
  migrationStrategies: {}
};

// Storage utility class
export class HabitStorage {
  private config: StorageConfig;
  private isAvailable: boolean;

  constructor(config: Partial<StorageConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.isAvailable = this.checkStorageAvailability();
  }

  // Check if localStorage is available
  private checkStorageAvailability(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.warn('localStorage is not available:', error);
      return false;
    }
  }

  // Safe JSON parse with error handling
  private safeJsonParse<T>(data: string, fallback: T): T {
    try {
      return JSON.parse(data) as T;
    } catch (error) {
      console.error('JSON parse error:', error);
      return fallback;
    }
  }

  // Safe JSON stringify with error handling
  private safeJsonStringify(data: any): string | null {
    try {
      return JSON.stringify(data);
    } catch (error) {
      console.error('JSON stringify error:', error);
      return null;
    }
  }

  // Get current timestamp
  private getCurrentTimestamp(): TimestampString {
    return new Date().toISOString();
  }

  // Generate unique ID
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  // Get storage quota information
  private async getStorageQuota(): Promise<{ used: number; available: number } | null> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage || 0,
          available: estimate.quota || 0
        };
      }
    } catch (error) {
      console.warn('Storage quota estimation failed:', error);
    }
    return null;
  }

  // Validate storage data structure
  private validateStorageData(data: any): data is StorageData {
    if (!data || typeof data !== 'object') {
      return false;
    }

    const requiredFields = ['version', 'habits', 'checkIns', 'streaks', 'metadata'];
    for (const field of requiredFields) {
      if (!(field in data)) {
        return false;
      }
    }

    // Validate version
    if (typeof data.version !== 'number' || data.version <= 0) {
      return false;
    }

    // Validate habits object
    if (typeof data.habits !== 'object' || data.habits === null) {
      return false;
    }

    // Validate checkIns object
    if (typeof data.checkIns !== 'object' || data.checkIns === null) {
      return false;
    }

    // Validate streaks object
    if (typeof data.streaks !== 'object' || data.streaks === null) {
      return false;
    }

    // Validate metadata
    if (typeof data.metadata !== 'object' || data.metadata === null) {
      return false;
    }

    return true;
  }

  // Create default storage data
  private createDefaultStorageData(): StorageData {
    const now = this.getCurrentTimestamp();
    return {
      version: this.config.version,
      habits: {},
      checkIns: {},
      streaks: {},
      metadata: {
        dataVersion: this.config.version,
        createdAt: now,
        updatedAt: now,
        totalHabits: 0,
        totalCheckIns: 0
      }
    };
  }

  // Create storage error
  private createError(code: StorageErrorCode, message: string, details?: any): StorageError {
    return createDetailedError(code, message, {
      operation: 'storage',
      data: details
    }, true, code === StorageErrorCode.STORAGE_UNAVAILABLE || code === StorageErrorCode.QUOTA_EXCEEDED);
  }

  // Create success result
  private createSuccessResult<T>(data: T): StorageResult<T> {
    return {
      success: true,
      data
    };
  }

  // Create error result
  private createErrorResult<T>(error: StorageError): StorageResult<T> {
    return {
      success: false,
      error
    };
  }

  // Read data from localStorage
  public async readData(): Promise<StorageResult<StorageData>> {
    const endPerfTracking = performanceMonitor.startOperation('readData');

    if (!this.isAvailable) {
      endPerfTracking();

      // Attempt error recovery
      const recoveryError = this.createError(StorageErrorCode.STORAGE_UNAVAILABLE, 'localStorage is not available');
      const recoveredData = await errorRecoveryManager.attemptRecovery(recoveryError);

      if (recoveredData) {
        return this.createSuccessResult(recoveredData);
      }

      return this.createErrorResult(recoveryError);
    }

    try {
      const rawData = localStorage.getItem(this.config.storageKey);

      if (!rawData) {
        // Return default data if nothing is stored
        const defaultData = this.createDefaultStorageData();
        const writeResult = await this.writeData(defaultData);
        endPerfTracking();

        if (!writeResult.success) {
          return this.createErrorResult(writeResult.error!);
        }

        return this.createSuccessResult(defaultData);
      }

      const parsedData = this.safeJsonParse(rawData, null);

      if (!parsedData) {
        endPerfTracking();
        const corruptionError = this.createError(StorageErrorCode.DATA_CORRUPTED, 'Failed to parse stored data');

        // Attempt recovery
        const recoveredData = await errorRecoveryManager.attemptRecovery(corruptionError);
        if (recoveredData) {
          await this.writeData(recoveredData);
          return this.createSuccessResult(recoveredData);
        }

        return this.createErrorResult(corruptionError);
      }

      // Detect schema version
      const versionInfo = SchemaVersionDetector.getVersionInfo(parsedData);

      if (!versionInfo.isValid) {
        endPerfTracking();
        return this.createErrorResult(
          this.createError(StorageErrorCode.DATA_CORRUPTED, `Unsupported data version: ${versionInfo.detectedVersion}`)
        );
      }

      let finalData = parsedData;

      // Handle data migration if needed
      if (versionInfo.needsMigration) {
        console.log(`Migration needed from version ${versionInfo.detectedVersion} to ${versionInfo.currentVersion}`);

        const migrationResult = await migrationManager.migrate(
          parsedData,
          versionInfo.detectedVersion,
          versionInfo.currentVersion
        );

        if (!migrationResult.success) {
          endPerfTracking();
          return this.createErrorResult(migrationResult.error!);
        }

        finalData = migrationResult.data!;

        // Save migrated data
        const saveResult = await this.writeData(finalData);
        if (!saveResult.success) {
          console.warn('Failed to save migrated data:', saveResult.error);
        }
      }

      // Validate final data structure
      if (!this.validateStorageData(finalData)) {
        endPerfTracking();

        // Try data repair
        const repairedData = integrityChecker.repairData(finalData);

        if (this.validateStorageData(repairedData)) {
          console.log('Data integrity issues found and repaired');
          await this.writeData(repairedData);
          endPerfTracking();
          return this.createSuccessResult(repairedData);
        }

        const corruptionError = this.createError(StorageErrorCode.DATA_CORRUPTED, 'Stored data is invalid or corrupted after repair attempt');

        // Attempt full recovery
        const recoveredData = await errorRecoveryManager.attemptRecovery(corruptionError, finalData);
        if (recoveredData) {
          await this.writeData(recoveredData);
          endPerfTracking();
          return this.createSuccessResult(recoveredData);
        }

        return this.createErrorResult(corruptionError);
      }

      endPerfTracking();
      return this.createSuccessResult(finalData);

    } catch (error) {
      endPerfTracking();
      performanceMonitor.recordError('readData', String(error));

      const unknownError = this.createError(StorageErrorCode.UNKNOWN_ERROR, 'Failed to read data from storage', error);

      // Attempt recovery
      const recoveredData = await errorRecoveryManager.attemptRecovery(unknownError);
      if (recoveredData) {
        await this.writeData(recoveredData);
        return this.createSuccessResult(recoveredData);
      }

      return this.createErrorResult(unknownError);
    }
  }

  // Write data to localStorage
  public async writeData(data: StorageData): Promise<StorageResult<boolean>> {
    const endPerfTracking = performanceMonitor.startOperation('writeData', 0, Object.keys(data.habits).length + Object.keys(data.checkIns).length);

    if (!this.isAvailable) {
      endPerfTracking();
      return this.createErrorResult(
        this.createError(StorageErrorCode.STORAGE_UNAVAILABLE, 'localStorage is not available')
      );
    }

    try {
      // Validate data before writing
      if (!this.validateStorageData(data)) {
        endPerfTracking();
        performanceMonitor.recordError('writeData', 'Invalid data structure');
        return this.createErrorResult(
          this.createError(StorageErrorCode.VALIDATION_ERROR, 'Data validation failed before write')
        );
      }

      // Run integrity check and repair if needed
      const repairedData = integrityChecker.repairData(data);

      // Update metadata
      const updatedData: StorageData = {
        ...repairedData,
        version: this.config.version,
        metadata: {
          ...repairedData.metadata,
          dataVersion: this.config.version,
          updatedAt: this.getCurrentTimestamp(),
          totalHabits: Object.keys(repairedData.habits).length,
          totalCheckIns: Object.keys(repairedData.checkIns).length
        }
      };

      const serializedData = this.safeJsonStringify(updatedData);

      if (!serializedData) {
        endPerfTracking();
        performanceMonitor.recordError('writeData', 'Serialization failed');
        return this.createErrorResult(
          this.createError(StorageErrorCode.UNKNOWN_ERROR, 'Failed to serialize data')
        );
      }

      // Check storage quota before writing
      const quota = await this.getStorageQuota();
      const dataSize = new Blob([serializedData]).size;

      if (quota && dataSize > quota.available - quota.used) {
        endPerfTracking();

        const quotaError = this.createError(StorageErrorCode.QUOTA_EXCEEDED, 'Storage quota exceeded');

        // Attempt recovery by cleaning up old data
        const recoveredData = await errorRecoveryManager.attemptRecovery(quotaError, updatedData);
        if (recoveredData) {
          // Try writing the recovered (cleaned up) data
          const recoveredSerialized = this.safeJsonStringify(recoveredData);
          if (recoveredSerialized) {
            try {
              localStorage.setItem(this.config.storageKey, recoveredSerialized);
              console.log('Successfully wrote data after quota cleanup');
              return this.createSuccessResult(true);
            } catch (recoveryWriteError) {
              // Even recovery failed
            }
          }
        }

        return this.createErrorResult(quotaError);
      }

      localStorage.setItem(this.config.storageKey, serializedData);
      endPerfTracking();
      return this.createSuccessResult(true);

    } catch (error) {
      endPerfTracking();
      performanceMonitor.recordError('writeData', String(error));

      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        const quotaError = this.createError(StorageErrorCode.QUOTA_EXCEEDED, 'Storage quota exceeded', error);

        // Attempt recovery
        const recoveredData = await errorRecoveryManager.attemptRecovery(quotaError, data);
        if (recoveredData) {
          // Retry with cleaned up data
          return this.writeData(recoveredData);
        }

        return this.createErrorResult(quotaError);
      }

      return this.createErrorResult(
        this.createError(StorageErrorCode.UNKNOWN_ERROR, 'Failed to write data to storage', error)
      );
    }
  }


  // Clear all data
  public async clearData(): Promise<StorageResult<boolean>> {
    if (!this.isAvailable) {
      return this.createErrorResult(
        this.createError(StorageErrorCode.STORAGE_UNAVAILABLE, 'localStorage is not available')
      );
    }

    try {
      localStorage.removeItem(this.config.storageKey);
      return this.createSuccessResult(true);
    } catch (error) {
      return this.createErrorResult(
        this.createError(StorageErrorCode.UNKNOWN_ERROR, 'Failed to clear storage', error)
      );
    }
  }

  // Create backup
  public async createBackup(): Promise<StorageResult<string>> {
    const dataResult = await this.readData();
    if (!dataResult.success) {
      return this.createErrorResult(dataResult.error!);
    }

    const backupData = {
      ...dataResult.data!,
      metadata: {
        ...dataResult.data!.metadata,
        lastBackup: this.getCurrentTimestamp()
      }
    };

    const serialized = this.safeJsonStringify(backupData);
    if (!serialized) {
      return this.createErrorResult(
        this.createError(StorageErrorCode.UNKNOWN_ERROR, 'Failed to create backup')
      );
    }

    return this.createSuccessResult(serialized);
  }

  // Restore from backup
  public async restoreFromBackup(backupData: string): Promise<StorageResult<boolean>> {
    const parsedData = this.safeJsonParse(backupData, null);

    if (!parsedData || !this.validateStorageData(parsedData)) {
      return this.createErrorResult(
        this.createError(StorageErrorCode.VALIDATION_ERROR, 'Invalid backup data')
      );
    }

    return await this.writeData(parsedData);
  }

  // Get storage statistics
  public async getStorageStats(): Promise<{
    totalHabits: number;
    totalCheckIns: number;
    totalStreaks: number;
    dataSize: number;
    storageQuota?: { used: number; available: number };
  }> {
    const dataResult = await this.readData();
    const quota = await this.getStorageQuota();

    if (!dataResult.success) {
      return {
        totalHabits: 0,
        totalCheckIns: 0,
        totalStreaks: 0,
        dataSize: 0,
        storageQuota: quota || undefined
      };
    }

    const data = dataResult.data!;
    const serialized = this.safeJsonStringify(data) || '';

    return {
      totalHabits: Object.keys(data.habits).length,
      totalCheckIns: Object.keys(data.checkIns).length,
      totalStreaks: Object.keys(data.streaks).length,
      dataSize: new Blob([serialized]).size,
      storageQuota: quota || undefined
    };
  }
}

// Global storage instance
export const habitStorage = new HabitStorage();

// Utility functions for data validation
export const validators = {
  isValidId: (id: string): boolean => {
    return typeof id === 'string' && id.length > 0;
  },

  isValidDateString: (date: string): boolean => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(date)) return false;

    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime()) && parsedDate.toISOString().startsWith(date);
  },

  isValidTimestamp: (timestamp: string): boolean => {
    try {
      const date = new Date(timestamp);
      return !isNaN(date.getTime()) && date.toISOString() === timestamp;
    } catch {
      return false;
    }
  },

  isValidHabitFrequency: (frequency: string): frequency is HabitFrequency => {
    return Object.values(HabitFrequency).includes(frequency as HabitFrequency);
  },

  isValidCompletionStatus: (status: string): status is CompletionStatus => {
    return Object.values(CompletionStatus).includes(status as CompletionStatus);
  },

  isValidHabitCategory: (category: string): category is HabitCategory => {
    return Object.values(HabitCategory).includes(category as HabitCategory);
  }
};

// Date utility functions
export const dateUtils = {
  getCurrentDate(): DateString {
    return new Date().toISOString().split('T')[0];
  },

  getCurrentTimestamp(): TimestampString {
    return new Date().toISOString();
  },

  formatDate(date: Date): DateString {
    return date.toISOString().split('T')[0];
  },

  parseDate(dateString: DateString): Date {
    return new Date(dateString + 'T00:00:00.000Z');
  },

  addDays(date: DateString, days: number): DateString {
    const d = this.parseDate(date);
    d.setUTCDate(d.getUTCDate() + days);
    return this.formatDate(d);
  },

  getDaysDifference(date1: DateString, date2: DateString): number {
    const d1 = this.parseDate(date1);
    const d2 = this.parseDate(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  getWeekStart(date: DateString): DateString {
    const d = this.parseDate(date);
    const day = d.getUTCDay();
    d.setUTCDate(d.getUTCDate() - day);
    return this.formatDate(d);
  },

  getMonthStart(date: DateString): DateString {
    const d = this.parseDate(date);
    d.setUTCDate(1);
    return this.formatDate(d);
  },

  isValidDate(dateString: string): dateString is DateString {
    return validators.isValidDateString(dateString);
  }
};

// Habit CRUD operations
export class HabitCRUD {
  private storage: HabitStorage;

  constructor(storage: HabitStorage) {
    this.storage = storage;
  }

  // Validate habit data using enhanced validator
  private validateHabit(habit: Partial<Habit>): string[] {
    const validation = dataValidator.validateHabit(habit);
    return validation.errors;
  }

  // Sanitize habit data using enhanced validator
  private sanitizeHabit(habit: Partial<Habit>): Partial<Habit> {
    return dataValidator.sanitizeHabit(habit);
  }

  // Create a new habit
  public async createHabit(
    habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<StorageResult<Habit>> {
    // Validate input
    const errors = this.validateHabit(habitData);
    if (errors.length > 0) {
      return this.storage['createErrorResult'](
        this.storage['createError'](StorageErrorCode.VALIDATION_ERROR, `Validation failed: ${errors.join(', ')}`)
      );
    }

    // Sanitize input
    const sanitizedData = this.sanitizeHabit(habitData);

    // Read current data
    const dataResult = await this.storage.readData();
    if (!dataResult.success) {
      return this.storage['createErrorResult'](dataResult.error!);
    }

    const data = dataResult.data!;
    const now = dateUtils.getCurrentTimestamp();
    const id = this.storage['generateId']();

    // Create habit object
    const habit: Habit = {
      id,
      name: sanitizedData.name || '',
      description: sanitizedData.description,
      category: sanitizedData.category || HabitCategory.OTHER,
      frequency: sanitizedData.frequency || HabitFrequency.DAILY,
      targetCount: sanitizedData.targetCount || 1,
      color: sanitizedData.color,
      icon: sanitizedData.icon,
      isActive: sanitizedData.isActive !== undefined ? sanitizedData.isActive : true,
      createdAt: now,
      updatedAt: now,
      customFrequency: sanitizedData.customFrequency,
      goal: sanitizedData.goal,
      motivation: sanitizedData.motivation,
      reminderTime: sanitizedData.reminderTime,
      timezone: sanitizedData.timezone
    };

    // Add habit to data
    data.habits[id] = habit;

    // Initialize empty streak
    data.streaks[id] = {
      habitId: id,
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: 0,
      streakType: 'new',
      lastCalculated: now
    };

    // Save data
    const saveResult = await this.storage.writeData(data);
    if (!saveResult.success) {
      return this.storage['createErrorResult'](saveResult.error!);
    }

    return this.storage['createSuccessResult'](habit);
  }

  // Get a habit by ID
  public async getHabit(id: HabitId): Promise<StorageResult<Habit | null>> {
    if (!validators.isValidId(id)) {
      return this.storage['createErrorResult'](
        this.storage['createError'](StorageErrorCode.VALIDATION_ERROR, 'Invalid habit ID')
      );
    }

    const dataResult = await this.storage.readData();
    if (!dataResult.success) {
      return this.storage['createErrorResult'](dataResult.error!);
    }

    const habit = dataResult.data!.habits[id] || null;
    return this.storage['createSuccessResult'](habit);
  }

  // Get all habits
  public async getAllHabits(): Promise<StorageResult<Habit[]>> {
    const dataResult = await this.storage.readData();
    if (!dataResult.success) {
      return this.storage['createErrorResult'](dataResult.error!);
    }

    const habits = Object.values(dataResult.data!.habits);
    return this.storage['createSuccessResult'](habits);
  }

  // Get active habits
  public async getActiveHabits(): Promise<StorageResult<Habit[]>> {
    const allHabitsResult = await this.getAllHabits();
    if (!allHabitsResult.success) {
      return allHabitsResult;
    }

    const activeHabits = allHabitsResult.data!.filter(habit => habit.isActive);
    return this.storage['createSuccessResult'](activeHabits);
  }

  // Update a habit
  public async updateHabit(
    id: HabitId,
    updates: Partial<Omit<Habit, 'id' | 'createdAt'>>
  ): Promise<StorageResult<Habit>> {
    if (!validators.isValidId(id)) {
      return this.storage['createErrorResult'](
        this.storage['createError'](StorageErrorCode.VALIDATION_ERROR, 'Invalid habit ID')
      );
    }

    // Validate updates
    const errors = this.validateHabit(updates);
    if (errors.length > 0) {
      return this.storage['createErrorResult'](
        this.storage['createError'](StorageErrorCode.VALIDATION_ERROR, `Validation failed: ${errors.join(', ')}`)
      );
    }

    // Sanitize updates
    const sanitizedUpdates = this.sanitizeHabit(updates);

    // Read current data
    const dataResult = await this.storage.readData();
    if (!dataResult.success) {
      return this.storage['createErrorResult'](dataResult.error!);
    }

    const data = dataResult.data!;
    const existingHabit = data.habits[id];

    if (!existingHabit) {
      return this.storage['createErrorResult'](
        this.storage['createError'](StorageErrorCode.NOT_FOUND, `Habit with ID ${id} not found`)
      );
    }

    // Update habit
    const updatedHabit: Habit = {
      ...existingHabit,
      ...sanitizedUpdates,
      updatedAt: dateUtils.getCurrentTimestamp()
    };

    data.habits[id] = updatedHabit;

    // Save data
    const saveResult = await this.storage.writeData(data);
    if (!saveResult.success) {
      return this.storage['createErrorResult'](saveResult.error!);
    }

    return this.storage['createSuccessResult'](updatedHabit);
  }

  // Delete a habit
  public async deleteHabit(id: HabitId): Promise<StorageResult<boolean>> {
    if (!validators.isValidId(id)) {
      return this.storage['createErrorResult'](
        this.storage['createError'](StorageErrorCode.VALIDATION_ERROR, 'Invalid habit ID')
      );
    }

    // Read current data
    const dataResult = await this.storage.readData();
    if (!dataResult.success) {
      return this.storage['createErrorResult'](dataResult.error!);
    }

    const data = dataResult.data!;

    if (!data.habits[id]) {
      return this.storage['createErrorResult'](
        this.storage['createError'](StorageErrorCode.NOT_FOUND, `Habit with ID ${id} not found`)
      );
    }

    // Remove habit
    delete data.habits[id];

    // Remove related check-ins
    const checkInsToRemove = Object.keys(data.checkIns).filter(
      checkInId => data.checkIns[checkInId].habitId === id
    );
    checkInsToRemove.forEach(checkInId => {
      delete data.checkIns[checkInId];
    });

    // Remove streak data
    delete data.streaks[id];

    // Save data
    const saveResult = await this.storage.writeData(data);
    if (!saveResult.success) {
      return this.storage['createErrorResult'](saveResult.error!);
    }

    return this.storage['createSuccessResult'](true);
  }

  // Soft delete (mark as inactive instead of removing)
  public async archiveHabit(id: HabitId): Promise<StorageResult<Habit>> {
    return this.updateHabit(id, { isActive: false });
  }

  // Restore archived habit
  public async restoreHabit(id: HabitId): Promise<StorageResult<Habit>> {
    return this.updateHabit(id, { isActive: true });
  }

  // Search habits
  public async searchHabits(query: string): Promise<StorageResult<Habit[]>> {
    const allHabitsResult = await this.getAllHabits();
    if (!allHabitsResult.success) {
      return allHabitsResult;
    }

    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) {
      return this.storage['createSuccessResult']([]);
    }

    const matchingHabits = allHabitsResult.data!.filter(habit => {
      return (
        habit.name.toLowerCase().includes(searchTerm) ||
        habit.description?.toLowerCase().includes(searchTerm) ||
        habit.goal?.toLowerCase().includes(searchTerm) ||
        habit.motivation?.toLowerCase().includes(searchTerm) ||
        habit.category.toLowerCase().includes(searchTerm)
      );
    });

    return this.storage['createSuccessResult'](matchingHabits);
  }

  // Get habits by category
  public async getHabitsByCategory(category: HabitCategory): Promise<StorageResult<Habit[]>> {
    if (!validators.isValidHabitCategory(category)) {
      return this.storage['createErrorResult'](
        this.storage['createError'](StorageErrorCode.VALIDATION_ERROR, 'Invalid habit category')
      );
    }

    const allHabitsResult = await this.getAllHabits();
    if (!allHabitsResult.success) {
      return allHabitsResult;
    }

    const categoryHabits = allHabitsResult.data!.filter(habit => habit.category === category);
    return this.storage['createSuccessResult'](categoryHabits);
  }

  // Duplicate habit
  public async duplicateHabit(id: HabitId, name?: string): Promise<StorageResult<Habit>> {
    const habitResult = await this.getHabit(id);
    if (!habitResult.success) {
      return habitResult;
    }

    const originalHabit = habitResult.data!;
    if (!originalHabit) {
      return this.storage['createErrorResult'](
        this.storage['createError'](StorageErrorCode.NOT_FOUND, `Habit with ID ${id} not found`)
      );
    }

    // Create copy without id, timestamps
    const { id: _, createdAt, updatedAt, ...habitData } = originalHabit;

    // Update name if provided
    if (name) {
      habitData.name = name;
    } else {
      habitData.name = `${habitData.name} (Copy)`;
    }

    return this.createHabit(habitData);
  }
}

// Create global habit CRUD instance
export const habitCRUD = new HabitCRUD(habitStorage);

// Check-in and Streak Management
export class CheckInManager {
  private storage: HabitStorage;

  constructor(storage: HabitStorage) {
    this.storage = storage;
  }

  // Validate check-in data using enhanced validator
  private validateCheckIn(checkIn: Partial<CheckIn>): string[] {
    const validation = dataValidator.validateCheckIn(checkIn);
    return validation.errors;
  }

  // Sanitize check-in data
  private sanitizeCheckIn(checkIn: Partial<CheckIn>): Partial<CheckIn> {
    return dataValidator.sanitizeCheckIn(checkIn);
  }

  // Record a check-in
  public async recordCheckIn(
    habitId: HabitId,
    date: DateString,
    status: CompletionStatus,
    count: number = 1,
    notes?: string
  ): Promise<StorageResult<CheckIn>> {
    // Validate inputs
    const checkInData = { habitId, date, status, count, notes };
    const errors = this.validateCheckIn(checkInData);
    if (errors.length > 0) {
      return this.storage['createErrorResult'](
        this.storage['createError'](StorageErrorCode.VALIDATION_ERROR, `Validation failed: ${errors.join(', ')}`)
      );
    }

    // Sanitize inputs
    const sanitizedData = this.sanitizeCheckIn(checkInData);

    // Read current data
    const dataResult = await this.storage.readData();
    if (!dataResult.success) {
      return this.storage['createErrorResult'](dataResult.error!);
    }

    const data = dataResult.data!;

    // Verify habit exists
    if (!data.habits[habitId]) {
      return this.storage['createErrorResult'](
        this.storage['createError'](StorageErrorCode.NOT_FOUND, `Habit with ID ${habitId} not found`)
      );
    }

    // Check for existing check-in on the same date
    const existingCheckIn = Object.values(data.checkIns).find(
      checkIn => checkIn.habitId === habitId && checkIn.date === date
    );

    if (existingCheckIn) {
      // Update existing check-in
      const updatedCheckIn: CheckIn = {
        ...existingCheckIn,
        status: sanitizedData.status || status,
        count: sanitizedData.count !== undefined ? sanitizedData.count : Math.max(0, count),
        notes: sanitizedData.notes || existingCheckIn.notes,
        timestamp: dateUtils.getCurrentTimestamp()
      };

      data.checkIns[existingCheckIn.id] = updatedCheckIn;

      // Recalculate streak
      const streakResult = await this.calculateStreak(habitId, data);
      if (streakResult.success && streakResult.data) {
        data.streaks[habitId] = streakResult.data;
      }

      // Save data
      const saveResult = await this.storage.writeData(data);
      if (!saveResult.success) {
        return this.storage['createErrorResult'](saveResult.error!);
      }

      return this.storage['createSuccessResult'](updatedCheckIn);
    } else {
      // Create new check-in
      const id = this.storage['generateId']();
      const newCheckIn: CheckIn = {
        id,
        habitId: sanitizedData.habitId || habitId,
        date: sanitizedData.date || date,
        status: sanitizedData.status || status,
        count: sanitizedData.count !== undefined ? sanitizedData.count : Math.max(0, count),
        notes: sanitizedData.notes,
        timestamp: dateUtils.getCurrentTimestamp()
      };

      data.checkIns[id] = newCheckIn;

      // Recalculate streak
      const streakResult = await this.calculateStreak(habitId, data);
      if (streakResult.success && streakResult.data) {
        data.streaks[habitId] = streakResult.data;
      }

      // Save data
      const saveResult = await this.storage.writeData(data);
      if (!saveResult.success) {
        return this.storage['createErrorResult'](saveResult.error!);
      }

      return this.storage['createSuccessResult'](newCheckIn);
    }
  }

  // Get check-in for a specific habit and date
  public async getCheckIn(habitId: HabitId, date: DateString): Promise<StorageResult<CheckIn | null>> {
    if (!validators.isValidId(habitId) || !validators.isValidDateString(date)) {
      return this.storage['createErrorResult'](
        this.storage['createError'](StorageErrorCode.VALIDATION_ERROR, 'Invalid habit ID or date')
      );
    }

    const dataResult = await this.storage.readData();
    if (!dataResult.success) {
      return this.storage['createErrorResult'](dataResult.error!);
    }

    const checkIn = Object.values(dataResult.data!.checkIns).find(
      checkIn => checkIn.habitId === habitId && checkIn.date === date
    ) || null;

    return this.storage['createSuccessResult'](checkIn);
  }

  // Get all check-ins for a habit
  public async getHabitCheckIns(
    habitId: HabitId,
    startDate?: DateString,
    endDate?: DateString
  ): Promise<StorageResult<CheckIn[]>> {
    if (!validators.isValidId(habitId)) {
      return this.storage['createErrorResult'](
        this.storage['createError'](StorageErrorCode.VALIDATION_ERROR, 'Invalid habit ID')
      );
    }

    const dataResult = await this.storage.readData();
    if (!dataResult.success) {
      return this.storage['createErrorResult'](dataResult.error!);
    }

    let checkIns = Object.values(dataResult.data!.checkIns).filter(
      checkIn => checkIn.habitId === habitId
    );

    // Filter by date range if provided
    if (startDate && validators.isValidDateString(startDate)) {
      checkIns = checkIns.filter(checkIn => checkIn.date >= startDate);
    }

    if (endDate && validators.isValidDateString(endDate)) {
      checkIns = checkIns.filter(checkIn => checkIn.date <= endDate);
    }

    // Sort by date (newest first)
    checkIns.sort((a, b) => b.date.localeCompare(a.date));

    return this.storage['createSuccessResult'](checkIns);
  }

  // Update check-in
  public async updateCheckIn(
    checkInId: CheckInId,
    updates: Partial<Omit<CheckIn, 'id' | 'habitId' | 'timestamp'>>
  ): Promise<StorageResult<CheckIn>> {
    if (!validators.isValidId(checkInId)) {
      return this.storage['createErrorResult'](
        this.storage['createError'](StorageErrorCode.VALIDATION_ERROR, 'Invalid check-in ID')
      );
    }

    // Validate updates
    const errors = this.validateCheckIn(updates);
    if (errors.length > 0) {
      return this.storage['createErrorResult'](
        this.storage['createError'](StorageErrorCode.VALIDATION_ERROR, `Validation failed: ${errors.join(', ')}`)
      );
    }

    // Sanitize updates
    const sanitizedUpdates = this.sanitizeCheckIn(updates);

    // Read current data
    const dataResult = await this.storage.readData();
    if (!dataResult.success) {
      return this.storage['createErrorResult'](dataResult.error!);
    }

    const data = dataResult.data!;
    const existingCheckIn = data.checkIns[checkInId];

    if (!existingCheckIn) {
      return this.storage['createErrorResult'](
        this.storage['createError'](StorageErrorCode.NOT_FOUND, `Check-in with ID ${checkInId} not found`)
      );
    }

    // Update check-in
    const updatedCheckIn: CheckIn = {
      ...existingCheckIn,
      ...sanitizedUpdates,
      timestamp: dateUtils.getCurrentTimestamp()
    };

    data.checkIns[checkInId] = updatedCheckIn;

    // Recalculate streak if status changed
    if (updates.status && updates.status !== existingCheckIn.status) {
      const streakResult = await this.calculateStreak(existingCheckIn.habitId, data);
      if (streakResult.success && streakResult.data) {
        data.streaks[existingCheckIn.habitId] = streakResult.data;
      }
    }

    // Save data
    const saveResult = await this.storage.writeData(data);
    if (!saveResult.success) {
      return this.storage['createErrorResult'](saveResult.error!);
    }

    return this.storage['createSuccessResult'](updatedCheckIn);
  }

  // Delete check-in
  public async deleteCheckIn(checkInId: CheckInId): Promise<StorageResult<boolean>> {
    if (!validators.isValidId(checkInId)) {
      return this.storage['createErrorResult'](
        this.storage['createError'](StorageErrorCode.VALIDATION_ERROR, 'Invalid check-in ID')
      );
    }

    // Read current data
    const dataResult = await this.storage.readData();
    if (!dataResult.success) {
      return this.storage['createErrorResult'](dataResult.error!);
    }

    const data = dataResult.data!;
    const checkIn = data.checkIns[checkInId];

    if (!checkIn) {
      return this.storage['createErrorResult'](
        this.storage['createError'](StorageErrorCode.NOT_FOUND, `Check-in with ID ${checkInId} not found`)
      );
    }

    const habitId = checkIn.habitId;

    // Remove check-in
    delete data.checkIns[checkInId];

    // Recalculate streak
    const streakResult = await this.calculateStreak(habitId, data);
    if (streakResult.success && streakResult.data) {
      data.streaks[habitId] = streakResult.data;
    }

    // Save data
    const saveResult = await this.storage.writeData(data);
    if (!saveResult.success) {
      return this.storage['createErrorResult'](saveResult.error!);
    }

    return this.storage['createSuccessResult'](true);
  }

  // Calculate streak for a habit
  public async calculateStreak(habitId: HabitId, data?: StorageData): Promise<StorageResult<Streak>> {
    if (!validators.isValidId(habitId)) {
      return this.storage['createErrorResult'](
        this.storage['createError'](StorageErrorCode.VALIDATION_ERROR, 'Invalid habit ID')
      );
    }

    // Get data if not provided
    if (!data) {
      const dataResult = await this.storage.readData();
      if (!dataResult.success) {
        return this.storage['createErrorResult'](dataResult.error!);
      }
      data = dataResult.data!;
    }

    const habit = data.habits[habitId];
    if (!habit) {
      return this.storage['createErrorResult'](
        this.storage['createError'](StorageErrorCode.NOT_FOUND, `Habit with ID ${habitId} not found`)
      );
    }

    // Get all completed check-ins for this habit, sorted by date
    const completedCheckIns = Object.values(data.checkIns)
      .filter(checkIn =>
        checkIn.habitId === habitId &&
        checkIn.status === CompletionStatus.COMPLETED
      )
      .sort((a, b) => a.date.localeCompare(b.date));

    if (completedCheckIns.length === 0) {
      const streak: Streak = {
        habitId,
        currentStreak: 0,
        longestStreak: 0,
        totalCompletions: 0,
        streakType: 'new',
        lastCalculated: dateUtils.getCurrentTimestamp()
      };
      return this.storage['createSuccessResult'](streak);
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    let lastDate = completedCheckIns[0].date;
    let streakStartDate = completedCheckIns[0].date;
    let lastCompletedDate = completedCheckIns[completedCheckIns.length - 1].date;

    // Calculate streaks by iterating through completed check-ins
    for (let i = 1; i < completedCheckIns.length; i++) {
      const currentDate = completedCheckIns[i].date;
      const daysDiff = dateUtils.getDaysDifference(lastDate, currentDate);

      if (this.isConsecutiveDay(habit, lastDate, currentDate)) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
        streakStartDate = currentDate;
      }

      lastDate = currentDate;
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    // Calculate current streak (from today backwards)
    const today = dateUtils.getCurrentDate();
    let currentDate = today;
    let checkingCurrentStreak = true;

    while (checkingCurrentStreak) {
      const checkIn = completedCheckIns.find(c => c.date === currentDate);

      if (checkIn) {
        currentStreak++;
        currentDate = dateUtils.addDays(currentDate, -1);
      } else if (currentStreak === 0) {
        // If we haven't found any completed check-ins yet, keep looking backwards
        currentDate = dateUtils.addDays(currentDate, -1);

        // Don't look too far back
        if (dateUtils.getDaysDifference(currentDate, today) > 7) {
          checkingCurrentStreak = false;
        }
      } else {
        // We found a gap in the streak
        checkingCurrentStreak = false;
      }
    }

    // Determine streak type
    let streakType: 'current' | 'broken' | 'new' = 'new';
    if (currentStreak > 0) {
      const lastCheckInDate = completedCheckIns[completedCheckIns.length - 1].date;
      const daysSinceLastCheckIn = dateUtils.getDaysDifference(lastCheckInDate, today);

      if (daysSinceLastCheckIn <= this.getMaxDaysBetweenCheckIns(habit)) {
        streakType = 'current';
      } else {
        streakType = 'broken';
      }
    }

    const streak: Streak = {
      habitId,
      currentStreak,
      longestStreak,
      lastCompletedDate,
      streakStartDate: currentStreak > 0 ? streakStartDate : undefined,
      totalCompletions: completedCheckIns.length,
      streakType,
      lastCalculated: dateUtils.getCurrentTimestamp()
    };

    return this.storage['createSuccessResult'](streak);
  }

  // Helper to determine if two dates are consecutive for a given habit frequency
  private isConsecutiveDay(habit: Habit, date1: DateString, date2: DateString): boolean {
    const daysDiff = dateUtils.getDaysDifference(date1, date2);

    switch (habit.frequency) {
      case HabitFrequency.DAILY:
        return daysDiff === 1;
      case HabitFrequency.WEEKLY:
        return daysDiff <= 7 && daysDiff >= 1;
      case HabitFrequency.MONTHLY:
        return daysDiff <= 31 && daysDiff >= 1;
      case HabitFrequency.CUSTOM:
        if (habit.customFrequency?.days) {
          return daysDiff <= habit.customFrequency.days && daysDiff >= 1;
        }
        return daysDiff === 1; // Default to daily
      default:
        return daysDiff === 1;
    }
  }

  // Helper to get maximum days allowed between check-ins for a streak to continue
  private getMaxDaysBetweenCheckIns(habit: Habit): number {
    switch (habit.frequency) {
      case HabitFrequency.DAILY:
        return 1;
      case HabitFrequency.WEEKLY:
        return 7;
      case HabitFrequency.MONTHLY:
        return 31;
      case HabitFrequency.CUSTOM:
        return habit.customFrequency?.days || 1;
      default:
        return 1;
    }
  }

  // Get streak for a habit
  public async getStreak(habitId: HabitId): Promise<StorageResult<Streak | null>> {
    if (!validators.isValidId(habitId)) {
      return this.storage['createErrorResult'](
        this.storage['createError'](StorageErrorCode.VALIDATION_ERROR, 'Invalid habit ID')
      );
    }

    const dataResult = await this.storage.readData();
    if (!dataResult.success) {
      return this.storage['createErrorResult'](dataResult.error!);
    }

    const streak = dataResult.data!.streaks[habitId] || null;
    return this.storage['createSuccessResult'](streak);
  }

  // Recalculate all streaks
  public async recalculateAllStreaks(): Promise<StorageResult<Record<HabitId, Streak>>> {
    const dataResult = await this.storage.readData();
    if (!dataResult.success) {
      return this.storage['createErrorResult'](dataResult.error!);
    }

    const data = dataResult.data!;
    const streaks: Record<HabitId, Streak> = {};

    // Recalculate streak for each habit
    for (const habitId of Object.keys(data.habits)) {
      const streakResult = await this.calculateStreak(habitId, data);
      if (streakResult.success && streakResult.data) {
        streaks[habitId] = streakResult.data;
        data.streaks[habitId] = streakResult.data;
      }
    }

    // Save updated data
    const saveResult = await this.storage.writeData(data);
    if (!saveResult.success) {
      return this.storage['createErrorResult'](saveResult.error!);
    }

    return this.storage['createSuccessResult'](streaks);
  }

  // Get completion statistics for a date range
  public async getCompletionStats(
    habitId: HabitId,
    startDate: DateString,
    endDate: DateString
  ): Promise<StorageResult<{
    totalDays: number;
    completedDays: number;
    completionRate: number;
    missedDays: number;
    skippedDays: number;
  }>> {
    if (!validators.isValidId(habitId) ||
        !validators.isValidDateString(startDate) ||
        !validators.isValidDateString(endDate)) {
      return this.storage['createErrorResult'](
        this.storage['createError'](StorageErrorCode.VALIDATION_ERROR, 'Invalid parameters')
      );
    }

    const checkInsResult = await this.getHabitCheckIns(habitId, startDate, endDate);
    if (!checkInsResult.success) {
      return this.storage['createErrorResult'](checkInsResult.error!);
    }

    const checkIns = checkInsResult.data!;
    const totalDays = dateUtils.getDaysDifference(startDate, endDate) + 1;
    const completedDays = checkIns.filter(checkIn => checkIn.status === CompletionStatus.COMPLETED).length;
    const missedDays = checkIns.filter(checkIn => checkIn.status === CompletionStatus.MISSED).length;
    const skippedDays = checkIns.filter(checkIn => checkIn.status === CompletionStatus.SKIPPED).length;
    const completionRate = totalDays > 0 ? completedDays / totalDays : 0;

    return this.storage['createSuccessResult']({
      totalDays,
      completedDays,
      completionRate,
      missedDays,
      skippedDays
    });
  }
}

// Create global check-in manager instance
export const checkInManager = new CheckInManager(habitStorage);