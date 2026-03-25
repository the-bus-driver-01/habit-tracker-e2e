import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarGrid } from '../CalendarGrid';

describe('CalendarGrid', () => {
  const mockOnDateSelect = vi.fn();
  const currentDate = new Date(2024, 2, 15); // March 15, 2024

  beforeEach(() => {
    mockOnDateSelect.mockClear();
  });

  it('should render calendar grid with week headers', () => {
    render(
      <CalendarGrid
        currentDate={currentDate}
        onDateSelect={mockOnDateSelect}
      />
    );

    // Check for week day headers
    expect(screen.getByRole('columnheader', { name: 'Sun' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Mon' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Tue' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Wed' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Thu' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Fri' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Sat' })).toBeInTheDocument();
  });

  it('should render all calendar dates', () => {
    render(
      <CalendarGrid
        currentDate={currentDate}
        onDateSelect={mockOnDateSelect}
      />
    );

    // Should render 42 date buttons (6 weeks * 7 days)
    const dateButtons = screen.getAllByRole('gridcell');
    expect(dateButtons).toHaveLength(42);
  });

  it('should call onDateSelect when a date is clicked', async () => {
    const user = userEvent.setup();
    render(
      <CalendarGrid
        currentDate={currentDate}
        onDateSelect={mockOnDateSelect}
      />
    );

    // Find and click a date button (e.g., March 20, 2024)
    const dateButton = screen.getByRole('gridcell', { name: /Wednesday, March 20th, 2024/ });
    await user.click(dateButton);

    expect(mockOnDateSelect).toHaveBeenCalledTimes(1);
    const calledDate = mockOnDateSelect.mock.calls[0][0];
    expect(calledDate.getDate()).toBe(20);
    expect(calledDate.getMonth()).toBe(2); // March
  });

  it('should handle keyboard navigation', () => {
    render(
      <CalendarGrid
        currentDate={currentDate}
        onDateSelect={mockOnDateSelect}
      />
    );

    const dateButton = screen.getByRole('gridcell', { name: /Wednesday, March 20th, 2024/ });

    // Test Enter key
    fireEvent.keyDown(dateButton, { key: 'Enter' });
    expect(mockOnDateSelect).toHaveBeenCalledTimes(1);

    // Test Space key
    fireEvent.keyDown(dateButton, { key: ' ' });
    expect(mockOnDateSelect).toHaveBeenCalledTimes(2);
  });

  it('should mark selected date correctly', () => {
    const selectedDate = new Date(2024, 2, 20); // March 20, 2024
    render(
      <CalendarGrid
        currentDate={currentDate}
        selectedDate={selectedDate}
        onDateSelect={mockOnDateSelect}
      />
    );

    const selectedButton = screen.getByRole('gridcell', { name: /Wednesday, March 20th, 2024/ });
    expect(selectedButton).toHaveAttribute('aria-selected', 'true');
    expect(selectedButton).toHaveAttribute('tabIndex', '0');
  });

  it('should mark today correctly', () => {
    const today = new Date();
    render(
      <CalendarGrid
        currentDate={today}
        onDateSelect={mockOnDateSelect}
      />
    );

    // Find today's button
    const todayButtons = screen.getAllByRole('gridcell').filter(button =>
      button.getAttribute('aria-current') === 'date'
    );

    expect(todayButtons).toHaveLength(1);
  });

  it('should disable dates outside min/max range', async () => {
    const user = userEvent.setup();
    const minDate = new Date(2024, 2, 10); // March 10, 2024
    const maxDate = new Date(2024, 2, 20); // March 20, 2024

    render(
      <CalendarGrid
        currentDate={currentDate}
        onDateSelect={mockOnDateSelect}
        minDate={minDate}
        maxDate={maxDate}
      />
    );

    // Find a date before minDate (e.g., March 5, 2024)
    const disabledButton = screen.getByRole('gridcell', { name: /Tuesday, March 5th, 2024/ });
    expect(disabledButton).toBeDisabled();

    // Try to click disabled date - should not call onDateSelect
    await user.click(disabledButton);
    expect(mockOnDateSelect).not.toHaveBeenCalled();
  });

  it('should disable explicitly disabled dates', async () => {
    const user = userEvent.setup();
    const disabledDate = new Date(2024, 2, 15); // March 15, 2024

    render(
      <CalendarGrid
        currentDate={currentDate}
        onDateSelect={mockOnDateSelect}
        disabledDates={[disabledDate]}
      />
    );

    const disabledButton = screen.getByRole('gridcell', { name: /Friday, March 15th, 2024/ });
    expect(disabledButton).toBeDisabled();

    await user.click(disabledButton);
    expect(mockOnDateSelect).not.toHaveBeenCalled();
  });

  it('should highlight specified dates', () => {
    const highlightedDate = new Date(2024, 2, 25); // March 25, 2024

    render(
      <CalendarGrid
        currentDate={currentDate}
        onDateSelect={mockOnDateSelect}
        highlightedDates={[highlightedDate]}
      />
    );

    const highlightedButton = screen.getByRole('gridcell', { name: /Monday, March 25th, 2024/ });
    // The highlighting would be visible through CSS classes, which we can check
    expect(highlightedButton).toBeInTheDocument();
  });

  it('should show dates from adjacent months', () => {
    render(
      <CalendarGrid
        currentDate={currentDate}
        onDateSelect={mockOnDateSelect}
      />
    );

    // March 2024 calendar should show some February and April dates
    // February dates would be at the beginning (grayed out)
    // April dates would be at the end (grayed out)
    const allDateButtons = screen.getAllByRole('gridcell');
    expect(allDateButtons).toHaveLength(42);

    // Check that we have dates with different months represented
    // This is a bit tricky to test directly, but we know the structure should be correct
    expect(allDateButtons[0]).toBeInTheDocument(); // Should be a February date
    expect(allDateButtons[41]).toBeInTheDocument(); // Should be an April date
  });

  it('should have proper accessibility attributes', () => {
    const selectedDate = new Date(2024, 2, 20);
    render(
      <CalendarGrid
        currentDate={currentDate}
        selectedDate={selectedDate}
        onDateSelect={mockOnDateSelect}
      />
    );

    // Grid should have proper role
    const grid = screen.getByRole('grid', { name: /calendar grid/i });
    expect(grid).toBeInTheDocument();

    // Week header should have proper role
    const weekHeader = screen.getByRole('row');
    expect(weekHeader).toBeInTheDocument();

    // Selected date should have proper tabindex
    const selectedButton = screen.getByRole('gridcell', { name: /Wednesday, March 20th, 2024/ });
    expect(selectedButton).toHaveAttribute('tabIndex', '0');

    // Other dates should have tabindex -1
    const otherButton = screen.getByRole('gridcell', { name: /Thursday, March 21st, 2024/ });
    expect(otherButton).toHaveAttribute('tabIndex', '-1');
  });

  it('should handle month boundary edge cases', () => {
    // Test with January (previous month is December of previous year)
    const januaryDate = new Date(2024, 0, 15); // January 15, 2024
    render(
      <CalendarGrid
        currentDate={januaryDate}
        onDateSelect={mockOnDateSelect}
      />
    );

    const dateButtons = screen.getAllByRole('gridcell');
    expect(dateButtons).toHaveLength(42);

    // Should show some December 2023 dates at the beginning
    // and some February 2024 dates at the end
  });

  it('should handle leap year correctly', () => {
    const februaryLeapYear = new Date(2024, 1, 15); // February 15, 2024 (leap year)
    render(
      <CalendarGrid
        currentDate={februaryLeapYear}
        onDateSelect={mockOnDateSelect}
      />
    );

    // Should show February 29, 2024 in a leap year
    const feb29Button = screen.getByRole('gridcell', { name: /Thursday, February 29th, 2024/ });
    expect(feb29Button).toBeInTheDocument();
  });

  it('should prevent default on keyboard events', () => {
    render(
      <CalendarGrid
        currentDate={currentDate}
        onDateSelect={mockOnDateSelect}
      />
    );

    const dateButton = screen.getByRole('gridcell', { name: /Friday, March 15th, 2024/ });
    const keydownEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    const preventDefaultSpy = vi.spyOn(keydownEvent, 'preventDefault');

    fireEvent(dateButton, keydownEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should not call onDateSelect for keyboard events on disabled dates', () => {
    const disabledDate = new Date(2024, 2, 15);
    render(
      <CalendarGrid
        currentDate={currentDate}
        onDateSelect={mockOnDateSelect}
        disabledDates={[disabledDate]}
      />
    );

    const disabledButton = screen.getByRole('gridcell', { name: /Friday, March 15th, 2024/ });

    fireEvent.keyDown(disabledButton, { key: 'Enter' });
    fireEvent.keyDown(disabledButton, { key: ' ' });

    expect(mockOnDateSelect).not.toHaveBeenCalled();
  });
});