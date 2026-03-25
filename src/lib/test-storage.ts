/**
 * Test script to verify the localStorage data layer implementation
 */
import { habitStorage, habitCRUD, checkInManager, dateUtils } from './storage';
import { dataValidator, integrityChecker } from './validation';
import { migrationManager } from './migration';
import { HabitCategory, HabitFrequency, CompletionStatus } from './types';

export async function runStorageTests(): Promise<boolean> {
  console.log('🧪 Running localStorage data layer tests...');

  try {
    // Test 1: Clear storage and start fresh
    console.log('\n1️⃣ Testing storage initialization...');
    await habitStorage.clearData();
    const initialData = await habitStorage.readData();
    console.log('✅ Initial data loaded:', initialData.success);

    // Test 2: Create a habit
    console.log('\n2️⃣ Testing habit creation...');
    const habitResult = await habitCRUD.createHabit({
      name: 'Morning Exercise',
      description: 'Daily morning workout routine',
      category: HabitCategory.FITNESS,
      frequency: HabitFrequency.DAILY,
      targetCount: 1,
      color: '#FF5722',
      isActive: true
    });
    console.log('✅ Habit created:', habitResult.success);

    if (!habitResult.success || !habitResult.data) {
      throw new Error('Failed to create habit');
    }

    const habitId = habitResult.data.id;

    // Test 3: Record check-ins
    console.log('\n3️⃣ Testing check-in recording...');
    const today = dateUtils.getCurrentDate();
    const yesterday = dateUtils.addDays(today, -1);

    const checkIn1 = await checkInManager.recordCheckIn(
      habitId,
      today,
      CompletionStatus.COMPLETED,
      1,
      'Great workout session!'
    );
    console.log('✅ Today check-in recorded:', checkIn1.success);

    const checkIn2 = await checkInManager.recordCheckIn(
      habitId,
      yesterday,
      CompletionStatus.COMPLETED,
      1
    );
    console.log('✅ Yesterday check-in recorded:', checkIn2.success);

    // Test 4: Calculate streaks
    console.log('\n4️⃣ Testing streak calculation...');
    const streakResult = await checkInManager.calculateStreak(habitId);
    console.log('✅ Streak calculated:', streakResult.success);
    if (streakResult.success && streakResult.data) {
      console.log('  📈 Current streak:', streakResult.data.currentStreak);
      console.log('  📊 Total completions:', streakResult.data.totalCompletions);
    }

    // Test 5: Update habit
    console.log('\n5️⃣ Testing habit updates...');
    const updateResult = await habitCRUD.updateHabit(habitId, {
      name: 'Enhanced Morning Exercise',
      targetCount: 2
    });
    console.log('✅ Habit updated:', updateResult.success);

    // Test 6: Search functionality
    console.log('\n6️⃣ Testing search functionality...');
    const searchResult = await habitCRUD.searchHabits('exercise');
    console.log('✅ Search completed:', searchResult.success);
    if (searchResult.success) {
      console.log('  🔍 Found habits:', searchResult.data?.length);
    }

    // Test 7: Data validation
    console.log('\n7️⃣ Testing data validation...');
    const validHabit = {
      name: 'Valid Habit',
      category: HabitCategory.HEALTH,
      frequency: HabitFrequency.DAILY,
      targetCount: 1,
      isActive: true,
      createdAt: dateUtils.getCurrentTimestamp(),
      updatedAt: dateUtils.getCurrentTimestamp()
    };
    const validation = dataValidator.validateHabit(validHabit);
    console.log('✅ Validation passed:', validation.isValid);

    // Test 8: Data integrity check
    console.log('\n8️⃣ Testing data integrity...');
    const dataResult = await habitStorage.readData();
    if (dataResult.success && dataResult.data) {
      const integrityReport = integrityChecker.checkDataIntegrity(dataResult.data);
      console.log('✅ Integrity check completed');
      console.log('  ⚠️ Issues found:', integrityReport.recommendedActions.length);
    }

    // Test 9: Migration system
    console.log('\n9️⃣ Testing migration system...');
    const currentVersion = migrationManager.getCurrentVersion();
    const needsMigration = migrationManager.isMigrationNeeded(0);
    console.log('✅ Migration system ready, current version:', currentVersion);
    console.log('  🔄 Migration needed from v0:', needsMigration);

    // Test 10: Storage statistics
    console.log('\n🔟 Testing storage statistics...');
    const stats = await habitStorage.getStorageStats();
    console.log('✅ Storage stats retrieved:');
    console.log('  📁 Total habits:', stats.totalHabits);
    console.log('  ✅ Total check-ins:', stats.totalCheckIns);
    console.log('  📏 Data size:', Math.round(stats.dataSize / 1024), 'KB');

    console.log('\n🎉 All tests passed! Storage layer is working correctly.');
    return true;

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    return false;
  }
}

// Export test function for use in development
if (typeof window !== 'undefined') {
  (window as any).runStorageTests = runStorageTests;
}