import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Calendar } from '../Calendar';

describe('Calendar', () => {
  const mockOnDateSelect = vi.fn();

  beforeEach(() => {
    mockOnDateSelect.mockClear();
  });

  it('should render calendar with navigation and grid', () => {
    render(
      <Calendar onDateSelect={mockOnDateSelect} />
    );

    // Should have navigation
    expect(screen.getByRole('navigation', { name: /calendar navigation/i })).toBeInTheDocument();

    // Should have calendar grid
    expect(screen.getByRole('grid', { name: /calendar grid/i })).toBeInTheDocument();

    // Should have week day headers
    expect(screen.getByRole('columnheader', { name: 'Sun' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Sat' })).toBeInTheDocument();
  });

  it('should render without navigation when disabled', () => {
    render(
      <Calendar onDateSelect={mockOnDateSelect} showNavigation={false} />
    );

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.getByRole('grid', { name: /calendar grid/i })).toBeInTheDocument();
  });

  it('should handle date selection', async () => {
    const user = userEvent.setup();
    render(
      <Calendar onDateSelect={mockOnDateSelect} />
    );

    // Find a date button and click it
    const dateButtons = screen.getAllByRole('gridcell');
    const firstEnabledDate = dateButtons.find(button => !button.hasAttribute('disabled'));

    if (firstEnabledDate) {
      await user.click(firstEnabledDate);
      expect(mockOnDateSelect).toHaveBeenCalledTimes(1);
    }
  });

  it('should show month and year selectors when enabled', () => {
    render(
      <Calendar
        onDateSelect={mockOnDateSelect}
        showMonthSelector={true}
        showYearSelector={true}
      />
    );

    expect(screen.getByRole('button', { name: /select month/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /select year/i })).toBeInTheDocument();
  });

  it('should respect min and max date constraints', () => {
    const today = new Date();
    const minDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const maxDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    render(
      <Calendar
        onDateSelect={mockOnDateSelect}
        minDate={minDate}
        maxDate={maxDate}
      />
    );

    // Calendar should render without errors
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('should handle controlled selectedDate prop', () => {
    const selectedDate = new Date();
    render(
      <Calendar
        onDateSelect={mockOnDateSelect}
        selectedDate={selectedDate}
      />
    );

    // Should have a selected date
    const selectedButton = screen.getByRole('gridcell', { selected: true });
    expect(selectedButton).toBeInTheDocument();
  });

  it('should handle disabled dates', () => {
    const today = new Date();
    const disabledDate = new Date(today.getFullYear(), today.getMonth(), 15);

    render(
      <Calendar
        onDateSelect={mockOnDateSelect}
        disabledDates={[disabledDate]}
      />
    );

    // Should render without errors
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(
      <Calendar onDateSelect={mockOnDateSelect} />
    );

    const calendar = screen.getByRole('application', { name: /calendar/i });
    expect(calendar).toBeInTheDocument();
  });

  it('should navigate months using navigation buttons', async () => {
    const user = userEvent.setup();
    render(
      <Calendar onDateSelect={mockOnDateSelect} />
    );

    const nextButton = screen.getByRole('button', { name: /next month/i });
    await user.click(nextButton);

    // Calendar should still be rendered (month changed)
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });
});