'use client';

import React, { useState } from 'react';
import {
  Habit,
  HabitCategory,
  HabitFrequency,
} from '../../lib/types';
import { getCategoryDisplayName, getFrequencyDisplayName } from '../../lib/validation';

interface HabitItemProps {
  habit: Habit;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
  isLoading?: boolean;
  className?: string;
}

// Category icons mapping
const getCategoryIcon = (category: HabitCategory): string => {
  const icons: Record<HabitCategory, string> = {
    [HabitCategory.HEALTH]: '🏥',
    [HabitCategory.PRODUCTIVITY]: '⚡',
    [HabitCategory.LEARNING]: '📚',
    [HabitCategory.LIFESTYLE]: '🌟',
    [HabitCategory.FITNESS]: '💪',
    [HabitCategory.MINDFULNESS]: '🧘',
    [HabitCategory.SOCIAL]: '👥',
    [HabitCategory.OTHER]: '📋',
  };
  return icons[category];
};

// Category colors mapping
const getCategoryColor = (category: HabitCategory): string => {
  const colors: Record<HabitCategory, string> = {
    [HabitCategory.HEALTH]: 'bg-red-100 text-red-800 border-red-200',
    [HabitCategory.PRODUCTIVITY]: 'bg-blue-100 text-blue-800 border-blue-200',
    [HabitCategory.LEARNING]: 'bg-purple-100 text-purple-800 border-purple-200',
    [HabitCategory.LIFESTYLE]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    [HabitCategory.FITNESS]: 'bg-green-100 text-green-800 border-green-200',
    [HabitCategory.MINDFULNESS]: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    [HabitCategory.SOCIAL]: 'bg-pink-100 text-pink-800 border-pink-200',
    [HabitCategory.OTHER]: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return colors[category];
};

export function HabitItem({ habit, onEdit, onDelete, isLoading = false, className = '' }: HabitItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditClick = () => {
    if (isLoading || isDeleting) return;
    onEdit(habit);
  };

  const handleDeleteClick = () => {
    if (isLoading || isDeleting) return;
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(habit.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      // Error handling is done in parent component
      console.error('Delete failed:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const formatFrequencyDisplay = (habit: Habit): string => {
    if (habit.frequency === HabitFrequency.CUSTOM && habit.customFrequency) {
      if (habit.customFrequency.weekdays && habit.customFrequency.weekdays.length > 0) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const selectedDays = habit.customFrequency.weekdays.map(day => days[day]).join(', ');
        return `Custom (${selectedDays})`;
      } else if (habit.customFrequency.days) {
        return `Every ${habit.customFrequency.days} day${habit.customFrequency.days > 1 ? 's' : ''}`;
      }
    }
    return getFrequencyDisplayName(habit.frequency);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ${className}`}>
      {/* Main Content */}
      <div className="p-4">
        {/* Header with category badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg" aria-label={`Category: ${getCategoryDisplayName(habit.category)}`}>
              {getCategoryIcon(habit.category)}
            </span>
            <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getCategoryColor(habit.category)}`}>
              {getCategoryDisplayName(habit.category)}
            </span>
          </div>
          {habit.color && (
            <div
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: habit.color }}
              aria-label="Habit color"
            />
          )}
        </div>

        {/* Habit name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
          {habit.name}
        </h3>

        {/* Description */}
        {habit.description && (
          <p className="text-sm text-gray-600 mb-3 leading-relaxed">
            {habit.description}
          </p>
        )}

        {/* Habit details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Frequency:</span>
            <span className="text-gray-900 font-medium">
              {formatFrequencyDisplay(habit)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Target:</span>
            <span className="text-gray-900 font-medium">
              {habit.targetCount} {habit.targetCount === 1 ? 'time' : 'times'}
            </span>
          </div>
          {habit.reminderTime && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Reminder:</span>
              <span className="text-gray-900 font-medium">{habit.reminderTime}</span>
            </div>
          )}
        </div>

        {/* Goal and motivation */}
        {(habit.goal || habit.motivation) && (
          <div className="border-t border-gray-100 pt-3 mb-4">
            {habit.goal && (
              <div className="mb-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Goal</span>
                <p className="text-sm text-gray-700 mt-1">{habit.goal}</p>
              </div>
            )}
            {habit.motivation && (
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Motivation</span>
                <p className="text-sm text-gray-700 mt-1">{habit.motivation}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Created {new Date(habit.createdAt).toLocaleDateString()}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleEditClick}
              disabled={isLoading || isDeleting}
              className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              aria-label={`Edit ${habit.name}`}
            >
              {isLoading ? 'Loading...' : 'Edit'}
            </button>
            <button
              onClick={handleDeleteClick}
              disabled={isLoading || isDeleting}
              className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
              aria-label={`Delete ${habit.name}`}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Habit
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete "{habit.name}"? This action cannot be undone and will remove all associated data.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}