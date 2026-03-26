/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HabitItem } from '../HabitItem';
import { Habit, HabitCategory, HabitFrequency } from '../../../lib/types';

const mockHabit: Habit = {
  id: 'test-habit-id',
  name: 'Test Habit',
  description: 'This is a test habit description',
  category: HabitCategory.HEALTH,
  frequency: HabitFrequency.DAILY,
  targetCount: 1,
  color: '#3B82F6',
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  goal: 'Test goal',
  motivation: 'Test motivation',
  reminderTime: '09:00',
};

const mockHabitWithCustomFrequency: Habit = {
  ...mockHabit,
  id: 'custom-habit-id',
  name: 'Custom Habit',
  frequency: HabitFrequency.CUSTOM,
  customFrequency: {
    days: 3,
    weekdays: [1, 3, 5], // Monday, Wednesday, Friday
  },
};

const mockHabitMinimal: Habit = {
  id: 'minimal-habit-id',
  name: 'Minimal Habit',
  category: HabitCategory.OTHER,
  frequency: HabitFrequency.WEEKLY,
  targetCount: 2,
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('HabitItem', () => {
  const defaultProps = {
    habit: mockHabit,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders habit name and description', () => {
      render(<HabitItem {...defaultProps} />);

      expect(screen.getByText('Test Habit')).toBeInTheDocument();
      expect(screen.getByText('This is a test habit description')).toBeInTheDocument();
    });

    it('displays category icon and badge', () => {
      render(<HabitItem {...defaultProps} />);

      expect(screen.getByText('🏥')).toBeInTheDocument();
      expect(screen.getByText('Health')).toBeInTheDocument();
    });

    it('shows habit color when provided', () => {
      render(<HabitItem {...defaultProps} />);

      const colorIndicator = screen.getByLabelText('Habit color');
      expect(colorIndicator).toHaveStyle('background-color: rgb(59, 130, 246)');
    });

    it('displays frequency and target count', () => {
      render(<HabitItem {...defaultProps} />);

      expect(screen.getByText('Daily')).toBeInTheDocument();
      expect(screen.getByText('1 time')).toBeInTheDocument();
    });

    it('shows reminder time when provided', () => {
      render(<HabitItem {...defaultProps} />);

      expect(screen.getByText('09:00')).toBeInTheDocument();
    });

    it('displays goal and motivation when provided', () => {
      render(<HabitItem {...defaultProps} />);

      expect(screen.getByText('Goal')).toBeInTheDocument();
      expect(screen.getByText('Test goal')).toBeInTheDocument();
      expect(screen.getByText('Motivation')).toBeInTheDocument();
      expect(screen.getByText('Test motivation')).toBeInTheDocument();
    });

    it('shows creation date', () => {
      render(<HabitItem {...defaultProps} />);

      expect(screen.getByText(/Created/)).toBeInTheDocument();
    });
  });

  describe('Minimal Habit Display', () => {
    it('renders habit with only required fields', () => {
      const props = { ...defaultProps, habit: mockHabitMinimal };
      render(<HabitItem {...props} />);

      expect(screen.getByText('Minimal Habit')).toBeInTheDocument();
      expect(screen.getByText('Other')).toBeInTheDocument();
      expect(screen.getByText('Weekly')).toBeInTheDocument();
      expect(screen.getByText('2 times')).toBeInTheDocument();
    });

    it('does not show optional sections when data is missing', () => {
      const props = { ...defaultProps, habit: mockHabitMinimal };
      render(<HabitItem {...props} />);

      expect(screen.queryByText('Goal')).not.toBeInTheDocument();
      expect(screen.queryByText('Motivation')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Habit color')).not.toBeInTheDocument();
    });
  });

  describe('Custom Frequency Display', () => {
    it('displays custom frequency with weekdays', () => {
      const props = { ...defaultProps, habit: mockHabitWithCustomFrequency };
      render(<HabitItem {...props} />);

      expect(screen.getByText('Custom (Mon, Wed, Fri)')).toBeInTheDocument();
    });

    it('displays custom frequency with days interval', () => {
      const habitWithDaysOnly: Habit = {
        ...mockHabitWithCustomFrequency,
        customFrequency: { days: 3 },
      };
      const props = { ...defaultProps, habit: habitWithDaysOnly };
      render(<HabitItem {...props} />);

      expect(screen.getByText('Every 3 days')).toBeInTheDocument();
    });

    it('displays singular day for custom frequency', () => {
      const habitWithOneDay: Habit = {
        ...mockHabitWithCustomFrequency,
        customFrequency: { days: 1 },
      };
      const props = { ...defaultProps, habit: habitWithOneDay };
      render(<HabitItem {...props} />);

      expect(screen.getByText('Every 1 day')).toBeInTheDocument();
    });
  });

  describe('Edit Functionality', () => {
    it('calls onEdit when edit button is clicked', () => {
      const onEdit = jest.fn();
      render(<HabitItem {...defaultProps} onEdit={onEdit} />);

      const editButton = screen.getByRole('button', { name: /edit test habit/i });
      fireEvent.click(editButton);

      expect(onEdit).toHaveBeenCalledTimes(1);
      expect(onEdit).toHaveBeenCalledWith(mockHabit);
    });

    it('disables edit button when loading', () => {
      render(<HabitItem {...defaultProps} isLoading={true} />);

      const editButton = screen.getByRole('button', { name: /edit test habit/i });
      expect(editButton).toBeDisabled();
      expect(editButton).toHaveTextContent('Loading...');
    });

    it('does not call onEdit when loading and button is clicked', () => {
      const onEdit = jest.fn();
      render(<HabitItem {...defaultProps} onEdit={onEdit} isLoading={true} />);

      const editButton = screen.getByRole('button', { name: /edit test habit/i });
      fireEvent.click(editButton);

      expect(onEdit).not.toHaveBeenCalled();
    });
  });

  describe('Delete Functionality', () => {
    it('shows delete confirmation dialog when delete button is clicked', () => {
      render(<HabitItem {...defaultProps} />);

      const deleteButton = screen.getByRole('button', { name: /delete test habit/i });
      fireEvent.click(deleteButton);

      expect(screen.getByText('Delete Habit')).toBeInTheDocument();
      expect(screen.getByText(/are you sure you want to delete "test habit"/i)).toBeInTheDocument();
    });

    it('closes confirmation dialog when cancel is clicked', () => {
      render(<HabitItem {...defaultProps} />);

      const deleteButton = screen.getByRole('button', { name: /delete test habit/i });
      fireEvent.click(deleteButton);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(screen.queryByText('Delete Habit')).not.toBeInTheDocument();
    });

    it('calls onDelete when delete is confirmed', async () => {
      const onDelete = jest.fn().mockResolvedValue(undefined);
      render(<HabitItem {...defaultProps} onDelete={onDelete} />);

      const deleteButton = screen.getByRole('button', { name: /delete test habit/i });
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(onDelete).toHaveBeenCalledTimes(1);
        expect(onDelete).toHaveBeenCalledWith(mockHabit.id);
      });
    });

    it('shows loading state during delete operation', async () => {
      const onDelete = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      render(<HabitItem {...defaultProps} onDelete={onDelete} />);

      const deleteButton = screen.getByRole('button', { name: /delete test habit/i });
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(confirmButton);

      expect(screen.getByText('Deleting...')).toBeInTheDocument();
      expect(confirmButton).toBeDisabled();

      await waitFor(() => {
        expect(onDelete).toHaveBeenCalled();
      });
    });

    it('disables delete button when loading', () => {
      render(<HabitItem {...defaultProps} isLoading={true} />);

      const deleteButton = screen.getByRole('button', { name: /delete test habit/i });
      expect(deleteButton).toBeDisabled();
    });

    it('handles delete errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const onDelete = jest.fn().mockRejectedValue(new Error('Delete failed'));
      render(<HabitItem {...defaultProps} onDelete={onDelete} />);

      const deleteButton = screen.getByRole('button', { name: /delete test habit/i });
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Delete failed:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Loading States', () => {
    it('shows loading text on edit button when loading', () => {
      render(<HabitItem {...defaultProps} isLoading={true} />);

      const editButton = screen.getByRole('button', { name: /edit test habit/i });
      expect(editButton).toHaveTextContent('Loading...');
      expect(editButton).toBeDisabled();
    });

    it('disables both buttons when loading', () => {
      render(<HabitItem {...defaultProps} isLoading={true} />);

      const editButton = screen.getByRole('button', { name: /edit test habit/i });
      const deleteButton = screen.getByRole('button', { name: /delete test habit/i });

      expect(editButton).toBeDisabled();
      expect(deleteButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has proper aria labels for buttons', () => {
      render(<HabitItem {...defaultProps} />);

      expect(screen.getByRole('button', { name: /edit test habit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete test habit/i })).toBeInTheDocument();
    });

    it('has proper aria label for category icon', () => {
      render(<HabitItem {...defaultProps} />);

      expect(screen.getByLabelText('Category: Health')).toBeInTheDocument();
    });

    it('has proper aria label for habit color', () => {
      render(<HabitItem {...defaultProps} />);

      expect(screen.getByLabelText('Habit color')).toBeInTheDocument();
    });

    it('has proper focus management for modal', () => {
      render(<HabitItem {...defaultProps} />);

      const deleteButton = screen.getByRole('button', { name: /delete test habit/i });
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByRole('button', { name: /delete/i });
      const cancelButton = screen.getByRole('button', { name: /cancel/i });

      expect(confirmButton).toHaveAttribute('tabIndex');
      expect(cancelButton).toHaveAttribute('tabIndex');
    });
  });

  describe('Category Colors and Icons', () => {
    it.each([
      [HabitCategory.HEALTH, '🏥'],
      [HabitCategory.PRODUCTIVITY, '⚡'],
      [HabitCategory.LEARNING, '📚'],
      [HabitCategory.LIFESTYLE, '🌟'],
      [HabitCategory.FITNESS, '💪'],
      [HabitCategory.MINDFULNESS, '🧘'],
      [HabitCategory.SOCIAL, '👥'],
      [HabitCategory.OTHER, '📋'],
    ])('displays correct icon for %s category', (category, expectedIcon) => {
      const habit = { ...mockHabit, category };
      render(<HabitItem {...defaultProps} habit={habit} />);

      expect(screen.getByText(expectedIcon)).toBeInTheDocument();
    });
  });

  describe('Target Count Display', () => {
    it('shows singular form for count of 1', () => {
      const habit = { ...mockHabit, targetCount: 1 };
      render(<HabitItem {...defaultProps} habit={habit} />);

      expect(screen.getByText('1 time')).toBeInTheDocument();
    });

    it('shows plural form for count greater than 1', () => {
      const habit = { ...mockHabit, targetCount: 5 };
      render(<HabitItem {...defaultProps} habit={habit} />);

      expect(screen.getByText('5 times')).toBeInTheDocument();
    });
  });
});