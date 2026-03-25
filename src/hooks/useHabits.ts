import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Habit,
  HabitId,
  CheckIn,
  CheckInId,
  Streak,
  HabitsState,
  HabitsActions,
  StorageResult,
  StorageError,
  DateString,
  CompletionStatus,
  HabitCategory,
  HabitProgress,
  StorageData,
  TimestampString
} from '../lib/types';
import { habitCRUD, checkInManager, habitStorage, dateUtils } from '../lib/storage';

// Custom hook for habit management
export function useHabits(): HabitsState & HabitsActions {
  // State management
  const [state, setState] = useState<HabitsState>({
    habits: [],
    checkIns: {},
    streaks: {},
    isLoading: true,
    error: null,
    lastUpdated: null
  });

  // Refs for preventing stale closures and managing updates
  const isMountedRef = useRef(true);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to safely update state only if component is mounted
  const safeSetState = useCallback((updater: (prev: HabitsState) => HabitsState) => {
    if (isMountedRef.current) {
      setState(updater);
    }
  }, []);

  // Helper to handle storage errors
  const handleStorageError = useCallback((error: StorageError) => {
    console.error('Storage error:', error);
    safeSetState(prev => ({
      ...prev,
      error,
      isLoading: false
    }));
  }, [safeSetState]);

  // Helper to clear errors
  const clearError = useCallback(() => {
    safeSetState(prev => ({
      ...prev,
      error: null
    }));
  }, [safeSetState]);

  // Load all data from storage
  const loadData = useCallback(async () => {
    try {
      safeSetState(prev => ({ ...prev, isLoading: true, error: null }));

      // Load habits
      const habitsResult = await habitCRUD.getAllHabits();
      if (!habitsResult.success) {
        handleStorageError(habitsResult.error!);
        return;
      }

      // Load check-ins grouped by habit
      const checkInsByHabit: Record<HabitId, CheckIn[]> = {};
      const streaks: Record<HabitId, Streak> = {};

      for (const habit of habitsResult.data!) {
        // Load check-ins for this habit
        const checkInsResult = await checkInManager.getHabitCheckIns(habit.id);
        if (checkInsResult.success) {
          checkInsByHabit[habit.id] = checkInsResult.data!;
        }

        // Load streak for this habit
        const streakResult = await checkInManager.getStreak(habit.id);
        if (streakResult.success && streakResult.data) {
          streaks[habit.id] = streakResult.data;
        }
      }

      safeSetState(prev => ({
        ...prev,
        habits: habitsResult.data!,
        checkIns: checkInsByHabit,
        streaks,
        isLoading: false,
        error: null,
        lastUpdated: dateUtils.getCurrentTimestamp()
      }));
    } catch (error) {
      console.error('Failed to load data:', error);
      safeSetState(prev => ({
        ...prev,
        isLoading: false,
        error: {
          code: 'UNKNOWN_ERROR' as any,
          message: 'Failed to load data',
          timestamp: dateUtils.getCurrentTimestamp()
        }
      }));
    }
  }, [safeSetState, handleStorageError]);

  // Refresh data with debouncing
  const refreshData = useCallback(async () => {
    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Debounce the refresh to avoid excessive updates
    updateTimeoutRef.current = setTimeout(() => {
      loadData();
    }, 100);
  }, [loadData]);

  // Optimistic update helper
  const withOptimisticUpdate = useCallback(<T,>(
    optimisticUpdate: (prevState: HabitsState) => HabitsState,
    asyncOperation: () => Promise<StorageResult<T>>,
    onSuccess?: (result: T) => void,
    onError?: (error: StorageError) => void
  ) => {
    return async (): Promise<StorageResult<T>> => {
      const prevState = state;

      // Apply optimistic update
      safeSetState(optimisticUpdate);
      clearError();

      try {
        const result = await asyncOperation();

        if (result.success) {
          // Refresh data to get the latest state
          await refreshData();
          if (onSuccess && result.data) {
            onSuccess(result.data);
          }
        } else {
          // Revert optimistic update on error
          safeSetState(() => ({
            ...prevState,
            error: result.error!
          }));
          if (onError) {
            onError(result.error!);
          }
        }

        return result;
      } catch (error) {
        const storageError: StorageError = {
          code: 'UNKNOWN_ERROR' as any,
          message: 'Operation failed',
          timestamp: dateUtils.getCurrentTimestamp()
        };

        // Revert optimistic update
        safeSetState(() => ({
          ...prevState,
          error: storageError
        }));

        if (onError) {
          onError(storageError);
        }

        return {
          success: false,
          error: storageError
        };
      }
    };
  }, [state, safeSetState, clearError, refreshData]);

  // Habit CRUD operations
  const createHabit = useCallback(async (
    habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<StorageResult<Habit>> => {
    const operation = withOptimisticUpdate<Habit>(
      (prevState) => ({
        ...prevState,
        isLoading: false // We'll show the optimistic update immediately
      }),
      () => habitCRUD.createHabit(habitData)
    );

    return operation();
  }, [withOptimisticUpdate]);

  const updateHabit = useCallback(async (
    id: HabitId,
    updates: Partial<Omit<Habit, 'id' | 'createdAt'>>
  ): Promise<StorageResult<Habit>> => {
    const operation = withOptimisticUpdate<Habit>(
      (prevState) => ({
        ...prevState,
        habits: prevState.habits.map(habit =>
          habit.id === id
            ? { ...habit, ...updates, updatedAt: dateUtils.getCurrentTimestamp() }
            : habit
        )
      }),
      () => habitCRUD.updateHabit(id, updates)
    );

    return operation();
  }, [withOptimisticUpdate]);

  const deleteHabit = useCallback(async (id: HabitId): Promise<StorageResult<boolean>> => {
    const operation = withOptimisticUpdate<boolean>(
      (prevState) => ({
        ...prevState,
        habits: prevState.habits.filter(habit => habit.id !== id),
        checkIns: Object.fromEntries(
          Object.entries(prevState.checkIns).filter(([habitId]) => habitId !== id)
        ),
        streaks: Object.fromEntries(
          Object.entries(prevState.streaks).filter(([habitId]) => habitId !== id)
        )
      }),
      () => habitCRUD.deleteHabit(id)
    );

    return operation();
  }, [withOptimisticUpdate]);

  const archiveHabit = useCallback(async (id: HabitId): Promise<StorageResult<Habit>> => {
    return updateHabit(id, { isActive: false });
  }, [updateHabit]);

  const restoreHabit = useCallback(async (id: HabitId): Promise<StorageResult<Habit>> => {
    return updateHabit(id, { isActive: true });
  }, [updateHabit]);

  // Check-in management operations
  const recordCheckIn = useCallback(async (
    habitId: HabitId,
    date: DateString,
    status: CompletionStatus,
    count: number = 1,
    notes?: string
  ): Promise<StorageResult<CheckIn>> => {
    const operation = withOptimisticUpdate<CheckIn>(
      (prevState) => {
        const existingCheckIns = prevState.checkIns[habitId] || [];
        const existingCheckIn = existingCheckIns.find(checkIn => checkIn.date === date);

        let updatedCheckIns: CheckIn[];
        if (existingCheckIn) {
          // Update existing check-in
          updatedCheckIns = existingCheckIns.map(checkIn =>
            checkIn.date === date
              ? { ...checkIn, status, count, notes, timestamp: dateUtils.getCurrentTimestamp() }
              : checkIn
          );
        } else {
          // Add new check-in
          const newCheckIn: CheckIn = {
            id: 'temp_' + Date.now(), // Temporary ID for optimistic update
            habitId,
            date,
            status,
            count,
            notes,
            timestamp: dateUtils.getCurrentTimestamp()
          };
          updatedCheckIns = [...existingCheckIns, newCheckIn];
        }

        return {
          ...prevState,
          checkIns: {
            ...prevState.checkIns,
            [habitId]: updatedCheckIns
          }
        };
      },
      () => checkInManager.recordCheckIn(habitId, date, status, count, notes)
    );

    return operation();
  }, [withOptimisticUpdate]);

  const updateCheckIn = useCallback(async (
    checkInId: CheckInId,
    updates: Partial<Omit<CheckIn, 'id' | 'habitId' | 'timestamp'>>
  ): Promise<StorageResult<CheckIn>> => {
    const operation = withOptimisticUpdate<CheckIn>(
      (prevState) => {
        const updatedCheckIns = { ...prevState.checkIns };

        // Find and update the check-in across all habits
        for (const [habitId, checkIns] of Object.entries(updatedCheckIns)) {
          const checkInIndex = checkIns.findIndex(checkIn => checkIn.id === checkInId);
          if (checkInIndex !== -1) {
            updatedCheckIns[habitId] = checkIns.map(checkIn =>
              checkIn.id === checkInId
                ? { ...checkIn, ...updates, timestamp: dateUtils.getCurrentTimestamp() }
                : checkIn
            );
            break;
          }
        }

        return {
          ...prevState,
          checkIns: updatedCheckIns
        };
      },
      () => checkInManager.updateCheckIn(checkInId, updates)
    );

    return operation();
  }, [withOptimisticUpdate]);

  const deleteCheckIn = useCallback(async (checkInId: CheckInId): Promise<StorageResult<boolean>> => {
    const operation = withOptimisticUpdate<boolean>(
      (prevState) => {
        const updatedCheckIns = { ...prevState.checkIns };

        // Find and remove the check-in across all habits
        for (const [habitId, checkIns] of Object.entries(updatedCheckIns)) {
          const filteredCheckIns = checkIns.filter(checkIn => checkIn.id !== checkInId);
          if (filteredCheckIns.length !== checkIns.length) {
            updatedCheckIns[habitId] = filteredCheckIns;
            break;
          }
        }

        return {
          ...prevState,
          checkIns: updatedCheckIns
        };
      },
      () => checkInManager.deleteCheckIn(checkInId)
    );

    return operation();
  }, [withOptimisticUpdate]);

  // Utility functions
  const getHabitProgress = useCallback((habitId: HabitId, days: number = 30): HabitProgress | null => {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return null;

    const checkIns = state.checkIns[habitId] || [];
    const streak = state.streaks[habitId];

    if (!streak) return null;

    const endDate = dateUtils.getCurrentDate();
    const startDate = dateUtils.addDays(endDate, -days);

    // Filter check-ins for the specified period
    const recentCheckIns = checkIns.filter(checkIn =>
      checkIn.date >= startDate && checkIn.date <= endDate
    );

    // Calculate completion rate
    const completedCheckIns = recentCheckIns.filter(checkIn =>
      checkIn.status === CompletionStatus.COMPLETED
    );
    const completionRate = days > 0 ? completedCheckIns.length / days : 0;

    // Calculate next due date based on frequency
    const lastCompletedDate = streak.lastCompletedDate;
    let nextDueDate: DateString | undefined;

    if (lastCompletedDate) {
      switch (habit.frequency) {
        case 'daily':
          nextDueDate = dateUtils.addDays(lastCompletedDate, 1);
          break;
        case 'weekly':
          nextDueDate = dateUtils.addDays(lastCompletedDate, 7);
          break;
        case 'monthly':
          nextDueDate = dateUtils.addDays(lastCompletedDate, 30);
          break;
        case 'custom':
          nextDueDate = dateUtils.addDays(lastCompletedDate, habit.customFrequency?.days || 1);
          break;
      }
    }

    // Generate weekly and monthly stats
    const weeklyStats = [];
    const monthlyStats = [];

    // Simple weekly stats calculation (last 4 weeks)
    for (let i = 0; i < 4; i++) {
      const weekEnd = dateUtils.addDays(endDate, -i * 7);
      const weekStart = dateUtils.addDays(weekEnd, -6);

      const weekCheckIns = checkIns.filter(checkIn =>
        checkIn.date >= weekStart && checkIn.date <= weekEnd &&
        checkIn.status === CompletionStatus.COMPLETED
      );

      const target = habit.frequency === 'weekly' ? habit.targetCount : 7 * habit.targetCount;
      weeklyStats.push({
        week: weekStart,
        completed: weekCheckIns.length,
        target,
        rate: target > 0 ? weekCheckIns.length / target : 0
      });
    }

    return {
      habitId,
      completionRate,
      streak,
      recentCheckIns,
      nextDueDate,
      weeklyStats,
      monthlyStats
    };
  }, [state]);

  const exportData = useCallback((): StorageData => {
    // Convert current state to StorageData format
    const habitsRecord = state.habits.reduce((acc, habit) => {
      acc[habit.id] = habit;
      return acc;
    }, {} as Record<HabitId, Habit>);

    const checkInsRecord = Object.values(state.checkIns)
      .flat()
      .reduce((acc, checkIn) => {
        acc[checkIn.id] = checkIn;
        return acc;
      }, {} as Record<CheckInId, CheckIn>);

    return {
      version: 1,
      habits: habitsRecord,
      checkIns: checkInsRecord,
      streaks: state.streaks,
      metadata: {
        dataVersion: 1,
        createdAt: dateUtils.getCurrentTimestamp(),
        updatedAt: state.lastUpdated || dateUtils.getCurrentTimestamp(),
        totalHabits: state.habits.length,
        totalCheckIns: Object.values(state.checkIns).flat().length
      }
    };
  }, [state]);

  const importData = useCallback(async (data: Partial<StorageData>): Promise<StorageResult<boolean>> => {
    try {
      safeSetState(prev => ({ ...prev, isLoading: true, error: null }));

      // Validate and write data to storage
      const fullData: StorageData = {
        version: data.version || 1,
        habits: data.habits || {},
        checkIns: data.checkIns || {},
        streaks: data.streaks || {},
        metadata: data.metadata || {
          dataVersion: 1,
          createdAt: dateUtils.getCurrentTimestamp(),
          updatedAt: dateUtils.getCurrentTimestamp(),
          totalHabits: Object.keys(data.habits || {}).length,
          totalCheckIns: Object.keys(data.checkIns || {}).length
        }
      };

      const result = await habitStorage.writeData(fullData);

      if (result.success) {
        // Refresh data after import
        await refreshData();
      } else {
        handleStorageError(result.error!);
      }

      return result;
    } catch (error) {
      const storageError: StorageError = {
        code: 'UNKNOWN_ERROR' as any,
        message: 'Import failed',
        timestamp: dateUtils.getCurrentTimestamp()
      };

      handleStorageError(storageError);
      return { success: false, error: storageError };
    }
  }, [safeSetState, handleStorageError, refreshData]);

  const clearAllData = useCallback(async (): Promise<StorageResult<boolean>> => {
    const operation = withOptimisticUpdate<boolean>(
      (prevState) => ({
        ...prevState,
        habits: [],
        checkIns: {},
        streaks: {}
      }),
      () => habitStorage.clearData()
    );

    return operation();
  }, [withOptimisticUpdate]);

  // Initialize data loading
  useEffect(() => {
    isMountedRef.current = true;
    loadData();

    return () => {
      isMountedRef.current = false;
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [loadData]);

  // Return state and actions
  return {
    // State
    habits: state.habits,
    checkIns: state.checkIns,
    streaks: state.streaks,
    isLoading: state.isLoading,
    error: state.error,
    lastUpdated: state.lastUpdated,

    // Actions
    createHabit,
    updateHabit,
    deleteHabit,
    recordCheckIn,
    updateCheckIn,
    deleteCheckIn,
    refreshData,
    getHabitProgress,
    exportData,
    importData,
    clearAllData
  };
}

// Hook for getting habits with filters
export function useFilteredHabits(filters?: {
  category?: HabitCategory;
  isActive?: boolean;
  searchQuery?: string;
}) {
  const { habits, ...rest } = useHabits();

  const filteredHabits = habits.filter(habit => {
    if (filters?.category && habit.category !== filters.category) {
      return false;
    }

    if (filters?.isActive !== undefined && habit.isActive !== filters.isActive) {
      return false;
    }

    if (filters?.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      return (
        habit.name.toLowerCase().includes(query) ||
        habit.description?.toLowerCase().includes(query) ||
        habit.goal?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  return {
    habits: filteredHabits,
    ...rest
  };
}

// Hook for a single habit
export function useHabit(habitId: HabitId) {
  const { habits, checkIns, streaks, getHabitProgress, ...actions } = useHabits();

  const habit = habits.find(h => h.id === habitId);
  const habitCheckIns = checkIns[habitId] || [];
  const habitStreak = streaks[habitId];
  const progress = habit ? getHabitProgress(habitId) : null;

  return {
    habit,
    checkIns: habitCheckIns,
    streak: habitStreak,
    progress,
    ...actions
  };
}