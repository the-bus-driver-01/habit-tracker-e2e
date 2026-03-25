/**
 * Tests for DayCell component - verifying acceptance criteria
 */
import { Habit, CheckIn, CheckInStatus } from '../types/habit';
import { buildDayCellData, getHabitStatusForDate } from '../utils/habitUtils';

// Test data
const testHabits: Habit[] = [
  {
    id: 'habit-1',
    name: 'Exercise',
    color: '#3B82F6',
    createdAt: new Date('2024-01-01'),
    isActive: true
  },
  {
    id: 'habit-2',
    name: 'Read',
    color: '#10B981',
    createdAt: new Date('2024-01-01'),
    isActive: true
  },
  {
    id: 'habit-3',
    name: 'Meditate',
    color: '#8B5CF6',
    createdAt: new Date('2024-01-05'),
    isActive: true
  }
];

const testCheckIns: CheckIn[] = [
  {
    id: 'check-1',
    habitId: 'habit-1',
    date: '2026-03-20',
    completed: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'check-2',
    habitId: 'habit-2',
    date: '2026-03-20',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

/**
 * Acceptance Criteria Tests
 */

// Test 1: Given: A day cell is rendered for a specific date
//         When: I view the calendar
//         Then: The cell shows the appropriate visual state for each habit
function testDayCellVisualStates() {
  console.log('Testing: Day cell shows appropriate visual states...');

  const date = '2026-03-20';
  const dayCellData = buildDayCellData(date, testHabits, testCheckIns);

  // Verify each habit has correct status
  const habit1Status = dayCellData.habitStatuses.find(h => h.habit.id === 'habit-1');
  const habit2Status = dayCellData.habitStatuses.find(h => h.habit.id === 'habit-2');
  const habit3Status = dayCellData.habitStatuses.find(h => h.habit.id === 'habit-3');

  // Test completed habit
  if (habit1Status?.status !== CheckInStatus.COMPLETED) {
    throw new Error('Habit 1 should be completed');
  }

  // Test incomplete habit
  if (habit2Status?.status !== CheckInStatus.INCOMPLETE) {
    throw new Error('Habit 2 should be incomplete');
  }

  // Test habit with no check-in (should be incomplete for past dates)
  if (habit3Status?.status !== CheckInStatus.INCOMPLETE) {
    throw new Error('Habit 3 should be incomplete (no check-in for past date)');
  }

  console.log('✅ Visual states test passed');
  return true;
}

// Test 2: Given: Multiple habits exist
//         When: I view a day cell
//         Then: The cell displays completion status for all active habits on that date
function testMultipleHabitsDisplay() {
  console.log('Testing: Day cell displays all active habits...');

  const date = '2026-03-20';
  const dayCellData = buildDayCellData(date, testHabits, testCheckIns);

  // Should have status for all active habits
  const activeHabits = testHabits.filter(h => h.isActive);
  if (dayCellData.habitStatuses.length !== activeHabits.length) {
    throw new Error(`Expected ${activeHabits.length} habit statuses, got ${dayCellData.habitStatuses.length}`);
  }

  // Verify each active habit has a status
  for (const habit of activeHabits) {
    const habitStatus = dayCellData.habitStatuses.find(h => h.habit.id === habit.id);
    if (!habitStatus) {
      throw new Error(`Missing status for habit: ${habit.name}`);
    }

    // Verify status is one of the valid options
    const validStatuses = [CheckInStatus.COMPLETED, CheckInStatus.INCOMPLETE, CheckInStatus.NO_DATA];
    if (!validStatuses.includes(habitStatus.status)) {
      throw new Error(`Invalid status for habit ${habit.name}: ${habitStatus.status}`);
    }
  }

  console.log('✅ Multiple habits display test passed');
  return true;
}

// Additional edge case tests
function testEdgeCases() {
  console.log('Testing: Edge cases...');

  // Test future date (should show no data)
  const futureDate = '2026-12-31';
  const futureDayData = buildDayCellData(futureDate, testHabits, testCheckIns);

  for (const habitStatus of futureDayData.habitStatuses) {
    if (habitStatus.status !== CheckInStatus.NO_DATA) {
      throw new Error(`Future date should show NO_DATA status, got: ${habitStatus.status}`);
    }
  }

  // Test habit created after the date (should show no data)
  const earlyDate = '2024-01-02';  // Before habit-3 was created
  const earlyDayData = buildDayCellData(earlyDate, testHabits, testCheckIns);
  const habit3Early = earlyDayData.habitStatuses.find(h => h.habit.id === 'habit-3');

  if (habit3Early?.status !== CheckInStatus.NO_DATA) {
    throw new Error('Habit created after date should show NO_DATA status');
  }

  // Test inactive habit (should not be included)
  const inactiveHabits = [...testHabits, {
    id: 'inactive-habit',
    name: 'Inactive',
    color: '#000000',
    createdAt: new Date('2024-01-01'),
    isActive: false
  }];

  const dayDataWithInactive = buildDayCellData('2026-03-20', inactiveHabits, testCheckIns);
  const inactiveHabitStatus = dayDataWithInactive.habitStatuses.find(h => h.habit.id === 'inactive-habit');

  if (inactiveHabitStatus) {
    throw new Error('Inactive habits should not be included in day cell data');
  }

  console.log('✅ Edge cases test passed');
  return true;
}

// Test specific habit status logic
function testHabitStatusLogic() {
  console.log('Testing: Habit status logic...');

  // Test completed check-in
  const completedStatus = getHabitStatusForDate(
    testHabits[0],
    '2026-03-20',
    testCheckIns
  );

  if (completedStatus.status !== CheckInStatus.COMPLETED || !completedStatus.checkIn) {
    throw new Error('Completed check-in should return COMPLETED status with checkIn data');
  }

  // Test incomplete check-in
  const incompleteStatus = getHabitStatusForDate(
    testHabits[1],
    '2026-03-20',
    testCheckIns
  );

  if (incompleteStatus.status !== CheckInStatus.INCOMPLETE || !incompleteStatus.checkIn) {
    throw new Error('Incomplete check-in should return INCOMPLETE status with checkIn data');
  }

  // Test no check-in (past date)
  const noCheckInStatus = getHabitStatusForDate(
    testHabits[0],
    '2026-03-19', // Past date with no check-in
    testCheckIns
  );

  if (noCheckInStatus.status !== CheckInStatus.INCOMPLETE || noCheckInStatus.checkIn) {
    throw new Error('Past date with no check-in should return INCOMPLETE status without checkIn data');
  }

  console.log('✅ Habit status logic test passed');
  return true;
}

// Run all tests
function runTests() {
  console.log('🧪 Running DayCell component tests...\n');

  try {
    // Acceptance criteria tests
    testDayCellVisualStates();
    testMultipleHabitsDisplay();

    // Additional tests
    testEdgeCases();
    testHabitStatusLogic();

    console.log('\n✅ All tests passed! Implementation meets acceptance criteria.');
    return true;
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    return false;
  }
}

// Export for Node.js usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runTests };
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  runTests();
}