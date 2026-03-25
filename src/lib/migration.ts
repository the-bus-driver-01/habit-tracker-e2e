import {
  StorageData,
  StorageResult,
  StorageError,
  StorageErrorCode,
  StorageMetadata,
  Habit,
  CheckIn,
  Streak,
  HabitFrequency,
  HabitCategory,
  CompletionStatus,
  BackupInfo,
  TimestampString
} from './types';
import { dateUtils } from './storage';
import { createDetailedError, integrityChecker } from './validation';

// Migration strategy interface
export interface MigrationStrategy {
  version: number;
  description: string;
  migrate: (data: any) => any;
  validate?: (data: any) => boolean;
  rollback?: (data: any) => any;
}

// Backup manager for safe migrations
export class BackupManager {
  private static readonly BACKUP_KEY_PREFIX = 'habitTracker_backup_';
  private static readonly MAX_BACKUPS = 10;

  // Create a backup before migration
  public static async createMigrationBackup(data: StorageData, version: number): Promise<BackupInfo> {
    const backupId = `v${version}_${Date.now()}`;
    const backupKey = `${this.BACKUP_KEY_PREFIX}${backupId}`;
    const timestamp = dateUtils.getCurrentTimestamp();

    const backupData = {
      id: backupId,
      timestamp,
      version: data.version,
      data: JSON.stringify(data)
    };

    try {
      localStorage.setItem(backupKey, JSON.stringify(backupData));

      // Cleanup old backups
      await this.cleanupOldBackups();

      return {
        id: backupId,
        timestamp,
        size: new Blob([JSON.stringify(backupData)]).size,
        version: data.version,
        compressed: false,
        encrypted: false
      };
    } catch (error) {
      throw new Error(`Failed to create backup: ${error}`);
    }
  }

  // Restore from backup
  public static async restoreFromBackup(backupId: string): Promise<StorageData | null> {
    const backupKey = `${this.BACKUP_KEY_PREFIX}${backupId}`;

    try {
      const backupJson = localStorage.getItem(backupKey);
      if (!backupJson) {
        return null;
      }

      const backup = JSON.parse(backupJson);
      return JSON.parse(backup.data);
    } catch (error) {
      console.error(`Failed to restore backup ${backupId}:`, error);
      return null;
    }
  }

  // List available backups
  public static getAvailableBackups(): BackupInfo[] {
    const backups: BackupInfo[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.BACKUP_KEY_PREFIX)) {
        try {
          const backupJson = localStorage.getItem(key);
          if (backupJson) {
            const backup = JSON.parse(backupJson);
            backups.push({
              id: backup.id,
              timestamp: backup.timestamp,
              version: backup.version,
              size: new Blob([backupJson]).size,
              compressed: false,
              encrypted: false
            });
          }
        } catch (error) {
          console.warn(`Invalid backup found: ${key}`);
        }
      }
    }

    return backups.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  // Cleanup old backups
  private static async cleanupOldBackups(): Promise<void> {
    const backups = this.getAvailableBackups();

    if (backups.length > this.MAX_BACKUPS) {
      const backupsToDelete = backups.slice(this.MAX_BACKUPS);

      for (const backup of backupsToDelete) {
        const backupKey = `${this.BACKUP_KEY_PREFIX}${backup.id}`;
        localStorage.removeItem(backupKey);
      }
    }
  }

  // Delete specific backup
  public static deleteBackup(backupId: string): boolean {
    try {
      const backupKey = `${this.BACKUP_KEY_PREFIX}${backupId}`;
      localStorage.removeItem(backupKey);
      return true;
    } catch (error) {
      console.error(`Failed to delete backup ${backupId}:`, error);
      return false;
    }
  }
}

// Migration registry and executor
export class MigrationManager {
  private migrations: Map<number, MigrationStrategy> = new Map();
  private currentVersion = 1;

  constructor() {
    this.registerDefaultMigrations();
  }

  // Register a migration strategy
  public registerMigration(migration: MigrationStrategy): void {
    this.migrations.set(migration.version, migration);
    this.currentVersion = Math.max(this.currentVersion, migration.version);
  }

  // Get target version
  public getCurrentVersion(): number {
    return this.currentVersion;
  }

  // Execute migration from source version to target version
  public async migrate(data: any, sourceVersion: number, targetVersion?: number): Promise<StorageResult<StorageData>> {
    const target = targetVersion || this.currentVersion;

    if (sourceVersion === target) {
      return {
        success: true,
        data: data as StorageData
      };
    }

    if (sourceVersion > target) {
      return {
        success: false,
        error: createDetailedError(
          StorageErrorCode.MIGRATION_ERROR,
          `Cannot downgrade from version ${sourceVersion} to ${target}`,
          { operation: 'migration_downgrade' },
          false,
          false
        )
      };
    }

    try {
      // Create backup before migration
      let backupInfo: BackupInfo | null = null;
      if (this.isValidStorageData(data)) {
        try {
          backupInfo = await BackupManager.createMigrationBackup(data, sourceVersion);
          console.log(`Created migration backup: ${backupInfo.id}`);
        } catch (error) {
          console.warn('Failed to create migration backup:', error);
        }
      }

      let migratedData = data;

      // Apply migrations step by step
      for (let version = sourceVersion + 1; version <= target; version++) {
        const migration = this.migrations.get(version);

        if (!migration) {
          return {
            success: false,
            error: createDetailedError(
              StorageErrorCode.MIGRATION_ERROR,
              `No migration strategy found for version ${version}`,
              {
                operation: 'migration_missing_strategy',
                data: { sourceVersion, targetVersion: target, missingVersion: version }
              },
              false,
              false
            )
          };
        }

        console.log(`Applying migration to version ${version}: ${migration.description}`);

        try {
          // Validate pre-migration data if validator exists
          if (migration.validate && !migration.validate(migratedData)) {
            throw new Error(`Pre-migration validation failed for version ${version}`);
          }

          // Apply migration
          migratedData = migration.migrate(migratedData);

          // Ensure version is updated
          migratedData.version = version;

          // Update metadata
          if (migratedData.metadata) {
            migratedData.metadata.dataVersion = version;
            migratedData.metadata.updatedAt = dateUtils.getCurrentTimestamp();
          }

        } catch (error) {
          // Migration failed, attempt rollback if available
          if (migration.rollback && migratedData !== data) {
            try {
              migratedData = migration.rollback(migratedData);
              console.log(`Rolled back migration for version ${version}`);
            } catch (rollbackError) {
              console.error(`Rollback failed for version ${version}:`, rollbackError);
            }
          }

          return {
            success: false,
            error: createDetailedError(
              StorageErrorCode.MIGRATION_ERROR,
              `Migration failed at version ${version}: ${error}`,
              {
                operation: 'migration_execution',
                data: { sourceVersion, targetVersion: target, failedVersion: version, error: String(error) }
              },
              true,
              false
            )
          };
        }
      }

      // Final validation and integrity check
      if (!this.isValidStorageData(migratedData)) {
        return {
          success: false,
          error: createDetailedError(
            StorageErrorCode.MIGRATION_ERROR,
            'Migration resulted in invalid data structure',
            { operation: 'migration_validation' },
            true,
            false
          )
        };
      }

      // Run integrity check and repair if needed
      const repairedData = integrityChecker.repairData(migratedData);

      console.log(`Migration completed successfully from version ${sourceVersion} to ${target}`);

      return {
        success: true,
        data: repairedData
      };

    } catch (error) {
      return {
        success: false,
        error: createDetailedError(
          StorageErrorCode.MIGRATION_ERROR,
          `Unexpected error during migration: ${error}`,
          {
            operation: 'migration_unexpected',
            data: { sourceVersion, targetVersion: target, error: String(error) }
          },
          true,
          false
        )
      };
    }
  }

  // Validate if data looks like StorageData
  private isValidStorageData(data: any): data is StorageData {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.version === 'number' &&
      typeof data.habits === 'object' &&
      typeof data.checkIns === 'object' &&
      typeof data.streaks === 'object' &&
      typeof data.metadata === 'object'
    );
  }

  // Register default migrations
  private registerDefaultMigrations(): void {
    // Migration from version 0 (no version) to version 1
    this.registerMigration({
      version: 1,
      description: 'Initialize versioning and add metadata',
      migrate: (data: any) => {
        const now = dateUtils.getCurrentTimestamp();

        // Handle completely empty or null data
        if (!data || Object.keys(data).length === 0) {
          return {
            version: 1,
            habits: {},
            checkIns: {},
            streaks: {},
            metadata: {
              dataVersion: 1,
              createdAt: now,
              updatedAt: now,
              totalHabits: 0,
              totalCheckIns: 0
            }
          };
        }

        // Migrate existing data structure
        const migratedData: StorageData = {
          version: 1,
          habits: data.habits || {},
          checkIns: data.checkIns || {},
          streaks: data.streaks || {},
          metadata: {
            dataVersion: 1,
            createdAt: data.metadata?.createdAt || now,
            updatedAt: now,
            totalHabits: Object.keys(data.habits || {}).length,
            totalCheckIns: Object.keys(data.checkIns || {}).length
          }
        };

        // Ensure all habits have required fields
        Object.keys(migratedData.habits).forEach(habitId => {
          const habit = migratedData.habits[habitId];

          // Add missing required fields with defaults
          if (!habit.category) {
            habit.category = HabitCategory.OTHER;
          }
          if (!habit.frequency) {
            habit.frequency = HabitFrequency.DAILY;
          }
          if (!habit.targetCount) {
            habit.targetCount = 1;
          }
          if (habit.isActive === undefined) {
            habit.isActive = true;
          }
          if (!habit.createdAt) {
            habit.createdAt = now;
          }
          if (!habit.updatedAt) {
            habit.updatedAt = now;
          }
        });

        // Ensure all check-ins have valid status
        Object.keys(migratedData.checkIns).forEach(checkInId => {
          const checkIn = migratedData.checkIns[checkInId];

          if (!checkIn.status) {
            checkIn.status = CompletionStatus.COMPLETED;
          }
          if (checkIn.count === undefined) {
            checkIn.count = 1;
          }
          if (!checkIn.timestamp) {
            checkIn.timestamp = now;
          }
        });

        // Initialize missing streaks
        Object.keys(migratedData.habits).forEach(habitId => {
          if (!migratedData.streaks[habitId]) {
            migratedData.streaks[habitId] = {
              habitId,
              currentStreak: 0,
              longestStreak: 0,
              totalCompletions: 0,
              streakType: 'new',
              lastCalculated: now
            };
          }
        });

        return migratedData;
      },
      validate: (data: any) => {
        // Can accept any data structure for initial migration
        return true;
      }
    });

    // Future migration example: version 1 to 2
    this.registerMigration({
      version: 2,
      description: 'Add habit categories and enhanced tracking',
      migrate: (data: StorageData) => {
        // This would be used for future schema changes
        const migratedData = { ...data };

        // Example: Add new fields, transform existing data, etc.
        Object.values(migratedData.habits).forEach(habit => {
          // Add new fields with defaults if they don't exist
          if (!habit.goal) {
            habit.goal = '';
          }
          if (!habit.motivation) {
            habit.motivation = '';
          }
        });

        migratedData.version = 2;
        if (migratedData.metadata) {
          migratedData.metadata.dataVersion = 2;
          migratedData.metadata.updatedAt = dateUtils.getCurrentTimestamp();
        }

        return migratedData;
      },
      validate: (data: StorageData) => {
        return data.version === 1;
      },
      rollback: (data: StorageData) => {
        // Remove fields added in v2 migration
        const rolledBackData = { ...data };

        Object.values(rolledBackData.habits).forEach(habit => {
          delete habit.goal;
          delete habit.motivation;
        });

        rolledBackData.version = 1;
        if (rolledBackData.metadata) {
          rolledBackData.metadata.dataVersion = 1;
        }

        return rolledBackData;
      }
    });
  }

  // Get migration path
  public getMigrationPath(sourceVersion: number, targetVersion?: number): MigrationStrategy[] {
    const target = targetVersion || this.currentVersion;
    const path: MigrationStrategy[] = [];

    for (let version = sourceVersion + 1; version <= target; version++) {
      const migration = this.migrations.get(version);
      if (migration) {
        path.push(migration);
      }
    }

    return path;
  }

  // Check if migration is needed
  public isMigrationNeeded(currentVersion: number): boolean {
    return currentVersion < this.currentVersion;
  }

  // Get all registered migrations
  public getAllMigrations(): MigrationStrategy[] {
    return Array.from(this.migrations.values()).sort((a, b) => a.version - b.version);
  }
}

// Schema version detector
export class SchemaVersionDetector {
  // Detect version from data structure
  public static detectVersion(data: any): number {
    // If data has explicit version, use it
    if (data && typeof data.version === 'number') {
      return data.version;
    }

    // If no data or empty object, assume version 0 (needs initial migration)
    if (!data || Object.keys(data).length === 0) {
      return 0;
    }

    // Heuristics to detect version based on data structure
    if (data.metadata && data.metadata.dataVersion) {
      return data.metadata.dataVersion;
    }

    // Check for version 1 characteristics
    if (data.habits && data.checkIns && data.streaks) {
      // Check if habits have required v1 fields
      const hasV1Features = Object.values(data.habits).some((habit: any) =>
        habit.category && habit.frequency && typeof habit.isActive === 'boolean'
      );

      if (hasV1Features) {
        return 1;
      }
    }

    // Fallback: assume version 0 (needs migration)
    return 0;
  }

  // Validate version compatibility
  public static isVersionSupported(version: number, maxSupportedVersion: number): boolean {
    return version >= 0 && version <= maxSupportedVersion;
  }

  // Get version info
  public static getVersionInfo(data: any): {
    detectedVersion: number;
    hasExplicitVersion: boolean;
    isValid: boolean;
    needsMigration: boolean;
    currentVersion: number;
  } {
    const migrationManager = new MigrationManager();
    const detectedVersion = this.detectVersion(data);
    const currentVersion = migrationManager.getCurrentVersion();

    return {
      detectedVersion,
      hasExplicitVersion: data && typeof data.version === 'number',
      isValid: this.isVersionSupported(detectedVersion, currentVersion),
      needsMigration: detectedVersion < currentVersion,
      currentVersion
    };
  }
}

// Global migration manager instance
export const migrationManager = new MigrationManager();