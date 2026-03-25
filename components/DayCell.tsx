import React from 'react';
import classnames from 'classnames';
import { DayCellData, CheckInStatus, HabitStatus } from '@/types/habit';

interface DayCellProps {
  data: DayCellData;
  className?: string;
  onClick?: (date: string) => void;
}

interface HabitIndicatorProps {
  habitStatus: HabitStatus;
  size?: 'small' | 'medium' | 'large';
}

const HabitIndicator: React.FC<HabitIndicatorProps> = ({
  habitStatus,
  size = 'medium'
}) => {
  const { habit, status } = habitStatus;

  const sizeClasses = {
    small: 'w-2 h-2',
    medium: 'w-3 h-3',
    large: 'w-4 h-4'
  };

  const baseClasses = `${sizeClasses[size]} rounded-full border-2`;

  const statusClasses = classnames(baseClasses, {
    // Completed: filled with habit color
    'bg-opacity-100': status === CheckInStatus.COMPLETED,
    // Incomplete: empty circle with habit color border
    'bg-transparent': status === CheckInStatus.INCOMPLETE,
    // No data: gray and subtle
    'bg-gray-200 border-gray-300': status === CheckInStatus.NO_DATA,
  });

  const dynamicStyles = status !== CheckInStatus.NO_DATA ? {
    borderColor: habit.color,
    backgroundColor: status === CheckInStatus.COMPLETED ? habit.color : 'transparent'
  } : {};

  return (
    <div
      className={statusClasses}
      style={dynamicStyles}
      title={`${habit.name}: ${status === CheckInStatus.COMPLETED ? 'Completed' :
              status === CheckInStatus.INCOMPLETE ? 'Not completed' : 'No data'}`}
    />
  );
};

const DayCell: React.FC<DayCellProps> = ({
  data,
  className = '',
  onClick
}) => {
  const { date, habitStatuses } = data;

  // Parse date for display
  const dateObj = new Date(date + 'T00:00:00');
  const dayNumber = dateObj.getDate();

  // Calculate completion stats
  const completedCount = habitStatuses.filter(
    hs => hs.status === CheckInStatus.COMPLETED
  ).length;
  const totalHabits = habitStatuses.filter(
    hs => hs.status !== CheckInStatus.NO_DATA
  ).length;

  // Determine overall cell state
  const hasData = totalHabits > 0;
  const isFullyCompleted = hasData && completedCount === totalHabits;
  const isPartiallyCompleted = hasData && completedCount > 0 && completedCount < totalHabits;
  const isEmpty = completedCount === 0 && totalHabits > 0;

  const cellClasses = classnames(
    'flex flex-col items-center justify-start p-2 border border-gray-200 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm min-h-[80px]',
    {
      // Cell background based on overall completion
      'bg-green-50 border-green-200': isFullyCompleted,
      'bg-yellow-50 border-yellow-200': isPartiallyCompleted,
      'bg-red-50 border-red-200': isEmpty,
      'bg-gray-50 border-gray-200': !hasData,
      // Hover effects
      'hover:bg-green-100': isFullyCompleted,
      'hover:bg-yellow-100': isPartiallyCompleted,
      'hover:bg-red-100': isEmpty,
      'hover:bg-gray-100': !hasData,
    },
    className
  );

  const handleClick = () => {
    if (onClick) {
      onClick(date);
    }
  };

  return (
    <div className={cellClasses} onClick={handleClick}>
      {/* Day number */}
      <div className="text-sm font-medium text-gray-700 mb-2">
        {dayNumber}
      </div>

      {/* Habit indicators */}
      <div className="flex flex-wrap justify-center gap-1 flex-1">
        {habitStatuses.map((habitStatus) => (
          <HabitIndicator
            key={habitStatus.habit.id}
            habitStatus={habitStatus}
            size="medium"
          />
        ))}
      </div>

      {/* Completion summary (optional, for larger cells) */}
      {hasData && (
        <div className="text-xs text-gray-500 mt-1">
          {completedCount}/{totalHabits}
        </div>
      )}
    </div>
  );
};

export default DayCell;
export { HabitIndicator };