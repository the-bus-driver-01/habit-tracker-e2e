const HabitService = require('../services/habitService');
const fs = require('fs');
const path = require('path');

// Use a test database
const TEST_DB_PATH = path.join(__dirname, '../../test-data/test.db');

describe('HabitService Archiving Functionality', () => {
  let habitService;

  beforeEach(async () => {
    // Ensure test directory exists
    const testDir = path.dirname(TEST_DB_PATH);
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    // Remove test database if it exists
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }

    habitService = new HabitService();
    habitService.db.dbPath = TEST_DB_PATH;
    await habitService.initialize();
  });

  afterEach(async () => {
    await habitService.shutdown();

    // Clean up test database
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
  });

  describe('Basic Habit Operations', () => {
    test('should create a new habit', async () => {
      const habit = await habitService.createHabit('Exercise', 'Daily workout');

      expect(habit.id).toBeDefined();
      expect(habit.name).toBe('Exercise');
      expect(habit.description).toBe('Daily workout');
      expect(habit.isArchived).toBe(false);
      expect(habit.createdAt).toBeDefined();
      expect(habit.archivedAt).toBeNull();
    });

    test('should get active habits', async () => {
      await habitService.createHabit('Exercise', 'Daily workout');
      await habitService.createHabit('Reading', 'Read for 30 minutes');

      const activeHabits = await habitService.getActiveHabits();

      expect(activeHabits).toHaveLength(2);
      expect(activeHabits.every(h => !h.isArchived)).toBe(true);
    });
  });

  describe('Archiving Functionality', () => {
    test('should archive a habit', async () => {
      const habit = await habitService.createHabit('Exercise', 'Daily workout');

      const result = await habitService.archiveHabit(habit.id);

      expect(result.success).toBe(true);
      expect(result.habitId).toBe(habit.id);
      expect(result.archivedAt).toBeInstanceOf(Date);

      // Verify habit is archived
      const archivedHabit = await habitService.getHabitById(habit.id);
      expect(archivedHabit.isArchived).toBe(true);
      expect(archivedHabit.archivedAt).toBeDefined();
    });

    test('should hide archived habits from active list', async () => {
      const habit1 = await habitService.createHabit('Exercise', 'Daily workout');
      const habit2 = await habitService.createHabit('Reading', 'Read for 30 minutes');

      // Archive one habit
      await habitService.archiveHabit(habit1.id);

      // Active habits should only contain non-archived habit
      const activeHabits = await habitService.getActiveHabits();
      expect(activeHabits).toHaveLength(1);
      expect(activeHabits[0].id).toBe(habit2.id);
      expect(activeHabits[0].isArchived).toBe(false);
    });

    test('should show archived habits separately', async () => {
      const habit1 = await habitService.createHabit('Exercise', 'Daily workout');
      const habit2 = await habitService.createHabit('Reading', 'Read for 30 minutes');

      // Archive one habit
      await habitService.archiveHabit(habit1.id);

      // Archived habits should contain the archived habit
      const archivedHabits = await habitService.getArchivedHabits();
      expect(archivedHabits).toHaveLength(1);
      expect(archivedHabits[0].id).toBe(habit1.id);
      expect(archivedHabits[0].isArchived).toBe(true);
    });

    test('should restore an archived habit', async () => {
      const habit = await habitService.createHabit('Exercise', 'Daily workout');

      // Archive the habit
      await habitService.archiveHabit(habit.id);

      // Restore the habit
      const result = await habitService.restoreHabit(habit.id);

      expect(result.success).toBe(true);
      expect(result.habitId).toBe(habit.id);
      expect(result.restoredAt).toBeInstanceOf(Date);

      // Verify habit is no longer archived
      const restoredHabit = await habitService.getHabitById(habit.id);
      expect(restoredHabit.isArchived).toBe(false);
      expect(restoredHabit.archivedAt).toBeNull();

      // Verify habit appears in active list
      const activeHabits = await habitService.getActiveHabits();
      expect(activeHabits).toHaveLength(1);
      expect(activeHabits[0].id).toBe(habit.id);
    });

    test('should preserve historical data when archiving', async () => {
      const habit = await habitService.createHabit('Exercise', 'Daily workout');

      // Add some completions
      await habitService.completeHabit(habit.id, 'Great workout today');
      await habitService.completeHabit(habit.id, 'Did some cardio');

      // Archive the habit
      await habitService.archiveHabit(habit.id);

      // Historical data should still be accessible
      const completions = await habitService.getHabitCompletions(habit.id);
      expect(completions).toHaveLength(2);
      expect(completions[0].notes).toBe('Did some cardio');
      expect(completions[1].notes).toBe('Great workout today');

      // Stats should still work
      const stats = await habitService.getHabitStats(habit.id);
      expect(stats.totalCompletions).toBe(2);
      expect(stats.isArchived).toBe(true);
    });

    test('should throw error when archiving non-existent habit', async () => {
      await expect(habitService.archiveHabit('non-existent-id'))
        .rejects.toThrow('Habit not found');
    });

    test('should throw error when archiving already archived habit', async () => {
      const habit = await habitService.createHabit('Exercise', 'Daily workout');
      await habitService.archiveHabit(habit.id);

      await expect(habitService.archiveHabit(habit.id))
        .rejects.toThrow('Habit is already archived');
    });

    test('should throw error when restoring non-archived habit', async () => {
      const habit = await habitService.createHabit('Exercise', 'Daily workout');

      await expect(habitService.restoreHabit(habit.id))
        .rejects.toThrow('Habit is not archived');
    });
  });

  describe('Data Preservation', () => {
    test('should maintain completion history after archive and restore', async () => {
      const habit = await habitService.createHabit('Exercise', 'Daily workout');

      // Add completions
      await habitService.completeHabit(habit.id, 'Day 1');
      await habitService.completeHabit(habit.id, 'Day 2');

      // Get initial stats
      const initialStats = await habitService.getHabitStats(habit.id);

      // Archive and restore
      await habitService.archiveHabit(habit.id);
      await habitService.restoreHabit(habit.id);

      // Stats should be the same
      const finalStats = await habitService.getHabitStats(habit.id);
      expect(finalStats.totalCompletions).toBe(initialStats.totalCompletions);
      expect(finalStats.completionRate).toBe(initialStats.completionRate);

      // Completions should still be there
      const completions = await habitService.getHabitCompletions(habit.id);
      expect(completions).toHaveLength(2);
    });
  });
});