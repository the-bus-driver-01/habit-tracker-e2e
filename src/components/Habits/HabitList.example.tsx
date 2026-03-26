'use client';

import React, { useState } from 'react';
import { HabitList } from './HabitList';
import { HabitForm } from './HabitForm';
import { Habit } from '../../lib/types';

/**
 * Example demonstrating how to integrate HabitList with edit/delete functionality
 *
 * This component shows:
 * - How to handle edit actions (opening HabitForm in edit mode)
 * - How to handle delete confirmations and cleanup
 * - How to manage different view states
 * - How to provide user feedback for actions
 */

type ViewMode = 'list' | 'create';

interface NotificationState {
  type: 'success' | 'error' | 'info';
  message: string;
  visible: boolean;
}

export function HabitListExample() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [notification, setNotification] = useState<NotificationState>({
    type: 'info',
    message: '',
    visible: false,
  });

  // Show notification helper
  const showNotification = (type: NotificationState['type'], message: string) => {
    setNotification({ type, message, visible: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 5000);
  };

  // Handle creating a new habit
  const handleCreateClick = () => {
    setViewMode('create');
    setEditingHabit(null);
  };

  // Handle editing a habit
  // Note: Current HabitForm only supports creation, not editing
  // This is a placeholder for future edit functionality
  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    showNotification('info', `Edit functionality for "${habit.name}" would go here. Current HabitForm only supports creation.`);

    // For now, we'll just show an alert
    alert(`Edit functionality for "${habit.name}" is not yet implemented. The HabitForm component currently only supports creating new habits.`);
  };

  // Handle successful form submission
  const handleFormSuccess = (habitId: string) => {
    setViewMode('list');
    setEditingHabit(null);
    showNotification('success', 'Habit created successfully!');
  };

  // Handle form cancellation
  const handleFormCancel = () => {
    setViewMode('list');
    setEditingHabit(null);
    showNotification('info', 'Changes cancelled');
  };

  // Handle habit deletion
  const handleHabitDeleted = (habitId: string) => {
    showNotification('success', 'Habit deleted successfully');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Notification */}
      {notification.visible && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm w-full ${
          notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        } border rounded-lg shadow-lg p-4 animate-slide-in-right`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {notification.type === 'success' && <span className="text-green-400 text-lg">✅</span>}
              {notification.type === 'error' && <span className="text-red-400 text-lg">❌</span>}
              {notification.type === 'info' && <span className="text-blue-400 text-lg">ℹ️</span>}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(prev => ({ ...prev, visible: false }))}
              className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span className="sr-only">Close</span>
              <span className="text-sm">×</span>
            </button>
          </div>
        </div>
      )}

      {/* Header with navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {viewMode === 'list' && 'Habit Tracker'}
              {viewMode === 'create' && 'Create New Habit'}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {viewMode === 'list' && 'Track and manage your daily habits'}
              {viewMode === 'create' && 'Create a new habit to start tracking'}
            </p>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center space-x-3">
            {viewMode !== 'list' && (
              <button
                onClick={() => {
                  setViewMode('list');
                  setEditingHabit(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                ← Back to List
              </button>
            )}

            {viewMode === 'list' && (
              <button
                onClick={handleCreateClick}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                + Create Habit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'list' && (
        <HabitList
          onEdit={handleEdit}
          onHabitDeleted={handleHabitDeleted}
          className="space-y-6"
        />
      )}

      {viewMode === 'create' && (
        <div className="max-w-2xl mx-auto">
          <HabitForm
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      {/* Usage Instructions */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Integration Guide
        </h2>

        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Basic Usage:</h3>
            <pre className="bg-gray-800 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`import { HabitList } from './components/Habits';

function MyApp() {
  const handleEdit = (habit) => {
    // Handle edit action
    console.log('Edit habit:', habit.name);
  };

  const handleDeleted = (habitId) => {
    // Handle post-deletion cleanup
    console.log('Habit deleted:', habitId);
  };

  return (
    <HabitList
      onEdit={handleEdit}
      onHabitDeleted={handleDeleted}
    />
  );
}`}
            </pre>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Props Interface:</h3>
            <pre className="bg-gray-800 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`interface HabitListProps {
  onEdit?: (habit: Habit) => void;        // Called when edit button clicked
  onHabitDeleted?: (habitId: string) => void; // Called after successful deletion
  className?: string;                      // Additional CSS classes
}`}
            </pre>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Features:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Responsive grid layout (1-3 columns based on screen size)</li>
              <li>Search by habit name or description</li>
              <li>Filter by category (Health, Fitness, Learning, etc.)</li>
              <li>Sort by name, category, frequency, or date</li>
              <li>Loading states with skeleton UI</li>
              <li>Error handling with retry functionality</li>
              <li>Empty states for no habits or no search results</li>
              <li>Confirmation dialogs for destructive actions</li>
              <li>Accessibility support (ARIA labels, keyboard navigation)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">State Management:</h3>
            <p>
              The component uses the <code className="bg-gray-200 px-1 rounded">useHabits</code> hook
              which provides automatic state management, loading states, error handling, and data persistence
              through localStorage. No additional state management is required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Additional example showing different layout configurations
export function HabitListCompactExample() {
  const handleEdit = (habit: Habit) => {
    alert(`Edit: ${habit.name}`);
  };

  const handleDeleted = (habitId: string) => {
    console.log('Deleted habit:', habitId);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Compact Layout Example</h2>

      <HabitList
        onEdit={handleEdit}
        onHabitDeleted={handleDeleted}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      />
    </div>
  );
}

// Example showing integration without edit functionality
export function HabitListReadOnlyExample() {
  const handleDeleted = (habitId: string) => {
    console.log('Habit deleted:', habitId);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Read-Only Example</h2>
      <p className="text-sm text-gray-600 mb-4">
        This example shows the list without edit functionality.
        Users can still delete habits, but edit buttons won't trigger any action.
      </p>

      <HabitList
        onHabitDeleted={handleDeleted}
        // onEdit is omitted - edit buttons will show a console message
      />
    </div>
  );
}