/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HabitForm } from '../HabitForm';
import { HabitCategory, HabitFrequency } from '../../../lib/types';

// Mock the useHabits hook
jest.mock('../../../hooks/useHabits', () => ({
  useHabits: () => ({
    createHabit: jest.fn().mockResolvedValue({ success: true, data: { id: 'test-id' } }),
    isLoading: false,
  }),
}));

describe('HabitForm', () => {
  const defaultProps = {
    onSuccess: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with all required fields', () => {
    render(<HabitForm {...defaultProps} />);

    expect(screen.getByText('Create New Habit')).toBeInTheDocument();
    expect(screen.getByLabelText(/habit name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/frequency/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/target count/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create habit/i })).toBeInTheDocument();
  });

  it('displays validation errors for required fields', async () => {
    render(<HabitForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /create habit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });

  it('allows input in form fields', () => {
    render(<HabitForm {...defaultProps} />);

    const nameInput = screen.getByLabelText(/habit name/i) as HTMLInputElement;
    const descriptionInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement;
    const targetCountInput = screen.getByLabelText(/target count/i) as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'Test Habit' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } });
    fireEvent.change(targetCountInput, { target: { value: '3' } });

    expect(nameInput.value).toBe('Test Habit');
    expect(descriptionInput.value).toBe('Test description');
    expect(targetCountInput.value).toBe('3');
  });

  it('shows custom frequency settings when custom frequency is selected', () => {
    render(<HabitForm {...defaultProps} />);

    const frequencySelect = screen.getByLabelText(/frequency/i) as HTMLSelectElement;
    fireEvent.change(frequencySelect, { target: { value: HabitFrequency.CUSTOM } });

    expect(screen.getByText('Custom Frequency Settings')).toBeInTheDocument();
    expect(screen.getByLabelText(/every x days/i)).toBeInTheDocument();
  });

  it('resets the form when reset button is clicked', () => {
    render(<HabitForm {...defaultProps} />);

    const nameInput = screen.getByLabelText(/habit name/i) as HTMLInputElement;
    const resetButton = screen.getByRole('button', { name: /reset/i });

    fireEvent.change(nameInput, { target: { value: 'Test Habit' } });
    expect(nameInput.value).toBe('Test Habit');

    fireEvent.click(resetButton);
    expect(nameInput.value).toBe('');
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = jest.fn();
    render(<HabitForm {...defaultProps} onCancel={onCancel} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('validates target count range', async () => {
    render(<HabitForm {...defaultProps} />);

    const targetCountInput = screen.getByLabelText(/target count/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /create habit/i });

    // Test invalid target count
    fireEvent.change(targetCountInput, { target: { value: '0' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/target count must be between 1 and 100/i)).toBeInTheDocument();
    });
  });
});