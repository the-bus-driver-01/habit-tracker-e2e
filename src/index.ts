/**
 * Habit Tracker localStorage Data Layer
 *
 * A comprehensive data layer implementation for habit tracking applications
 * with localStorage persistence, data validation, error handling, and React hooks.
 */

// Core types
export * from './lib/types';

// Storage layer
export {
  habitStorage,
  habitCRUD,
  checkInManager,
  validators,
  dateUtils,
  HabitStorage,
  HabitCRUD,
  CheckInManager
} from './lib/storage';

// Validation and error handling
export {
  dataValidator,
  integrityChecker,
  errorRecoveryManager,
  performanceMonitor,
  DataValidator,
  DataIntegrityChecker,
  ErrorRecoveryManager,
  PerformanceMonitor,
  createDetailedError
} from './lib/validation';

// Migration system
export {
  migrationManager,
  BackupManager,
  MigrationManager,
  SchemaVersionDetector
} from './lib/migration';

// React hooks
export {
  useHabits,
  useFilteredHabits,
  useHabit
} from './hooks/useHabits';

// Test utilities (for development)
export { runStorageTests } from './lib/test-storage';
export { testUseHabitsIntegration } from './hooks/test-hooks';

// Version information
export const VERSION = '1.0.0';
export const DATA_VERSION = 1;

/**
 * Quick start guide:
 *
 * 1. Basic usage with storage layer:
 * ```typescript
 * import { habitCRUD, checkInManager, HabitCategory, HabitFrequency, CompletionStatus } from '@/lib/storage';
 *
 * // Create a habit
 * const habit = await habitCRUD.createHabit({
 *   name: 'Morning Exercise',
 *   category: HabitCategory.FITNESS,
 *   frequency: HabitFrequency.DAILY,
 *   targetCount: 1,
 *   isActive: true
 * });
 *
 * // Record a check-in
 * if (habit.success && habit.data) {
 *   await checkInManager.recordCheckIn(
 *     habit.data.id,
 *     '2024-01-01',
 *     CompletionStatus.COMPLETED,
 *     1,
 *     'Great workout!'
 *   );
 * }
 * ```
 *
 * 2. Usage with React hooks:
 * ```typescript
 * import { useHabits, HabitCategory } from '@/hooks/useHabits';
 *
 * function HabitsComponent() {
 *   const {
 *     habits,
 *     isLoading,
 *     error,
 *     createHabit,
 *     recordCheckIn
 *   } = useHabits();
 *
 *   const handleCreateHabit = async () => {
 *     await createHabit({
 *       name: 'Read Books',
 *       category: HabitCategory.LEARNING,
 *       frequency: HabitFrequency.DAILY,
 *       targetCount: 1,
 *       isActive: true
 *     });
 *   };
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.userMessage}</div>;
 *
 *   return (
 *     <div>
 *       {habits.map(habit => (
 *         <div key={habit.id}>{habit.name}</div>
 *       ))}
 *       <button onClick={handleCreateHabit}>Add Habit</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * 3. Data validation and error handling:
 * ```typescript
 * import { dataValidator, createDetailedError, StorageErrorCode } from '@/lib/validation';
 *
 * // Validate habit data
 * const validation = dataValidator.validateHabit(habitData);
 * if (!validation.isValid) {
 *   console.error('Validation errors:', validation.errors);
 * }
 *
 * // Create detailed errors
 * const error = createDetailedError(
 *   StorageErrorCode.VALIDATION_ERROR,
 *   'Invalid input',
 *   { operation: 'create_habit' }
 * );
 * ```
 *
 * 4. Migration and versioning:
 * ```typescript
 * import { migrationManager, SchemaVersionDetector } from '@/lib/migration';
 *
 * // Check if migration is needed
 * const versionInfo = SchemaVersionDetector.getVersionInfo(data);
 * if (versionInfo.needsMigration) {
 *   const result = await migrationManager.migrate(data, versionInfo.detectedVersion);
 * }
 * ```
 */