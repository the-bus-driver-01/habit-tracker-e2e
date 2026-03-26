const HabitService = require('../services/habitService');
const fs = require('fs');
const path = require('path');

// Use a test database
const TEST_DB_PATH = path.join(__dirname, '../../test-data/integration-test.db');

describe('Habit Archiving Integration Tests', () => {
  let habitService;

  beforeAll(async () => {
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

  afterAll(async () => {
    await habitService.shutdown();

    // Clean up test database
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
  });

  test('Complete habit archiving workflow', async () => {
    console.log('\n=== HABIT ARCHIVING INTEGRATION TEST ===');

    // 1. Create multiple habits
    console.log('\n1. Creating habits...');
    const exercise = await habitService.createHabit('Exercise', 'Daily 30-minute workout');
    const reading = await habitService.createHabit('Reading', 'Read for 1 hour daily');
    const meditation = await habitService.createHabit('Meditation', 'Morning meditation');

    console.log(`Created: ${exercise.name}, ${reading.name}, ${meditation.name}`);

    // 2. Complete some habits to create historical data
    console.log('\n2. Adding completion data...');
    await habitService.completeHabit(exercise.id, 'Great cardio session');
    await habitService.completeHabit(exercise.id, 'Strength training');
    await habitService.completeHabit(reading.id, 'Read 2 chapters');
    await habitService.completeHabit(meditation.id, '15 minutes of mindfulness');

    // Verify active habits show all habits
    const initialActiveHabits = await habitService.getActiveHabits();
    expect(initialActiveHabits).toHaveLength(3);
    console.log(`Active habits: ${initialActiveHabits.length}`);

    // 3. Archive some habits
    console.log('\n3. Archiving habits...');
    await habitService.archiveHabit(exercise.id);
    await habitService.archiveHabit(meditation.id);
    console.log('Archived: Exercise and Meditation');

    // 4. Verify archived habits are hidden from active list
    console.log('\n4. Checking active habits after archiving...');
    const activeAfterArchive = await habitService.getActiveHabits();
    expect(activeAfterArchive).toHaveLength(1);
    expect(activeAfterArchive[0].id).toBe(reading.id);
    console.log(`Active habits now: ${activeAfterArchive.length} (${activeAfterArchive[0].name})`);

    // 5. Verify archived habits appear in archived list
    console.log('\n5. Checking archived habits list...');
    const archivedHabits = await habitService.getArchivedHabits();
    expect(archivedHabits).toHaveLength(2);
    const archivedNames = archivedHabits.map(h => h.name).sort();
    expect(archivedNames).toEqual(['Exercise', 'Meditation']);
    console.log(`Archived habits: ${archivedNames.join(', ')}`);

    // 6. Verify historical data is preserved
    console.log('\n6. Verifying data preservation...');
    const exerciseCompletions = await habitService.getHabitCompletions(exercise.id);
    expect(exerciseCompletions).toHaveLength(2);
    console.log(`Exercise completions preserved: ${exerciseCompletions.length}`);

    const exerciseStats = await habitService.getHabitStats(exercise.id);
    expect(exerciseStats.totalCompletions).toBe(2);
    expect(exerciseStats.isArchived).toBe(true);
    console.log(`Exercise stats: ${exerciseStats.totalCompletions} completions, archived: ${exerciseStats.isArchived}`);

    // 7. Restore an archived habit
    console.log('\n7. Restoring archived habit...');
    await habitService.restoreHabit(exercise.id);
    console.log('Restored: Exercise');

    // 8. Verify restoration worked correctly
    console.log('\n8. Verifying restoration...');
    const finalActiveHabits = await habitService.getActiveHabits();
    expect(finalActiveHabits).toHaveLength(2);
    const activeNames = finalActiveHabits.map(h => h.name).sort();
    expect(activeNames).toEqual(['Exercise', 'Reading']);
    console.log(`Active habits after restoration: ${activeNames.join(', ')}`);

    const finalArchivedHabits = await habitService.getArchivedHabits();
    expect(finalArchivedHabits).toHaveLength(1);
    expect(finalArchivedHabits[0].name).toBe('Meditation');
    console.log(`Remaining archived habits: ${finalArchivedHabits[0].name}`);

    // 9. Verify data integrity after restoration
    console.log('\n9. Verifying data integrity after restoration...');
    const restoredExercise = await habitService.getHabitById(exercise.id);
    expect(restoredExercise.isArchived).toBe(false);
    expect(restoredExercise.archivedAt).toBeNull();

    const restoredCompletions = await habitService.getHabitCompletions(exercise.id);
    expect(restoredCompletions).toHaveLength(2);
    console.log(`Restored exercise completions: ${restoredCompletions.length}`);

    console.log('\n✓ All archiving functionality working correctly!');
  });
});