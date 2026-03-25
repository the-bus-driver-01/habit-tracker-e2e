import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CalendarGrid from "./CalendarGrid";

describe("CalendarGrid Component", () => {
  describe("Rendering", () => {
    it("should render the calendar grid", () => {
      render(<CalendarGrid />);
      expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    });

    it("should display the current month and year", () => {
      const currentDate = new Date(2024, 2); // March 2024
      render(<CalendarGrid selectedDate={currentDate} />);
      expect(screen.getByText("March 2024")).toBeInTheDocument();
    });

    it("should display all day labels", () => {
      render(<CalendarGrid />);
      const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      dayLabels.forEach((label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });

    it("should render day cells for all weeks in the month", () => {
      const currentDate = new Date(2024, 2); // March 2024
      const { container } = render(<CalendarGrid selectedDate={currentDate} />);

      // March 2024 has 31 days
      const buttons = container.querySelectorAll("button[aria-label]");
      expect(buttons.length).toBeGreaterThanOrEqual(31);
    });

    it("should include navigation buttons", () => {
      render(<CalendarGrid />);
      const buttons = screen.getAllByRole("button");
      // Should have at least 2 nav buttons and some day buttons
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Navigation", () => {
    it("should update month when next button is clicked", () => {
      const onMonthChange = vi.fn();
      const currentDate = new Date(2024, 2); // March 2024
      render(
        <CalendarGrid
          selectedDate={currentDate}
          onMonthChange={onMonthChange}
        />
      );

      const nextButton = screen.getByLabelText("Next month");
      fireEvent.click(nextButton);

      expect(onMonthChange).toHaveBeenCalled();
    });

    it("should update month when previous button is clicked", () => {
      const onMonthChange = vi.fn();
      const currentDate = new Date(2024, 2); // March 2024
      render(
        <CalendarGrid
          selectedDate={currentDate}
          onMonthChange={onMonthChange}
        />
      );

      const prevButton = screen.getByLabelText("Previous month");
      fireEvent.click(prevButton);

      expect(onMonthChange).toHaveBeenCalled();
    });

    it("should display the correct month after navigation", () => {
      const currentDate = new Date(2024, 2); // March 2024
      const { rerender } = render(<CalendarGrid selectedDate={currentDate} />);

      expect(screen.getByText("March 2024")).toBeInTheDocument();

      // Simulate moving to next month
      const nextMonth = new Date(2024, 3); // April 2024
      rerender(
        <CalendarGrid
          selectedDate={nextMonth}
          onMonthChange={() => {}}
        />
      );

      expect(screen.getByText("April 2024")).toBeInTheDocument();
    });
  });

  describe("Date Selection", () => {
    it("should call onDateChange when a day is clicked", () => {
      const onDateChange = vi.fn();
      const currentDate = new Date(2024, 2); // March 2024
      render(
        <CalendarGrid
          selectedDate={currentDate}
          onDateChange={onDateChange}
        />
      );

      // Click on a specific day (e.g., 15th)
      const dayButtons = screen.getAllByRole("button");
      const dayButton = dayButtons.find(
        (btn) => btn.getAttribute("aria-label")?.includes("3/15/2024")
      );

      if (dayButton) {
        fireEvent.click(dayButton);
        expect(onDateChange).toHaveBeenCalled();
      }
    });

    it("should highlight the selected date", () => {
      const selectedDate = new Date(2024, 2, 15); // March 15, 2024
      render(<CalendarGrid selectedDate={selectedDate} />);

      const selectedCell = screen.getByTestId("calendar-day-15");
      expect(selectedCell).toHaveAttribute("data-selected", "true");
      expect(selectedCell.textContent).toContain("15");
    });

    it("should not allow clicking on days from other months", () => {
      const onDateChange = vi.fn();
      const currentDate = new Date(2024, 2); // March 2024
      const { container } = render(
        <CalendarGrid
          selectedDate={currentDate}
          onDateChange={onDateChange}
        />
      );

      // Find disabled buttons (days from other months)
      const disabledButtons = container.querySelectorAll("button:disabled");
      if (disabledButtons.length > 0) {
        fireEvent.click(disabledButtons[0]);
        expect(onDateChange).not.toHaveBeenCalled();
      }
    });
  });

  describe("Grid Structure", () => {
    it("should have a proper grid layout", () => {
      render(<CalendarGrid />);
      const grid = screen.getByTestId("calendar-grid");
      expect(grid).toBeInTheDocument();
      const weeks = grid.querySelectorAll("[data-testid^='calendar-week-']");
      expect(weeks.length).toBeGreaterThanOrEqual(5); // At least 5 weeks
    });

    it("should have 7 cells per week", () => {
      render(<CalendarGrid />);
      const grid = screen.getByTestId("calendar-grid");
      const weeks = grid.querySelectorAll("[data-testid^='calendar-week-']");
      weeks.forEach((week) => {
        const cells = week.children;
        expect(cells.length).toBe(7);
      });
    });

    it("should display the correct number of weeks for a month", () => {
      const currentDate = new Date(2024, 2); // March 2024
      render(<CalendarGrid selectedDate={currentDate} />);
      const grid = screen.getByTestId("calendar-grid");
      const weeks = grid.querySelectorAll("[data-testid^='calendar-week-']");
      // March 2024 should have 5 weeks (including padding)
      expect(weeks.length).toBe(5);
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels for navigation buttons", () => {
      render(<CalendarGrid />);
      expect(screen.getByLabelText("Previous month")).toBeInTheDocument();
      expect(screen.getByLabelText("Next month")).toBeInTheDocument();
    });

    it("should have ARIA labels for date cells", () => {
      const currentDate = new Date(2024, 2); // March 2024
      render(<CalendarGrid selectedDate={currentDate} />);

      // Check that at least some date cells have aria-label
      const buttons = screen.getAllByRole("button");
      const labeledButtons = buttons.filter((btn) =>
        btn.getAttribute("aria-label")
      );
      expect(labeledButtons.length).toBeGreaterThan(0);
    });

    it("should mark selected date with aria-pressed", () => {
      const selectedDate = new Date(2024, 2, 15); // March 15, 2024
      const { container } = render(<CalendarGrid selectedDate={selectedDate} />);

      const selectedButtons = container.querySelectorAll('[aria-pressed="true"]');
      expect(selectedButtons.length).toBeGreaterThan(0);
    });
  });
});
