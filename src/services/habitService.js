const { v4: uuidv4 } = require('uuid');
const Database = require('../lib/database');

class HabitService {
  constructor() {
    this.db = new Database();
  }

  async initialize() {
    await this.db.connect();
    await this.db.initializeTables();
  }

  async shutdown() {
    await this.db.close();
  }

  /**
   * Create a new habit
   * @param {string} name - Name of the habit
   * @param {string} description - Description of the habit
   * @returns {Promise<Object>} Created habit
   */
  async createHabit(name, description = '') {
    const habit = {
      id: uuidv4(),
      name,
      description,
      isArchived: false,
      createdAt: new Date().toISOString(),
      archivedAt: null
    };

    await this.db.createHabit(habit);
    return habit;
  }

  /**
   * Get all active (non-archived) habits
   * @returns {Promise<Array>} Array of active habits
   */
  async getActiveHabits() {
    return await this.db.getActiveHabits();
  }

  /**
   * Get all archived habits
   * @returns {Promise<Array>} Array of archived habits
   */
  async getArchivedHabits() {
    return await this.db.getArchivedHabits();
  }

  /**
   * Archive a habit (hide from active list while preserving data)
   * @param {string} habitId - ID of the habit to archive
   * @returns {Promise<Object>} Result of archiving operation
   */
  async archiveHabit(habitId) {
    // Verify habit exists and is not already archived
    const habit = await this.db.getHabitById(habitId);
    if (!habit) {
      throw new Error('Habit not found');
    }
    if (habit.isArchived) {
      throw new Error('Habit is already archived');
    }

    const result = await this.db.archiveHabit(habitId);
    return {
      success: result.changes > 0,
      habitId: habitId,
      archivedAt: new Date()
    };
  }

  /**
   * Restore an archived habit to active status
   * @param {string} habitId - ID of the habit to restore
   * @returns {Promise<Object>} Result of restore operation
   */
  async restoreHabit(habitId) {
    // Verify habit exists and is archived
    const habit = await this.db.getHabitById(habitId);
    if (!habit) {
      throw new Error('Habit not found');
    }
    if (!habit.isArchived) {
      throw new Error('Habit is not archived');
    }

    const result = await this.db.restoreHabit(habitId);
    return {
      success: result.changes > 0,
      habitId: habitId,
      restoredAt: new Date()
    };
  }

  /**
   * Get a habit by ID (including archived habits)
   * @param {string} habitId - ID of the habit
   * @returns {Promise<Object|null>} Habit object or null if not found
   */
  async getHabitById(habitId) {
    return await this.db.getHabitById(habitId);
  }

  /**
   * Mark a habit as completed
   * @param {string} habitId - ID of the habit
   * @param {string} notes - Optional notes for this completion
   * @returns {Promise<Object>} Completion record
   */
  async completeHabit(habitId, notes = '') {
    // Verify habit exists
    const habit = await this.db.getHabitById(habitId);
    if (!habit) {
      throw new Error('Habit not found');
    }

    const completion = {
      id: uuidv4(),
      habitId,
      completedAt: new Date().toISOString(),
      notes
    };

    await this.db.addCompletion(completion);
    return completion;
  }

  /**
   * Get completion history for a habit (preserves data even for archived habits)
   * @param {string} habitId - ID of the habit
   * @returns {Promise<Array>} Array of completion records
   */
  async getHabitCompletions(habitId) {
    return await this.db.getCompletionsForHabit(habitId);
  }

  /**
   * Get habit statistics
   * @param {string} habitId - ID of the habit
   * @returns {Promise<Object>} Statistics object
   */
  async getHabitStats(habitId) {
    const completions = await this.getHabitCompletions(habitId);
    const habit = await this.getHabitById(habitId);

    if (!habit) {
      throw new Error('Habit not found');
    }

    const totalCompletions = completions.length;
    const daysSinceCreation = Math.ceil((new Date() - new Date(habit.createdAt)) / (1000 * 60 * 60 * 24));
    const completionRate = daysSinceCreation > 0 ? (totalCompletions / daysSinceCreation) * 100 : 0;

    return {
      habitId,
      habitName: habit.name,
      isArchived: habit.isArchived,
      totalCompletions,
      daysSinceCreation,
      completionRate: Math.round(completionRate * 100) / 100,
      lastCompletion: completions.length > 0 ? completions[0].completedAt : null,
      createdAt: habit.createdAt,
      archivedAt: habit.archivedAt
    };
  }
}

module.exports = HabitService;