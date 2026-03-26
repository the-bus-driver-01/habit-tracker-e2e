/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HabitList } from '../HabitList';
import { Habit, HabitCategory, HabitFrequency, StorageError } from '../../../lib/types';

// Mock the useHabits hook
const mockUseHabits = {
  habits: [] as Habit[],
  deleteHabit: jest.fn(),
  isLoading: false,
  error: null as StorageError | null,
  refreshData: jest.fn(),
};

jest.mock('../../../hooks/useHabits', () => ({
  useHabits: () => mockUseHabits,
}));

// Mock HabitItem component to focus on HabitList logic
jest.mock('../HabitItem', () => ({
  HabitItem: ({ habit, onEdit, onDelete, isLoading }: any) => (
    <div data-testid={`habit-item-${habit.id}`}>
      <h3>{habit.name}</h3>
      <p>{habit.description}</p>
      <span>{habit.category}</span>
      <button onClick={() => onEdit(habit)}>Edit {habit.name}</button>
      <button onClick={() => onDelete(habit.id)} disabled={isLoading}>
        {isLoading ? 'Deleting...' : `Delete ${habit.name}`}
      </button>
    </div>
  ),
}));

const mockHabits: Habit[] = [
  {
    id: 'habit-1',
    name: 'Morning Exercise',
    description: 'Daily morning workout routine',
    category: HabitCategory.FITNESS,
    frequency: HabitFrequency.DAILY,
    targetCount: 1,
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'habit-2',
    name: 'Read Books',
    description: 'Read educational books',
    category: HabitCategory.LEARNING,
    frequency: HabitFrequency.DAILY,
    targetCount: 1,
    isActive: true,
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
  {
    id: 'habit-3',
    name: 'Meditation',
    description: 'Mindfulness meditation practice',
    category: HabitCategory.MINDFULNESS,
    frequency: HabitFrequency.WEEKLY,
    targetCount: 3,
    isActive: true,
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: '2024-01-03T00:00:00.000Z',
  },
];

describe('HabitList', () => {
  const defaultProps = {
    onEdit: jest.fn(),
    onHabitDeleted: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseHabits.habits = [];
    mockUseHabits.isLoading = false;
    mockUseHabits.error = null;
    mockUseHabits.deleteHabit.mockResolvedValue({ success: true });
  });

  describe('Basic Rendering', () => {
    it('renders the header with title', () => {
      render(<HabitList {...defaultProps} />);

      expect(screen.getByText('My Habits')).toBeInTheDocument();
    });

    it('shows habit count when habits exist', () => {
      mockUseHabits.habits = mockHabits;
      render(<HabitList {...defaultProps} />);

      expect(screen.getByText('3 habits')).toBeInTheDocument();
    });

    it('shows singular count for one habit', () => {
      mockUseHabits.habits = [mockHabits[0]];
      render(<HabitList {...defaultProps} />);

      expect(screen.getByText('1 habit')).toBeInTheDocument();
    });

    it('shows refresh button', () => {
      render(<HabitList {...defaultProps} />);

      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows loading skeleton when loading', () => {
      mockUseHabits.isLoading = true;
      render(<HabitList {...defaultProps} />);

      // Check for skeleton animation class
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('disables refresh button when loading', () => {
      mockUseHabits.isLoading = true;
      render(<HabitList {...defaultProps} />);

      const refreshButton = screen.getByRole('button', { name: /loading/i });
      expect(refreshButton).toBeDisabled();
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no habits exist', () => {
      render(<HabitList {...defaultProps} />);

      expect(screen.getByText('No habits yet')).toBeInTheDocument();
      expect(screen.getByText(/start building better habits/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create your first habit/i })).toBeInTheDocument();
    });

    it('shows empty search results state', () => {
      mockUseHabits.habits = mockHabits;
      render(<HabitList {...defaultProps} />);

      // Filter by a category that doesn't exist in mockHabits
      const filterSelect = screen.getByLabelText(/filter by category/i);
      fireEvent.change(filterSelect, { target: { value: HabitCategory.SOCIAL } });

      expect(screen.getByText('No matching habits')).toBeInTheDocument();
      expect(screen.getByText(/try adjusting your search or filter criteria/i)).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('displays error message when error exists', () => {
      mockUseHabits.error = {
        code: 'LOAD_ERROR',
        message: 'Failed to load habits',
        timestamp: '2024-01-01T00:00:00.000Z',
      };
      render(<HabitList {...defaultProps} />);

      expect(screen.getByText('Error Loading Habits')).toBeInTheDocument();
      expect(screen.getByText('Failed to load habits')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('calls refreshData when try again is clicked', () => {
      mockUseHabits.error = {
        code: 'LOAD_ERROR',
        message: 'Failed to load habits',
        timestamp: '2024-01-01T00:00:00.000Z',
      };
      render(<HabitList {...defaultProps} />);

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(tryAgainButton);

      expect(mockUseHabits.refreshData).toHaveBeenCalledTimes(1);
    });
  });

  describe('Habit Display', () => {
    it('renders all habits when loaded', () => {
      mockUseHabits.habits = mockHabits;
      render(<HabitList {...defaultProps} />);

      expect(screen.getByTestId('habit-item-habit-1')).toBeInTheDocument();
      expect(screen.getByTestId('habit-item-habit-2')).toBeInTheDocument();
      expect(screen.getByTestId('habit-item-habit-3')).toBeInTheDocument();
    });

    it('displays habits in a grid layout', () => {
      mockUseHabits.habits = mockHabits;
      render(<HabitList {...defaultProps} />);

      const gridContainer = document.querySelector('.grid');
      expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
    });
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      mockUseHabits.habits = mockHabits;
    });

    it('filters habits by name', () => {
      render(<HabitList {...defaultProps} />);

      const searchInput = screen.getByLabelText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'exercise' } });

      expect(screen.getByTestId('habit-item-habit-1')).toBeInTheDocument();
      expect(screen.queryByTestId('habit-item-habit-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('habit-item-habit-3')).not.toBeInTheDocument();
    });

    it('filters habits by description', () => {
      render(<HabitList {...defaultProps} />);

      const searchInput = screen.getByLabelText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'meditation' } });

      expect(screen.queryByTestId('habit-item-habit-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('habit-item-habit-2')).not.toBeInTheDocument();
      expect(screen.getByTestId('habit-item-habit-3')).toBeInTheDocument();
    });

    it('performs case-insensitive search', () => {
      render(<HabitList {...defaultProps} />);

      const searchInput = screen.getByLabelText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'EXERCISE' } });

      expect(screen.getByTestId('habit-item-habit-1')).toBeInTheDocument();
    });

    it('shows filtered count in header', () => {
      render(<HabitList {...defaultProps} />);

      const searchInput = screen.getByLabelText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'exercise' } });

      expect(screen.getByText('3 habits (1 shown)')).toBeInTheDocument();
    });
  });

  describe('Category Filter', () => {
    beforeEach(() => {
      mockUseHabits.habits = mockHabits;
    });

    it('filters habits by category', () => {
      render(<HabitList {...defaultProps} />);

      const filterSelect = screen.getByLabelText(/filter by category/i);
      fireEvent.change(filterSelect, { target: { value: HabitCategory.FITNESS } });

      expect(screen.getByTestId('habit-item-habit-1')).toBeInTheDocument();
      expect(screen.queryByTestId('habit-item-habit-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('habit-item-habit-3')).not.toBeInTheDocument();
    });

    it('shows all habits when "all" is selected', () => {
      render(<HabitList {...defaultProps} />);

      const filterSelect = screen.getByLabelText(/filter by category/i);
      fireEvent.change(filterSelect, { target: { value: HabitCategory.FITNESS } });
      fireEvent.change(filterSelect, { target: { value: 'all' } });

      expect(screen.getByTestId('habit-item-habit-1')).toBeInTheDocument();
      expect(screen.getByTestId('habit-item-habit-2')).toBeInTheDocument();
      expect(screen.getByTestId('habit-item-habit-3')).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    beforeEach(() => {
      mockUseHabits.habits = mockHabits;
    });

    it('sorts habits by name', () => {
      render(<HabitList {...defaultProps} />);

      const sortSelect = screen.getByLabelText(/sort by/i);
      fireEvent.change(sortSelect, { target: { value: 'name' } });

      const habitItems = screen.getAllByTestId(/habit-item-/);
      expect(habitItems[0]).toHaveAttribute('data-testid', 'habit-item-habit-3'); // Meditation
      expect(habitItems[1]).toHaveAttribute('data-testid', 'habit-item-habit-1'); // Morning Exercise
      expect(habitItems[2]).toHaveAttribute('data-testid', 'habit-item-habit-2'); // Read Books
    });

    it('sorts habits by category', () => {
      render(<HabitList {...defaultProps} />);

      const sortSelect = screen.getByLabelText(/sort by/i);
      fireEvent.change(sortSelect, { target: { value: 'category' } });

      // Should be sorted alphabetically by category display name
      const habitItems = screen.getAllByTestId(/habit-item-/);
      expect(habitItems).toHaveLength(3);
    });

    it('defaults to newest first (created date)', () => {
      render(<HabitList {...defaultProps} />);

      const habitItems = screen.getAllByTestId(/habit-item-/);
      expect(habitItems[0]).toHaveAttribute('data-testid', 'habit-item-habit-3'); // Newest
      expect(habitItems[2]).toHaveAttribute('data-testid', 'habit-item-habit-1'); // Oldest
    });
  });

  describe('Edit Functionality', () => {
    it('calls onEdit when habit edit is triggered', () => {
      mockUseHabits.habits = mockHabits;
      const onEdit = jest.fn();
      render(<HabitList {...defaultProps} onEdit={onEdit} />);

      const editButton = screen.getByRole('button', { name: /edit morning exercise/i });
      fireEvent.click(editButton);

      expect(onEdit).toHaveBeenCalledTimes(1);
      expect(onEdit).toHaveBeenCalledWith(mockHabits[0]);
    });

    it('handles missing onEdit prop gracefully', () => {
      mockUseHabits.habits = mockHabits;
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      render(<HabitList />);

      const editButton = screen.getByRole('button', { name: /edit morning exercise/i });
      fireEvent.click(editButton);

      expect(consoleSpy).toHaveBeenCalledWith('Edit clicked for habit:', 'Morning Exercise');
      consoleSpy.mockRestore();
    });
  });

  describe('Delete Functionality', () => {
    beforeEach(() => {
      mockUseHabits.habits = mockHabits;
    });

    it('calls deleteHabit and onHabitDeleted when delete is successful', async () => {
      const onHabitDeleted = jest.fn();
      mockUseHabits.deleteHabit.mockResolvedValue({ success: true });

      render(<HabitList {...defaultProps} onHabitDeleted={onHabitDeleted} />);

      const deleteButton = screen.getByRole('button', { name: /delete morning exercise/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockUseHabits.deleteHabit).toHaveBeenCalledWith('habit-1');
        expect(onHabitDeleted).toHaveBeenCalledWith('habit-1');
      });
    });

    it('handles delete failure gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockUseHabits.deleteHabit.mockResolvedValue({
        success: false,
        error: { code: 'DELETE_ERROR', message: 'Delete failed', timestamp: '2024-01-01T00:00:00.000Z' }
      });

      render(<HabitList {...defaultProps} />);

      const deleteButton = screen.getByRole('button', { name: /delete morning exercise/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Delete failed:', 'Delete failed');
      });

      consoleSpy.mockRestore();
    });

    it('shows loading state during delete operation', async () => {
      mockUseHabits.deleteHabit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<HabitList {...defaultProps} />);

      const deleteButton = screen.getByRole('button', { name: /delete morning exercise/i });
      fireEvent.click(deleteButton);

      expect(screen.getByText('Deleting...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /deleting/i })).toBeDisabled();

      await waitFor(() => {
        expect(mockUseHabits.deleteHabit).toHaveBeenCalled();
      }, { timeout: 200 });
    });

    it('handles delete exceptions', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockUseHabits.deleteHabit.mockRejectedValue(new Error('Network error'));

      render(<HabitList {...defaultProps} />);

      const deleteButton = screen.getByRole('button', { name: /delete morning exercise/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Delete failed:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Refresh Functionality', () => {
    it('calls refreshData when refresh button is clicked', () => {
      render(<HabitList {...defaultProps} />);

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);

      expect(mockUseHabits.refreshData).toHaveBeenCalledTimes(1);
    });
  });

  describe('Combined Filters', () => {
    beforeEach(() => {
      mockUseHabits.habits = mockHabits;
    });

    it('applies search and category filter together', () => {
      render(<HabitList {...defaultProps} />);

      const searchInput = screen.getByLabelText(/search/i);
      const filterSelect = screen.getByLabelText(/filter by category/i);

      fireEvent.change(searchInput, { target: { value: 'read' } });
      fireEvent.change(filterSelect, { target: { value: HabitCategory.LEARNING } });

      expect(screen.getByTestId('habit-item-habit-2')).toBeInTheDocument();
      expect(screen.queryByTestId('habit-item-habit-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('habit-item-habit-3')).not.toBeInTheDocument();
    });

    it('shows correct filtered count with multiple filters', () => {
      render(<HabitList {...defaultProps} />);

      const searchInput = screen.getByLabelText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'meditation' } });

      expect(screen.getByText('3 habits (1 shown)')).toBeInTheDocument();
    });
  });

  describe('Custom Classes', () => {
    it('applies custom className', () => {
      const { container } = render(<HabitList {...defaultProps} className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});