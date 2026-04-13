const HabitService = require('../services/habitService');

class HabitCLI {
  constructor() {
    this.habitService = new HabitService();
  }

  async initialize() {
    await this.habitService.initialize();
  }

  async shutdown() {
    await this.habitService.shutdown();
  }

  /**
   * Display all active habits
   */
  async showActiveHabits() {
    const habits = await this.habitService.getActiveHabits();

    console.log('\n=== ACTIVE HABITS ===');
    if (habits.length === 0) {
      console.log('No active habits found.');
    } else {
      habits.forEach((habit, index) => {
        console.log(`${index + 1}. ${habit.name}`);
        if (habit.description) {
          console.log(`   Description: ${habit.description}`);
        }
        console.log(`   Created: ${new Date(habit.createdAt).toLocaleDateString()}`);
        console.log(`   ID: ${habit.id}`);
        console.log('');
      });
    }
  }

  /**
   * Display all archived habits
   */
  async showArchivedHabits() {
    const habits = await this.habitService.getArchivedHabits();

    console.log('\n=== ARCHIVED HABITS ===');
    if (habits.length === 0) {
      console.log('No archived habits found.');
    } else {
      habits.forEach((habit, index) => {
        console.log(`${index + 1}. ${habit.name} [ARCHIVED]`);
        if (habit.description) {
          console.log(`   Description: ${habit.description}`);
        }
        console.log(`   Created: ${new Date(habit.createdAt).toLocaleDateString()}`);
        console.log(`   Archived: ${new Date(habit.archivedAt).toLocaleDateString()}`);
        console.log(`   ID: ${habit.id}`);
        console.log('');
      });
    }
  }

  /**
   * Create a new habit
   */
  async createHabit(name, description = '') {
    try {
      const habit = await this.habitService.createHabit(name, description);
      console.log(`\n✓ Created habit: "${habit.name}"`);
      return habit;
    } catch (error) {
      console.error(`✗ Error creating habit: ${error.message}`);
    }
  }

  /**
   * Archive a habit
   */
  async archiveHabit(habitId) {
    try {
      const result = await this.habitService.archiveHabit(habitId);
      if (result.success) {
        const habit = await this.habitService.getHabitById(habitId);
        console.log(`\n✓ Archived habit: "${habit.name}"`);
        console.log('  The habit is now hidden from the active list but all data is preserved.');
      }
    } catch (error) {
      console.error(`✗ Error archiving habit: ${error.message}`);
    }
  }

  /**
   * Restore an archived habit
   */
  async restoreHabit(habitId) {
    try {
      const result = await this.habitService.restoreHabit(habitId);
      if (result.success) {
        const habit = await this.habitService.getHabitById(habitId);
        console.log(`\n✓ Restored habit: "${habit.name}"`);
        console.log('  The habit is now active again with all historical data intact.');
      }
    } catch (error) {
      console.error(`✗ Error restoring habit: ${error.message}`);
    }
  }

  /**
   * Complete a habit
   */
  async completeHabit(habitId, notes = '') {
    try {
      const completion = await this.habitService.completeHabit(habitId, notes);
      const habit = await this.habitService.getHabitById(habitId);
      console.log(`\n✓ Completed habit: "${habit.name}"`);
      if (notes) {
        console.log(`  Notes: ${notes}`);
      }
    } catch (error) {
      console.error(`✗ Error completing habit: ${error.message}`);
    }
  }

  /**
   * Show habit statistics
   */
  async showHabitStats(habitId) {
    try {
      const stats = await this.habitService.getHabitStats(habitId);
      console.log(`\n=== HABIT STATISTICS: ${stats.habitName} ===`);
      console.log(`Status: ${stats.isArchived ? 'ARCHIVED' : 'ACTIVE'}`);
      console.log(`Total completions: ${stats.totalCompletions}`);
      console.log(`Days since creation: ${stats.daysSinceCreation}`);
      console.log(`Completion rate: ${stats.completionRate}%`);
      if (stats.lastCompletion) {
        console.log(`Last completion: ${new Date(stats.lastCompletion).toLocaleDateString()}`);
      }
      console.log(`Created: ${new Date(stats.createdAt).toLocaleDateString()}`);
      if (stats.archivedAt) {
        console.log(`Archived: ${new Date(stats.archivedAt).toLocaleDateString()}`);
      }
    } catch (error) {
      console.error(`✗ Error getting habit stats: ${error.message}`);
    }
  }

  /**
   * Show help menu
   */
  showHelp() {
    console.log('\n=== HABIT TRACKER WITH ARCHIVING ===');
    console.log('Available commands:');
    console.log('  active          - Show all active habits');
    console.log('  archived        - Show all archived habits');
    console.log('  create <name> [description] - Create a new habit');
    console.log('  complete <id> [notes] - Complete a habit');
    console.log('  archive <id>    - Archive a habit (hide while preserving data)');
    console.log('  restore <id>    - Restore an archived habit');
    console.log('  stats <id>      - Show habit statistics');
    console.log('  help            - Show this help menu');
    console.log('');
  }

  /**
   * Run the CLI with provided arguments
   */
  async run(args) {
    const command = args[0];

    switch (command) {
      case 'active':
        await this.showActiveHabits();
        break;

      case 'archived':
        await this.showArchivedHabits();
        break;

      case 'create':
        if (!args[1]) {
          console.error('Please provide a habit name');
          break;
        }
        await this.createHabit(args[1], args[2] || '');
        break;

      case 'complete':
        if (!args[1]) {
          console.error('Please provide a habit ID');
          break;
        }
        await this.completeHabit(args[1], args[2] || '');
        break;

      case 'archive':
        if (!args[1]) {
          console.error('Please provide a habit ID');
          break;
        }
        await this.archiveHabit(args[1]);
        break;

      case 'restore':
        if (!args[1]) {
          console.error('Please provide a habit ID');
          break;
        }
        await this.restoreHabit(args[1]);
        break;

      case 'stats':
        if (!args[1]) {
          console.error('Please provide a habit ID');
          break;
        }
        await this.showHabitStats(args[1]);
        break;

      case 'help':
      default:
        this.showHelp();
        break;
    }
  }
}

module.exports = HabitCLI;