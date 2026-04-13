const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor(dbPath = path.join(__dirname, '../../data/habits.db')) {
    this.dbPath = dbPath;
    this.db = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async initializeTables() {
    const createHabitsTable = `
      CREATE TABLE IF NOT EXISTS habits (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        isArchived INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        archivedAt DATETIME
      )
    `;

    const createCompletionsTable = `
      CREATE TABLE IF NOT EXISTS completions (
        id TEXT PRIMARY KEY,
        habitId TEXT NOT NULL,
        completedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        FOREIGN KEY (habitId) REFERENCES habits(id)
      )
    `;

    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run(createHabitsTable, (err) => {
          if (err) reject(err);
        });
        this.db.run(createCompletionsTable, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  }

  async close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close(() => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  // Habit methods
  async createHabit(habit) {
    const sql = 'INSERT INTO habits (id, name, description, isArchived, createdAt) VALUES (?, ?, ?, ?, ?)';
    return new Promise((resolve, reject) => {
      this.db.run(sql, [habit.id, habit.name, habit.description, habit.isArchived ? 1 : 0, habit.createdAt], function(err) {
        if (err) reject(err);
        else resolve({ id: habit.id, changes: this.changes });
      });
    });
  }

  async getActiveHabits() {
    const sql = 'SELECT * FROM habits WHERE isArchived = 0 ORDER BY createdAt DESC';
    return new Promise((resolve, reject) => {
      this.db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(this._transformHabitRow));
      });
    });
  }

  async getArchivedHabits() {
    const sql = 'SELECT * FROM habits WHERE isArchived = 1 ORDER BY archivedAt DESC';
    return new Promise((resolve, reject) => {
      this.db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(this._transformHabitRow));
      });
    });
  }

  async archiveHabit(habitId) {
    const sql = 'UPDATE habits SET isArchived = 1, archivedAt = CURRENT_TIMESTAMP WHERE id = ?';
    return new Promise((resolve, reject) => {
      this.db.run(sql, [habitId], function(err) {
        if (err) reject(err);
        else resolve({ id: habitId, changes: this.changes });
      });
    });
  }

  async restoreHabit(habitId) {
    const sql = 'UPDATE habits SET isArchived = 0, archivedAt = NULL WHERE id = ?';
    return new Promise((resolve, reject) => {
      this.db.run(sql, [habitId], function(err) {
        if (err) reject(err);
        else resolve({ id: habitId, changes: this.changes });
      });
    });
  }

  async getHabitById(habitId) {
    const sql = 'SELECT * FROM habits WHERE id = ?';
    return new Promise((resolve, reject) => {
      this.db.get(sql, [habitId], (err, row) => {
        if (err) reject(err);
        else resolve(row ? this._transformHabitRow(row) : null);
      });
    });
  }

  // Completion methods
  async addCompletion(completion) {
    const sql = 'INSERT INTO completions (id, habitId, completedAt, notes) VALUES (?, ?, ?, ?)';
    return new Promise((resolve, reject) => {
      this.db.run(sql, [completion.id, completion.habitId, completion.completedAt, completion.notes], function(err) {
        if (err) reject(err);
        else resolve({ id: completion.id, changes: this.changes });
      });
    });
  }

  async getCompletionsForHabit(habitId) {
    const sql = 'SELECT * FROM completions WHERE habitId = ? ORDER BY completedAt DESC';
    return new Promise((resolve, reject) => {
      this.db.all(sql, [habitId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(this._transformCompletionRow));
      });
    });
  }

  // Transform database rows to proper JavaScript objects
  _transformHabitRow(row) {
    return {
      ...row,
      isArchived: Boolean(row.isArchived),
      createdAt: new Date(row.createdAt),
      archivedAt: row.archivedAt ? new Date(row.archivedAt) : null
    };
  }

  _transformCompletionRow(row) {
    return {
      ...row,
      completedAt: new Date(row.completedAt)
    };
  }
}

module.exports = Database;