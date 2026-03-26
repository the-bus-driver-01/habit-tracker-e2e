const HabitService = require('../services/habitService');
const fs = require('fs');
const path = require('path');

class ArchivingDemo {
  constructor() {
    this.habitService = new HabitService();
    // Use a demo database
    const demoDbPath = path.join(__dirname, '../../data/demo.db');
    this.habitService.db.dbPath = demoDbPath;
  }

  async initialize() {
    // Ensure data directory exists
    const dataDir = path.dirname(this.habitService.db.dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    await this.habitService.initialize();
  }

  async cleanup() {
    await this.habitService.shutdown();
  }

  async runDemo() {
    console.log('🎯 HABIT TRACKER ARCHIVING FUNCTIONALITY DEMO');
    console.log('='.repeat(50));

    try {
      await this.initialize();

      // Step 1: Create habits
      console.log('\n📝 Step 1: Creating sample habits...');
      const exercise = await this.habitService.createHabit(
        'Daily Exercise',
        'Get at least 30 minutes of physical activity'
      );
      const reading = await this.habitService.createHabit(
        'Reading',
        'Read for 1 hour every day'
      );
      const meditation = await this.habitService.createHabit(
        'Meditation',
        'Morning mindfulness practice'
      );
      const journaling = await this.habitService.createHabit(
        'Journaling',
        'Write daily reflections'
      );

      console.log(`✅ Created: ${exercise.name}`);
      console.log(`✅ Created: ${reading.name}`);
      console.log(`✅ Created: ${meditation.name}`);
      console.log(`✅ Created: ${journaling.name}`);

      // Step 2: Add completion history
      console.log('\n📈 Step 2: Building completion history...');

      // Add multiple completions for exercise
      await this.habitService.completeHabit(exercise.id, 'Great 45-minute run');
      await this.habitService.completeHabit(exercise.id, 'Strength training session');
      await this.habitService.completeHabit(exercise.id, 'Yoga and stretching');

      // Add completions for reading
      await this.habitService.completeHabit(reading.id, 'Read 3 chapters of "Dune"');
      await this.habitService.completeHabit(reading.id, 'Finished article on quantum computing');

      // Add completion for meditation
      await this.habitService.completeHabit(meditation.id, '15 minutes of breath awareness');

      console.log('✅ Added completion history for multiple habits');

      // Step 3: Show active habits
      console.log('\n📋 Step 3: Current active habits:');
      const activeHabits = await this.habitService.getActiveHabits();
      activeHabits.forEach((habit, index) => {
        console.log(`  ${index + 1}. ${habit.name} (Created: ${habit.createdAt.toDateString()})`);
      });
      console.log(`   Total active habits: ${activeHabits.length}`);

      // Step 4: Show statistics before archiving
      console.log('\n📊 Step 4: Habit statistics before archiving:');
      const exerciseStats = await this.habitService.getHabitStats(exercise.id);
      console.log(`   ${exerciseStats.habitName}: ${exerciseStats.totalCompletions} completions, ${exerciseStats.completionRate}% completion rate`);

      // Step 5: Archive some habits
      console.log('\n📦 Step 5: Archiving unused habits...');
      await this.habitService.archiveHabit(meditation.id);
      await this.habitService.archiveHabit(journaling.id);

      console.log('✅ Archived: Meditation (not actively tracking)');
      console.log('✅ Archived: Journaling (taking a break from this habit)');

      // Step 6: Show updated active habits list
      console.log('\n📋 Step 6: Active habits after archiving:');
      const activeAfterArchive = await this.habitService.getActiveHabits();
      activeAfterArchive.forEach((habit, index) => {
        console.log(`  ${index + 1}. ${habit.name}`);
      });
      console.log(`   Total active habits: ${activeAfterArchive.length} (reduced from ${activeHabits.length})`);

      // Step 7: Show archived habits
      console.log('\n🗄️ Step 7: Archived habits section:');
      const archivedHabits = await this.habitService.getArchivedHabits();
      archivedHabits.forEach((habit, index) => {
        console.log(`  ${index + 1}. ${habit.name} [ARCHIVED on ${habit.archivedAt.toDateString()}]`);
      });

      // Step 8: Demonstrate data preservation
      console.log('\n💾 Step 8: Verifying data preservation for archived habits:');
      const meditationStats = await this.habitService.getHabitStats(meditation.id);
      console.log(`   ${meditationStats.habitName} (archived): ${meditationStats.totalCompletions} completions preserved`);

      const meditationCompletions = await this.habitService.getHabitCompletions(meditation.id);
      if (meditationCompletions.length > 0) {
        console.log(`   Latest completion: "${meditationCompletions[0].notes}"`);
      }

      // Step 9: Restore a habit
      console.log('\n🔄 Step 9: Restoring an archived habit...');
      await this.habitService.restoreHabit(meditation.id);
      console.log('✅ Restored: Meditation (decided to resume practice)');

      // Step 10: Show final state
      console.log('\n📋 Step 10: Final state after restoration:');
      const finalActive = await this.habitService.getActiveHabits();
      const finalArchived = await this.habitService.getArchivedHabits();

      console.log(`   Active habits: ${finalActive.length}`);
      finalActive.forEach((habit, index) => {
        console.log(`     ${index + 1}. ${habit.name}`);
      });

      console.log(`   Archived habits: ${finalArchived.length}`);
      finalArchived.forEach((habit, index) => {
        console.log(`     ${index + 1}. ${habit.name}`);
      });

      // Step 11: Verify data integrity
      console.log('\n🔍 Step 11: Data integrity verification:');
      const restoredMeditation = await this.habitService.getHabitById(meditation.id);
      const restoredStats = await this.habitService.getHabitStats(meditation.id);
      console.log(`   ${restoredStats.habitName}: ${restoredStats.totalCompletions} completions maintained`);
      console.log(`   Archive status: ${restoredMeditation.isArchived ? 'ARCHIVED' : 'ACTIVE'}`);

      console.log('\n🎉 DEMO COMPLETED SUCCESSFULLY!');
      console.log('\nKey Archiving Features Demonstrated:');
      console.log('✅ Archive habits - hide from active list while preserving data');
      console.log('✅ Archived habits view - dedicated section for archived habits');
      console.log('✅ Data preservation - all completion history maintained');
      console.log('✅ Restore functionality - bring archived habits back to active status');
      console.log('✅ Statistics integrity - all analytics preserved throughout archiving');

    } catch (error) {
      console.error('❌ Demo failed:', error.message);
    } finally {
      await this.cleanup();
    }
  }
}

// Run demo if called directly
if (require.main === module) {
  const demo = new ArchivingDemo();
  demo.runDemo();
}

module.exports = ArchivingDemo;