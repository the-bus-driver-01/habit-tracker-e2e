/**
 * Habit data structure
 * @typedef {Object} Habit
 * @property {string} id - Unique identifier
 * @property {string} name - Name of the habit
 * @property {string} description - Description of the habit
 * @property {boolean} isArchived - Whether the habit is archived
 * @property {Date} createdAt - When the habit was created
 * @property {Date} archivedAt - When the habit was archived (null if not archived)
 * @property {Array<CompletionRecord>} completions - Array of completion records
 */

/**
 * Completion record for a habit
 * @typedef {Object} CompletionRecord
 * @property {string} id - Unique identifier
 * @property {string} habitId - ID of the associated habit
 * @property {Date} completedAt - When the habit was completed
 * @property {string} notes - Optional notes for this completion
 */

module.exports = {
  // Export types for JSDoc usage
};