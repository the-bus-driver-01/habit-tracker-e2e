import React from 'react';
import DayCell, { HabitIndicator } from './DayCell';
import { Habit, CheckIn, CheckInStatus, HabitStatus, DayCellData } from '@/types/habit';

// Test data for comprehensive demonstration
const testHabits: Habit[] = [
  {
    id: 'test-habit-1',
    name: 'Exercise',
    description: 'Daily workout',
    color: '#3B82F6',
    createdAt: new Date('2024-01-01'),
    isActive: true
  },
  {
    id: 'test-habit-2',
    name: 'Read',
    description: 'Reading time',
    color: '#10B981',
    createdAt: new Date('2024-01-01'),
    isActive: true
  },
  {
    id: 'test-habit-3',
    name: 'Meditate',
    description: 'Mindfulness',
    color: '#8B5CF6',
    createdAt: new Date('2024-01-01'),
    isActive: true
  },
  {
    id: 'test-habit-4',
    name: 'Journal',
    description: 'Daily writing',
    color: '#F59E0B',
    createdAt: new Date('2024-01-01'),
    isActive: true
  }
];

const DayCellDemo: React.FC = () => {
  // Test Case 1: All habits completed
  const allCompletedData: DayCellData = {
    date: '2026-03-20',
    habitStatuses: testHabits.map(habit => ({
      habit,
      status: CheckInStatus.COMPLETED,
      checkIn: {
        id: `check-${habit.id}`,
        habitId: habit.id,
        date: '2026-03-20',
        completed: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }))
  };

  // Test Case 2: Mixed completion (some completed, some incomplete)
  const mixedData: DayCellData = {
    date: '2026-03-21',
    habitStatuses: [
      { habit: testHabits[0], status: CheckInStatus.COMPLETED },
      { habit: testHabits[1], status: CheckInStatus.COMPLETED },
      { habit: testHabits[2], status: CheckInStatus.INCOMPLETE },
      { habit: testHabits[3], status: CheckInStatus.INCOMPLETE }
    ]
  };

  // Test Case 3: All habits incomplete
  const allIncompleteData: DayCellData = {
    date: '2026-03-22',
    habitStatuses: testHabits.map(habit => ({
      habit,
      status: CheckInStatus.INCOMPLETE
    }))
  };

  // Test Case 4: No data available
  const noDataData: DayCellData = {
    date: '2026-03-23',
    habitStatuses: testHabits.map(habit => ({
      habit,
      status: CheckInStatus.NO_DATA
    }))
  };

  // Test Case 5: Single habit scenarios
  const singleHabitCompleted: DayCellData = {
    date: '2026-03-24',
    habitStatuses: [
      { habit: testHabits[0], status: CheckInStatus.COMPLETED }
    ]
  };

  const singleHabitIncomplete: DayCellData = {
    date: '2026-03-25',
    habitStatuses: [
      { habit: testHabits[0], status: CheckInStatus.INCOMPLETE }
    ]
  };

  // Test Case 6: Many habits (stress test)
  const manyHabitsData: DayCellData = {
    date: '2026-03-26',
    habitStatuses: [
      ...testHabits.map(habit => ({ habit, status: CheckInStatus.COMPLETED })),
      ...testHabits.map((habit, i) => ({
        habit: { ...habit, id: `extra-${i}`, name: `Extra ${i}` },
        status: CheckInStatus.INCOMPLETE
      }))
    ]
  };

  const testCases = [
    { data: allCompletedData, title: 'All Completed', description: 'All habits are completed for this day' },
    { data: mixedData, title: 'Mixed Status', description: 'Some habits completed, some incomplete' },
    { data: allIncompleteData, title: 'All Incomplete', description: 'All habits are incomplete for this day' },
    { data: noDataData, title: 'No Data', description: 'No check-in data available' },
    { data: singleHabitCompleted, title: 'Single Completed', description: 'Only one habit, completed' },
    { data: singleHabitIncomplete, title: 'Single Incomplete', description: 'Only one habit, incomplete' },
    { data: manyHabitsData, title: 'Many Habits', description: '8 habits total with mixed states' }
  ];

  const handleDayClick = (date: string) => {
    console.log(`Demo: Day ${date} clicked`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">DayCell Component Demo</h1>

        {/* Individual Habit Indicator Demo */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Individual Habit Indicators</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <h3 className="font-medium mb-3">Completed</h3>
              <div className="flex justify-center space-x-2">
                {testHabits.slice(0, 3).map(habit => (
                  <HabitIndicator
                    key={habit.id}
                    habitStatus={{ habit, status: CheckInStatus.COMPLETED }}
                    size="large"
                  />
                ))}
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-medium mb-3">Incomplete</h3>
              <div className="flex justify-center space-x-2">
                {testHabits.slice(0, 3).map(habit => (
                  <HabitIndicator
                    key={habit.id}
                    habitStatus={{ habit, status: CheckInStatus.INCOMPLETE }}
                    size="large"
                  />
                ))}
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-medium mb-3">No Data</h3>
              <div className="flex justify-center space-x-2">
                {testHabits.slice(0, 3).map(habit => (
                  <HabitIndicator
                    key={habit.id}
                    habitStatus={{ habit, status: CheckInStatus.NO_DATA }}
                    size="large"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Day Cell Test Cases */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Day Cell Test Cases</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {testCases.map((testCase, index) => (
              <div key={index} className="text-center">
                <DayCell
                  data={testCase.data}
                  onClick={handleDayClick}
                  className="mx-auto mb-3"
                />
                <h3 className="font-semibold text-sm mb-1">{testCase.title}</h3>
                <p className="text-xs text-gray-600">{testCase.description}</p>
                <div className="text-xs text-gray-500 mt-1">
                  {testCase.data.habitStatuses.filter(h => h.status === CheckInStatus.COMPLETED).length}/
                  {testCase.data.habitStatuses.filter(h => h.status !== CheckInStatus.NO_DATA).length} completed
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Size Variations */}
        <div className="bg-white rounded-lg p-6 mt-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Size Variations</h2>

          <div className="flex justify-center items-end space-x-8">
            <div className="text-center">
              <h3 className="font-medium mb-3">Compact</h3>
              <div className="scale-75">
                <DayCell
                  data={mixedData}
                  onClick={handleDayClick}
                  className="mx-auto"
                />
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-medium mb-3">Normal</h3>
              <DayCell
                data={mixedData}
                onClick={handleDayClick}
                className="mx-auto"
              />
            </div>
            <div className="text-center">
              <h3 className="font-medium mb-3">Large</h3>
              <div className="scale-125">
                <DayCell
                  data={mixedData}
                  onClick={handleDayClick}
                  className="mx-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayCellDemo;