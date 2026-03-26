'use client';

import React, { useState } from 'react';
import { Habit, HabitCategory, HabitFrequency } from '../../lib/types';
import { useHabits } from '../../hooks/useHabits';
import { HabitItem } from './HabitItem';
import { getCategoryDisplayName, getFrequencyDisplayName } from '../../lib/validation';

interface HabitListProps {
  onEdit?: (habit: Habit) => void;
  onHabitDeleted?: (habitId: string) => void;
  className?: string;
}

type SortOption = 'name' | 'category' | 'frequency' | 'created' | 'updated';
type FilterOption = 'all' | HabitCategory;

export function HabitList({ onEdit, onHabitDeleted, className = '' }: HabitListProps) {
  const { habits, deleteHabit, isLoading, error, refreshData } = useHabits();

  const [sortBy, setSortBy] = useState<SortOption>('created');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});

  // Filter and sort habits
  const filteredAndSortedHabits = React.useMemo(() => {
    let filtered = habits.filter(habit => {
      // Filter by category
      const categoryMatch = filterBy === 'all' || habit.category === filterBy;

      // Filter by search query
      const searchMatch = searchQuery === '' ||
        habit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        habit.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        false;

      return categoryMatch && searchMatch;
    });

    // Sort habits
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return getCategoryDisplayName(a.category).localeCompare(getCategoryDisplayName(b.category));
        case 'frequency':
          return getFrequencyDisplayName(a.frequency).localeCompare(getFrequencyDisplayName(b.frequency));
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'created':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [habits, filterBy, searchQuery, sortBy]);

  const handleEdit = (habit: Habit) => {
    if (onEdit) {
      onEdit(habit);
    } else {
      // Default behavior - could show a message or do nothing
    }
  };

  const handleDelete = async (habitId: string) => {
    setIsDeleting(prev => ({ ...prev, [habitId]: true }));

    try {
      const result = await deleteHabit(habitId);

      if (result.success) {
        onHabitDeleted?.(habitId);
      } else {
        // Error is already handled by useHabits hook and shown in error state
      }
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsDeleting(prev => ({ ...prev, [habitId]: false }));
    }
  };

  const handleRefresh = () => {
    refreshData();
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-lg shadow-md p-4">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-300 rounded"></div>
                <div className="w-16 h-4 bg-gray-300 rounded"></div>
              </div>
              <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
            </div>
            <div className="w-3/4 h-5 bg-gray-300 rounded mb-2"></div>
            <div className="w-full h-4 bg-gray-300 rounded mb-3"></div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="w-16 h-3 bg-gray-300 rounded"></div>
                <div className="w-12 h-3 bg-gray-300 rounded"></div>
              </div>
              <div className="flex justify-between">
                <div className="w-16 h-3 bg-gray-300 rounded"></div>
                <div className="w-8 h-3 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Habits</h1>
          <p className="text-sm text-gray-600 mt-1">
            {habits.length === 0 ? 'No habits yet' :
             habits.length === 1 ? '1 habit' :
             `${habits.length} habits`}
            {filteredAndSortedHabits.length !== habits.length &&
             ` (${filteredAndSortedHabits.length} shown)`}
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search habits..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Filter by category */}
          <div>
            <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Category
            </label>
            <select
              id="filter"
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as FilterOption)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">All Categories</option>
              {Object.values(HabitCategory).map((category) => (
                <option key={category} value={category}>
                  {getCategoryDisplayName(category)}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
              Sort by
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="created">Newest First</option>
              <option value="updated">Recently Updated</option>
              <option value="name">Name (A-Z)</option>
              <option value="category">Category</option>
              <option value="frequency">Frequency</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-red-400 text-lg">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error Loading Habits
              </h3>
              <p className="mt-1 text-sm text-red-700">
                {error.message}
              </p>
              <button
                onClick={handleRefresh}
                className="mt-2 text-sm font-medium text-red-800 hover:text-red-900 underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : filteredAndSortedHabits.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl text-gray-400">📝</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {habits.length === 0 ? 'No habits yet' : 'No matching habits'}
          </h3>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            {habits.length === 0
              ? 'Start building better habits by creating your first habit tracker.'
              : 'Try adjusting your search or filter criteria to find habits.'}
          </p>
          {habits.length === 0 && (
            <button
              onClick={() => {/* Create habit functionality would go here */}}
              className="mt-6 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Create Your First Habit
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedHabits.map((habit) => (
            <HabitItem
              key={habit.id}
              habit={habit}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={isDeleting[habit.id] || false}
            />
          ))}
        </div>
      )}
    </div>
  );
}