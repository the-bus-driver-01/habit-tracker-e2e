import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarNavigation } from '../CalendarNavigation';

describe('CalendarNavigation', () => {
  const mockOnNavigate = vi.fn();
  const currentDate = new Date(2024, 2, 15); // March 15, 2024

  beforeEach(() => {
    mockOnNavigate.mockClear();
  });

  it('should render navigation buttons and date display', () => {
    render(
      <CalendarNavigation
        currentDate={currentDate}
        onNavigate={mockOnNavigate}
      />
    );

    expect(screen.getByRole('button', { name: /previous month/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next month/i })).toBeInTheDocument();
    expect(screen.getByText('March')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
  });

  it('should call onNavigate when previous button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <CalendarNavigation
        currentDate={currentDate}
        onNavigate={mockOnNavigate}
      />
    );

    const previousButton = screen.getByRole('button', { name: /previous month/i });
    await user.click(previousButton);

    expect(mockOnNavigate).toHaveBeenCalledTimes(1);
    const calledDate = mockOnNavigate.mock.calls[0][0];
    expect(calledDate.getMonth()).toBe(1); // February
  });

  it('should call onNavigate when next button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <CalendarNavigation
        currentDate={currentDate}
        onNavigate={mockOnNavigate}
      />
    );

    const nextButton = screen.getByRole('button', { name: /next month/i });
    await user.click(nextButton);

    expect(mockOnNavigate).toHaveBeenCalledTimes(1);
    const calledDate = mockOnNavigate.mock.calls[0][0];
    expect(calledDate.getMonth()).toBe(3); // April
  });

  it('should disable previous button when at min date', () => {
    const minDate = new Date(2024, 2, 1); // March 1, 2024
    render(
      <CalendarNavigation
        currentDate={currentDate}
        onNavigate={mockOnNavigate}
        minDate={minDate}
      />
    );

    const previousButton = screen.getByRole('button', { name: /previous month/i });
    expect(previousButton).toBeDisabled();
  });

  it('should disable next button when at max date', () => {
    const maxDate = new Date(2024, 2, 31); // March 31, 2024
    render(
      <CalendarNavigation
        currentDate={currentDate}
        onNavigate={mockOnNavigate}
        maxDate={maxDate}
      />
    );

    const nextButton = screen.getByRole('button', { name: /next month/i });
    expect(nextButton).toBeDisabled();
  });

  it('should show month selector when enabled', async () => {
    const user = userEvent.setup();
    render(
      <CalendarNavigation
        currentDate={currentDate}
        onNavigate={mockOnNavigate}
        showMonthSelector={true}
      />
    );

    const monthButton = screen.getByRole('button', { name: /select month/i });
    expect(monthButton).toBeInTheDocument();
    expect(monthButton).toHaveTextContent('March');

    await user.click(monthButton);

    // Should show dropdown with month options
    expect(screen.getByRole('listbox', { name: /month selection/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'January' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'December' })).toBeInTheDocument();
  });

  it('should navigate to selected month from dropdown', async () => {
    const user = userEvent.setup();
    render(
      <CalendarNavigation
        currentDate={currentDate}
        onNavigate={mockOnNavigate}
        showMonthSelector={true}
      />
    );

    const monthButton = screen.getByRole('button', { name: /select month/i });
    await user.click(monthButton);

    const juneOption = screen.getByRole('option', { name: 'June' });
    await user.click(juneOption);

    expect(mockOnNavigate).toHaveBeenCalledTimes(1);
    const calledDate = mockOnNavigate.mock.calls[0][0];
    expect(calledDate.getMonth()).toBe(5); // June (0-indexed)
  });

  it('should show year selector when enabled', async () => {
    const user = userEvent.setup();
    render(
      <CalendarNavigation
        currentDate={currentDate}
        onNavigate={mockOnNavigate}
        showYearSelector={true}
      />
    );

    const yearButton = screen.getByRole('button', { name: /select year/i });
    expect(yearButton).toBeInTheDocument();
    expect(yearButton).toHaveTextContent('2024');

    await user.click(yearButton);

    // Should show dropdown with year options
    expect(screen.getByRole('listbox', { name: /year selection/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '2014' })).toBeInTheDocument(); // 10 years before
    expect(screen.getByRole('option', { name: '2034' })).toBeInTheDocument(); // 10 years after
  });

  it('should navigate to selected year from dropdown', async () => {
    const user = userEvent.setup();
    render(
      <CalendarNavigation
        currentDate={currentDate}
        onNavigate={mockOnNavigate}
        showYearSelector={true}
      />
    );

    const yearButton = screen.getByRole('button', { name: /select year/i });
    await user.click(yearButton);

    const year2025Option = screen.getByRole('option', { name: '2025' });
    await user.click(year2025Option);

    expect(mockOnNavigate).toHaveBeenCalledTimes(1);
    const calledDate = mockOnNavigate.mock.calls[0][0];
    expect(calledDate.getFullYear()).toBe(2025);
  });

  it('should handle keyboard navigation', async () => {
    render(
      <CalendarNavigation
        currentDate={currentDate}
        onNavigate={mockOnNavigate}
      />
    );

    const previousButton = screen.getByRole('button', { name: /previous month/i });

    // Test Enter key
    fireEvent.keyDown(previousButton, { key: 'Enter' });
    expect(mockOnNavigate).toHaveBeenCalledTimes(1);

    // Test Space key
    fireEvent.keyDown(previousButton, { key: ' ' });
    expect(mockOnNavigate).toHaveBeenCalledTimes(2);
  });

  it('should have proper accessibility attributes', () => {
    render(
      <CalendarNavigation
        currentDate={currentDate}
        onNavigate={mockOnNavigate}
        showMonthSelector={true}
        showYearSelector={true}
      />
    );

    // Navigation should have proper role and label
    const navigation = screen.getByRole('navigation', { name: /calendar navigation/i });
    expect(navigation).toBeInTheDocument();

    // Buttons should have proper aria-labels
    expect(screen.getByRole('button', { name: /previous month/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next month/i })).toBeInTheDocument();

    // Dropdowns should have proper aria attributes
    const monthButton = screen.getByRole('button', { name: /select month/i });
    expect(monthButton).toHaveAttribute('aria-haspopup', 'listbox');
    expect(monthButton).toHaveAttribute('aria-expanded', 'false');

    const yearButton = screen.getByRole('button', { name: /select year/i });
    expect(yearButton).toHaveAttribute('aria-haspopup', 'listbox');
    expect(yearButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('should update aria-expanded when dropdown is opened', async () => {
    const user = userEvent.setup();
    render(
      <CalendarNavigation
        currentDate={currentDate}
        onNavigate={mockOnNavigate}
        showMonthSelector={true}
      />
    );

    const monthButton = screen.getByRole('button', { name: /select month/i });
    expect(monthButton).toHaveAttribute('aria-expanded', 'false');

    await user.click(monthButton);
    expect(monthButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('should close dropdown after selection', async () => {
    const user = userEvent.setup();
    render(
      <CalendarNavigation
        currentDate={currentDate}
        onNavigate={mockOnNavigate}
        showMonthSelector={true}
      />
    );

    const monthButton = screen.getByRole('button', { name: /select month/i });
    await user.click(monthButton);

    const januaryOption = screen.getByRole('option', { name: 'January' });
    await user.click(januaryOption);

    // Dropdown should be closed
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('should handle edge case navigation correctly', async () => {
    const user = userEvent.setup();
    const januaryDate = new Date(2024, 0, 15); // January 15, 2024

    render(
      <CalendarNavigation
        currentDate={januaryDate}
        onNavigate={mockOnNavigate}
      />
    );

    const previousButton = screen.getByRole('button', { name: /previous month/i });
    await user.click(previousButton);

    expect(mockOnNavigate).toHaveBeenCalledTimes(1);
    const calledDate = mockOnNavigate.mock.calls[0][0];
    expect(calledDate.getMonth()).toBe(11); // December (previous year)
    expect(calledDate.getFullYear()).toBe(2023);
  });
});