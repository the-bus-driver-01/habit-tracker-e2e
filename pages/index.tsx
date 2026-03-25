import React from 'react';
import Head from 'next/head';
import DayCell from '@/components/DayCell';
import { buildDayCellData } from '@/utils/habitUtils';
import { sampleHabits, sampleCheckIns } from '@/data/sampleData';

const Home: React.FC = () => {
  // Create test data for different scenarios
  const testDates = [
    '2026-03-20', // Mixed completion
    '2026-03-21', // Full completion
    '2026-03-22', // No completions (all incomplete)
    '2026-03-23', // No data (no check-ins)
    '2026-03-24', // Partial completion
    '2026-03-25', // Today - no data yet
  ];

  const dayCellsData = testDates.map(date =>
    buildDayCellData(date, sampleHabits.filter(h => h.isActive), sampleCheckIns)
  );

  const handleDayCellClick = (date: string) => {
    console.log(`Clicked on date: ${date}`);
    alert(`Day clicked: ${date}`);
  };

  return (
    <>
      <Head>
        <title>Habit Tracker - Day Cells Demo</title>
        <meta name="description" content="Habit tracker day cell components demo" />
      </Head>

      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 text-center mb-8">
              Habit Tracker - Day Cells Demo
            </h1>

            {/* Legend */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Legend</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <span className="text-sm">Completed habit</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full border-2 border-blue-500 bg-transparent"></div>
                  <span className="text-sm">Incomplete habit</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full bg-gray-200 border-2 border-gray-300"></div>
                  <span className="text-sm">No data</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-xs bg-green-50 px-2 py-1 rounded">3/3</div>
                  <span className="text-sm">Completion ratio</span>
                </div>
              </div>
            </div>

            {/* Active Habits List */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Active Habits</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {sampleHabits.filter(h => h.isActive).map(habit => (
                  <div key={habit.id} className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: habit.color }}
                    ></div>
                    <div>
                      <div className="font-medium text-sm">{habit.name}</div>
                      <div className="text-xs text-gray-500">{habit.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Day Cells Demo */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Day Cells with Different States</h2>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {dayCellsData.map((dayData, index) => (
                  <div key={dayData.date} className="text-center">
                    <DayCell
                      data={dayData}
                      onClick={handleDayCellClick}
                      className="mx-auto"
                    />
                    <div className="mt-2 text-xs text-gray-600">
                      {getDateDescription(dayData.date, index)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Week View Demo */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
              <h2 className="text-xl font-semibold mb-6">Week View Example</h2>

              <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                    {day}
                  </div>
                ))}

                {/* Week of day cells */}
                {dayCellsData.slice(0, 7).map((dayData) => (
                  <DayCell
                    key={dayData.date}
                    data={dayData}
                    onClick={handleDayCellClick}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

function getDateDescription(date: string, index: number): string {
  const descriptions = [
    'Mixed completion',
    'All completed',
    'All incomplete',
    'No check-ins',
    'Partial completion',
    'Today (no data)'
  ];
  return `${date.split('-').slice(1).join('/')} - ${descriptions[index]}`;
}

export default Home;