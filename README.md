# Habit Tracker with Archiving Functionality

A comprehensive habit tracking application with full archiving support. This application allows users to create, track, and manage habits while providing powerful archiving functionality to hide completed or unused habits while preserving all historical data.

## Features

### Core Functionality
- ✅ Create and manage habits with descriptions
- ✅ Track habit completions with optional notes
- ✅ View habit statistics and completion rates
- ✅ SQLite database for persistent storage

### Archiving Functionality (Main Feature)
- ✅ **Archive habits** - Hide habits from active list while preserving all data
- ✅ **Archived habits view** - Dedicated section to view all archived habits
- ✅ **Restore archived habits** - Bring archived habits back to active status
- ✅ **Data preservation** - All historical completions and statistics are maintained during archiving
- ✅ **Seamless workflow** - Archive/restore habits without losing any information

## Installation

```bash
npm install
```

## Usage

### Command Line Interface

The application provides a comprehensive CLI for all operations:

```bash
# Show help
node src/index.js help

# View active habits
node src/index.js active

# View archived habits
node src/index.js archived

# Create a new habit
node src/index.js create "Exercise" "Daily 30-minute workout"

# Complete a habit (use habit ID from active list)
node src/index.js complete <habit-id> "Great workout today"

# Archive a habit (removes from active list, preserves data)
node src/index.js archive <habit-id>

# Restore an archived habit (returns to active list)
node src/index.js restore <habit-id>

# View habit statistics (works for active and archived habits)
node src/index.js stats <habit-id>
```

### Example Workflow

```bash
# 1. Create some habits
node src/index.js create "Exercise" "Daily workout routine"
node src/index.js create "Reading" "Read for 1 hour daily"
node src/index.js create "Meditation" "Morning mindfulness practice"

# 2. Complete some habits to build history
node src/index.js complete <exercise-id> "Great cardio session"
node src/index.js complete <reading-id> "Read 2 chapters"

# 3. Archive a habit you're not actively tracking
node src/index.js archive <meditation-id>

# 4. View active habits (meditation won't appear)
node src/index.js active

# 5. View archived habits (meditation will be here)
node src/index.js archived

# 6. Check statistics (works for archived habits too)
node src/index.js stats <meditation-id>

# 7. Restore when ready to track again
node src/index.js restore <meditation-id>
```

## Archiving Functionality Details

### What Happens When You Archive a Habit?

1. **Hidden from active list**: Archived habits don't appear when viewing active habits
2. **Data preservation**: All completion records, statistics, and metadata are preserved
3. **Searchable in archived section**: Archived habits have their own dedicated view
4. **Timestamp recorded**: Archive date/time is recorded for reference

### What Happens When You Restore a Habit?

1. **Returns to active status**: Habit appears in active habits list again
2. **Complete data integrity**: All historical data is intact and accessible
3. **Statistics preserved**: Completion rates, streaks, and other stats are maintained
4. **Archive timestamp cleared**: No longer marked as archived

### Data Preservation Guarantee

- ✅ **Completion history**: All completion records are maintained
- ✅ **Creation date**: Original habit creation timestamp preserved
- ✅ **Statistics**: Completion rates and analytics remain accurate
- ✅ **Notes**: All completion notes are retained
- ✅ **Metadata**: Descriptions and other habit details unchanged

## Architecture

### Core Components

- **HabitService**: Main business logic for habit operations and archiving
- **Database**: SQLite-based persistence layer with archiving support
- **HabitCLI**: Command-line interface for user interactions
- **Types**: TypeScript-style JSDoc definitions for data structures

### Database Schema

**Habits Table**:
```sql
CREATE TABLE habits (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  isArchived INTEGER DEFAULT 0,  -- Key field for archiving
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  archivedAt DATETIME           -- Timestamp when archived
)
```

**Completions Table**:
```sql
CREATE TABLE completions (
  id TEXT PRIMARY KEY,
  habitId TEXT NOT NULL,
  completedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (habitId) REFERENCES habits(id)
)
```

## Testing

Run the comprehensive test suite that validates all archiving functionality:

```bash
npm test
```

The tests cover:
- Basic habit creation and management
- Archiving and restoration workflows
- Data preservation during archiving
- Edge cases and error handling
- Integration scenarios

## Development

### Project Structure

```
src/
├── __tests__/          # Test suites
├── cli/               # Command-line interface
├── lib/               # Database and core utilities
├── services/          # Business logic layer
├── types/             # Type definitions
└── index.js           # Main entry point
```

### Adding New Features

The archiving system is designed to be extensible. Key extension points:

- **HabitService**: Add new habit operations
- **Database**: Extend schema or add new queries
- **HabitCLI**: Add new command-line commands
- **Tests**: Maintain comprehensive test coverage

## License

ISC